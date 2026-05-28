with source_rows as (
  select
    ae.id as access_event_id,
    ae.booking_id,
    ae.actor_id,
    ae.actor_type,
    ae.access_method,
    ae.status,
    ae.requested_at,
    ae.created_at as access_created_at,
    b.office_id,
    p.full_name,
    p.role,
    o.name as office_name,
    o.building,
    o.floor,
    o.room,
    md5('access_events_read_model:' || ae.id::text) as row_hash
  from public.access_events as ae
  left join public.bookings as b
    on b.id = ae.booking_id
    and b.deleted_at is null
  left join public.offices as o
    on o.id = b.office_id
    and o.deleted_at is null
  left join public.profiles as p
    on p.id = ae.actor_id
    and p.deleted_at is null
  where ae.deleted_at is null
),
mapped_rows as (
  select
    (
      substr(row_hash, 1, 8) || '-' ||
      substr(row_hash, 9, 4) || '-' ||
      substr(row_hash, 13, 4) || '-' ||
      substr(row_hash, 17, 4) || '-' ||
      substr(row_hash, 21, 12)
    )::uuid as id,
    access_event_id,
    booking_id,
    office_id,
    actor_id,
    coalesce(requested_at, access_created_at) as occurred_at,
    to_char(coalesce(requested_at, access_created_at), 'YYYY-MM-DD') as date_label,
    to_char(coalesce(requested_at, access_created_at), 'HH24:MI:SS') as time_label,
    coalesce(
      'ACT-' || upper(substr(replace(actor_id::text, '-', ''), 1, 8)),
      'SYSTEM'
    ) as actor_display_id,
    coalesce(nullif(full_name, ''), 'Member') as actor_display_name,
    coalesce(role::text, actor_type::text, 'UNKNOWN') as actor_display_type,
    coalesce(
      nullif(
        concat_ws(
          ' - ',
          nullif(office_name, ''),
          nullif(building, ''),
          nullif(floor, ''),
          nullif(room, '')
        ),
        ''
      ),
      'Workspace'
    ) as location_label,
    lower(replace(access_method::text, '_', '-')) as access_method,
    case
      when status in ('ACKED', 'MANUAL_OVERRIDE') then 'granted'
      when status in ('DENIED', 'FAILED_NO_ACK', 'REVOKED') then 'denied'
      else lower(replace(status::text, '_', '-'))
    end as status,
    case
      when status = 'ACKED' then 'Granted'
      when status = 'MANUAL_OVERRIDE' then 'Manual override'
      when status = 'DENIED' then 'Denied'
      when status = 'FAILED_NO_ACK' then 'Acknowledgement failed'
      when status = 'REVOKED' then 'Revoked'
      when status = 'PENDING_ACK' then 'Pending acknowledgement'
      else initcap(lower(replace(status::text, '_', ' ')))
    end as status_label,
    status in ('DENIED', 'FAILED_NO_ACK', 'REVOKED') as is_security_alert,
    status in ('DENIED', 'FAILED_NO_ACK', 'MANUAL_OVERRIDE', 'REVOKED') as is_anomaly,
    case
      when status = 'ACKED' then 'Access granted'
      when status = 'MANUAL_OVERRIDE' then 'Manual override recorded'
      when status = 'DENIED' then 'Access denied'
      when status = 'FAILED_NO_ACK' then 'Access acknowledgement failed'
      when status = 'REVOKED' then 'Access revoked'
      when status = 'PENDING_ACK' then 'Awaiting acknowledgement'
      else 'Access event recorded'
    end as reason_label
  from source_rows
)
insert into public.access_events_read_model (
  id,
  access_event_id,
  booking_id,
  office_id,
  actor_id,
  occurred_at,
  date_label,
  time_label,
  actor_display_id,
  actor_display_name,
  actor_display_type,
  location_label,
  access_method,
  status,
  status_label,
  is_security_alert,
  is_anomaly,
  reason_label,
  created_at,
  updated_at
)
select
  id,
  access_event_id,
  booking_id,
  office_id,
  actor_id,
  occurred_at,
  date_label,
  time_label,
  actor_display_id,
  actor_display_name,
  actor_display_type,
  location_label,
  access_method,
  status,
  status_label,
  is_security_alert,
  is_anomaly,
  reason_label,
  now(),
  now()
from mapped_rows
on conflict (id) do update set
  access_event_id = excluded.access_event_id,
  booking_id = excluded.booking_id,
  office_id = excluded.office_id,
  actor_id = excluded.actor_id,
  occurred_at = excluded.occurred_at,
  date_label = excluded.date_label,
  time_label = excluded.time_label,
  actor_display_id = excluded.actor_display_id,
  actor_display_name = excluded.actor_display_name,
  actor_display_type = excluded.actor_display_type,
  location_label = excluded.location_label,
  access_method = excluded.access_method,
  status = excluded.status,
  status_label = excluded.status_label,
  is_security_alert = excluded.is_security_alert,
  is_anomaly = excluded.is_anomaly,
  reason_label = excluded.reason_label,
  updated_at = now();
