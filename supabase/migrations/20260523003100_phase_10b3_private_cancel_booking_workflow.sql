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

  return pg_catalog.jsonb_build_object(
    'booking_id', v_booking.id,
    'status', v_booking.status,
    'cancelled_at', v_booking.cancelled_at,
    'idempotent_replay', false
  );
end;
$$;

revoke all on function private.cancel_booking_workflow_v1(uuid, text) from public;
