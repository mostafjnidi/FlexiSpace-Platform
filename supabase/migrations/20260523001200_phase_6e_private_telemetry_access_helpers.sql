create or replace function private.can_read_telemetry_for_device(
  p_device_id uuid
)
returns boolean
language plpgsql
security definer
stable
set search_path = pg_catalog
as $$
declare
  v_actor_type public.actor_type;
  v_role public.user_role;
begin
  if not private.has_trusted_actor_context() then
    return false;
  end if;

  if p_device_id is null then
    return false;
  end if;

  v_actor_type := private.current_actor_type();

  if v_actor_type in ('JOB'::public.actor_type, 'SYSTEM'::public.actor_type) then
    return false;
  end if;

  v_role := private.current_actor_role();

  if v_role is null or v_role = 'USER'::public.user_role then
    return false;
  end if;

  if v_role = 'ADMIN'::public.user_role then
    return exists (
      select 1
      from public.iot_devices as d
      join public.offices as o
        on o.id = d.office_id
      where d.id = p_device_id
        and d.deleted_at is null
        and o.deleted_at is null
        and o.status = 'ACTIVE'::public.office_status
    );
  end if;

  if v_role in ('OWNER'::public.user_role, 'OPERATOR'::public.user_role) then
    return private.can_access_device(p_device_id);
  end if;

  return false;
end;
$$;

create or replace function private.can_write_telemetry_for_device(
  p_device_id uuid
)
returns boolean
language plpgsql
security definer
stable
set search_path = pg_catalog
as $$
declare
  v_actor_type public.actor_type;
begin
  if not private.has_trusted_actor_context() then
    return false;
  end if;

  if p_device_id is null then
    return false;
  end if;

  v_actor_type := private.current_actor_type();

  if v_actor_type not in ('SYSTEM'::public.actor_type, 'JOB'::public.actor_type) then
    return false;
  end if;

  return exists (
    select 1
    from public.iot_devices as d
    where d.id = p_device_id
      and d.deleted_at is null
  );
end;
$$;

revoke all on function private.can_read_telemetry_for_device(uuid) from public;
revoke all on function private.can_write_telemetry_for_device(uuid) from public;
