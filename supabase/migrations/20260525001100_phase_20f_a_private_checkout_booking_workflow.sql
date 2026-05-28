-- Phase 20F-A: Private Checkout Booking Workflow
--
-- Creates private.checkout_booking_workflow_v1(p_booking_id uuid) returns jsonb.
-- Called only from the public wrapper with trusted actor context already set.
--
-- Handles:
--   CHECKED_IN → CHECKED_OUT transition (Phase 8C trigger validates the matrix)
--   Telemetry aggregation from IoT devices for the session window
--   booking_usage_summaries row creation
--   Optional usage-fee payment (PENDING) if total_usage_fee_cents > 0
--   Zero-fee path: CHECKED_OUT → COMPLETED via temporary SYSTEM actor context
--     (USER is not in the COMPLETED allowed_actor_types; SYSTEM is)

create or replace function private.checkout_booking_workflow_v1(
  p_booking_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
  v_actor_role           public.user_role;
  v_actor_type           public.actor_type;
  v_actor_id             uuid;
  v_request_id           text;

  v_booking              public.bookings%rowtype;
  v_office_id            uuid;

  -- Session timing
  v_session_started_at   timestamptz;
  v_session_ended_at     timestamptz;
  v_session_minutes      integer;

  -- Telemetry aggregates
  v_avg_kwh              numeric;
  v_session_kwh          numeric(10,3);
  v_avg_co2_ppm          numeric(8,1);
  v_avg_pm25             numeric(8,2);
  v_avg_temperature_c    numeric(5,1);
  v_avg_humidity_percent numeric(5,1);

  -- Access event metrics
  v_access_event_count   integer;
  v_door_open_count      integer;
  v_last_access_method   text;

  -- Pricing (defaults applied when no office_usage_pricing row exists)
  v_electricity_price_per_kwh_cents integer;
  v_ventilation_fee_per_hour_cents  integer;
  v_currency                        text;

  -- Computed fees
  v_electricity_fee_cents integer;
  v_ventilation_fee_cents integer;
  v_total_usage_fee_cents integer;

  -- Result identifiers
  v_usage_summary_id uuid;
  v_payment_id       uuid;
  v_idem_md5         text;
  v_usage_fee_idem   uuid;
begin
  -- ── 1. Trusted actor context ───────────────────────────────────────────────
  if not private.has_trusted_actor_context() then
    raise exception 'INVALID_ACTOR_CONTEXT: trusted actor context is required'
      using errcode = 'P0001';
  end if;

  v_actor_role := private.current_actor_role();
  v_actor_type := private.current_actor_type();
  v_actor_id   := private.current_actor_id();
  v_request_id := private.current_request_id();

  -- ── 2. Role restriction: USER, OWNER, OPERATOR, ADMIN ─────────────────────
  -- SYSTEM and JOB yield null from current_actor_role(); the null check catches them.
  if v_actor_role is null
    or v_actor_role not in (
      'USER'::public.user_role,
      'OWNER'::public.user_role,
      'OPERATOR'::public.user_role,
      'ADMIN'::public.user_role
    )
  then
    raise exception 'FORBIDDEN: checkout_booking_workflow_v1 requires USER, OWNER, OPERATOR, or ADMIN actor role'
      using errcode = 'P0001';
  end if;

  -- ── 3. Input validation ────────────────────────────────────────────────────
  if p_booking_id is null then
    raise exception 'BOOKING_NOT_FOUND: booking id is required'
      using errcode = 'P0001';
  end if;

  -- ── 4. Load and lock booking ───────────────────────────────────────────────
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

  v_office_id := v_booking.office_id;

  -- ── 5. Fine-grained authorization ─────────────────────────────────────────
  if v_actor_role = 'USER'::public.user_role then
    if v_booking.user_id is distinct from v_actor_id then
      raise exception 'FORBIDDEN: USER may only check out their own booking'
        using errcode = 'P0001';
    end if;
  elsif v_actor_role <> 'ADMIN'::public.user_role
    and not private.can_manage_office(v_office_id)
  then
    raise exception 'FORBIDDEN: actor cannot manage the booking office'
      using errcode = 'P0001';
  end if;

  -- ── 6. State check + idempotency ──────────────────────────────────────────
  -- If the booking is already past CHECKED_IN, return the existing usage summary.
  if v_booking.status in (
    'CHECKED_OUT'::public.booking_status,
    'COMPLETED'::public.booking_status
  ) then
    select s.id,
           s.session_minutes,
           s.session_kwh,
           s.electricity_fee_cents,
           s.ventilation_fee_cents,
           s.total_usage_fee_cents,
           s.currency
      into v_usage_summary_id,
           v_session_minutes,
           v_session_kwh,
           v_electricity_fee_cents,
           v_ventilation_fee_cents,
           v_total_usage_fee_cents,
           v_currency
    from public.booking_usage_summaries as s
    where s.booking_id = p_booking_id
      and s.deleted_at is null;

    return pg_catalog.jsonb_build_object(
      'booking_id',            p_booking_id,
      'booking_status',        v_booking.status,
      'usage_summary_id',      v_usage_summary_id,
      'session_minutes',       v_session_minutes,
      'session_kwh',           v_session_kwh,
      'electricity_fee_cents', v_electricity_fee_cents,
      'ventilation_fee_cents', v_ventilation_fee_cents,
      'total_usage_fee_cents', v_total_usage_fee_cents,
      'currency',              v_currency,
      'idempotent_replay',     true
    );
  end if;

  if v_booking.status <> 'CHECKED_IN'::public.booking_status then
    raise exception 'INVALID_STATE: booking must be CHECKED_IN but is %', v_booking.status
      using errcode = 'P0001';
  end if;

  -- ── 7. Session timing ──────────────────────────────────────────────────────
  v_session_ended_at := now();

  -- First acknowledged access event marks when the session actually started.
  -- Fall back to booking.start_time when no access events exist (e.g. manual admin checkout).
  select ae.requested_at
    into v_session_started_at
  from public.access_events as ae
  where ae.booking_id = p_booking_id
    and ae.status in (
      'ACKED'::public.access_event_status,
      'MANUAL_OVERRIDE'::public.access_event_status
    )
    and ae.deleted_at is null
  order by ae.requested_at asc
  limit 1;

  if v_session_started_at is null then
    v_session_started_at := v_booking.start_time;
  end if;

  -- Ceiling-divide seconds to minutes; minimum 1 minute to avoid zero-fee edge cases.
  v_session_minutes := greatest(
    pg_catalog.ceil(
      extract(epoch from (v_session_ended_at - v_session_started_at)) / 60.0
    )::integer,
    1
  );

  -- ── 8. Access event metrics ────────────────────────────────────────────────
  select
    count(*)::integer,
    count(*) filter (
      where ae.status in (
        'ACKED'::public.access_event_status,
        'MANUAL_OVERRIDE'::public.access_event_status
      )
    )::integer
    into v_access_event_count, v_door_open_count
  from public.access_events as ae
  where ae.booking_id = p_booking_id
    and ae.deleted_at is null;

  select ae.access_method::text
    into v_last_access_method
  from public.access_events as ae
  where ae.booking_id = p_booking_id
    and ae.deleted_at is null
  order by ae.requested_at desc
  limit 1;

  -- ── 9. Electricity telemetry → session_kwh ────────────────────────────────
  -- Reads payload->>'current_kw' from ELECTRICITY_METER devices for this office.
  -- NULL payload fields are excluded by avg() automatically.
  select avg((te.payload->>'current_kw')::numeric)
    into v_avg_kwh
  from public.telemetry_events as te
  join public.iot_devices as d on d.id = te.device_id
  where d.office_id = v_office_id
    and d.device_type = 'ELECTRICITY_METER'::public.device_type
    and d.deleted_at is null
    and te.observed_at >= v_session_started_at
    and te.observed_at <= v_session_ended_at;

  if v_avg_kwh is not null and v_avg_kwh > 0 then
    v_session_kwh := pg_catalog.round(v_avg_kwh * (v_session_minutes / 60.0), 3);
  else
    v_session_kwh := 0;
  end if;

  -- ── 10. Air quality telemetry ──────────────────────────────────────────────
  select
    avg((te.payload->>'co2_ppm')::numeric),
    avg((te.payload->>'pm25_ug_m3')::numeric),
    avg((te.payload->>'temperature_c')::numeric),
    avg((te.payload->>'humidity_percent')::numeric)
    into v_avg_co2_ppm, v_avg_pm25, v_avg_temperature_c, v_avg_humidity_percent
  from public.telemetry_events as te
  join public.iot_devices as d on d.id = te.device_id
  where d.office_id = v_office_id
    and d.device_type = 'AIR_QUALITY_SENSOR'::public.device_type
    and d.deleted_at is null
    and te.observed_at >= v_session_started_at
    and te.observed_at <= v_session_ended_at;

  -- ── 11. Pricing: load from office_usage_pricing or use defaults ────────────
  select
    oup.electricity_price_per_kwh_cents,
    oup.ventilation_fee_per_hour_cents,
    oup.currency
    into
      v_electricity_price_per_kwh_cents,
      v_ventilation_fee_per_hour_cents,
      v_currency
  from public.office_usage_pricing as oup
  where oup.office_id = v_office_id
    and oup.deleted_at is null;

  if not found then
    v_electricity_price_per_kwh_cents := 15;
    v_ventilation_fee_per_hour_cents  := 200;
    v_currency                        := v_booking.currency;
  end if;

  -- ── 12. Fee calculation ────────────────────────────────────────────────────
  v_electricity_fee_cents :=
    pg_catalog.round(v_session_kwh * v_electricity_price_per_kwh_cents)::integer;

  v_ventilation_fee_cents :=
    pg_catalog.ceil(v_session_minutes / 60.0)::integer
    * v_ventilation_fee_per_hour_cents;

  v_total_usage_fee_cents := v_electricity_fee_cents + v_ventilation_fee_cents;

  -- ── 13. Transition: CHECKED_IN → CHECKED_OUT ──────────────────────────────
  -- Phase 8C trigger validates this against the booking_status_transitions matrix.
  update public.bookings
  set status     = 'CHECKED_OUT'::public.booking_status,
      updated_at = now()
  where id = p_booking_id;

  -- ── 14. Insert booking_usage_summaries ─────────────────────────────────────
  insert into public.booking_usage_summaries (
    booking_id,
    session_started_at,
    session_ended_at,
    session_minutes,
    session_kwh,
    electricity_fee_cents,
    avg_co2_ppm,
    avg_pm25,
    avg_temperature_c,
    avg_humidity_percent,
    ventilation_fee_cents,
    door_open_count,
    access_event_count,
    last_access_method,
    total_usage_fee_cents,
    currency,
    calculated_at
  ) values (
    p_booking_id,
    v_session_started_at,
    v_session_ended_at,
    v_session_minutes,
    v_session_kwh,
    v_electricity_fee_cents,
    v_avg_co2_ppm,
    v_avg_pm25,
    v_avg_temperature_c,
    v_avg_humidity_percent,
    v_ventilation_fee_cents,
    coalesce(v_door_open_count, 0),
    coalesce(v_access_event_count, 0),
    v_last_access_method,
    v_total_usage_fee_cents,
    v_currency,
    now()
  )
  returning id into v_usage_summary_id;

  -- ── 15. Usage-fee payment or zero-fee completion ───────────────────────────
  if v_total_usage_fee_cents > 0 then
    -- Create a PENDING usage-fee payment; booking stays CHECKED_OUT until confirmed.
    -- Idempotency key is deterministic: md5(booking_id || ':USAGE_FEE') formatted as UUID.
    v_idem_md5 := pg_catalog.md5(p_booking_id::text || ':USAGE_FEE');
    v_usage_fee_idem := (
      pg_catalog.substring(v_idem_md5, 1, 8)  || '-' ||
      pg_catalog.substring(v_idem_md5, 9, 4)  || '-' ||
      pg_catalog.substring(v_idem_md5, 13, 4) || '-' ||
      pg_catalog.substring(v_idem_md5, 17, 4) || '-' ||
      pg_catalog.substring(v_idem_md5, 21)
    )::uuid;

    insert into public.payments (
      booking_id,
      gateway,
      status,
      amount_cents,
      currency,
      idempotency_key,
      expires_at,
      metadata
    ) values (
      p_booking_id,
      'MOCK'::public.payment_gateway,
      'PENDING'::public.payment_status,
      v_total_usage_fee_cents,
      v_currency,
      v_usage_fee_idem,
      now() + interval '1 hour',
      pg_catalog.jsonb_build_object(
        'payment_type',         'USAGE_FEE',
        'usage_summary_id',     v_usage_summary_id,
        'base_booking_payment', false
      )
    )
    returning id into v_payment_id;

  else
    -- Zero-fee: transition CHECKED_OUT → COMPLETED.
    -- USER is not in the matrix's allowed_actor_types for this pair; SYSTEM is.
    -- Switch context to SYSTEM for the update, then restore the original actor.
    perform private.set_actor_context(null, 'SYSTEM'::public.actor_type, v_request_id);

    update public.bookings
    set status     = 'COMPLETED'::public.booking_status,
        updated_at = now()
    where id = p_booking_id;

    perform private.set_actor_context(v_actor_id, v_actor_type, v_request_id);
  end if;

  -- ── 16. Return ─────────────────────────────────────────────────────────────
  return pg_catalog.jsonb_build_object(
    'booking_id',            p_booking_id,
    'booking_status',        case
                               when v_total_usage_fee_cents > 0
                               then 'CHECKED_OUT'::text
                               else 'COMPLETED'::text
                             end,
    'usage_summary_id',      v_usage_summary_id,
    'session_minutes',       v_session_minutes,
    'session_kwh',           v_session_kwh,
    'electricity_fee_cents', v_electricity_fee_cents,
    'ventilation_fee_cents', v_ventilation_fee_cents,
    'total_usage_fee_cents', v_total_usage_fee_cents,
    'currency',              v_currency,
    'payment_id',            v_payment_id,
    'idempotent_replay',     false
  );
end;
$$;

revoke all on function private.checkout_booking_workflow_v1(uuid) from public;