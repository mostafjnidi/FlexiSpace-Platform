create table public.device_inventory_read_model (
  id uuid primary key,
  office_id uuid not null references public.offices(id) on delete no action,
  office_name text not null,
  device_type public.device_type not null,
  name text not null,
  status public.device_status not null,
  firmware_version text,
  last_seen_at timestamptz,
  latest_snapshot_observed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint device_inventory_read_model_office_name_not_empty_check check (office_name <> ''),
  constraint device_inventory_read_model_name_not_empty_check check (name <> '')
);
