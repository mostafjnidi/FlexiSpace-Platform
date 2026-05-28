create or replace function private.create_booking_workflow_v1(
  p_office_id uuid,
  p_start_time timestamptz,
  p_end_time timestamptz,
  p_idempotency_key uuid
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
  v_actor_role public.user_role;
  v_user_id uuid;
  v_office_status public.office_status;
  v_hourly_rate_cents integer;
  v_currency text;
  v_duration_minutes integer;
  v_billable_hours integer;
  v_amount_cents integer;
  v_existing_booking public.bookings%rowtype;
  v_booking_id uuid;
  v_booking_status public.booking_status;
  v_constraint_name text;
begin
  if not private.has_trusted_actor_context() then
    raise exception 'INVALID_ACTOR_CONTEXT: trusted actor context is required'
      using errcode = 'P0001';
  end if;

  v_actor_role := private.current_actor_role();

  if v_actor_role is distinct from 'USER'::public.user_role then
    raise exception 'FORBIDDEN: create_booking_workflow_v1 requires USER actor role'
      using errcode = 'P0001';
  end if;

  begin
    v_user_id := private.require_actor_id();
  exception
    when others then
      raise exception 'INVALID_ACTOR_CONTEXT: actor id is required'
        using errcode = 'P0001';
  end;

  if p_idempotency_key is null then
    raise exception 'IDEMPOTENCY_CONFLICT: idempotency key is required'
      using errcode = 'P0001';
  end if;

  if p_start_time is null or p_end_time is null or p_start_time >= p_end_time then
    raise exception 'INVALID_TIME_RANGE: start_time must be before end_time'
      using errcode = 'P0001';
  end if;

  select o.status, o.hourly_rate_cents, o.currency
    into v_office_status, v_hourly_rate_cents, v_currency
  from public.offices as o
  where o.id = p_office_id
    and o.deleted_at is null;

  if not found then
    raise exception 'OFFICE_NOT_FOUND: office was not found'
      using errcode = 'P0001';
  end if;

  if v_office_status is distinct from 'ACTIVE'::public.office_status then
    raise exception 'OFFICE_NOT_ACTIVE: office is not active'
      using errcode = 'P0001';
  end if;

  select b.*
    into v_existing_booking
  from public.bookings as b
  where b.user_id = v_user_id
    and b.idempotency_key = p_idempotency_key
    and b.deleted_at is null
  for update;

  if found then
    if v_existing_booking.office_id = p_office_id
      and v_existing_booking.start_time = p_start_time
      and v_existing_booking.end_time = p_end_time
    then
      return pg_catalog.jsonb_build_object(
        'booking_id', v_existing_booking.id,
        'status', v_existing_booking.status,
        'amount_cents', v_existing_booking.amount_cents,
        'currency', v_existing_booking.currency,
        'idempotent_replay', true
      );
    end if;

    raise exception 'IDEMPOTENCY_CONFLICT: idempotency key was already used with different booking inputs'
      using errcode = 'P0001';
  end if;

  v_duration_minutes := pg_catalog.ceil(
    extract(epoch from (p_end_time - p_start_time)) / 60.0
  )::integer;
  v_billable_hours := pg_catalog.ceil(v_duration_minutes / 60.0)::integer;
  v_amount_cents := v_billable_hours * v_hourly_rate_cents;

  begin
    insert into public.bookings (
      user_id,
      office_id,
      status,
      start_time,
      end_time,
      amount_cents,
      currency,
      idempotency_key
    )
    values (
      v_user_id,
      p_office_id,
      'PENDING_APPROVAL'::public.booking_status,
      p_start_time,
      p_end_time,
      v_amount_cents,
      v_currency,
      p_idempotency_key
    )
    returning id, status
      into v_booking_id, v_booking_status;
  exception
    when unique_violation then
      select b.*
        into v_existing_booking
      from public.bookings as b
      where b.user_id = v_user_id
        and b.idempotency_key = p_idempotency_key
        and b.deleted_at is null;

      if found
        and v_existing_booking.office_id = p_office_id
        and v_existing_booking.start_time = p_start_time
        and v_existing_booking.end_time = p_end_time
      then
        return pg_catalog.jsonb_build_object(
          'booking_id', v_existing_booking.id,
          'status', v_existing_booking.status,
          'amount_cents', v_existing_booking.amount_cents,
          'currency', v_existing_booking.currency,
          'idempotent_replay', true
        );
      end if;

      raise exception 'IDEMPOTENCY_CONFLICT: idempotency key was already used with different booking inputs'
        using errcode = 'P0001';
    when exclusion_violation then
      raise exception 'BOOKING_OVERLAP: booking overlaps an existing blocking booking'
        using errcode = 'P0001';
    when check_violation then
      get stacked diagnostics v_constraint_name = constraint_name;

      if v_constraint_name = 'bookings_time_range_check' then
        raise exception 'INVALID_TIME_RANGE: start_time must be before end_time'
          using errcode = 'P0001';
      elsif v_constraint_name = 'bookings_duration_bounds_check'
        and p_end_time < p_start_time + interval '30 minutes'
      then
        raise exception 'BOOKING_TOO_SHORT: minimum booking duration is 30 minutes'
          using errcode = 'P0001';
      elsif v_constraint_name = 'bookings_duration_bounds_check'
        and p_end_time > p_start_time + interval '30 days'
      then
        raise exception 'BOOKING_TOO_LONG: maximum booking duration is 30 days'
          using errcode = 'P0001';
      end if;

      raise exception 'INTERNAL_ERROR: booking check constraint failed'
        using errcode = 'P0001';
    when others then
      raise exception 'INTERNAL_ERROR: booking creation failed'
        using errcode = 'P0001';
  end;

  return pg_catalog.jsonb_build_object(
    'booking_id', v_booking_id,
    'status', v_booking_status,
    'amount_cents', v_amount_cents,
    'currency', v_currency,
    'idempotent_replay', false
  );
end;
$$;

revoke all on function private.create_booking_workflow_v1(uuid, timestamptz, timestamptz, uuid) from public;
