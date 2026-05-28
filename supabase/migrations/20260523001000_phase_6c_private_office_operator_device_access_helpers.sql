create or replace function private.is_owner_of_office(
  p_office_id uuid
)
returns boolean
language plpgsql
security definer
stable
set search_path = pg_catalog
as $$
declare
  v_actor_id uuid;
begin
  if not private.has_trusted_actor_context() then
    return false;
  end if;

  if private.current_actor_role() is distinct from 'OWNER'::public.user_role then
    return false;
  end if;

  v_actor_id := private.current_actor_id();

  if p_office_id is null or v_actor_id is null then
    return false;
  end if;

  return exists (
    select 1
    from public.offices as o
    where o.id = p_office_id
      and o.owner_id = v_actor_id
      and o.deleted_at is null
      and o.status = 'ACTIVE'::public.office_status
  );
end;
$$;

create or replace function private.is_operator_of_office(
  p_office_id uuid
)
returns boolean
language plpgsql
security definer
stable
set search_path = pg_catalog
as $$
declare
  v_actor_id uuid;
begin
  if not private.has_trusted_actor_context() then
    return false;
  end if;

  if private.current_actor_role() is distinct from 'OPERATOR'::public.user_role then
    return false;
  end if;

  v_actor_id := private.current_actor_id();

  if p_office_id is null or v_actor_id is null then
    return false;
  end if;

  return exists (
    select 1
    from public.operator_offices as oo
    join public.offices as o
      on o.id = oo.office_id
    where oo.operator_id = v_actor_id
      and oo.office_id = p_office_id
      and oo.deleted_at is null
      and o.id = p_office_id
      and o.deleted_at is null
      and o.status = 'ACTIVE'::public.office_status
  );
end;
$$;

create or replace function private.can_manage_office(
  p_office_id uuid
)
returns boolean
language plpgsql
security definer
stable
set search_path = pg_catalog
as $$
declare
  v_role public.user_role;
begin
  if not private.has_trusted_actor_context() then
    return false;
  end if;

  if p_office_id is null then
    return false;
  end if;

  v_role := private.current_actor_role();

  if v_role = 'ADMIN'::public.user_role then
    return exists (
      select 1
      from public.offices as o
      where o.id = p_office_id
        and o.deleted_at is null
        and o.status = 'ACTIVE'::public.office_status
    );
  end if;

  if private.is_owner_of_office(p_office_id) then
    return true;
  end if;

  if private.is_operator_of_office(p_office_id) then
    return true;
  end if;

  return false;
end;
$$;

create or replace function private.can_access_device(
  p_device_id uuid
)
returns boolean
language plpgsql
security definer
stable
set search_path = pg_catalog
as $$
declare
  v_office_id uuid;
begin
  if not private.has_trusted_actor_context() then
    return false;
  end if;

  if p_device_id is null then
    return false;
  end if;

  select d.office_id
    into v_office_id
  from public.iot_devices as d
  where d.id = p_device_id
    and d.deleted_at is null;

  if v_office_id is null then
    return false;
  end if;

  return private.can_manage_office(v_office_id);
end;
$$;

revoke all on function private.is_owner_of_office(uuid) from public;
revoke all on function private.is_operator_of_office(uuid) from public;
revoke all on function private.can_manage_office(uuid) from public;
revoke all on function private.can_access_device(uuid) from public;
