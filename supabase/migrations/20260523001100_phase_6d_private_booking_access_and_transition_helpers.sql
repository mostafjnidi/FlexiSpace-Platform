create or replace function private.can_access_booking(
  p_booking_id uuid
)
returns boolean
language plpgsql
security definer
stable
set search_path = pg_catalog
as $$
declare
  v_actor_id uuid;
  v_office_id uuid;
  v_role public.user_role;
  v_user_id uuid;
begin
  if not private.has_trusted_actor_context() then
    return false;
  end if;

  if p_booking_id is null then
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

  v_role := private.current_actor_role();

  if v_role = 'ADMIN'::public.user_role then
    return true;
  end if;

  v_actor_id := private.current_actor_id();

  if v_actor_id is null then
    return false;
  end if;

  if v_role = 'USER'::public.user_role and v_user_id = v_actor_id then
    return true;
  end if;

  if v_role = 'OWNER'::public.user_role and private.is_owner_of_office(v_office_id) then
    return true;
  end if;

  if v_role = 'OPERATOR'::public.user_role and private.is_operator_of_office(v_office_id) then
    return true;
  end if;

  return false;
end;
$$;

create or replace function private.can_transition_booking_status(
  p_from_status public.booking_status,
  p_to_status public.booking_status
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

  if p_from_status is null or p_to_status is null then
    return false;
  end if;

  if p_from_status = p_to_status then
    return false;
  end if;

  v_actor_type := private.current_actor_type();

  if v_actor_type is null then
    return false;
  end if;

  return exists (
    select 1
    from public.booking_status_transitions as bst
    where bst.from_status = p_from_status
      and bst.to_status = p_to_status
      and v_actor_type = any(bst.allowed_actor_types)
  );
end;
$$;

revoke all on function private.can_access_booking(uuid) from public;
revoke all on function private.can_transition_booking_status(public.booking_status, public.booking_status) from public;
