-- Phase 22b: Seed iot_devices ELECTRICITY_METER + AIR_QUALITY_SENSOR rows
-- for every office that lacks them.
--
-- Mirrors Phase 22a (SMART_LOCK) — same deterministic ID formula.
-- Uses md5(office_id::text || ':DEVICE_TYPE') to match Phase 9e3 read-model IDs.
-- Only inserts for offices with NO existing device of that type.

-- Actor context required by audit trigger on iot_devices.
select private.set_actor_context(
  null,
  'SYSTEM'::public.actor_type,
  'phase-22b-seed-electricity-air-devices'
);

-- ── ELECTRICITY_METER ─────────────────────────────────────────────────────────

with offices_needing_elec as (
  select o.id as office_id, o.name as office_name
  from public.offices o
  where o.deleted_at is null
    and not exists (
      select 1
      from public.iot_devices d
      where d.office_id   = o.id
        and d.device_type = 'ELECTRICITY_METER'
        and d.deleted_at  is null
    )
),
elec_ids as (
  select
    office_id,
    office_name,
    (
      substr(md5(office_id::text || ':ELECTRICITY_METER'), 1,  8) || '-' ||
      substr(md5(office_id::text || ':ELECTRICITY_METER'), 9,  4) || '-' ||
      substr(md5(office_id::text || ':ELECTRICITY_METER'), 13, 4) || '-' ||
      substr(md5(office_id::text || ':ELECTRICITY_METER'), 17, 4) || '-' ||
      substr(md5(office_id::text || ':ELECTRICITY_METER'), 21, 12)
    )::uuid as device_id
  from offices_needing_elec
)
insert into public.iot_devices (
  id,
  office_id,
  device_key,
  device_type,
  name,
  status,
  firmware_version,
  last_seen_at
)
select
  device_id,
  office_id,
  'demo-electricity-meter-' || office_id::text,
  'ELECTRICITY_METER'::public.device_type,
  office_name || ' Electricity Meter',
  'ONLINE'::public.device_status,
  'v1.0.0-demo',
  now()
from elec_ids;

-- ── AIR_QUALITY_SENSOR ────────────────────────────────────────────────────────

with offices_needing_air as (
  select o.id as office_id, o.name as office_name
  from public.offices o
  where o.deleted_at is null
    and not exists (
      select 1
      from public.iot_devices d
      where d.office_id   = o.id
        and d.device_type = 'AIR_QUALITY_SENSOR'
        and d.deleted_at  is null
    )
),
air_ids as (
  select
    office_id,
    office_name,
    (
      substr(md5(office_id::text || ':AIR_QUALITY_SENSOR'), 1,  8) || '-' ||
      substr(md5(office_id::text || ':AIR_QUALITY_SENSOR'), 9,  4) || '-' ||
      substr(md5(office_id::text || ':AIR_QUALITY_SENSOR'), 13, 4) || '-' ||
      substr(md5(office_id::text || ':AIR_QUALITY_SENSOR'), 17, 4) || '-' ||
      substr(md5(office_id::text || ':AIR_QUALITY_SENSOR'), 21, 12)
    )::uuid as device_id
  from offices_needing_air
)
insert into public.iot_devices (
  id,
  office_id,
  device_key,
  device_type,
  name,
  status,
  firmware_version,
  last_seen_at
)
select
  device_id,
  office_id,
  'demo-air-sensor-' || office_id::text,
  'AIR_QUALITY_SENSOR'::public.device_type,
  office_name || ' Air Quality Sensor',
  'ONLINE'::public.device_status,
  'v1.0.0-demo',
  now()
from air_ids;

select private.clear_actor_context();