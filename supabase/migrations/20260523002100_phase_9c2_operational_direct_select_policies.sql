create policy operator_offices_select_scoped
on public.operator_offices
for select
to authenticated
using (
  deleted_at is null
  and (
    operator_id = (select auth.uid())
    or private.auth_is_owner_of_office(office_id)
    or (select private.auth_user_is_admin())
  )
);

create policy access_events_select_scoped
on public.access_events
for select
to authenticated
using (
  deleted_at is null
  and (
    actor_id = (select auth.uid())
    or (
      booking_id is not null
      and private.auth_can_access_booking(booking_id)
    )
    or (
      device_id is not null
      and private.auth_can_access_device(device_id)
    )
    or (select private.auth_user_is_admin())
  )
);

create policy telemetry_events_select_scoped
on public.telemetry_events
for select
to authenticated
using (private.auth_can_read_device_telemetry(device_id));

create policy device_state_snapshots_select_scoped
on public.device_state_snapshots
for select
to authenticated
using (private.auth_can_read_device_telemetry(device_id));

create policy incidents_select_operational_scoped
on public.incidents
for select
to authenticated
using (
  deleted_at is null
  and (
    (select private.auth_user_is_admin())
    or (
      office_id is not null
      and private.auth_can_manage_office(office_id)
    )
    or (
      device_id is not null
      and private.auth_can_access_device(device_id)
    )
    or (
      booking_id is not null
      and private.auth_can_access_booking(booking_id)
    )
    or (
      access_event_id is not null
      and exists (
        select 1
        from public.access_events as ae
        where ae.id = access_event_id
          and ae.deleted_at is null
          and (
            ae.actor_id = (select auth.uid())
            or (
              ae.booking_id is not null
              and private.auth_can_access_booking(ae.booking_id)
            )
            or (
              ae.device_id is not null
              and private.auth_can_access_device(ae.device_id)
            )
          )
      )
    )
  )
);
