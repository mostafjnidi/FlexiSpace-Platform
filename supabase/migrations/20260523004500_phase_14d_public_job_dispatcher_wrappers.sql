create or replace function public.run_expire_unpaid_bookings_v1(
  p_request_id text default null
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
  v_result jsonb;
begin
  begin
    perform private.set_actor_context(
      null::uuid,
      'JOB'::public.actor_type,
      p_request_id
    );

    v_result := private.expire_unpaid_bookings_job_v1();

    perform private.clear_actor_context();

    return v_result;
  exception
    when others then
      perform private.clear_actor_context();
      raise;
  end;
end;
$$;


create or replace function public.run_mark_no_show_bookings_v1(
  p_request_id text default null
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
  v_result jsonb;
begin
  begin
    perform private.set_actor_context(
      null::uuid,
      'JOB'::public.actor_type,
      p_request_id
    );

    v_result := private.mark_no_show_bookings_job_v1();

    perform private.clear_actor_context();

    return v_result;
  exception
    when others then
      perform private.clear_actor_context();
      raise;
  end;
end;
$$;


create or replace function public.run_mark_overstay_bookings_v1(
  p_request_id text default null
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
  v_result jsonb;
begin
  begin
    perform private.set_actor_context(
      null::uuid,
      'JOB'::public.actor_type,
      p_request_id
    );

    v_result := private.mark_overstay_bookings_job_v1();

    perform private.clear_actor_context();

    return v_result;
  exception
    when others then
      perform private.clear_actor_context();
      raise;
  end;
end;
$$;


create or replace function public.run_complete_checked_out_bookings_v1(
  p_request_id text default null
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
  v_result jsonb;
begin
  begin
    perform private.set_actor_context(
      null::uuid,
      'JOB'::public.actor_type,
      p_request_id
    );

    v_result := private.complete_checked_out_bookings_job_v1();

    perform private.clear_actor_context();

    return v_result;
  exception
    when others then
      perform private.clear_actor_context();
      raise;
  end;
end;
$$;


create or replace function public.run_scan_offline_devices_v1(
  p_request_id text default null
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
  v_result jsonb;
begin
  begin
    perform private.set_actor_context(
      null::uuid,
      'JOB'::public.actor_type,
      p_request_id
    );

    v_result := private.scan_offline_devices_job_v1();

    perform private.clear_actor_context();

    return v_result;
  exception
    when others then
      perform private.clear_actor_context();
      raise;
  end;
end;
$$;


create or replace function public.run_recover_stale_jobs_v1(
  p_request_id text default null
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
  v_result jsonb;
begin
  begin
    perform private.set_actor_context(
      null::uuid,
      'JOB'::public.actor_type,
      p_request_id
    );

    v_result := private.recover_stale_jobs_job_v1();

    perform private.clear_actor_context();

    return v_result;
  exception
    when others then
      perform private.clear_actor_context();
      raise;
  end;
end;
$$;


revoke all on function public.run_expire_unpaid_bookings_v1(text) from PUBLIC;
revoke all on function public.run_mark_no_show_bookings_v1(text) from PUBLIC;
revoke all on function public.run_mark_overstay_bookings_v1(text) from PUBLIC;
revoke all on function public.run_complete_checked_out_bookings_v1(text) from PUBLIC;
revoke all on function public.run_scan_offline_devices_v1(text) from PUBLIC;
revoke all on function public.run_recover_stale_jobs_v1(text) from PUBLIC;

do $$
begin
  if exists (
    select 1
    from pg_catalog.pg_roles
    where rolname = 'anon'
  ) then
    execute 'revoke all on function public.run_expire_unpaid_bookings_v1(text) from anon';
    execute 'revoke all on function public.run_mark_no_show_bookings_v1(text) from anon';
    execute 'revoke all on function public.run_mark_overstay_bookings_v1(text) from anon';
    execute 'revoke all on function public.run_complete_checked_out_bookings_v1(text) from anon';
    execute 'revoke all on function public.run_scan_offline_devices_v1(text) from anon';
    execute 'revoke all on function public.run_recover_stale_jobs_v1(text) from anon';
  end if;

  if exists (
    select 1
    from pg_catalog.pg_roles
    where rolname = 'authenticated'
  ) then
    execute 'revoke all on function public.run_expire_unpaid_bookings_v1(text) from authenticated';
    execute 'revoke all on function public.run_mark_no_show_bookings_v1(text) from authenticated';
    execute 'revoke all on function public.run_mark_overstay_bookings_v1(text) from authenticated';
    execute 'revoke all on function public.run_complete_checked_out_bookings_v1(text) from authenticated';
    execute 'revoke all on function public.run_scan_offline_devices_v1(text) from authenticated';
    execute 'revoke all on function public.run_recover_stale_jobs_v1(text) from authenticated';
  end if;

  if exists (
    select 1
    from pg_catalog.pg_roles
    where rolname = 'service_role'
  ) then
    execute 'grant execute on function public.run_expire_unpaid_bookings_v1(text) to service_role';
    execute 'grant execute on function public.run_mark_no_show_bookings_v1(text) to service_role';
    execute 'grant execute on function public.run_mark_overstay_bookings_v1(text) to service_role';
    execute 'grant execute on function public.run_complete_checked_out_bookings_v1(text) to service_role';
    execute 'grant execute on function public.run_scan_offline_devices_v1(text) to service_role';
    execute 'grant execute on function public.run_recover_stale_jobs_v1(text) to service_role';
  end if;
end;
$$;
