with selected_offices as (
  select
    id as office_id,
    name as office_name
  from public.offices
  where deleted_at is null
  order by created_at, id
  limit 3
),
demo_devices as (
  select
    office_id,
    office_name,
    device_type::public.device_type,
    device_name,
    latest_snapshot_observed_at,
    md5(office_id::text || ':' || device_type) as device_id_hash
  from selected_offices
  cross join lateral (
    values
      (
        'SMART_LOCK',
        office_name || ' Smart Lock',
        null::timestamptz
      ),
      (
        'AIR_QUALITY_SENSOR',
        office_name || ' Air Quality',
        now()
      ),
      (
        'ELECTRICITY_METER',
        office_name || ' Electricity Meter',
        now()
      )
  ) as devices(device_type, device_name, latest_snapshot_observed_at)
)
insert into public.device_inventory_read_model (
  id,
  office_id,
  office_name,
  device_type,
  name,
  status,
  firmware_version,
  last_seen_at,
  latest_snapshot_observed_at,
  updated_at
)
select
  (
    substr(device_id_hash, 1, 8) || '-' ||
    substr(device_id_hash, 9, 4) || '-' ||
    substr(device_id_hash, 13, 4) || '-' ||
    substr(device_id_hash, 17, 4) || '-' ||
    substr(device_id_hash, 21, 12)
  )::uuid,
  office_id,
  office_name,
  device_type,
  device_name,
  'ONLINE'::public.device_status,
  'v1.0.0-demo',
  now(),
  latest_snapshot_observed_at,
  now()
from demo_devices
on conflict (id) do update set
  office_id = excluded.office_id,
  office_name = excluded.office_name,
  device_type = excluded.device_type,
  name = excluded.name,
  status = excluded.status,
  firmware_version = excluded.firmware_version,
  last_seen_at = excluded.last_seen_at,
  latest_snapshot_observed_at = excluded.latest_snapshot_observed_at,
  updated_at = excluded.updated_at;
