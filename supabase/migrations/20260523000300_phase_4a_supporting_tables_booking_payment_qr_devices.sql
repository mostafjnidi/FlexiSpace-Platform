create table booking_status_transitions (
  id uuid primary key default gen_random_uuid(),
  from_status booking_status not null,
  to_status booking_status not null,
  allowed_actor_types actor_type[] not null,
  created_at timestamptz not null default now(),
  constraint booking_status_transitions_distinct_status_check check (from_status <> to_status),
  constraint booking_status_transitions_allowed_actor_types_not_empty_check check (array_length(allowed_actor_types, 1) > 0)
);

create table payments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references bookings(id) on delete no action,
  gateway payment_gateway not null default 'MOCK',
  gateway_payment_id text,
  status payment_status not null default 'PENDING',
  amount_cents integer not null,
  currency text not null default 'USD',
  idempotency_key uuid not null,
  paid_at timestamptz,
  refunded_at timestamptz,
  expires_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint payments_amount_cents_nonnegative_check check (amount_cents >= 0),
  constraint payments_currency_format_check check (currency ~ '^[A-Z]{3}$')
);

create table webhook_events (
  id uuid primary key default gen_random_uuid(),
  gateway payment_gateway not null default 'MOCK',
  event_id text not null,
  event_type text not null,
  event_created_at timestamptz,
  payload jsonb not null,
  signature_verified boolean not null default false,
  request_id text,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  processing_error text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint webhook_events_event_id_not_empty_check check (event_id <> ''),
  constraint webhook_events_event_type_not_empty_check check (event_type <> '')
);

create table qr_tokens (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references bookings(id) on delete no action,
  jti uuid not null,
  token_hash text not null,
  encrypted_token text not null,
  valid_from timestamptz not null,
  expires_at timestamptz not null,
  used_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint qr_tokens_token_hash_not_empty_check check (token_hash <> ''),
  constraint qr_tokens_encrypted_token_not_empty_check check (encrypted_token <> ''),
  constraint qr_tokens_valid_time_range_check check (valid_from < expires_at)
);

create table iot_devices (
  id uuid primary key default gen_random_uuid(),
  office_id uuid not null references offices(id) on delete no action,
  device_key text not null,
  device_type device_type not null,
  name text not null,
  status device_status not null default 'OFFLINE',
  firmware_version text,
  last_seen_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint iot_devices_device_key_not_empty_check check (device_key <> ''),
  constraint iot_devices_name_not_empty_check check (name <> '')
);
