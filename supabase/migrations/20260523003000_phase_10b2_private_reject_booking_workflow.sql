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

  return pg_catalog.jsonb_build_object(
    'booking_id', v_booking.id,
    'status', v_booking.status,
    'idempotent_replay', false
  );
end;
$$;

revoke all on function private.reject_booking_workflow_v1(uuid, text) from public;
