create or replace function private.current_actor_role()
returns public.user_role
language plpgsql
security definer
stable
set search_path = pg_catalog
as $$
declare
  v_actor_id uuid;
  v_actor_type public.actor_type;
  v_role public.user_role;
begin
  if not private.has_trusted_actor_context() then
    return null;
  end if;

  v_actor_type := private.current_actor_type();

  if v_actor_type is null
    or v_actor_type in ('JOB'::public.actor_type, 'SYSTEM'::public.actor_type)
  then
    return null;
  end if;

  v_actor_id := private.current_actor_id();

  if v_actor_id is null then
    return null;
  end if;

  select p.role
    into v_role
  from public.profiles as p
  where p.id = v_actor_id
    and p.deleted_at is null
    and p.is_active = true;

  return v_role;
end;
$$;

create or replace function private.actor_has_role(
  p_allowed_roles public.user_role[]
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
  if p_allowed_roles is null or cardinality(p_allowed_roles) = 0 then
    return false;
  end if;

  v_role := private.current_actor_role();

  if v_role is null then
    return false;
  end if;

  return coalesce(v_role = any(p_allowed_roles), false);
end;
$$;

create or replace function private.require_actor_role(
  p_allowed_roles public.user_role[]
)
returns public.user_role
language plpgsql
security definer
stable
set search_path = pg_catalog
as $$
declare
  v_role public.user_role;
begin
  if not private.actor_has_role(p_allowed_roles) then
    raise exception 'actor role is not authorized';
  end if;

  v_role := private.current_actor_role();

  if v_role is null then
    raise exception 'actor role is required';
  end if;

  return v_role;
end;
$$;

revoke all on function private.current_actor_role() from public;
revoke all on function private.actor_has_role(public.user_role[]) from public;
revoke all on function private.require_actor_role(public.user_role[]) from public;
