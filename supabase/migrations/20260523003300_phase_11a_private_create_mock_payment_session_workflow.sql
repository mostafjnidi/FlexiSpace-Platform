create or replace function private.create_mock_payment_session_workflow_v1(
  p_booking_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
  v_actor_type public.actor_type;
  v_booking    public.bookings%rowtype;
  v_payment    public.payments%rowtype;
begin
  if not private.has_trusted_actor_context() then
    raise exception 'INVALID_ACTOR_CONTEXT: trusted actor context is required'
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
    and b.deleted_at is null;

  if not found then
    raise exception 'BOOKING_NOT_FOUND: booking was not found'
      using errcode = 'P0001';
  end if;

  v_actor_type := private.current_actor_type();

  if v_actor_type not in (
    'ADMIN'::public.actor_type,
    'SYSTEM'::public.actor_type,
    'JOB'::public.actor_type
  ) then
    if not private.can_access_booking(p_booking_id) then
      raise exception 'FORBIDDEN: actor cannot access this booking'
        using errcode = 'P0001';
    end if;
  end if;

  if v_booking.status <> 'PAYMENT_PENDING'::public.booking_status then
    raise exception 'INVALID_STATE: booking must be PAYMENT_PENDING but is %', v_booking.status
      using errcode = 'P0001';
  end if;

  select p.*
    into v_payment
  from public.payments as p
  where p.booking_id = p_booking_id
    and p.gateway = 'MOCK'::public.payment_gateway
    and p.status = 'PENDING'::public.payment_status
    and p.deleted_at is null;

  if not found then
    raise exception 'PAYMENT_NOT_FOUND: no pending payment found for this booking'
      using errcode = 'P0001';
  end if;

  return pg_catalog.jsonb_build_object(
    'payment_id',      v_payment.id,
    'booking_id',      v_payment.booking_id,
    'gateway',         v_payment.gateway,
    'amount_cents',    v_payment.amount_cents,
    'currency',        v_payment.currency,
    'status',          v_payment.status,
    'idempotency_key', v_payment.idempotency_key,
    'expires_at',      v_payment.expires_at
  );
end;
$$;

revoke execute on function private.create_mock_payment_session_workflow_v1(uuid) from public;