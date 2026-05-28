create policy profiles_select_own_or_admin
on public.profiles
for select
to authenticated
using (
  id = (select auth.uid())
  or (select private.auth_user_is_admin())
);

create policy offices_select_catalog_or_manager
on public.offices
for select
to authenticated
using (
  deleted_at is null
  and (
    status = 'ACTIVE'::public.office_status
    or private.auth_can_manage_office(id)
  )
);

create policy office_availability_rules_select_visible_offices
on public.office_availability_rules
for select
to authenticated
using (
  deleted_at is null
  and exists (
    select 1
    from public.offices as o
    where o.id = office_availability_rules.office_id
      and o.deleted_at is null
      and (
        o.status = 'ACTIVE'::public.office_status
        or private.auth_can_manage_office(o.id)
      )
  )
);

create policy bookings_select_scoped
on public.bookings
for select
to authenticated
using (
  deleted_at is null
  and (
    user_id = (select auth.uid())
    or private.auth_can_manage_office(office_id)
  )
);

create policy booking_status_transitions_select_authenticated
on public.booking_status_transitions
for select
to authenticated
using ((select auth.uid()) is not null);

create policy payments_select_by_accessible_booking
on public.payments
for select
to authenticated
using (
  deleted_at is null
  and private.auth_can_access_booking(booking_id)
);

create policy notifications_select_own_or_admin
on public.notifications
for select
to authenticated
using (
  deleted_at is null
  and (
    user_id = (select auth.uid())
    or (select private.auth_user_is_admin())
  )
);
