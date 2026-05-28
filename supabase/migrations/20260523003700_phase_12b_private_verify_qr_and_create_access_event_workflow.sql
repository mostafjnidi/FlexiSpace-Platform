create or replace function private.verify_qr_and_create_access_event_workflow_v1(
  p_raw_token text,
  p_device_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
  v_actor_type   public.actor_type;
  v_token_hash   text;
  v_qr_token     public.qr_tokens%rowtype;
  v_booking      public.bookings%rowtype;
  v_device       public.iot_devices%rowtype;
  v_access_event public.access_events%rowtype;
begin
  -- Step 1: Require trusted actor context
  if not private.has_trusted_actor_context() then
    raise exception 'INVALID_ACTOR_CONTEXT: trusted actor context is required'
      using errcode = 'P0001';
  end if;

  -- Step 2: Actor type must be SYSTEM, JOB, or ADMIN; USER/OWNER/OPERATOR are forbidden
  v_actor_type := private.current_actor_type();

  if v_actor_type is null or v_actor_type not in (
    'SYSTEM'::public.actor_type,
    'JOB'::public.actor_type,
    'ADMIN'::public.actor_type
  ) then
    raise exception 'FORBIDDEN: actor type % is not permitted to verify QR tokens', v_actor_type
      using errcode = 'P0001';
  end if;

  -- Step 3: Validate p_raw_token
  if p_raw_token is null or pg_catalog.btrim(p_raw_token) = '' then
    raise exception 'VALIDATION_ERROR: p_raw_token must not be null or blank'
      using errcode = 'P0001';
  end if;

  -- Step 4: Compute token hash
  v_token_hash := pg_catalog.encode(extensions.digest(p_raw_token, 'sha256'), 'hex');

  -- Step 5: Find qr_tokens row by token_hash
  select t.*
    into v_qr_token
  from public.qr_tokens as t
  where t.token_hash = v_token_hash;

  if not found then
    raise exception 'TOKEN_NOT_FOUND: no QR token found for the provided raw token'
      using errcode = 'P0001';
  end if;

  -- Step 6: Check soft-deleted
  if v_qr_token.deleted_at is not null then
    raise exception 'TOKEN_DELETED: QR token has been deleted'
      using errcode = 'P0001';
  end if;

  -- Step 7: Check revoked
  if v_qr_token.revoked_at is not null then
    raise exception 'TOKEN_REVOKED: QR token has been revoked'
      using errcode = 'P0001';
  end if;

  -- Step 8: Check expired
  if now() > v_qr_token.expires_at then
    raise exception 'TOKEN_EXPIRED: QR token has expired'
      using errcode = 'P0001';
  end if;

  -- Step 9: Check access window (valid_from)
  if now() < v_qr_token.valid_from then
    raise exception 'ACCESS_WINDOW_VIOLATION: QR token is not yet valid'
      using errcode = 'P0001';
  end if;

  -- Step 10: Load booking
  select b.*
    into v_booking
  from public.bookings as b
  where b.id = v_qr_token.booking_id
    and b.deleted_at is null;

  if not found then
    raise exception 'BOOKING_NOT_FOUND: booking for QR token was not found'
      using errcode = 'P0001';
  end if;

  -- Step 11: Booking must be CONFIRMED
  if v_booking.status <> 'CONFIRMED'::public.booking_status then
    raise exception 'BOOKING_NOT_CONFIRMED: booking must be CONFIRMED but is %', v_booking.status
      using errcode = 'P0001';
  end if;

  -- Step 12: Optional device validation
  if p_device_id is not null then
    select d.*
      into v_device
    from public.iot_devices as d
    where d.id = p_device_id
      and d.deleted_at is null;

    if not found or v_device.office_id <> v_booking.office_id then
      raise exception 'DEVICE_NOT_IN_OFFICE: device not found or does not belong to the booking office'
        using errcode = 'P0001';
    end if;
  end if;

  -- Step 13: Insert access event
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
    v_booking.id,
    p_device_id,
    v_booking.user_id,
    'USER'::public.actor_type,
    null,
    'QR_SCAN'::public.access_method,
    'PENDING_ACK'::public.access_event_status,
    1,
    null,
    pg_catalog.jsonb_build_object('qr_token_id', v_qr_token.id)
  )
  returning *
    into v_access_event;

  -- Step 14: Mark QR token as used
  update public.qr_tokens
  set
    used_at    = now(),
    updated_at = now()
  where id = v_qr_token.id;

  -- Step 15: Return result
  return pg_catalog.jsonb_build_object(
    'access_event_id', v_access_event.id,
    'booking_id',      v_booking.id,
    'qr_token_id',     v_qr_token.id,
    'device_id',       p_device_id,
    'status',          v_access_event.status,
    'verified',        true
  );
end;
$$;

revoke execute on function private.verify_qr_and_create_access_event_workflow_v1(text, uuid) from public;