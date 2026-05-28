create table profiles (
  id uuid primary key references auth.users(id) on delete no action,
  email text not null unique,
  full_name text not null,
  role user_role not null default 'USER',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint profiles_email_not_empty_check check (email <> ''),
  constraint profiles_full_name_not_empty_check check (full_name <> '')
);

create table offices (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id),
  name text not null,
  description text,
  building text,
  floor text,
  room text,
  capacity integer not null,
  hourly_rate_cents integer not null,
  currency text not null default 'USD',
  status office_status not null default 'ACTIVE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint offices_name_not_empty_check check (name <> ''),
  constraint offices_capacity_positive_check check (capacity > 0),
  constraint offices_hourly_rate_cents_nonnegative_check check (hourly_rate_cents >= 0),
  constraint offices_currency_format_check check (currency ~ '^[A-Z]{3}$')
);

create table operator_offices (
  id uuid primary key default gen_random_uuid(),
  operator_id uuid not null references profiles(id),
  office_id uuid not null references offices(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table office_availability_rules (
  id uuid primary key default gen_random_uuid(),
  office_id uuid not null references offices(id),
  day_of_week integer not null,
  start_minute integer not null,
  end_minute integer not null,
  is_available boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint office_availability_rules_day_of_week_check check (day_of_week between 0 and 6),
  constraint office_availability_rules_start_minute_min_check check (start_minute >= 0),
  constraint office_availability_rules_start_minute_max_check check (start_minute < 1440),
  constraint office_availability_rules_end_minute_min_check check (end_minute > 0),
  constraint office_availability_rules_end_minute_max_check check (end_minute <= 1440),
  constraint office_availability_rules_minute_range_check check (start_minute < end_minute)
);

create table bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id),
  office_id uuid not null references offices(id),
  status booking_status not null default 'PENDING_APPROVAL',
  start_time timestamptz not null,
  end_time timestamptz not null,
  amount_cents integer not null,
  currency text not null default 'USD',
  idempotency_key uuid not null,
  degraded_mode boolean not null default false,
  checked_in_at timestamptz,
  checked_out_at timestamptz,
  cancelled_at timestamptz,
  cancelled_by uuid references profiles(id),
  cancellation_reason text,
  cancelled_by_role user_role,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint bookings_time_range_check check (start_time < end_time),
  constraint bookings_amount_cents_nonnegative_check check (amount_cents >= 0),
  constraint bookings_currency_format_check check (currency ~ '^[A-Z]{3}$')
);
