create policy offices_update_by_manager
on public.offices
for update
to authenticated
using (
  private.auth_is_owner_of_office(id)
  or (select private.auth_user_is_admin())
)
with check (
  (auth.uid() = owner_id)
  or (select private.auth_user_is_admin())
);