-- ─────────────────────────────────────────────────────────────────────────────
-- create_booking_workflow_v1 — add BOOKING_CREATED notification on success path
-- ─────────────────────────────────────────────────────────────────────────────
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

  perform private.create_notification_once_v1(
    v_user_id,
    'BOOKING_CREATED'::public.notification_type,
    'Booking Received',
    'Your booking request has been submitted and is pending approval.',
    pg_catalog.jsonb_build_object(
      'booking_id', v_booking_id,
      'office_id',  p_office_id,
      'status',     'PENDING_APPROVAL'
    ),
    v_booking_id::text || ':BOOKING_CREATED'
  );

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


-- ─────────────────────────────────────────────────────────────────────────────
-- approve_booking_workflow_v1 — add BOOKING_APPROVED notification on success path
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function private.approve_booking_workflow_v1(
  p_booking_id uuid,
  p_payment_idempotency_key uuid
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
  v_actor_role public.user_role;
  v_booking public.bookings%rowtype;
  v_payment_id uuid;
begin
  if not private.has_trusted_actor_context() then
    raise exception 'INVALID_ACTOR_CONTEXT: trusted actor context is required'
      using errcode = 'P0001';
  end if;

  v_actor_role := private.current_actor_role();

  if v_actor_role is null
    or v_actor_role not in (
    'OWNER'::public.user_role,
    'OPERATOR'::public.user_role,
    'ADMIN'::public.user_role
  ) then
    raise exception 'FORBIDDEN: approve_booking_workflow_v1 requires OWNER, OPERATOR, or ADMIN actor role'
      using errcode = 'P0001';
  end if;

  if p_booking_id is null then
    raise exception 'BOOKING_NOT_FOUND: booking id is required'
      using errcode = 'P0001';
  end if;

  if p_payment_idempotency_key is null then
    raise exception 'IDEMPOTENCY_CONFLICT: payment idempotency key is required'
      using errcode = 'P0001';
  end if;

  select b.*
    into v_booking
  from public.bookings as b
  where b.id = p_booking_id
    and b.deleted_at is null
  for update;

  if not found then
    raise exception 'BOOKING_NOT_FOUND: booking was not found'
      using errcode = 'P0001';
  end if;

  if v_actor_role <> 'ADMIN'::public.user_role
    and not private.can_manage_office(v_booking.office_id)
  then
    raise exception 'FORBIDDEN: actor cannot manage booking office'
      using errcode = 'P0001';
  end if;

  if v_booking.status = 'PAYMENT_PENDING'::public.booking_status then
    select p.id
      into v_payment_id
    from public.payments as p
    where p.booking_id = v_booking.id
      and p.idempotency_key = p_payment_idempotency_key
      and p.gateway = 'MOCK'::public.payment_gateway
      and p.status = 'PENDING'::public.payment_status
      and p.deleted_at is null;

    if found then
      return pg_catalog.jsonb_build_object(
        'booking_id', v_booking.id,
        'status', v_booking.status,
        'payment_id', v_payment_id,
        'idempotent_replay', true
      );
    end if;

    raise exception 'IDEMPOTENCY_CONFLICT: booking is already payment pending with a different payment request'
      using errcode = 'P0001';
  end if;

  if v_booking.status <> 'PENDING_APPROVAL'::public.booking_status then
    raise exception 'INVALID_STATE: booking must be PENDING_APPROVAL for approval'
      using errcode = 'P0001';
  end if;

  begin
    update public.bookings
    set status = 'APPROVED'::public.booking_status
    where id = v_booking.id
    returning *
      into v_booking;

    insert into public.payments (
      booking_id,
      gateway,
      status,
      amount_cents,
      currency,
      idempotency_key
    )
    values (
      v_booking.id,
      'MOCK'::public.payment_gateway,
      'PENDING'::public.payment_status,
      v_booking.amount_cents,
      v_booking.currency,
      p_payment_idempotency_key
    )
    returning id
      into v_payment_id;

    update public.bookings
    set status = 'PAYMENT_PENDING'::public.booking_status
    where id = v_booking.id
    returning *
      into v_booking;
  exception
    when unique_violation then
      raise exception 'IDEMPOTENCY_CONFLICT: payment idempotency key was already used for this booking'
        using errcode = 'P0001';
    when others then
      raise exception 'INTERNAL_ERROR: booking approval failed'
        using errcode = 'P0001';
  end;

  perform private.create_notification_once_v1(
    v_booking.user_id,
    'BOOKING_APPROVED'::public.notification_type,
    'Booking Approved',
    'Your booking has been approved. Complete payment to confirm your reservation.',
    pg_catalog.jsonb_build_object(
      'booking_id', v_booking.id,
      'office_id',  v_booking.office_id,
      'payment_id', v_payment_id,
      'status',     'PAYMENT_PENDING'
    ),
    v_booking.id::text || ':BOOKING_APPROVED'
  );

  return pg_catalog.jsonb_build_object(
    'booking_id', v_booking.id,
    'status', v_booking.status,
    'payment_id', v_payment_id,
    'idempotent_replay', false
  );
end;
$$;

revoke all on function private.approve_booking_workflow_v1(uuid, uuid) from public;


-- ─────────────────────────────────────────────────────────────────────────────
-- reject_booking_workflow_v1 — add BOOKING_REJECTED notification on success path
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function private.reject_booking_workflow_v1(
  p_booking_id uuid,
  p_reason text default null
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
  v_actor_role public.user_role;
  v_booking public.bookings%rowtype;
begin
  if not private.has_trusted_actor_context() then
    raise exception 'INVALID_ACTOR_CONTEXT: trusted actor context is required'
      using errcode = 'P0001';
  end if;

  v_actor_role := private.current_actor_role();

  if v_actor_role is null
    or v_actor_role not in (
      'OWNER'::public.user_role,
      'OPERATOR'::public.user_role,
      'ADMIN'::public.user_role
    )
  then
    raise exception 'FORBIDDEN: reject_booking_workflow_v1 requires OWNER, OPERATOR, or ADMIN actor role'
      using errcode = 'P0001';
  end if;

  if p_booking_id is null then
    raise exception 'BOOKING_NOT_FOUND: booking id is required'
      using errcode = 'P0001';
  end if;

  select b.*
    into v_booking
  from public.bookings as b
  where b.id = p_booking_id
    and b.deleted_at is null
  for update;

  if not found then
    raise exception 'BOOKING_NOT_FOUND: booking was not found'
      using errcode = 'P0001';
  end if;

  if v_actor_role <> 'ADMIN'::public.user_role
    and not private.can_manage_office(v_booking.office_id)
  then
    raise exception 'FORBIDDEN: actor cannot manage booking office'
      using errcode = 'P0001';
  end if;

  if v_booking.status = 'REJECTED'::public.booking_status then
    return pg_catalog.jsonb_build_object(
      'booking_id', v_booking.id,
      'status', v_booking.status,
      'idempotent_replay', true
    );
  end if;

  if v_booking.status <> 'PENDING_APPROVAL'::public.booking_status then
    raise exception 'INVALID_STATE: booking must be PENDING_APPROVAL for rejection'
      using errcode = 'P0001';
  end if;

  begin
    update public.bookings
    set status = 'REJECTED'::public.booking_status
    where id = v_booking.id
    returning *
      into v_booking;
  exception
    when others then
      raise exception 'INTERNAL_ERROR: booking rejection failed'
        using errcode = 'P0001';
  end;

  perform private.create_notification_once_v1(
    v_booking.user_id,
    'BOOKING_REJECTED'::public.notification_type,
    'Booking Rejected',
    'Unfortunately, your booking request has been rejected.',
    pg_catalog.jsonb_build_object(
      'booking_id', v_booking.id,
      'office_id',  v_booking.office_id,
      'status',     'REJECTED'
    ),
    v_booking.id::text || ':BOOKING_REJECTED'
  );

  return pg_catalog.jsonb_build_object(
    'booking_id', v_booking.id,
    'status', v_booking.status,
    'idempotent_replay', false
  );
end;
$$;

revoke all on function private.reject_booking_workflow_v1(uuid, text) from public;


-- ─────────────────────────────────────────────────────────────────────────────
-- cancel_booking_workflow_v1 — add BOOKING_CANCELLED notification on success path
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function private.cancel_booking_workflow_v1(
  p_booking_id uuid,
  p_reason text default null
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
  v_actor_id uuid;
  v_actor_role public.user_role;
  v_booking public.bookings%rowtype;
  v_cancelled_at timestamptz;
begin
  if not private.has_trusted_actor_context() then
    raise exception 'INVALID_ACTOR_CONTEXT: trusted actor context is required'
      using errcode = 'P0001';
  end if;

  v_actor_role := private.current_actor_role();

  if v_actor_role is null
    or v_actor_role not in (
      'USER'::public.user_role,
      'OWNER'::public.user_role,
      'OPERATOR'::public.user_role,
      'ADMIN'::public.user_role
    )
  then
    raise exception 'FORBIDDEN: cancel_booking_workflow_v1 requires USER, OWNER, OPERATOR, or ADMIN actor role'
      using errcode = 'P0001';
  end if;

  begin
    v_actor_id := private.require_actor_id();
  exception
    when others then
      raise exception 'INVALID_ACTOR_CONTEXT: actor id is required'
        using errcode = 'P0001';
  end;

  if p_booking_id is null then
    raise exception 'BOOKING_NOT_FOUND: booking id is required'
      using errcode = 'P0001';
  end if;

  if nullif(pg_catalog.btrim(p_reason), '') is null then
    raise exception 'REASON_REQUIRED: cancellation reason is required'
      using errcode = 'P0001';
  end if;

  select b.*
    into v_booking
  from public.bookings as b
  where b.id = p_booking_id
    and b.deleted_at is null
  for update;

  if not found then
    raise exception 'BOOKING_NOT_FOUND: booking was not found'
      using errcode = 'P0001';
  end if;

  if v_actor_role = 'USER'::public.user_role then
    if v_booking.user_id <> v_actor_id then
      raise exception 'FORBIDDEN: actor cannot cancel this booking'
        using errcode = 'P0001';
    end if;
  elsif v_actor_role in ('OWNER'::public.user_role, 'OPERATOR'::public.user_role) then
    if not private.can_manage_office(v_booking.office_id) then
      raise exception 'FORBIDDEN: actor cannot manage booking office'
        using errcode = 'P0001';
    end if;
  elsif v_actor_role <> 'ADMIN'::public.user_role then
    raise exception 'FORBIDDEN: actor cannot cancel bookings'
      using errcode = 'P0001';
  end if;

  if v_booking.status = 'CANCELLED'::public.booking_status then
    return pg_catalog.jsonb_build_object(
      'booking_id', v_booking.id,
      'status', v_booking.status,
      'cancelled_at', v_booking.cancelled_at,
      'idempotent_replay', true
    );
  end if;

  if v_booking.status not in (
    'PENDING_APPROVAL'::public.booking_status,
    'APPROVED'::public.booking_status,
    'PAYMENT_PENDING'::public.booking_status,
    'CONFIRMED'::public.booking_status
  ) then
    raise exception 'INVALID_STATE: booking status cannot be cancelled'
      using errcode = 'P0001';
  end if;

  if pg_catalog.now() > v_booking.start_time - interval '12 hours'
    or v_booking.checked_in_at is not null
  then
    raise exception 'CANCELLATION_NOT_ALLOWED: booking cancellation is not allowed'
      using errcode = 'P0001';
  end if;

  v_cancelled_at := pg_catalog.now();

  begin
    update public.bookings
    set status = 'CANCELLED'::public.booking_status,
        cancelled_at = v_cancelled_at,
        cancelled_by = v_actor_id,
        cancelled_by_role = v_actor_role,
        cancellation_reason = pg_catalog.btrim(p_reason)
    where id = v_booking.id
    returning *
      into v_booking;
  exception
    when others then
      raise exception 'INTERNAL_ERROR: booking cancellation failed'
        using errcode = 'P0001';
  end;

  perform private.create_notification_once_v1(
    v_booking.user_id,
    'BOOKING_CANCELLED'::public.notification_type,
    'Booking Cancelled',
    'Your booking has been cancelled.',
    pg_catalog.jsonb_build_object(
      'booking_id', v_booking.id,
      'office_id',  v_booking.office_id,
      'status',     'CANCELLED'
    ),
    v_booking.id::text || ':BOOKING_CANCELLED'
  );

  return pg_catalog.jsonb_build_object(
    'booking_id', v_booking.id,
    'status', v_booking.status,
    'cancelled_at', v_booking.cancelled_at,
    'idempotent_replay', false
  );
end;
$$;

revoke all on function private.cancel_booking_workflow_v1(uuid, text) from public;