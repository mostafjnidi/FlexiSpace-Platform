create or replace function private.scan_offline_devices_job_v1()
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
  v_actor_type              public.actor_type;
  v_job                     public.jobs%rowtype;
  v_device                  public.iot_devices%rowtype;
  v_existing_open_incidents integer;
  v_devices_processed       integer := 0;
  v_incidents_created       integer := 0;
begin
  if not private.has_trusted_actor_context() then
    raise exception 'INVALID_ACTOR_CONTEXT: trusted actor context is required'
      using errcode = 'P0001';
  end if;

  v_actor_type := private.current_actor_type();

  if v_actor_type is distinct from 'JOB'::public.actor_type then
    raise exception 'FORBIDDEN: actor type % is not permitted to run device and system jobs', v_actor_type
      using errcode = 'P0001';
  end if;

  v_job := private.create_and_claim_job_v1(
    'SCAN_OFFLINE_DEVICES',
    'pgcron:scan_offline_devices'
  );

  begin
    for v_device in
      select d.*
      from public.iot_devices as d
      where d.status = 'ONLINE'::public.device_status
        and d.deleted_at is null
        and (
          d.last_seen_at is null
          or d.last_seen_at < now() - interval '300 seconds'
        )
      order by d.last_seen_at asc nulls first
      limit 500
      for update skip locked
    loop
      update public.iot_devices
      set
        status     = 'OFFLINE'::public.device_status,
        updated_at = now()
      where id = v_device.id;

      v_devices_processed := v_devices_processed + 1;

      select count(*)
        into v_existing_open_incidents
      from public.incidents as i
      where i.device_id = v_device.id
        and i.type = 'DEVICE_OFFLINE'::public.incident_type
        and i.status = 'OPEN'::public.incident_status
        and i.deleted_at is null;

      if v_existing_open_incidents = 0 then
        insert into public.incidents (
          type,
          status,
          device_id,
          office_id,
          description,
          metadata
        ) values (
          'DEVICE_OFFLINE'::public.incident_type,
          'OPEN'::public.incident_status,
          v_device.id,
          v_device.office_id,
          'Device went offline: ' || v_device.name,
          '{}'::jsonb
        );

        v_incidents_created := v_incidents_created + 1;
      end if;
    end loop;

    perform private.succeed_job_v1(v_job.id);

    return pg_catalog.jsonb_build_object(
      'job_id',            v_job.id,
      'job_type',          'SCAN_OFFLINE_DEVICES',
      'devices_processed', v_devices_processed,
      'incidents_created', v_incidents_created
    );
  exception
    when others then
      perform private.fail_job_v1(v_job.id, SQLERRM);
      raise;
  end;
end;
$$;


create or replace function private.recover_stale_jobs_job_v1()
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
  v_actor_type public.actor_type;
  v_job        public.jobs%rowtype;
  v_jobs_reset integer := 0;
begin
  if not private.has_trusted_actor_context() then
    raise exception 'INVALID_ACTOR_CONTEXT: trusted actor context is required'
      using errcode = 'P0001';
  end if;

  v_actor_type := private.current_actor_type();

  if v_actor_type is distinct from 'JOB'::public.actor_type then
    raise exception 'FORBIDDEN: actor type % is not permitted to run device and system jobs', v_actor_type
      using errcode = 'P0001';
  end if;

  v_job := private.create_and_claim_job_v1(
    'RECOVER_STALE_JOBS',
    'pgcron:recover_stale_jobs'
  );

  begin
    v_jobs_reset := v_jobs_reset + private.reset_stale_jobs_v1(
      'EXPIRE_UNPAID_BOOKINGS',
      300
    );

    v_jobs_reset := v_jobs_reset + private.reset_stale_jobs_v1(
      'MARK_NO_SHOW_BOOKINGS',
      300
    );

    v_jobs_reset := v_jobs_reset + private.reset_stale_jobs_v1(
      'MARK_OVERSTAY_BOOKINGS',
      300
    );

    v_jobs_reset := v_jobs_reset + private.reset_stale_jobs_v1(
      'COMPLETE_CHECKED_OUT_BOOKINGS',
      300
    );

    v_jobs_reset := v_jobs_reset + private.reset_stale_jobs_v1(
      'SCAN_OFFLINE_DEVICES',
      300
    );

    v_jobs_reset := v_jobs_reset + private.reset_stale_jobs_v1(
      'RECOVER_STALE_JOBS',
      300
    );

    perform private.succeed_job_v1(v_job.id);

    return pg_catalog.jsonb_build_object(
      'job_id',     v_job.id,
      'job_type',   'RECOVER_STALE_JOBS',
      'jobs_reset', v_jobs_reset
    );
  exception
    when others then
      perform private.fail_job_v1(v_job.id, SQLERRM);
      raise;
  end;
end;
$$;


revoke execute on function private.scan_offline_devices_job_v1() from PUBLIC;
revoke execute on function private.recover_stale_jobs_job_v1() from PUBLIC;
