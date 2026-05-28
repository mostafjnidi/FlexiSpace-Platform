create index if not exists idx_offices_owner_id
  on offices (owner_id);

create index if not exists idx_offices_active_status
  on offices (status)
  where deleted_at is null;

create index if not exists idx_operator_offices_operator_id
  on operator_offices (operator_id);

create index if not exists idx_operator_offices_office_id
  on operator_offices (office_id);

create index if not exists idx_office_availability_rules_office_id
  on office_availability_rules (office_id);

create index if not exists idx_bookings_user_id
  on bookings (user_id);

create index if not exists idx_bookings_office_id
  on bookings (office_id);

create index if not exists idx_bookings_cancelled_by
  on bookings (cancelled_by)
  where cancelled_by is not null;

create index if not exists idx_bookings_active_user_start
  on bookings (user_id, start_time)
  where deleted_at is null;

create index if not exists idx_bookings_active_office_start
  on bookings (office_id, start_time)
  where deleted_at is null;

create index if not exists idx_payments_booking_id
  on payments (booking_id);

create index if not exists idx_qr_tokens_booking_id
  on qr_tokens (booking_id);

create index if not exists idx_iot_devices_office_id
  on iot_devices (office_id);

create index if not exists idx_iot_devices_active_office_status
  on iot_devices (office_id, status)
  where deleted_at is null;

create index if not exists idx_access_events_booking_id
  on access_events (booking_id)
  where booking_id is not null;

create index if not exists idx_access_events_device_id
  on access_events (device_id)
  where device_id is not null;

create index if not exists idx_access_events_actor_id
  on access_events (actor_id)
  where actor_id is not null;

create index if not exists idx_access_events_active_device_requested
  on access_events (device_id, requested_at)
  where deleted_at is null
    and device_id is not null;

create index if not exists idx_telemetry_events_device_id
  on telemetry_events (device_id);

create index if not exists idx_device_state_snapshots_last_event_id
  on device_state_snapshots (last_event_id)
  where last_event_id is not null;

create index if not exists idx_audit_logs_actor_id
  on audit_logs (actor_id)
  where actor_id is not null;

create index if not exists idx_notifications_user_id
  on notifications (user_id);

create index if not exists idx_notifications_user_unread
  on notifications (user_id, created_at)
  where deleted_at is null
    and read_at is null;

create index if not exists idx_incidents_office_id
  on incidents (office_id)
  where office_id is not null;

create index if not exists idx_incidents_device_id
  on incidents (device_id)
  where device_id is not null;

create index if not exists idx_incidents_booking_id
  on incidents (booking_id)
  where booking_id is not null;

create index if not exists idx_incidents_access_event_id
  on incidents (access_event_id)
  where access_event_id is not null;

create index if not exists idx_incidents_active_status_created
  on incidents (status, created_at)
  where deleted_at is null;

create index if not exists idx_jobs_pending_run_at
  on jobs (run_at, id)
  where status = 'PENDING'
    and deleted_at is null;

create index if not exists idx_jobs_running_locked_at
  on jobs (locked_at)
  where status = 'RUNNING'
    and locked_at is not null
    and deleted_at is null;

create index if not exists idx_outbox_events_pending_created
  on outbox_events (created_at, id)
  where status = 'PENDING';
