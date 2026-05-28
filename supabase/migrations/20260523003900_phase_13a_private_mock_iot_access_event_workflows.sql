-- ============================================================
-- private.mock_ack_access_event_workflow_v1
-- Simulates an IoT device ACKing an unlock command.
-- Transitions PENDING_ACK -> ACKED or FAILED_NO_ACK.
-- If ACKED and booking is CONFIRMED, transitions to CHECKED_IN.
-- ============================================================

create or replace function private.mock_ack_access_event_workflow_v1(
  p_access_event_id uuid,
  p_ack_result      public.access_event_status,
  p_reason          text default null
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
  v_actor_type   public.actor_type;
  v_access_event public.access_events%rowtype;
  v_booking      public.bookings%rowtype;
begin
  -- Step 1: Require trusted actor context
  if not private.has_trusted_actor_context() then
    raise exception 'INVALID_ACTOR_CONTEXT: trusted actor context is required'
      using errcode = 'P0001';
  end if;

  -- Step 2: Actor type must be SYSTEM or ADMIN
  v_actor_type := private.current_actor_type();

  if v_actor_type is null or v_actor_type not in (
    'SYSTEM'::public.actor_type,
    'ADMIN'::public.actor_type
  ) then
    raise exception 'FORBIDDEN: actor type % is not permitted to ACK access events', v_actor_type
      using errcode = 'P0001';
  end if;

  -- Step 3: Validate inputs
  if p_access_event_id is null then
    raise exception 'VALIDATION_ERROR: p_access_event_id must not be null'
      using errcode = 'P0001';
  end if;

  if p_ack_result is null or p_ack_result not in (
    'ACKED'::public.access_event_status,
    'FAILED_NO_ACK'::public.access_event_status
  ) then
    raise exception 'VALIDATION_ERROR: p_ack_result must be ACKED or FAILED_NO_ACK'
      using errcode = 'P0001';
  end if;

  -- Step 4: Load access event
  select ae.*
    into v_access_event
  from public.access_events as ae
  where ae.id = p_access_event_id
    and ae.deleted_at is null;

  if not found then
    raise exception 'ACCESS_EVENT_NOT_FOUND: access event was not found'
      using errcode = 'P0001';
  end if;

  -- Step 5: Idempotency — already in a terminal ACK state
  if v_access_event.status in (
    'ACKED'::public.access_event_status,
    'FAILED_NO_ACK'::public.access_event_status
  ) then
    return pg_catalog.jsonb_build_object(
      'access_event_id',   v_access_event.id,
      'booking_id',        v_access_event.booking_id,
      'ack_result',        v_access_event.status,
      'booking_status',    null,
      'checked_in_at',     null,
      'idempotent_replay', true
    );
  end if;

  -- Step 6: Status must be PENDING_ACK
  if v_access_event.status <> 'PENDING_ACK'::public.access_event_status then
    raise exception 'ACCESS_EVENT_WRONG_STATUS: access event status must be PENDING_ACK but is %', v_access_event.status
      using errcode = 'P0001';
  end if;

  -- Step 7: Update access event
  update public.access_events
  set
    status          = p_ack_result,
    acknowledged_at = now(),
    reason          = p_reason,
    updated_at      = now()
  where id = v_access_event.id;

  -- Step 8: Conditional booking check-in if ACKED and booking is linked
  if p_ack_result = 'ACKED'::public.access_event_status
    and v_access_event.booking_id is not null
  then
    select b.*
      into v_booking
    from public.bookings as b
    where b.id = v_access_event.booking_id
      and b.deleted_at is null;

    if not found then
      raise exception 'BOOKING_NOT_FOUND: booking for access event was not found'
        using errcode = 'P0001';
    end if;

    if v_booking.status = 'CONFIRMED'::public.booking_status then
      update public.bookings
      set
        status        = 'CHECKED_IN'::public.booking_status,
        checked_in_at = now(),
        updated_at    = now()
      where id = v_booking.id
      returning *
        into v_booking;
    end if;
  end if;

  -- Step 9: Return result
  return pg_catalog.jsonb_build_object(
    'access_event_id',   p_access_event_id,
    'booking_id',        v_access_event.booking_id,
    'ack_result',        p_ack_result,
    'booking_status',    v_booking.status,
    'checked_in_at',     v_booking.checked_in_at,
    'idempotent_replay', false
  );
end;
$$;

revoke execute on function private.mock_ack_access_event_workflow_v1(uuid, public.access_event_status, text) from public;


-- ============================================================
-- private.mock_app_unlock_workflow_v1
-- Simulates a user initiating a door unlock via the mobile app.
-- Creates a PENDING_ACK access_event with access_method APP_UNLOCK.
-- ============================================================

create or replace function private.mock_app_unlock_workflow_v1(
  p_booking_id uuid,
  p_device_id  uuid
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
  v_actor_type   public.actor_type;
  v_booking      public.bookings%rowtype;
  v_device       public.iot_devices%rowtype;
  v_access_event public.access_events%rowtype;
begin
  -- Step 1: Require trusted actor context
  if not private.has_trusted_actor_context() then
    raise exception 'INVALID_ACTOR_CONTEXT: trusted actor context is required'
      using errcode = 'P0001';
  end if;

  -- Step 2: Actor type must be USER, OWNER, OPERATOR, or ADMIN
  v_actor_type := private.current_actor_type();

  if v_actor_type is null or v_actor_type not in (
    'USER'::public.actor_type,
    'OWNER'::public.actor_type,
    'OPERATOR'::public.actor_type,
    'ADMIN'::public.actor_type
  ) then
    raise exception 'FORBIDDEN: actor type % is not permitted to request app unlock', v_actor_type
      using errcode = 'P0001';
  end if;

  -- Step 3: Validate inputs
  if p_booking_id is null then
    raise exception 'VALIDATION_ERROR: p_booking_id must not be null'
      using errcode = 'P0001';
  end if;

  if p_device_id is null then
    raise exception 'VALIDATION_ERROR: p_device_id must not be null'
      using errcode = 'P0001';
  end if;

  -- Step 4: Load booking
  select b.*
    into v_booking
  from public.bookings as b
  where b.id = p_booking_id
    and b.deleted_at is null;

  if not found then
    raise exception 'BOOKING_NOT_FOUND: booking was not found'
      using errcode = 'P0001';
  end if;

  -- Step 5: Booking must be CONFIRMED
  if v_booking.status <> 'CONFIRMED'::public.booking_status then
    raise exception 'BOOKING_NOT_CONFIRMED: booking must be CONFIRMED but is %', v_booking.status
      using errcode = 'P0001';
  end if;

  -- Step 6: Authorization
  if not private.can_access_booking(p_booking_id) then
    raise exception 'FORBIDDEN: actor is not authorized to access this booking'
      using errcode = 'P0001';
  end if;

  -- Step 7: Load device
  select d.*
    into v_device
  from public.iot_devices as d
  where d.id = p_device_id
    and d.deleted_at is null;

  if not found then
    raise exception 'DEVICE_NOT_FOUND: device was not found'
      using errcode = 'P0001';
  end if;

  -- Step 8: Device must belong to the booking's office
  if v_device.office_id <> v_booking.office_id then
    raise exception 'DEVICE_NOT_IN_OFFICE: device does not belong to the booking office'
      using errcode = 'P0001';
  end if;

  -- Step 9: Insert access event
  insert into public.access_events (
    booking_id,
    device_id,
    actor_id,
    actor_type,
    command_id,
    access_method,
    status,
    attempt,
    reason,
    metadata
  ) values (
    p_booking_id,
    p_device_id,
    v_booking.user_id,
    'USER'::public.actor_type,
    null,
    'APP_UNLOCK'::public.access_method,
    'PENDING_ACK'::public.access_event_status,
    1,
    null,
    '{}'::jsonb
  )
  returning *
    into v_access_event;

  -- Step 10: Return result
  return pg_catalog.jsonb_build_object(
    'access_event_id', v_access_event.id,
    'booking_id',      p_booking_id,
    'device_id',       p_device_id,
    'status',          v_access_event.status,
    'verified',        true
  );
end;
$$;

revoke execute on function private.mock_app_unlock_workflow_v1(uuid, uuid) from public;


-- ============================================================
-- private.mock_manual_override_access_workflow_v1
-- Simulates a facility manager physically overriding a door lock.
-- Creates an access_event with MANUAL_OVERRIDE method and status.
-- Terminates immediately — no ACK required.
-- ============================================================

create or replace function private.mock_manual_override_access_workflow_v1(
  p_device_id  uuid,
  p_reason     text,
  p_booking_id uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
  v_actor_type   public.actor_type;
  v_device       public.iot_devices%rowtype;
  v_booking      public.bookings%rowtype;
  v_access_event public.access_events%rowtype;
begin
  -- Step 1: Require trusted actor context
  if not private.has_trusted_actor_context() then
    raise exception 'INVALID_ACTOR_CONTEXT: trusted actor context is required'
      using errcode = 'P0001';
  end if;

  -- Step 2: Actor type must be OWNER, OPERATOR, or ADMIN
  v_actor_type := private.current_actor_type();

  if v_actor_type is null or v_actor_type not in (
    'OWNER'::public.actor_type,
    'OPERATOR'::public.actor_type,
    'ADMIN'::public.actor_type
  ) then
    raise exception 'FORBIDDEN: actor type % is not permitted to perform manual override', v_actor_type
      using errcode = 'P0001';
  end if;

  -- Step 3: Validate inputs
  if p_device_id is null then
    raise exception 'VALIDATION_ERROR: p_device_id must not be null'
      using errcode = 'P0001';
  end if;

  if p_reason is null or pg_catalog.btrim(p_reason) = '' then
    raise exception 'VALIDATION_ERROR: p_reason must not be null or blank'
      using errcode = 'P0001';
  end if;

  -- Step 4: Load device
  select d.*
    into v_device
  from public.iot_devices as d
  where d.id = p_device_id
    and d.deleted_at is null;

  if not found then
    raise exception 'DEVICE_NOT_FOUND: device was not found'
      using errcode = 'P0001';
  end if;

  -- Step 5: Authorization
  if not private.can_manage_office(v_device.office_id) then
    raise exception 'FORBIDDEN: actor is not authorized to manage this device'
      using errcode = 'P0001';
  end if;

  -- Step 6: Optional booking validation
  if p_booking_id is not null then
    select b.*
      into v_booking
    from public.bookings as b
    where b.id = p_booking_id
      and b.deleted_at is null;

    if not found then
      raise exception 'BOOKING_NOT_FOUND: booking was not found'
        using errcode = 'P0001';
    end if;

    if v_booking.office_id <> v_device.office_id then
      raise exception 'DEVICE_NOT_IN_OFFICE: device does not belong to the booking office'
        using errcode = 'P0001';
    end if;
  end if;

  -- Step 7: Insert access event — terminal status, acknowledged immediately
  insert into public.access_events (
    booking_id,
    device_id,
    actor_id,
    actor_type,
    command_id,
    access_method,
    status,
    attempt,
    reason,
    acknowledged_at,
    metadata
  ) values (
    p_booking_id,
    p_device_id,
    private.current_actor_id(),
    v_actor_type,
    null,
    'MANUAL_OVERRIDE'::public.access_method,
    'MANUAL_OVERRIDE'::public.access_event_status,
    1,
    p_reason,
    now(),
    '{}'::jsonb
  )
  returning *
    into v_access_event;

  -- Step 8: Return result
  return pg_catalog.jsonb_build_object(
    'access_event_id', v_access_event.id,
    'device_id',       p_device_id,
    'booking_id',      p_booking_id,
    'status',          v_access_event.status,
    'access_method',   v_access_event.access_method
  );
end;
$$;

revoke execute on function private.mock_manual_override_access_workflow_v1(uuid, text, uuid) from public;