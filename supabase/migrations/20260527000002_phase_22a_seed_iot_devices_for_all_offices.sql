-- Phase 22a: Seed iot_devices SMART_LOCK rows for every office that lacks one.
--
-- Two problems this fixes:
--   1. Phase 9e3 demo seed inserted directly into device_inventory_read_model with
--      deterministic hash IDs, but those IDs never existed in iot_devices.
--      mock_app_unlock_workflow_v1 queries iot_devices → DEVICE_NOT_FOUND.
--   2. Offices created after the demo seed (e.g. Phase 18/20 test offices) have no
--      devices at all if device_types was omitted at creation time.
--
-- Strategy:
--   - Only insert for offices with NO existing SMART_LOCK in iot_devices.
--   - Use the same deterministic ID formula as Phase 9e3 so existing
--     device_inventory_read_model rows are updated in-place by the
--     sync_device_inventory_read_model trigger.
--   - device_key uses a prefix that cannot collide with the office-workflow format.

with offices_needing_lock as (
  select o.id as office_id, o.name as office_name
  from public.offices o
  where o.deleted_at is null
    and not exists (
      select 1
      from public.iot_devices d
      where d.office_id   = o.id
        and d.device_type = 'SMART_LOCK'
        and d.deleted_at  is null
    )
),
device_ids as (
  select
    office_id,
    office_name,
    (
      substr(md5(office_id::text || ':SMART_LOCK'), 1,  8) || '-' ||
      substr(md5(office_id::text || ':SMART_LOCK'), 9,  4) || '-' ||
      substr(md5(office_id::text || ':SMART_LOCK'), 13, 4) || '-' ||
      substr(md5(office_id::text || ':SMART_LOCK'), 17, 4) || '-' ||
      substr(md5(office_id::text || ':SMART_LOCK'), 21, 12)
    )::uuid as device_id
  from offices_needing_lock
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
  'demo-smart-lock-' || office_id::text,
  'SMART_LOCK'::public.device_type,
  office_name || ' Smart Lock',
  'ONLINE'::public.device_status,
  'v1.0.0-demo',
  now()
from device_ids;