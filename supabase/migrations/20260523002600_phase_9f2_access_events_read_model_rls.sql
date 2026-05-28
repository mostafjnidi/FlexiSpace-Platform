alter table public.access_events_read_model enable row level security;
alter table public.access_events_read_model force row level security;

create policy access_events_read_model_select_scoped
on public.access_events_read_model
for select
to authenticated
using (
  actor_id = (select auth.uid())
  or (select private.auth_user_is_admin())
  or (
    booking_id is not null
    and private.auth_can_access_booking(booking_id)
  )
  or (
    office_id is not null
    and private.auth_can_manage_office(office_id)
  )
);

create policy access_events_read_model_deny_insert
on public.access_events_read_model
for insert
with check (false);

create policy access_events_read_model_deny_update
on public.access_events_read_model
for update
using (false)
with check (false);

create policy access_events_read_model_deny_delete
on public.access_events_read_model
for delete
using (false);

grant select on public.access_events_read_model to authenticated;
