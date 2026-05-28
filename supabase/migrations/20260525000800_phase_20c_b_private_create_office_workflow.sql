-- Phase 20C-B: private.create_office_with_devices_workflow_v1
--
-- Called exclusively from the public wrapper; never exposed directly.
-- Actor must be OWNER or ADMIN.  owner_id is always set to actor_id.
-- Inserts:
--   1. public.offices (with optional image_url, optional idempotency_key)
--   2. public.iot_devices  per requested device_type
--   3. public.device_state_snapshots  per device (initial readings)
-- The Phase 17A trigger on iot_devices writes device_inventory_read_model automatically.
-- The Phase 7B audit trigger on offices and iot_devices writes audit_logs automatically.
--
-- Idempotency:
--   If p_idempotency_key is provided and an office already exists with the same
--   (owner_id, idempotency_key), returns the existing result with idempotent_replay=true.

create or replace function private.create_office_with_devices_workflow_v1(
  p_name              text,
  p_description       text,
  p_building          text,
  p_floor             text,
  p_room              text,
  p_capacity          integer,
  p_hourly_rate_cents integer,
  p_currency          text,
  p_status            public.office_status,
  p_image_url         text,
  p_device_types      public.device_type[],
  p_idempotency_key   uuid
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
  v_actor_id         uuid;
  v_actor_role       public.user_role;
  v_office_id        uuid;
  v_device_ids       uuid[]             := '{}';
  v_device_type      public.device_type;
  v_device_id        uuid;
  v_device_key       text;
  v_device_name      text;
  v_device_state     jsonb;
  v_existing_office  public.offices%rowtype;
  v_i                integer;
begin
  -- ── Actor context ────────────────────────────────────────────────────────────
  if not private.has_trusted_actor_context() then
    raise exception 'INVALID_ACTOR_CONTEXT: trusted actor context is required'
      using errcode = 'P0001';
  end if;

  v_actor_id   := private.require_actor_id();
  v_actor_role := private.current_actor_role();

  if v_actor_role is distinct from 'OWNER'::public.user_role
    and v_actor_role is distinct from 'ADMIN'::public.user_role
  then
    raise exception 'FORBIDDEN: create_office_with_devices_workflow_v1 requires OWNER or ADMIN role'
      using errcode = 'P0001';
  end if;

  -- ── Input validation ─────────────────────────────────────────────────────────
  if p_name is null or btrim(p_name) = '' then
    raise exception 'VALIDATION_ERROR: name is required and must not be empty'
      using errcode = 'P0001';
  end if;

  if p_capacity is null or p_capacity <= 0 then
    raise exception 'VALIDATION_ERROR: capacity must be greater than 0'
      using errcode = 'P0001';
  end if;

  if p_hourly_rate_cents is null or p_hourly_rate_cents < 0 then
    raise exception 'VALIDATION_ERROR: hourly_rate_cents must be 0 or greater'
      using errcode = 'P0001';
  end if;

  if p_currency is null or p_currency !~ '^[A-Z]{3}$' then
    raise exception 'VALIDATION_ERROR: currency must be 3 uppercase letters (e.g. USD)'
      using errcode = 'P0001';
  end if;

  if p_status is null then
    raise exception 'VALIDATION_ERROR: status is required'
      using errcode = 'P0001';
  end if;

  -- No duplicate device types
  if p_device_types is not null and pg_catalog.cardinality(p_device_types) > 0 then
    if (
      select pg_catalog.count(*) from (
        select pg_catalog.unnest(p_device_types) as dt
      ) all_types
    ) <> (
      select pg_catalog.count(*) from (
        select distinct pg_catalog.unnest(p_device_types) as dt
      ) distinct_types
    ) then
      raise exception 'VALIDATION_ERROR: device_types must not contain duplicates'
        using errcode = 'P0001';
    end if;
  end if;

  -- ── Idempotency check ─────────────────────────────────────────────────────────
  if p_idempotency_key is not null then
    select o.*
      into v_existing_office
    from public.offices as o
    where o.owner_id        = v_actor_id
      and o.idempotency_key = p_idempotency_key
      and o.deleted_at      is null
    for update;

    if found then
      select pg_catalog.array_agg(d.id)
        into v_device_ids
      from public.iot_devices as d
      where d.office_id  = v_existing_office.id
        and d.deleted_at is null;

      return pg_catalog.jsonb_build_object(
        'office_id',         v_existing_office.id,
        'device_ids',        coalesce(v_device_ids, '{}'::uuid[]),
        'idempotent_replay', true
      );
    end if;
  end if;

  -- ── Insert office ─────────────────────────────────────────────────────────────
  insert into public.offices (
    owner_id,
    name,
    description,
    building,
    floor,
    room,
    capacity,
    hourly_rate_cents,
    currency,
    status,
    image_url,
    idempotency_key
  )
  values (
    v_actor_id,
    btrim(p_name),
    p_description,
    p_building,
    p_floor,
    p_room,
    p_capacity,
    p_hourly_rate_cents,
    p_currency,
    p_status,
    nullif(btrim(coalesce(p_image_url, ''::text)), ''::text),
    p_idempotency_key
  )
  returning id into v_office_id;

  -- ── Insert devices + initial snapshots ────────────────────────────────────────
  if p_device_types is not null and pg_catalog.cardinality(p_device_types) > 0 then
    for v_i in 1 .. pg_catalog.cardinality(p_device_types) loop
      v_device_type := p_device_types[v_i];

      -- device_key is globally unique: UUID prefix prevents collision across offices
      v_device_key := v_office_id::text || ':' || v_device_type::text;

      v_device_name := case v_device_type
        when 'SMART_LOCK'         then 'Smart Lock'
        when 'AIR_QUALITY_SENSOR' then 'Air Quality Sensor'
        when 'ELECTRICITY_METER'  then 'Electricity Meter'
        else                           v_device_type::text
      end;

      -- Default factory readings per device type
      v_device_state := case v_device_type
        when 'SMART_LOCK' then pg_catalog.jsonb_build_object(
          'battery',    87,
          'signal',     'good',
          'lock_state', 'locked',
          'door_state', 'closed',
          'open_count', 0
        )
        when 'AIR_QUALITY_SENSOR' then pg_catalog.jsonb_build_object(
          'co2_ppm',          620,
          'pm25',             8,
          'temperature_c',    23.4,
          'humidity_percent', 42,
          'air_quality',      'good'
        )
        when 'ELECTRICITY_METER' then pg_catalog.jsonb_build_object(
          'current_kw',  1.2,
          'today_kwh',   3.8,
          'voltage',     229,
          'load_status', 'normal'
        )
        else '{}'::jsonb
      end;

      -- INSERT fires the Phase 17A trigger → device_inventory_read_model populated
      -- INSERT fires the Phase 7B audit trigger → audit_logs populated
      insert into public.iot_devices (
        office_id,
        device_key,
        device_type,
        name,
        status,
        firmware_version
      )
      values (
        v_office_id,
        v_device_key,
        v_device_type,
        v_device_name,
        'ONLINE'::public.device_status,
        '1.0.0'
      )
      returning id into v_device_id;

      v_device_ids := v_device_ids || v_device_id;

      -- device_state_snapshots has unique index on device_id; safe for new devices
      insert into public.device_state_snapshots (
        device_id,
        state,
        observed_at
      )
      values (
        v_device_id,
        v_device_state,
        now()
      );
    end loop;
  end if;

  return pg_catalog.jsonb_build_object(
    'office_id',         v_office_id,
    'device_ids',        v_device_ids,
    'idempotent_replay', false
  );
end;
$$;

revoke all on function private.create_office_with_devices_workflow_v1(
  text, text, text, text, text,
  integer, integer, text,
  public.office_status, text,
  public.device_type[], uuid
) from public;