-- Phase 20E: Usage Pricing + Booking Usage Summary Schema
--
-- Creates two new tables for post-session usage-based billing:
--   1. public.office_usage_pricing  — per-office electricity and ventilation rates
--   2. public.booking_usage_summaries — aggregated usage metrics written after checkout
--
-- RLS is enabled and forced on both tables.
-- Audit row-change triggers and hard-delete blockers follow the Phase 7B pattern.
-- No enum changes. No realtime publications. No Edge Function or frontend changes.

-- ── 1. public.office_usage_pricing ────────────────────────────────────────────

create table public.office_usage_pricing (
  id                              uuid        primary key default gen_random_uuid(),
  office_id                       uuid        not null unique references public.offices(id),
  electricity_price_per_kwh_cents integer     not null default 15,
  ventilation_fee_per_hour_cents  integer     not null default 200,
  currency                        text        not null default 'USD',
  created_at                      timestamptz not null default now(),
  updated_at                      timestamptz not null default now(),
  deleted_at                      timestamptz,

  constraint office_usage_pricing_kwh_price_cents_nonneg_check
    check (electricity_price_per_kwh_cents >= 0),
  constraint office_usage_pricing_vent_fee_cents_nonneg_check
    check (ventilation_fee_per_hour_cents >= 0),
  constraint office_usage_pricing_currency_format_check
    check (currency ~ '^[A-Z]{3}$')
);

-- ── 2. public.booking_usage_summaries ─────────────────────────────────────────

create table public.booking_usage_summaries (
  id                    uuid          primary key default gen_random_uuid(),
  booking_id            uuid          not null unique references public.bookings(id),
  session_started_at    timestamptz,
  session_ended_at      timestamptz,
  session_minutes       integer       not null default 0,
  session_kwh           numeric(10,3) not null default 0,
  electricity_fee_cents integer       not null default 0,
  avg_co2_ppm           numeric(8,1),
  avg_pm25              numeric(8,2),
  avg_temperature_c     numeric(5,1),
  avg_humidity_percent  numeric(5,1),
  ventilation_fee_cents integer       not null default 0,
  door_open_count       integer       not null default 0,
  access_event_count    integer       not null default 0,
  last_access_method    text,
  total_usage_fee_cents integer       not null default 0,
  currency              text          not null default 'USD',
  calculated_at         timestamptz   not null default now(),
  created_at            timestamptz   not null default now(),
  updated_at            timestamptz   not null default now(),
  deleted_at            timestamptz,

  constraint booking_usage_summaries_session_minutes_nonnegative_check
    check (session_minutes >= 0),
  constraint booking_usage_summaries_session_kwh_nonnegative_check
    check (session_kwh >= 0),
  constraint booking_usage_summaries_electricity_fee_cents_nonnegative_check
    check (electricity_fee_cents >= 0),
  constraint booking_usage_summaries_ventilation_fee_cents_nonnegative_check
    check (ventilation_fee_cents >= 0),
  constraint booking_usage_summaries_door_open_count_nonnegative_check
    check (door_open_count >= 0),
  constraint booking_usage_summaries_access_event_count_nonnegative_check
    check (access_event_count >= 0),
  constraint booking_usage_summaries_total_usage_fee_cents_nonnegative_check
    check (total_usage_fee_cents >= 0),
  constraint booking_usage_summaries_currency_format_check
    check (currency ~ '^[A-Z]{3}$'),
  constraint booking_usage_summaries_session_time_range_check
    check (
      session_started_at is null
      or session_ended_at is null
      or session_ended_at >= session_started_at
    )
);

-- ── Indexes ────────────────────────────────────────────────────────────────────
-- The UNIQUE constraints above create implicit indexes on
-- office_usage_pricing.office_id and booking_usage_summaries.booking_id.

-- Supports time-range queries and recency ordering on booking_usage_summaries.
create index booking_usage_summaries_calculated_at_idx
  on public.booking_usage_summaries (calculated_at);

-- ── RLS: enable and force ─────────────────────────────────────────────────────

alter table public.office_usage_pricing    enable row level security;
alter table public.office_usage_pricing    force  row level security;

alter table public.booking_usage_summaries enable row level security;
alter table public.booking_usage_summaries force  row level security;

-- ── RLS policies: office_usage_pricing ────────────────────────────────────────

-- SELECT: mirrors offices_select_catalog_or_manager.
-- Authenticated users may read pricing for offices that appear in the catalog
-- (status = ACTIVE) or offices they manage (OWNER / OPERATOR / ADMIN).
create policy office_usage_pricing_select_catalog_or_manager
on public.office_usage_pricing
for select
to authenticated
using (
  deleted_at is null
  and exists (
    select 1
    from public.offices as o
    where o.id = office_usage_pricing.office_id
      and o.deleted_at is null
      and (
        o.status = 'ACTIVE'::public.office_status
        or private.auth_can_manage_office(o.id)
      )
  )
);

-- No broad INSERT / UPDATE / DELETE from the frontend.
-- Mutations are reserved for future service-role checkout workflows.
create policy office_usage_pricing_deny_insert
on public.office_usage_pricing
for insert
with check (false);

create policy office_usage_pricing_deny_update
on public.office_usage_pricing
for update
using (false)
with check (false);

create policy office_usage_pricing_deny_delete
on public.office_usage_pricing
for delete
using (false);

-- ── RLS policies: booking_usage_summaries ─────────────────────────────────────

-- SELECT: reuses private.auth_can_access_booking which grants access to:
--   - the booking's own user  (USER path)
--   - OWNER / OPERATOR of the office (manager path)
--   - ADMIN (via auth_can_manage_office → auth_user_is_admin)
create policy booking_usage_summaries_select_scoped
on public.booking_usage_summaries
for select
to authenticated
using (
  deleted_at is null
  and private.auth_can_access_booking(booking_id)
);

-- No broad INSERT / UPDATE / DELETE from the frontend.
-- Mutations are reserved for future service-role checkout workflows.
create policy booking_usage_summaries_deny_insert
on public.booking_usage_summaries
for insert
with check (false);

create policy booking_usage_summaries_deny_update
on public.booking_usage_summaries
for update
using (false)
with check (false);

create policy booking_usage_summaries_deny_delete
on public.booking_usage_summaries
for delete
using (false);

-- ── Grants ─────────────────────────────────────────────────────────────────────

grant select on public.office_usage_pricing    to authenticated;
grant select on public.booking_usage_summaries to authenticated;

-- ── Audit triggers (Phase 7B pattern) ─────────────────────────────────────────

drop trigger if exists audit_office_usage_pricing_row_changes
  on public.office_usage_pricing;
create trigger audit_office_usage_pricing_row_changes
after insert or update or delete on public.office_usage_pricing
for each row
execute function private.audit_row_change('office_usage_pricing', 'id', '');

drop trigger if exists block_office_usage_pricing_hard_delete
  on public.office_usage_pricing;
create trigger block_office_usage_pricing_hard_delete
before delete on public.office_usage_pricing
for each row
execute function private.block_hard_delete();

drop trigger if exists audit_booking_usage_summaries_row_changes
  on public.booking_usage_summaries;
create trigger audit_booking_usage_summaries_row_changes
after insert or update or delete on public.booking_usage_summaries
for each row
execute function private.audit_row_change('booking_usage_summary', 'id', '');

drop trigger if exists block_booking_usage_summaries_hard_delete
  on public.booking_usage_summaries;
create trigger block_booking_usage_summaries_hard_delete
before delete on public.booking_usage_summaries
for each row
execute function private.block_hard_delete();