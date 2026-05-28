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

  return pg_catalog.jsonb_build_object(
    'booking_id', v_booking.id,
    'status', v_booking.status,
    'payment_id', v_payment_id,
    'idempotent_replay', false
  );
end;
$$;

revoke all on function private.approve_booking_workflow_v1(uuid, uuid) from public;
