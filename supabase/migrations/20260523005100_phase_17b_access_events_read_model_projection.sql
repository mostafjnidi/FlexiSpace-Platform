do $$
begin
  if not exists (
    select 1
    from pg_catalog.pg_constraint as c
    where c.conname = 'access_events_read_model_access_event_id_unique'
      and c.conrelid = 'public.access_events_read_model'::regclass
  ) then
    alter table public.access_events_read_model
      add constraint access_events_read_model_access_event_id_unique
      unique (access_event_id);
  end if;
end;
$$;

create or replace function private.project_access_event_read_model_row_v1()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
  v_office_id           uuid;
  v_office_name         text;
  v_office_building     text;
  v_office_floor        text;
  v_office_room         text;
  v_profile_full_name   text;
  v_profile_role        text;
  v_occurred_at         timestamptz;
  v_status              text;
  v_status_label        text;
  v_reason_label        text;
begin
  if TG_OP = 'UPDATE'
    and OLD.deleted_at is null
    and NEW.deleted_at is not null
  then
    delete from public.access_events_read_model
    where access_event_id = NEW.id;
    return NEW;
  end if;

  select
    b.office_id,
    o.name,
    o.building,
    o.floor::text,
    o.room
    into
      v_office_id,
      v_office_name,
      v_office_building,
      v_office_floor,
      v_office_room
  from public.bookings as b
  left join public.offices as o
    on o.id = b.office_id
  where b.id = NEW.booking_id;

  if NEW.actor_id is not null then
    select
      p.full_name,
      p.role::text
      into
        v_profile_full_name,
        v_profile_role
    from public.profiles as p
    where p.id = NEW.actor_id;
  end if;

  v_occurred_at := coalesce(NEW.requested_at, NEW.created_at);

  v_status := case NEW.status
    when 'PENDING_ACK'::public.access_event_status then 'pending-ack'
    when 'ACKED'::public.access_event_status then 'granted'
    when 'FAILED_NO_ACK'::public.access_event_status then 'denied'
    when 'DENIED'::public.access_event_status then 'denied'
    when 'MANUAL_OVERRIDE'::public.access_event_status then 'granted'
    when 'REVOKED'::public.access_event_status then 'revoked'
    else pg_catalog.lower(NEW.status::text)
  end;

  v_status_label := case NEW.status
    when 'PENDING_ACK'::public.access_event_status then 'Pending acknowledgement'
    when 'ACKED'::public.access_event_status then 'Granted'
    when 'FAILED_NO_ACK'::public.access_event_status then 'No acknowledgement'
    when 'DENIED'::public.access_event_status then 'Denied'
    when 'MANUAL_OVERRIDE'::public.access_event_status then 'Manual override'
    when 'REVOKED'::public.access_event_status then 'Revoked'
    else pg_catalog.initcap(pg_catalog.replace(NEW.status::text, '_', ' '))
  end;

  v_reason_label := case
    when NEW.reason is not null and pg_catalog.btrim(NEW.reason) <> '' then pg_catalog.btrim(NEW.reason)
    else case NEW.status
      when 'PENDING_ACK'::public.access_event_status then 'Awaiting device acknowledgement'
      when 'ACKED'::public.access_event_status then 'Access granted'
      when 'FAILED_NO_ACK'::public.access_event_status then 'Device did not acknowledge'
      when 'DENIED'::public.access_event_status then 'Access denied'
      when 'MANUAL_OVERRIDE'::public.access_event_status then 'Manual override'
      when 'REVOKED'::public.access_event_status then 'Access revoked'
      else null
    end
  end;

  insert into public.access_events_read_model (
    id,
    access_event_id,
    booking_id,
    office_id,
    actor_id,
    occurred_at,
    date_label,
    time_label,
    actor_display_id,
    actor_display_name,
    actor_display_type,
    location_label,
    access_method,
    status,
    status_label,
    is_security_alert,
    is_anomaly,
    reason_label,
    created_at,
    updated_at
  ) values (
    extensions.gen_random_uuid(),
    NEW.id,
    NEW.booking_id,
    v_office_id,
    NEW.actor_id,
    v_occurred_at,
    pg_catalog.to_char(v_occurred_at, 'YYYY-MM-DD'),
    pg_catalog.to_char(v_occurred_at, 'HH24:MI:SS'),
    coalesce(
      'ACT-' || pg_catalog.upper(pg_catalog.substr(pg_catalog.replace(NEW.actor_id::text, '-', ''), 1, 8)),
      'SYSTEM'
    ),
    coalesce(nullif(v_profile_full_name, ''), 'Member'),
    coalesce(v_profile_role, NEW.actor_type::text, 'UNKNOWN'),
    coalesce(
      nullif(pg_catalog.concat_ws(' - ', v_office_name, v_office_building, v_office_floor, v_office_room), ''),
      'Workspace'
    ),
    pg_catalog.lower(pg_catalog.replace(NEW.access_method::text, '_', '-')),
    v_status,
    v_status_label,
    NEW.status in (
      'DENIED'::public.access_event_status,
      'FAILED_NO_ACK'::public.access_event_status,
      'REVOKED'::public.access_event_status
    ),
    NEW.status in (
      'DENIED'::public.access_event_status,
      'FAILED_NO_ACK'::public.access_event_status,
      'MANUAL_OVERRIDE'::public.access_event_status,
      'REVOKED'::public.access_event_status
    ),
    v_reason_label,
    now(),
    now()
  )
  on conflict (access_event_id) do update set
    status            = excluded.status,
    status_label      = excluded.status_label,
    is_security_alert = excluded.is_security_alert,
    is_anomaly        = excluded.is_anomaly,
    reason_label      = excluded.reason_label,
    updated_at        = now();

  return NEW;
end;
$$;

revoke execute on function private.project_access_event_read_model_row_v1() from public;

drop trigger if exists project_access_event_read_model on public.access_events;

create trigger project_access_event_read_model
after insert or update on public.access_events
for each row
execute function private.project_access_event_read_model_row_v1();
