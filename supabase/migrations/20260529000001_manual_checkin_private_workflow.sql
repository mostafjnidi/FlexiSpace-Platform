-- Manual Checkin Booking - Private Workflow
--
-- private.manual_checkin_booking_workflow_v1(p_booking_id uuid) returns jsonb
-- Called only from public.manual_checkin_booking_v1 with trusted actor context set.
--
-- Transitions: CONFIRMED → CHECKED_IN
-- Idempotent: returns idempotent_replay=true if already CHECKED_IN

create or replace function private.manual_checkin_booking_workflow_v1(
  p_booking_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
  v_actor_role public.user_role;
  v_actor_id   uuid;
  v_booking    public.bookings%rowtype;
begin
  -- 1. Require trusted actor context
  if not private.has_trusted_actor_context() then
    raise exception 'INVALID_ACTOR_CONTEXT: trusted actor context is required'
      using errcode = 'P0001';
  end if;

  v_actor_role := private.current_actor_role();
  v_actor_id   := private.current_actor_id();

  -- 2. Role check: USER, OWNER, OPERATOR, ADMIN
  if v_actor_role is null
    or v_actor_role not in (
      'USER'::public.user_role,
      'OWNER'::public.user_role,
      'OPERATOR'::public.user_role,
      'ADMIN'::public.user_role
    )
  then
    raise exception 'FORBIDDEN: manual_checkin_booking_workflow_v1 requires USER, OWNER, OPERATOR, or ADMIN actor role'
      using errcode = 'P0001';
  end if;

  -- 3. Input validation
  if p_booking_id is null then
    raise exception 'BOOKING_NOT_FOUND: booking id is required'
      using errcode = 'P0001';
  end if;

  -- 4. Load and lock booking
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

  -- 5. Authorization
  if v_actor_role = 'USER'::public.user_role then
    if v_booking.user_id is distinct from v_actor_id then
      raise exception 'FORBIDDEN: USER may only check in their own booking'
        using errcode = 'P0001';
    end if;
  elsif v_actor_role <> 'ADMIN'::public.user_role
    and not private.can_manage_office(v_booking.office_id)
  then
    raise exception 'FORBIDDEN: actor cannot manage the booking office'
      using errcode = 'P0001';
  end if;

  -- 6. Idempotency: already CHECKED_IN
  if v_booking.status = 'CHECKED_IN'::public.booking_status then
    return pg_catalog.jsonb_build_object(
      'booking_id',        p_booking_id,
      'booking_status',    'CHECKED_IN',
      'idempotent_replay', true
    );
  end if;

  -- 7. State check
  if v_booking.status <> 'CONFIRMED'::public.booking_status then
    raise exception 'INVALID_STATE: booking must be CONFIRMED but is %', v_booking.status
      using errcode = 'P0001';
  end if;

  -- 8. Transition: CONFIRMED → CHECKED_IN
  update public.bookings
  set status     = 'CHECKED_IN'::public.booking_status,
      updated_at = now()
  where id = p_booking_id;

  -- 9. Return
  return pg_catalog.jsonb_build_object(
    'booking_id',        p_booking_id,
    'booking_status',    'CHECKED_IN',
    'idempotent_replay', false
  );
end;
$$;

revoke all on function private.manual_checkin_booking_workflow_v1(uuid) from public;