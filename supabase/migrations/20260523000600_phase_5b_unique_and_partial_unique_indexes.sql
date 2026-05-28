create unique index if not exists operator_offices_active_assignment_uidx
  on operator_offices (operator_id, office_id)
  where deleted_at is null;

create unique index if not exists office_availability_rules_active_rule_uidx
  on office_availability_rules (office_id, day_of_week, start_minute, end_minute)
  where deleted_at is null;

create unique index if not exists bookings_user_idempotency_active_uidx
  on bookings (user_id, idempotency_key)
  where deleted_at is null;

create unique index if not exists payments_active_idempotency_uidx
  on payments (booking_id, idempotency_key)
  where deleted_at is null;

create unique index if not exists payments_gateway_payment_uidx
  on payments (gateway, gateway_payment_id)
  where gateway_payment_id is not null
    and deleted_at is null;

create unique index if not exists webhook_events_gateway_event_uidx
  on webhook_events (gateway, event_id);

create unique index if not exists qr_tokens_token_hash_uidx
  on qr_tokens (token_hash);

create unique index if not exists qr_tokens_active_booking_uidx
  on qr_tokens (booking_id)
  where deleted_at is null
    and revoked_at is null;

create unique index if not exists iot_devices_device_key_uidx
  on iot_devices (device_key);

create unique index if not exists access_events_command_id_uidx
  on access_events (command_id)
  where command_id is not null;

create unique index if not exists device_state_snapshots_device_id_uidx
  on device_state_snapshots (device_id);

create unique index if not exists jobs_idempotency_uidx
  on jobs (job_type, idempotency_key)
  where idempotency_key is not null
    and deleted_at is null;

create unique index if not exists outbox_events_idempotency_uidx
  on outbox_events (idempotency_key)
  where idempotency_key is not null;
