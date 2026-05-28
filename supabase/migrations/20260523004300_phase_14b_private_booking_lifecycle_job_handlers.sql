create or replace function private.expire_unpaid_bookings_job_v1()
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
  v_actor_type public.actor_type;
  v_job        public.jobs%rowtype;
  v_booking    public.bookings%rowtype;
  v_processed  integer := 0;
begin
  if not private.has_trusted_actor_context() then
    raise exception 'INVALID_ACTOR_CONTEXT: trusted actor context is required'
      using errcode = 'P0001';
  end if;

  v_actor_type := private.current_actor_type();

  if v_actor_type is distinct from 'JOB'::public.actor_type then
    raise exception 'FORBIDDEN: actor type % is not permitted to run booking lifecycle jobs', v_actor_type
      using errcode = 'P0001';
  end if;

  v_job := private.create_and_claim_job_v1(
    'EXPIRE_UNPAID_BOOKINGS',
    'pgcron:expire_unpaid_bookings'
  );

  begin
    for v_booking in
      select b.*
      from public.bookings as b
      where b.status = 'PAYMENT_PENDING'::public.booking_status
        and b.deleted_at is null
        and (
          b.end_time < now()
          or exists (
            select 1
            from public.payments as p
            where p.booking_id = b.id
              and p.deleted_at is null
              and p.status in (
                'PENDING'::public.payment_status,
                'FAILED'::public.payment_status
              )
              and p.expires_at < now()
          )
        )
      order by b.created_at asc
      limit 500
      for update of b skip locked
    loop
      update public.bookings
      set
        status     = 'EXPIRED'::public.booking_status,
        updated_at = now()
      where id = v_booking.id;

      update public.payments
      set
        status     = 'EXPIRED'::public.payment_status,
        updated_at = now()
      where booking_id = v_booking.id
        and deleted_at is null
        and status in (
          'PENDING'::public.payment_status,
          'FAILED'::public.payment_status
        );

      v_processed := v_processed + 1;
    end loop;

    perform private.succeed_job_v1(v_job.id);

    return pg_catalog.jsonb_build_object(
      'job_id',    v_job.id,
      'job_type',  'EXPIRE_UNPAID_BOOKINGS',
      'processed', v_processed
    );
  exception
    when others then
      perform private.fail_job_v1(v_job.id, SQLERRM);
      raise;
  end;
end;
$$;


create or replace function private.mark_no_show_bookings_job_v1()
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
  v_actor_type public.actor_type;
  v_job        public.jobs%rowtype;
  v_booking    public.bookings%rowtype;
  v_processed  integer := 0;
begin
  if not private.has_trusted_actor_context() then
    raise exception 'INVALID_ACTOR_CONTEXT: trusted actor context is required'
      using errcode = 'P0001';
  end if;

  v_actor_type := private.current_actor_type();

  if v_actor_type is distinct from 'JOB'::public.actor_type then
    raise exception 'FORBIDDEN: actor type % is not permitted to run booking lifecycle jobs', v_actor_type
      using errcode = 'P0001';
  end if;

  v_job := private.create_and_claim_job_v1(
    'MARK_NO_SHOW_BOOKINGS',
    'pgcron:mark_no_show_bookings'
  );

  begin
    for v_booking in
      select b.*
      from public.bookings as b
      where b.status = 'CONFIRMED'::public.booking_status
        and b.deleted_at is null
        and b.checked_in_at is null
        and b.start_time + interval '15 minutes' < now()
      order by b.start_time asc
      limit 500
      for update skip locked
    loop
      update public.bookings
      set
        status     = 'NO_SHOW'::public.booking_status,
        updated_at = now()
      where id = v_booking.id;

      v_processed := v_processed + 1;
    end loop;

    perform private.succeed_job_v1(v_job.id);

    return pg_catalog.jsonb_build_object(
      'job_id',    v_job.id,
      'job_type',  'MARK_NO_SHOW_BOOKINGS',
      'processed', v_processed
    );
  exception
    when others then
      perform private.fail_job_v1(v_job.id, SQLERRM);
      raise;
  end;
end;
$$;


create or replace function private.mark_overstay_bookings_job_v1()
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
  v_actor_type public.actor_type;
  v_job        public.jobs%rowtype;
  v_booking    public.bookings%rowtype;
  v_processed  integer := 0;
begin
  if not private.has_trusted_actor_context() then
    raise exception 'INVALID_ACTOR_CONTEXT: trusted actor context is required'
      using errcode = 'P0001';
  end if;

  v_actor_type := private.current_actor_type();

  if v_actor_type is distinct from 'JOB'::public.actor_type then
    raise exception 'FORBIDDEN: actor type % is not permitted to run booking lifecycle jobs', v_actor_type
      using errcode = 'P0001';
  end if;

  v_job := private.create_and_claim_job_v1(
    'MARK_OVERSTAY_BOOKINGS',
    'pgcron:mark_overstay_bookings'
  );

  begin
    for v_booking in
      select b.*
      from public.bookings as b
      where b.status = 'CHECKED_IN'::public.booking_status
        and b.deleted_at is null
        and b.end_time + interval '5 minutes' < now()
      order by b.end_time asc
      limit 500
      for update skip locked
    loop
      update public.bookings
      set
        status     = 'OVERSTAY'::public.booking_status,
        updated_at = now()
      where id = v_booking.id;

      v_processed := v_processed + 1;
    end loop;

    perform private.succeed_job_v1(v_job.id);

    return pg_catalog.jsonb_build_object(
      'job_id',    v_job.id,
      'job_type',  'MARK_OVERSTAY_BOOKINGS',
      'processed', v_processed
    );
  exception
    when others then
      perform private.fail_job_v1(v_job.id, SQLERRM);
      raise;
  end;
end;
$$;


create or replace function private.complete_checked_out_bookings_job_v1()
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
  v_actor_type public.actor_type;
  v_job        public.jobs%rowtype;
  v_booking    public.bookings%rowtype;
  v_processed  integer := 0;
begin
  if not private.has_trusted_actor_context() then
    raise exception 'INVALID_ACTOR_CONTEXT: trusted actor context is required'
      using errcode = 'P0001';
  end if;

  v_actor_type := private.current_actor_type();

  if v_actor_type is distinct from 'JOB'::public.actor_type then
    raise exception 'FORBIDDEN: actor type % is not permitted to run booking lifecycle jobs', v_actor_type
      using errcode = 'P0001';
  end if;

  v_job := private.create_and_claim_job_v1(
    'COMPLETE_CHECKED_OUT_BOOKINGS',
    'pgcron:complete_checked_out_bookings'
  );

  begin
    for v_booking in
      select b.*
      from public.bookings as b
      where b.status = 'CHECKED_OUT'::public.booking_status
        and b.deleted_at is null
      order by b.checked_out_at asc nulls last
      limit 500
      for update skip locked
    loop
      update public.bookings
      set
        status     = 'COMPLETED'::public.booking_status,
        updated_at = now()
      where id = v_booking.id;

      v_processed := v_processed + 1;
    end loop;

    perform private.succeed_job_v1(v_job.id);

    return pg_catalog.jsonb_build_object(
      'job_id',    v_job.id,
      'job_type',  'COMPLETE_CHECKED_OUT_BOOKINGS',
      'processed', v_processed
    );
  exception
    when others then
      perform private.fail_job_v1(v_job.id, SQLERRM);
      raise;
  end;
end;
$$;


revoke execute on function private.expire_unpaid_bookings_job_v1() from PUBLIC;
revoke execute on function private.mark_no_show_bookings_job_v1() from PUBLIC;
revoke execute on function private.mark_overstay_bookings_job_v1() from PUBLIC;
revoke execute on function private.complete_checked_out_bookings_job_v1() from PUBLIC;
