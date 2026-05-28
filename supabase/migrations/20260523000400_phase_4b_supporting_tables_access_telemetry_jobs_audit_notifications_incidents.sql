create table access_events (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references bookings(id) on delete no action,
  device_id uuid references iot_devices(id) on delete no action,
  actor_id uuid references profiles(id) on delete no action,
  actor_type actor_type,
  command_id uuid,
  access_method access_method not null,
  status access_event_status not null default 'PENDING_ACK',
  attempt integer not null default 1,
  reason text,
  requested_at timestamptz not null default now(),
  acknowledged_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint access_events_attempt_positive_check check (attempt > 0)
);

create table telemetry_events (
  id uuid primary key default gen_random_uuid(),
  device_id uuid not null references iot_devices(id) on delete no action,
  event_type text not null,
  payload jsonb not null,
  observed_at timestamptz not null,
  received_at timestamptz not null default now(),
  constraint telemetry_events_event_type_not_empty_check check (event_type <> '')
);

create table device_state_snapshots (
  id uuid primary key default gen_random_uuid(),
  device_id uuid not null references iot_devices(id) on delete no action,
  state jsonb not null default '{}'::jsonb,
  last_event_id uuid references telemetry_events(id) on delete no action,
  observed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table jobs (
  id uuid primary key default gen_random_uuid(),
  job_type text not null,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'PENDING',
  run_at timestamptz not null,
  attempts integer not null default 0,
  max_attempts integer not null default 3,
  idempotency_key text,
  locked_by text,
  locked_at timestamptz,
  completed_at timestamptz,
  cancelled_at timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint jobs_job_type_not_empty_check check (job_type <> ''),
  constraint jobs_status_check check (status in ('PENDING', 'RUNNING', 'SUCCEEDED', 'FAILED', 'DEAD_LETTER', 'CANCELLED')),
  constraint jobs_attempts_nonnegative_check check (attempts >= 0),
  constraint jobs_max_attempts_positive_check check (max_attempts > 0)
);

create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references profiles(id) on delete no action,
  actor_type actor_type not null,
  entity_type text not null,
  entity_id uuid,
  action text not null,
  request_id text,
  before_state jsonb,
  after_state jsonb,
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now(),
  constraint audit_logs_entity_type_not_empty_check check (entity_type <> ''),
  constraint audit_logs_action_not_empty_check check (action <> '')
);

create table outbox_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  aggregate_type text not null,
  aggregate_id uuid not null,
  version integer not null default 1,
  payload jsonb not null,
  status text not null default 'PENDING',
  idempotency_key text,
  published_at timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint outbox_events_event_type_not_empty_check check (event_type <> ''),
  constraint outbox_events_aggregate_type_not_empty_check check (aggregate_type <> ''),
  constraint outbox_events_version_positive_check check (version > 0),
  constraint outbox_events_status_check check (status in ('PENDING', 'PUBLISHED', 'FAILED', 'CANCELLED'))
);

create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete no action,
  type notification_type not null,
  title text not null,
  body text not null,
  data jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint notifications_title_not_empty_check check (title <> ''),
  constraint notifications_body_not_empty_check check (body <> '')
);

create table incidents (
  id uuid primary key default gen_random_uuid(),
  type incident_type not null,
  status incident_status not null default 'OPEN',
  office_id uuid references offices(id) on delete no action,
  device_id uuid references iot_devices(id) on delete no action,
  booking_id uuid references bookings(id) on delete no action,
  access_event_id uuid references access_events(id) on delete no action,
  description text not null,
  metadata jsonb not null default '{}'::jsonb,
  acknowledged_at timestamptz,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint incidents_description_not_empty_check check (description <> ''),
  constraint incidents_subject_present_check check (
    office_id is not null
    or device_id is not null
    or booking_id is not null
    or access_event_id is not null
  )
);
