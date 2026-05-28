create or replace function private.generate_qr_token_workflow_v1(
  p_booking_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
  v_actor_type      public.actor_type;
  v_secret          text;
  v_booking         public.bookings%rowtype;
  v_token           public.qr_tokens%rowtype;
  v_jti             uuid;
  v_raw_token       text;
  v_token_hash      text;
  v_encrypted_token text;
  v_valid_from      timestamptz;
  v_expires_at      timestamptz;
begin
  -- Step 1: Trusted actor context
  if not private.has_trusted_actor_context() then
    raise exception 'INVALID_ACTOR_CONTEXT: trusted actor context is required'
      using errcode = 'P0001';
  end if;

  -- Step 2: Input validation
  if p_booking_id is null then
    raise exception 'BOOKING_NOT_FOUND: booking id is required'
      using errcode = 'P0001';
  end if;

  -- Step 3: Read and validate encryption key
  v_secret := current_setting('app.qr_encryption_key', true);

  if v_secret is null or v_secret = '' then
    raise exception 'ENCRYPTION_CONFIG_ERROR: QR encryption key is not configured'
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

  -- Step 5: Actor type check — SYSTEM and JOB may not generate QR tokens
  v_actor_type := private.current_actor_type();

  if v_actor_type in (
    'SYSTEM'::public.actor_type,
    'JOB'::public.actor_type
  ) then
    raise exception 'FORBIDDEN: generate_qr_token_workflow_v1 is not available to SYSTEM or JOB actors'
      using errcode = 'P0001';
  end if;

  -- Step 6: Authorization — ADMIN always allowed; others must own or manage this booking
  if v_actor_type <> 'ADMIN'::public.actor_type then
    if not private.can_access_booking(p_booking_id) then
      raise exception 'FORBIDDEN: actor cannot access this booking'
        using errcode = 'P0001';
    end if;
  end if;

  -- Step 7: Booking status must be CONFIRMED
  if v_booking.status <> 'CONFIRMED'::public.booking_status then
    raise exception 'INVALID_STATE: booking must be CONFIRMED but is %', v_booking.status
      using errcode = 'P0001';
  end if;

  -- Step 8: Return existing active token if one exists (idempotent reuse)
  select t.*
    into v_token
  from public.qr_tokens as t
  where t.booking_id = p_booking_id
    and t.deleted_at is null
    and t.revoked_at is null;

  if found then
    v_raw_token := extensions.pgp_sym_decrypt(
      decode(v_token.encrypted_token, 'base64'),
      v_secret
    );

    return pg_catalog.jsonb_build_object(
      'qr_token_id',  v_token.id,
      'booking_id',   p_booking_id,
      'raw_token',    v_raw_token,
      'valid_from',   v_token.valid_from,
      'expires_at',   v_token.expires_at,
      'was_existing', true
    );
  end if;

  -- Step 9: Generate new token material
  v_jti             := gen_random_uuid();
  v_raw_token       := encode(extensions.gen_random_bytes(32), 'hex');
  v_token_hash      := encode(extensions.digest(v_raw_token, 'sha256'), 'hex');
  v_encrypted_token := encode(extensions.pgp_sym_encrypt(v_raw_token, v_secret), 'base64');
  v_valid_from      := v_booking.start_time - interval '10 minutes';
  v_expires_at      := v_booking.end_time   + interval '5 minutes';

  -- Step 10: Insert; handle race via unique_violation
  begin
    insert into public.qr_tokens (
      booking_id,
      jti,
      token_hash,
      encrypted_token,
      valid_from,
      expires_at
    ) values (
      p_booking_id,
      v_jti,
      v_token_hash,
      v_encrypted_token,
      v_valid_from,
      v_expires_at
    )
    returning *
      into v_token;

  exception
    when unique_violation then
      -- Concurrent insert won the race; fetch and return the winner
      select t.*
        into v_token
      from public.qr_tokens as t
      where t.booking_id = p_booking_id
        and t.deleted_at is null
        and t.revoked_at is null;

      v_raw_token := extensions.pgp_sym_decrypt(
        decode(v_token.encrypted_token, 'base64'),
        v_secret
      );

      return pg_catalog.jsonb_build_object(
        'qr_token_id',  v_token.id,
        'booking_id',   p_booking_id,
        'raw_token',    v_raw_token,
        'valid_from',   v_token.valid_from,
        'expires_at',   v_token.expires_at,
        'was_existing', true
      );
  end;

  -- Step 11: Return newly inserted token
  return pg_catalog.jsonb_build_object(
    'qr_token_id',  v_token.id,
    'booking_id',   p_booking_id,
    'raw_token',    v_raw_token,
    'valid_from',   v_token.valid_from,
    'expires_at',   v_token.expires_at,
    'was_existing', false
  );
end;
$$;

revoke execute on function private.generate_qr_token_workflow_v1(uuid) from public;