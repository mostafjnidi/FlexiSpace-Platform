create or replace function private.auth_user_role()
returns public.user_role
language plpgsql
security definer
stable
set search_path = pg_catalog
as $$
declare
  v_auth_uid uuid;
  v_role public.user_role;
begin
  v_auth_uid := auth.uid();

  if v_auth_uid is null then
    return null;
  end if;

  select p.role
    into v_role
  from public.profiles as p
  where p.id = v_auth_uid
    and p.deleted_at is null
    and p.is_active = true;

  return v_role;
end;
$$;

create or replace function private.auth_user_is_admin()
returns boolean
language plpgsql
security definer
stable
set search_path = pg_catalog
as $$
begin
  return coalesce(private.auth_user_role() = 'ADMIN'::public.user_role, false);
end;
$$;

create or replace function private.auth_is_owner_of_office(
  p_office_id uuid
)
returns boolean
language plpgsql
security definer
stable
set search_path = pg_catalog
as $$
declare
  v_auth_uid uuid;
begin
  v_auth_uid := auth.uid();

  if v_auth_uid is null or p_office_id is null then
    return false;
  end if;

  return exists (
    select 1
    from public.offices as o
    where o.id = p_office_id
      and o.owner_id = v_auth_uid
      and o.deleted_at is null
  );
end;
$$;

create or replace function private.auth_is_operator_of_office(
  p_office_id uuid
)
returns boolean
language plpgsql
security definer
stable
set search_path = pg_catalog
as $$
declare
  v_auth_uid uuid;
begin
  v_auth_uid := auth.uid();

  if v_auth_uid is null or p_office_id is null then
    return false;
  end if;

  return exists (
    select 1
    from public.operator_offices as oo
    join public.offices as o
      on o.id = oo.office_id
    where oo.operator_id = v_auth_uid
      and oo.office_id = p_office_id
      and oo.deleted_at is null
      and o.id = p_office_id
      and o.deleted_at is null
  );
end;
$$;

create or replace function private.auth_can_manage_office(
  p_office_id uuid
)
returns boolean
language plpgsql
security definer
stable
set search_path = pg_catalog
as $$
declare
  v_auth_uid uuid;
begin
  v_auth_uid := auth.uid();

  if v_auth_uid is null or p_office_id is null then
    return false;
  end if;

  if private.auth_user_is_admin() then
    return true;
  end if;

  if private.auth_is_owner_of_office(p_office_id) then
    return true;
  end if;

  if private.auth_is_operator_of_office(p_office_id) then
    return true;
  end if;

  return false;
end;
$$;

create or replace function private.auth_can_access_device(
  p_device_id uuid
)
returns boolean
language plpgsql
security definer
stable
set search_path = pg_catalog
as $$
declare
  v_auth_uid uuid;
  v_office_id uuid;
begin
  v_auth_uid := auth.uid();

  if v_auth_uid is null or p_device_id is null then
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

  return private.auth_can_manage_office(v_office_id);
end;
$$;

create or replace function private.auth_can_access_booking(
  p_booking_id uuid
)
returns boolean
language plpgsql
security definer
stable
set search_path = pg_catalog
as $$
declare
  v_auth_uid uuid;
  v_office_id uuid;
  v_user_id uuid;
begin
  v_auth_uid := auth.uid();

  if v_auth_uid is null or p_booking_id is null then
    return false;
  end if;

  select b.user_id, b.office_id
    into v_user_id, v_office_id
  from public.bookings as b
  where b.id = p_booking_id
    and b.deleted_at is null;

  if v_user_id is null or v_office_id is null then
    return false;
  end if;

  if v_user_id = v_auth_uid then
    return true;
  end if;

  if private.auth_can_manage_office(v_office_id) then
    return true;
  end if;

  return false;
end;
$$;

create or replace function private.auth_can_read_device_telemetry(
  p_device_id uuid
)
returns boolean
language plpgsql
security definer
stable
set search_path = pg_catalog
as $$
declare
  v_auth_uid uuid;
  v_role public.user_role;
begin
  v_auth_uid := auth.uid();

  if v_auth_uid is null or p_device_id is null then
    return false;
  end if;

  v_role := private.auth_user_role();

  if v_role is null or v_role = 'USER'::public.user_role then
    return false;
  end if;

  if private.auth_user_is_admin() then
    return true;
  end if;

  if private.auth_can_access_device(p_device_id) then
    return true;
  end if;

  return false;
end;
$$;

revoke all on function private.auth_user_role() from public;
revoke all on function private.auth_user_is_admin() from public;
revoke all on function private.auth_is_owner_of_office(uuid) from public;
revoke all on function private.auth_is_operator_of_office(uuid) from public;
revoke all on function private.auth_can_manage_office(uuid) from public;
revoke all on function private.auth_can_access_device(uuid) from public;
revoke all on function private.auth_can_access_booking(uuid) from public;
revoke all on function private.auth_can_read_device_telemetry(uuid) from public;
