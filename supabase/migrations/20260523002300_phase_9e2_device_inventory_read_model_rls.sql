alter table public.device_inventory_read_model enable row level security;
alter table public.device_inventory_read_model force row level security;

create policy device_inventory_read_model_select_scoped
on public.device_inventory_read_model
for select
to authenticated
using (
  private.auth_user_is_admin()
  or private.auth_can_manage_office(office_id)
);

create policy device_inventory_read_model_deny_insert
on public.device_inventory_read_model
for insert
with check (false);

create policy device_inventory_read_model_deny_update
on public.device_inventory_read_model
for update
using (false)
with check (false);

create policy device_inventory_read_model_deny_delete
on public.device_inventory_read_model
for delete
using (false);

grant select on public.device_inventory_read_model to authenticated;
