-- Maintenance Tasks Table
-- Schema, RLS, audit trigger, hard-delete blocker, index.

create table public.maintenance_tasks (
  id          uuid        primary key default gen_random_uuid(),
  office_id   uuid        references public.offices(id) on delete cascade,
  created_by  uuid        references public.profiles(id),
  assigned_to text,
  title       text        not null,
  location    text,
  task_type   text        not null default 'other',
  priority    text        not null default 'normal',
  status      text        not null default 'open',
  deleted_at  timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Enable + force RLS
alter table public.maintenance_tasks enable row level security;
alter table public.maintenance_tasks force row level security;

-- Internal deny policies (same pattern as Phase 9B)
create policy maintenance_tasks_deny_insert
  on public.maintenance_tasks for insert to public with check (false);

create policy maintenance_tasks_deny_update
  on public.maintenance_tasks for update to public using (false);

create policy maintenance_tasks_deny_delete
  on public.maintenance_tasks for delete to public using (false);

-- SELECT: owner of the office OR assigned operator OR admin
create policy maintenance_tasks_select_by_manager
  on public.maintenance_tasks
  for select
  to authenticated
  using (
    deleted_at is null
    and private.auth_can_manage_office(office_id)
  );

-- Grant SELECT to authenticated (service_role has all privileges by default)
grant select on public.maintenance_tasks to authenticated;

-- Index for common query pattern
create index maintenance_tasks_office_status_idx
  on public.maintenance_tasks(office_id, status)
  where deleted_at is null;

-- Audit trigger (Phase 7B pattern)
drop trigger if exists audit_maintenance_tasks_row_changes on public.maintenance_tasks;
create trigger audit_maintenance_tasks_row_changes
  after insert or update or delete on public.maintenance_tasks
  for each row
  execute function private.audit_row_change('maintenance_task', 'id', '');

-- Hard-delete blocker (Phase 7B pattern)
drop trigger if exists block_maintenance_tasks_hard_delete on public.maintenance_tasks;
create trigger block_maintenance_tasks_hard_delete
  before delete on public.maintenance_tasks
  for each row
  execute function private.block_hard_delete();