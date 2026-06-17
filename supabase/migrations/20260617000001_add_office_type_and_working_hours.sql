-- Phase 26: Add office_type and working_hours to offices table
--
-- Adds two new filterable attributes to offices:
--   office_type          - one of the four workspace categories shown in FindWorkspace
--   working_hours_start  - opening hour (0–23), default 8  (8 AM)
--   working_hours_end    - closing hour (1–24), default 22 (10 PM)
--
-- Updates all relevant RPCs to accept and persist the new fields.

-- ── 1. Columns ────────────────────────────────────────────────────────────────

alter table public.offices
  add column office_type          text,
  add column working_hours_start  integer not null default 8,
  add column working_hours_end    integer not null default 22;

alter table public.offices
  add constraint offices_office_type_check check (
    office_type is null
    or office_type in ('Private Office', 'Meeting Room', 'Hot Desk', 'Isolation Pod')
  ),
  add constraint offices_working_hours_start_check check (
    working_hours_start >= 0 and working_hours_start <= 23
  ),
  add constraint offices_working_hours_end_check check (
    working_hours_end >= 1 and working_hours_end <= 24
  ),
  add constraint offices_working_hours_range_check check (
    working_hours_end > working_hours_start
  );

-- ── 2. private.create_office_with_devices_workflow_v1 (new signature) ─────────

drop function if exists private.create_office_with_devices_workflow_v1(
  text, text, text, text, text,
  integer, integer, text,
  public.office_status, text,
  public.device_type[], uuid
);

create function private.create_office_with_devices_workflow_v1(
  p_name                text,
  p_description         text,
  p_building            text,
  p_floor               text,
  p_room                text,
  p_capacity            integer,
  p_hourly_rate_cents   integer,
  p_currency            text,
  p_status              public.office_status,
  p_image_url           text,
  p_device_types        public.device_type[],
  p_idempotency_key     uuid,
  p_office_type         text    default null,
  p_working_hours_start integer default 8,
  p_working_hours_end   integer default 22
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
  v_actor_id         uuid;
  v_actor_role       public.user_role;
  v_office_id        uuid;
  v_device_ids       uuid[]             := '{}';
  v_device_type      public.device_type;
  v_device_id        uuid;
  v_device_key       text;
  v_device_name      text;
  v_device_state     jsonb;
  v_existing_office  public.offices%rowtype;
  v_i                integer;
begin
  if not private.has_trusted_actor_context() then
    raise exception 'INVALID_ACTOR_CONTEXT: trusted actor context is required'
      using errcode = 'P0001';
  end if;

  v_actor_id   := private.require_actor_id();
  v_actor_role := private.current_actor_role();

  if v_actor_role is distinct from 'OWNER'::public.user_role
    and v_actor_role is distinct from 'ADMIN'::public.user_role
  then
    raise exception 'FORBIDDEN: create_office_with_devices_workflow_v1 requires OWNER or ADMIN role'
      using errcode = 'P0001';
  end if;

  if p_name is null or btrim(p_name) = '' then
    raise exception 'VALIDATION_ERROR: name is required and must not be empty'
      using errcode = 'P0001';
  end if;

  if p_capacity is null or p_capacity <= 0 then
    raise exception 'VALIDATION_ERROR: capacity must be greater than 0'
      using errcode = 'P0001';
  end if;

  if p_hourly_rate_cents is null or p_hourly_rate_cents < 0 then
    raise exception 'VALIDATION_ERROR: hourly_rate_cents must be 0 or greater'
      using errcode = 'P0001';
  end if;

  if p_currency is null or p_currency !~ '^[A-Z]{3}$' then
    raise exception 'VALIDATION_ERROR: currency must be 3 uppercase letters (e.g. USD)'
      using errcode = 'P0001';
  end if;

  if p_status is null then
    raise exception 'VALIDATION_ERROR: status is required'
      using errcode = 'P0001';
  end if;

  if p_office_type is not null and p_office_type not in (
    'Private Office', 'Meeting Room', 'Hot Desk', 'Isolation Pod'
  ) then
    raise exception 'VALIDATION_ERROR: office_type must be one of: Private Office, Meeting Room, Hot Desk, Isolation Pod'
      using errcode = 'P0001';
  end if;

  if p_working_hours_start < 0 or p_working_hours_start > 23 then
    raise exception 'VALIDATION_ERROR: working_hours_start must be between 0 and 23'
      using errcode = 'P0001';
  end if;

  if p_working_hours_end < 1 or p_working_hours_end > 24 then
    raise exception 'VALIDATION_ERROR: working_hours_end must be between 1 and 24'
      using errcode = 'P0001';
  end if;

  if p_working_hours_end <= p_working_hours_start then
    raise exception 'VALIDATION_ERROR: working_hours_end must be greater than working_hours_start'
      using errcode = 'P0001';
  end if;

  if p_device_types is not null and pg_catalog.cardinality(p_device_types) > 0 then
    if (
      select pg_catalog.count(*) from (
        select pg_catalog.unnest(p_device_types) as dt
      ) all_types
    ) <> (
      select pg_catalog.count(*) from (
        select distinct pg_catalog.unnest(p_device_types) as dt
      ) distinct_types
    ) then
      raise exception 'VALIDATION_ERROR: device_types must not contain duplicates'
        using errcode = 'P0001';
    end if;
  end if;

  if p_idempotency_key is not null then
    select o.*
      into v_existing_office
    from public.offices as o
    where o.owner_id        = v_actor_id
      and o.idempotency_key = p_idempotency_key
      and o.deleted_at      is null
    for update;

    if found then
      select pg_catalog.array_agg(d.id)
        into v_device_ids
      from public.iot_devices as d
      where d.office_id  = v_existing_office.id
        and d.deleted_at is null;

      return pg_catalog.jsonb_build_object(
        'office_id',         v_existing_office.id,
        'device_ids',        coalesce(v_device_ids, '{}'::uuid[]),
        'idempotent_replay', true
      );
    end if;
  end if;

  insert into public.offices (
    owner_id,
    name,
    description,
    building,
    floor,
    room,
    capacity,
    hourly_rate_cents,
    currency,
    status,
    image_url,
    idempotency_key,
    office_type,
    working_hours_start,
    working_hours_end
  )
  values (
    v_actor_id,
    btrim(p_name),
    p_description,
    p_building,
    p_floor,
    p_room,
    p_capacity,
    p_hourly_rate_cents,
    p_currency,
    p_status,
    nullif(btrim(coalesce(p_image_url, ''::text)), ''::text),
    p_idempotency_key,
    p_office_type,
    coalesce(p_working_hours_start, 8),
    coalesce(p_working_hours_end, 22)
  )
  returning id into v_office_id;

  if p_device_types is not null and pg_catalog.cardinality(p_device_types) > 0 then
    for v_i in 1 .. pg_catalog.cardinality(p_device_types) loop
      v_device_type := p_device_types[v_i];

      v_device_key := v_office_id::text || ':' || v_device_type::text;

      v_device_name := case v_device_type
        when 'SMART_LOCK'         then 'Smart Lock'
        when 'AIR_QUALITY_SENSOR' then 'Air Quality Sensor'
        when 'ELECTRICITY_METER'  then 'Electricity Meter'
        else                           v_device_type::text
      end;

      v_device_state := case v_device_type
        when 'SMART_LOCK' then pg_catalog.jsonb_build_object(
          'battery',    87,
          'signal',     'good',
          'lock_state', 'locked',
          'door_state', 'closed',
          'open_count', 0
        )
        when 'AIR_QUALITY_SENSOR' then pg_catalog.jsonb_build_object(
          'co2_ppm',          620,
          'pm25',             8,
          'temperature_c',    23.4,
          'humidity_percent', 42,
          'air_quality',      'good'
        )
        when 'ELECTRICITY_METER' then pg_catalog.jsonb_build_object(
          'current_kw',  1.2,
          'today_kwh',   3.8,
          'voltage',     229,
          'load_status', 'normal'
        )
        else '{}'::jsonb
      end;

      insert into public.iot_devices (
        office_id,
        device_key,
        device_type,
        name,
        status,
        firmware_version
      )
      values (
        v_office_id,
        v_device_key,
        v_device_type,
        v_device_name,
        'ONLINE'::public.device_status,
        '1.0.0'
      )
      returning id into v_device_id;

      v_device_ids := v_device_ids || v_device_id;

      insert into public.device_state_snapshots (
        device_id,
        state,
        observed_at
      )
      values (
        v_device_id,
        v_device_state,
        now()
      );
    end loop;
  end if;

  return pg_catalog.jsonb_build_object(
    'office_id',         v_office_id,
    'device_ids',        v_device_ids,
    'idempotent_replay', false
  );
end;
$$;

revoke all on function private.create_office_with_devices_workflow_v1(
  text, text, text, text, text,
  integer, integer, text,
  public.office_status, text,
  public.device_type[], uuid,
  text, integer, integer
) from public;

-- ── 3. public.create_office_with_devices_v1 wrapper (new signature) ───────────

drop function if exists public.create_office_with_devices_v1(
  uuid, public.actor_type, text,
  text, text, text, text, text,
  integer, integer, text,
  public.office_status, text,
  public.device_type[], uuid
);

create function public.create_office_with_devices_v1(
  p_trusted_actor_id    uuid,
  p_trusted_actor_type  public.actor_type,
  p_request_id          text                 default null,
  p_name                text                 default null,
  p_description         text                 default null,
  p_building            text                 default null,
  p_floor               text                 default null,
  p_room                text                 default null,
  p_capacity            integer              default null,
  p_hourly_rate_cents   integer              default null,
  p_currency            text                 default 'USD',
  p_status              public.office_status default 'ACTIVE',
  p_image_url           text                 default null,
  p_device_types        public.device_type[] default '{}',
  p_idempotency_key     uuid                 default null,
  p_office_type         text                 default null,
  p_working_hours_start integer              default 8,
  p_working_hours_end   integer              default 22
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
  v_result jsonb;
begin
  begin
    perform private.set_actor_context(
      p_trusted_actor_id,
      p_trusted_actor_type,
      p_request_id
    );

    v_result := private.create_office_with_devices_workflow_v1(
      p_name,
      p_description,
      p_building,
      p_floor,
      p_room,
      p_capacity,
      p_hourly_rate_cents,
      p_currency,
      p_status,
      p_image_url,
      p_device_types,
      p_idempotency_key,
      p_office_type,
      p_working_hours_start,
      p_working_hours_end
    );

    perform private.clear_actor_context();
    return v_result;
  exception
    when others then
      perform private.clear_actor_context();
      raise;
  end;
end;
$$;

do $$
begin
  execute 'revoke all on function public.create_office_with_devices_v1('
    || 'uuid, public.actor_type, text, '
    || 'text, text, text, text, text, '
    || 'integer, integer, text, '
    || 'public.office_status, text, '
    || 'public.device_type[], uuid, '
    || 'text, integer, integer'
    || ') from public';

  if exists (select 1 from pg_catalog.pg_roles where rolname = 'anon') then
    execute 'revoke all on function public.create_office_with_devices_v1('
      || 'uuid, public.actor_type, text, '
      || 'text, text, text, text, text, '
      || 'integer, integer, text, '
      || 'public.office_status, text, '
      || 'public.device_type[], uuid, '
      || 'text, integer, integer'
      || ') from anon';
  end if;

  if exists (select 1 from pg_catalog.pg_roles where rolname = 'authenticated') then
    execute 'revoke all on function public.create_office_with_devices_v1('
      || 'uuid, public.actor_type, text, '
      || 'text, text, text, text, text, '
      || 'integer, integer, text, '
      || 'public.office_status, text, '
      || 'public.device_type[], uuid, '
      || 'text, integer, integer'
      || ') from authenticated';
  end if;

  if exists (select 1 from pg_catalog.pg_roles where rolname = 'service_role') then
    execute 'grant execute on function public.create_office_with_devices_v1('
      || 'uuid, public.actor_type, text, '
      || 'text, text, text, text, text, '
      || 'integer, integer, text, '
      || 'public.office_status, text, '
      || 'public.device_type[], uuid, '
      || 'text, integer, integer'
      || ') to service_role';
  end if;
end;
$$;

-- ── 4. public.update_office_v1 (new signature) ───────────────────────────────

drop function if exists public.update_office_v1(
  uuid, text, text, text, text, text, integer, integer, text, text, text
);

create function public.update_office_v1(
  p_office_id           uuid,
  p_name                text,
  p_description         text,
  p_building            text,
  p_floor               text,
  p_room                text,
  p_capacity            integer,
  p_hourly_rate_cents   integer,
  p_currency            text,
  p_status              text,
  p_image_url           text,
  p_office_type         text    default null,
  p_working_hours_start integer default null,
  p_working_hours_end   integer default null
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

  if p_office_type is not null and p_office_type not in (
    'Private Office', 'Meeting Room', 'Hot Desk', 'Isolation Pod'
  ) then
    perform private.clear_actor_context();
    raise exception 'VALIDATION_ERROR: invalid office_type';
  end if;

  if p_working_hours_start is not null and (p_working_hours_start < 0 or p_working_hours_start > 23) then
    perform private.clear_actor_context();
    raise exception 'VALIDATION_ERROR: working_hours_start must be between 0 and 23';
  end if;

  if p_working_hours_end is not null and (p_working_hours_end < 1 or p_working_hours_end > 24) then
    perform private.clear_actor_context();
    raise exception 'VALIDATION_ERROR: working_hours_end must be between 1 and 24';
  end if;

  if p_working_hours_start is not null and p_working_hours_end is not null
    and p_working_hours_end <= p_working_hours_start
  then
    perform private.clear_actor_context();
    raise exception 'VALIDATION_ERROR: working_hours_end must be greater than working_hours_start';
  end if;

  update public.offices
  set
    name                = coalesce(p_name, name),
    description         = p_description,
    building            = p_building,
    floor               = p_floor,
    room                = p_room,
    capacity            = coalesce(p_capacity, capacity),
    hourly_rate_cents   = coalesce(p_hourly_rate_cents, hourly_rate_cents),
    currency            = coalesce(p_currency, currency),
    status              = coalesce(p_status::public.office_status, status),
    image_url           = p_image_url,
    office_type         = coalesce(p_office_type, office_type),
    working_hours_start = coalesce(p_working_hours_start, working_hours_start),
    working_hours_end   = coalesce(p_working_hours_end, working_hours_end),
    updated_at          = now()
  where id = p_office_id;

  perform private.clear_actor_context();
end;
$$;

grant execute on function public.update_office_v1(
  uuid, text, text, text, text, text,
  integer, integer, text, text, text,
  text, integer, integer
) to authenticated;