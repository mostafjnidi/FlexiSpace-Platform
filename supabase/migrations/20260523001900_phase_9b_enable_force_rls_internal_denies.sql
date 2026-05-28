alter table public.profiles enable row level security;
alter table public.profiles force row level security;

alter table public.offices enable row level security;
alter table public.offices force row level security;

alter table public.operator_offices enable row level security;
alter table public.operator_offices force row level security;

alter table public.office_availability_rules enable row level security;
alter table public.office_availability_rules force row level security;

alter table public.bookings enable row level security;
alter table public.bookings force row level security;

alter table public.booking_status_transitions enable row level security;
alter table public.booking_status_transitions force row level security;

alter table public.payments enable row level security;
alter table public.payments force row level security;

alter table public.webhook_events enable row level security;
alter table public.webhook_events force row level security;

alter table public.qr_tokens enable row level security;
alter table public.qr_tokens force row level security;

alter table public.iot_devices enable row level security;
alter table public.iot_devices force row level security;

alter table public.access_events enable row level security;
alter table public.access_events force row level security;

alter table public.telemetry_events enable row level security;
alter table public.telemetry_events force row level security;

alter table public.device_state_snapshots enable row level security;
alter table public.device_state_snapshots force row level security;

alter table public.jobs enable row level security;
alter table public.jobs force row level security;

alter table public.audit_logs enable row level security;
alter table public.audit_logs force row level security;

alter table public.outbox_events enable row level security;
alter table public.outbox_events force row level security;

alter table public.notifications enable row level security;
alter table public.notifications force row level security;

alter table public.incidents enable row level security;
alter table public.incidents force row level security;

create policy webhook_events_deny_select
on public.webhook_events
for select
using (false);

create policy webhook_events_deny_insert
on public.webhook_events
for insert
with check (false);

create policy webhook_events_deny_update
on public.webhook_events
for update
using (false)
with check (false);

create policy webhook_events_deny_delete
on public.webhook_events
for delete
using (false);

create policy qr_tokens_deny_select
on public.qr_tokens
for select
using (false);

create policy qr_tokens_deny_insert
on public.qr_tokens
for insert
with check (false);

create policy qr_tokens_deny_update
on public.qr_tokens
for update
using (false)
with check (false);

create policy qr_tokens_deny_delete
on public.qr_tokens
for delete
using (false);

create policy jobs_deny_select
on public.jobs
for select
using (false);

create policy jobs_deny_insert
on public.jobs
for insert
with check (false);

create policy jobs_deny_update
on public.jobs
for update
using (false)
with check (false);

create policy jobs_deny_delete
on public.jobs
for delete
using (false);

create policy audit_logs_deny_select
on public.audit_logs
for select
using (false);

create policy audit_logs_deny_insert
on public.audit_logs
for insert
with check (false);

create policy audit_logs_deny_update
on public.audit_logs
for update
using (false)
with check (false);

create policy audit_logs_deny_delete
on public.audit_logs
for delete
using (false);

create policy outbox_events_deny_select
on public.outbox_events
for select
using (false);

create policy outbox_events_deny_insert
on public.outbox_events
for insert
with check (false);

create policy outbox_events_deny_update
on public.outbox_events
for update
using (false)
with check (false);

create policy outbox_events_deny_delete
on public.outbox_events
for delete
using (false);
