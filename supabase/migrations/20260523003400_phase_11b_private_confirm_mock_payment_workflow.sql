create or replace function private.confirm_mock_payment_workflow_v1(
  p_booking_id       uuid,
  p_idempotency_key  uuid,
  p_simulate_success boolean
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
  v_actor_type       public.actor_type;
  v_webhook_event_id uuid;
  v_booking          public.bookings%rowtype;
  v_payment          public.payments%rowtype;
  v_payment_status   public.payment_status;
  v_booking_status   public.booking_status;
begin
  -- Step 1: Trusted actor context
  if not private.has_trusted_actor_context() then
    raise exception 'INVALID_ACTOR_CONTEXT: trusted actor context is required'
      using errcode = 'P0001';
  end if;

  -- Step 2: Actor type restriction
  v_actor_type := private.current_actor_type();

  if v_actor_type not in (
    'SYSTEM'::public.actor_type,
    'JOB'::public.actor_type,
    'ADMIN'::public.actor_type
  ) then
    raise exception 'FORBIDDEN: confirm_mock_payment_workflow_v1 requires SYSTEM, JOB, or ADMIN actor type'
      using errcode = 'P0001';
  end if;

  -- Step 3: Input validation
  if p_booking_id is null then
    raise exception 'BOOKING_NOT_FOUND: booking id is required'
      using errcode = 'P0001';
  end if;

  if p_idempotency_key is null then
    raise exception 'VALIDATION_ERROR: idempotency key is required'
      using errcode = 'P0001';
  end if;

  -- Step 4: Idempotency via webhook_events INSERT before acquiring row locks
  begin
    insert into public.webhook_events (
      gateway,
      event_id,
      event_type,
      event_created_at,
      payload,
      signature_verified,
      received_at,
      processed_at,
      metadata
    ) values (
      'MOCK'::public.payment_gateway,
      p_idempotency_key::text,
      case when p_simulate_success then 'mock.payment.succeeded' else 'mock.payment.failed' end,
      now(),
      pg_catalog.jsonb_build_object(
        'booking_id',       p_booking_id,
        'simulate_success', p_simulate_success
      ),
      true,
      now(),
      null,
      pg_catalog.jsonb_build_object(
        'request_id', private.current_request_id()
      )
    )
    returning id into v_webhook_event_id;

  exception
    when unique_violation then
      -- Idempotent replay: return current state without applying any mutations
      select we.id
        into v_webhook_event_id
      from public.webhook_events as we
      where we.gateway = 'MOCK'::public.payment_gateway
        and we.event_id = p_idempotency_key::text;

      select b.status
        into v_booking_status
      from public.bookings as b
      where b.id = p_booking_id
        and b.deleted_at is null;

      select p.*
        into v_payment
      from public.payments as p
      where p.booking_id = p_booking_id
        and p.deleted_at is null
      limit 1;

      return pg_catalog.jsonb_build_object(
        'payment_id',        v_payment.id,
        'booking_id',        p_booking_id,
        'payment_status',    v_payment.status,
        'booking_status',    v_booking_status,
        'webhook_event_id',  v_webhook_event_id,
        'idempotent_replay', true
      );
  end;

  -- Step 5: Load and lock booking (before payment lock)
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

  if v_booking.status <> 'PAYMENT_PENDING'::public.booking_status then
    raise exception 'INVALID_STATE: booking must be PAYMENT_PENDING but is %', v_booking.status
      using errcode = 'P0001';
  end if;

  -- Step 6: Load and lock payment (after booking lock)
  select p.*
    into v_payment
  from public.payments as p
  where p.booking_id = p_booking_id
    and p.deleted_at is null
  for update;

  if not found then
    raise exception 'PAYMENT_NOT_FOUND: no payment found for this booking'
      using errcode = 'P0001';
  end if;

  if v_payment.status <> 'PENDING'::public.payment_status then
    raise exception 'PAYMENT_ALREADY_FINAL: payment is already in status %', v_payment.status
      using errcode = 'P0001';
  end if;

  -- Step 7: Apply mutation
  if p_simulate_success then
    -- Success path: update payment then booking; Phase 8C trigger validates the booking transition
    update public.payments
    set status     = 'SUCCEEDED'::public.payment_status,
        paid_at    = now(),
        updated_at = now()
    where id = v_payment.id;

    update public.bookings
    set status     = 'CONFIRMED'::public.booking_status,
        updated_at = now()
    where id = p_booking_id;

    v_payment_status := 'SUCCEEDED'::public.payment_status;
    v_booking_status := 'CONFIRMED'::public.booking_status;
  else
    -- Failure path: update payment only; booking remains PAYMENT_PENDING
    update public.payments
    set status     = 'FAILED'::public.payment_status,
        updated_at = now()
    where id = v_payment.id;

    v_payment_status := 'FAILED'::public.payment_status;
    v_booking_status := v_booking.status;
  end if;

  -- Step 8: Mark webhook event processed
  update public.webhook_events
  set processed_at = now()
  where gateway  = 'MOCK'::public.payment_gateway
    and event_id = p_idempotency_key::text;

  -- Step 9: Return
  return pg_catalog.jsonb_build_object(
    'payment_id',        v_payment.id,
    'booking_id',        p_booking_id,
    'payment_status',    v_payment_status,
    'booking_status',    v_booking_status,
    'webhook_event_id',  v_webhook_event_id,
    'idempotent_replay', false
  );
end;
$$;

revoke execute on function private.confirm_mock_payment_workflow_v1(uuid, uuid, boolean) from public;