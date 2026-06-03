create or replace function public.soft_delete_office_v1(
  p_office_id uuid
)
returns void
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
  v_auth_uid    uuid;
  v_owner_id    uuid;
  v_actor_role  public.user_role;
  v_actor_type  public.actor_type;
begin
  v_auth_uid := auth.uid();

  if v_auth_uid is null then
    raise exception 'UNAUTHORIZED: not authenticated';
  end if;

  select p.role into v_actor_role
  from public.profiles as p
  where p.id = v_auth_uid
    and p.deleted_at is null
    and p.is_active = true;

  if v_actor_role is null then
    raise exception 'UNAUTHORIZED: profile not found or inactive';
  end if;

  v_actor_type := v_actor_role::text::public.actor_type;

  perform private.set_actor_context(v_auth_uid, v_actor_type);

  select owner_id into v_owner_id
  from public.offices
  where id = p_office_id and deleted_at is null;

  if v_owner_id is null then
    perform private.clear_actor_context();
    raise exception 'NOT_FOUND: office not found';
  end if;

  if v_owner_id != v_auth_uid and not private.auth_user_is_admin() then
    perform private.clear_actor_context();
    raise exception 'FORBIDDEN: you do not own this office';
  end if;

  update public.offices
  set deleted_at = now(), updated_at = now()
  where id = p_office_id;

  perform private.clear_actor_context();
end;
$$;

create or replace function public.update_office_v1(
  p_office_id         uuid,
  p_name              text,
  p_description       text,
  p_building          text,
  p_floor             text,
  p_room              text,
  p_capacity          integer,
  p_hourly_rate_cents integer,
  p_currency          text,
  p_status            text,
  p_image_url         text
)
returns void
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
  v_auth_uid   uuid;
  v_owner_id   uuid;
  v_actor_role public.user_role;
  v_actor_type public.actor_type;
begin
  v_auth_uid := auth.uid();

  if v_auth_uid is null then
    raise exception 'UNAUTHORIZED: not authenticated';
  end if;

  select p.role into v_actor_role
  from public.profiles as p
  where p.id = v_auth_uid
    and p.deleted_at is null
    and p.is_active = true;

  if v_actor_role is null then
    raise exception 'UNAUTHORIZED: profile not found or inactive';
  end if;

  v_actor_type := v_actor_role::text::public.actor_type;

  perform private.set_actor_context(v_auth_uid, v_actor_type);

  select owner_id into v_owner_id
  from public.offices
  where id = p_office_id and deleted_at is null;

  if v_owner_id is null then
    perform private.clear_actor_context();
    raise exception 'NOT_FOUND: office not found';
  end if;

  if v_owner_id != v_auth_uid and not private.auth_user_is_admin() then
    perform private.clear_actor_context();
    raise exception 'FORBIDDEN: you do not own this office';
  end if;

  update public.offices
  set
    name              = coalesce(p_name, name),
    description       = p_description,
    building          = p_building,
    floor             = p_floor,
    room              = p_room,
    capacity          = coalesce(p_capacity, capacity),
    hourly_rate_cents = coalesce(p_hourly_rate_cents, hourly_rate_cents),
    currency          = coalesce(p_currency, currency),
    status            = coalesce(p_status::public.office_status, status),
    image_url         = p_image_url,
    updated_at        = now()
  where id = p_office_id;

  perform private.clear_actor_context();
end;
$$;

grant execute on function public.soft_delete_office_v1(uuid) to authenticated;
grant execute on function public.update_office_v1(uuid, text, text, text, text, text, integer, integer, text, text, text) to authenticated;