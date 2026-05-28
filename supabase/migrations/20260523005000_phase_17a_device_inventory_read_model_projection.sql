create or replace function private.sync_device_inventory_row_v1()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
  v_office_name                 text;
  v_latest_snapshot_observed_at timestamptz;
begin
  if TG_OP = 'UPDATE'
    and OLD.deleted_at is null
    and NEW.deleted_at is not null
  then
    delete from public.device_inventory_read_model
    where id = NEW.id;
    return NEW;
  end if;

  if TG_OP = 'UPDATE' then
    if (
      OLD.deleted_at       is not distinct from NEW.deleted_at
      and OLD.status           is not distinct from NEW.status
      and OLD.firmware_version is not distinct from NEW.firmware_version
      and OLD.name             is not distinct from NEW.name
      and OLD.office_id        is not distinct from NEW.office_id
    ) then
      return NEW;
    end if;
  end if;

  select o.name
    into v_office_name
  from public.offices as o
  where o.id = NEW.office_id;

  select dss.observed_at
    into v_latest_snapshot_observed_at
  from public.device_state_snapshots as dss
  where dss.device_id = NEW.id
  order by dss.observed_at desc
  limit 1;

  insert into public.device_inventory_read_model (
    id,
    office_id,
    office_name,
    device_type,
    name,
    status,
    firmware_version,
    last_seen_at,
    latest_snapshot_observed_at,
    created_at,
    updated_at
  ) values (
    NEW.id,
    NEW.office_id,
    v_office_name,
    NEW.device_type,
    NEW.name,
    NEW.status,
    NEW.firmware_version,
    NEW.last_seen_at,
    v_latest_snapshot_observed_at,
    now(),
    now()
  )
  on conflict (id) do update set
    office_id                   = excluded.office_id,
    office_name                 = excluded.office_name,
    device_type                 = excluded.device_type,
    name                        = excluded.name,
    status                      = excluded.status,
    firmware_version            = excluded.firmware_version,
    last_seen_at                = excluded.last_seen_at,
    latest_snapshot_observed_at = excluded.latest_snapshot_observed_at,
    updated_at                  = now();

  return NEW;
end;
$$;

revoke execute on function private.sync_device_inventory_row_v1() from public;

drop trigger if exists sync_device_inventory_read_model on public.iot_devices;

create trigger sync_device_inventory_read_model
after insert or update on public.iot_devices
for each row
execute function private.sync_device_inventory_row_v1();