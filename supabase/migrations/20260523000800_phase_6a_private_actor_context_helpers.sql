create or replace function private.set_actor_context(
  p_actor_id uuid,
  p_actor_type public.actor_type,
  p_request_id text default null
)
returns void
language plpgsql
set search_path = pg_catalog
as $$
begin
  if p_actor_type is null then
    raise exception 'actor type is required';
  end if;

  if p_actor_type in (
    'USER'::public.actor_type,
    'OWNER'::public.actor_type,
    'OPERATOR'::public.actor_type,
    'ADMIN'::public.actor_type
  ) and p_actor_id is null then
    raise exception 'actor id is required for actor type %', p_actor_type;
  end if;

  if p_request_id is not null and length(p_request_id) > 128 then
    raise exception 'request id must be 128 characters or fewer';
  end if;

  perform set_config('app.trusted_actor_context', 'true', true);
  perform set_config('app.actor_type', p_actor_type::text, true);
  perform set_config('app.actor_id', coalesce(p_actor_id::text, ''), true);
  perform set_config('app.request_id', coalesce(p_request_id, ''), true);
end;
$$;

create or replace function private.clear_actor_context()
returns void
language plpgsql
set search_path = pg_catalog
as $$
begin
  perform set_config('app.trusted_actor_context', 'false', true);
  perform set_config('app.actor_type', '', true);
  perform set_config('app.actor_id', '', true);
  perform set_config('app.request_id', '', true);
end;
$$;

create or replace function private.has_trusted_actor_context()
returns boolean
language sql
stable
set search_path = pg_catalog
as $$
  select coalesce(current_setting('app.trusted_actor_context', true) = 'true', false);
$$;

create or replace function private.require_trusted_actor_context()
returns void
language plpgsql
stable
set search_path = pg_catalog
as $$
begin
  if not private.has_trusted_actor_context() then
    raise exception 'trusted actor context is required';
  end if;
end;
$$;

create or replace function private.current_actor_id()
returns uuid
language plpgsql
stable
set search_path = pg_catalog
as $$
declare
  v_actor_id text;
begin
  if not private.has_trusted_actor_context() then
    return null;
  end if;

  v_actor_id := nullif(current_setting('app.actor_id', true), '');

  if v_actor_id is null then
    return null;
  end if;

  return v_actor_id::uuid;
end;
$$;

create or replace function private.require_actor_id()
returns uuid
language plpgsql
stable
set search_path = pg_catalog
as $$
declare
  v_actor_id uuid;
begin
  v_actor_id := private.current_actor_id();

  if v_actor_id is null then
    raise exception 'actor id is required';
  end if;

  return v_actor_id;
end;
$$;

create or replace function private.current_actor_type()
returns public.actor_type
language plpgsql
stable
set search_path = pg_catalog
as $$
declare
  v_actor_type text;
begin
  if not private.has_trusted_actor_context() then
    return null;
  end if;

  v_actor_type := nullif(current_setting('app.actor_type', true), '');

  if v_actor_type is null then
    return null;
  end if;

  return v_actor_type::public.actor_type;
end;
$$;

create or replace function private.require_actor_type()
returns public.actor_type
language plpgsql
stable
set search_path = pg_catalog
as $$
declare
  v_actor_type public.actor_type;
begin
  v_actor_type := private.current_actor_type();

  if v_actor_type is null then
    raise exception 'actor type is required';
  end if;

  return v_actor_type;
end;
$$;

create or replace function private.current_request_id()
returns text
language plpgsql
stable
set search_path = pg_catalog
as $$
declare
  v_request_id text;
begin
  if not private.has_trusted_actor_context() then
    return null;
  end if;

  v_request_id := nullif(current_setting('app.request_id', true), '');

  if v_request_id is null then
    return null;
  end if;

  if length(v_request_id) > 128 then
    raise exception 'request id must be 128 characters or fewer';
  end if;

  return v_request_id;
end;
$$;

revoke all on function private.set_actor_context(uuid, public.actor_type, text) from public;
revoke all on function private.clear_actor_context() from public;
revoke all on function private.has_trusted_actor_context() from public;
revoke all on function private.require_trusted_actor_context() from public;
revoke all on function private.current_actor_id() from public;
revoke all on function private.require_actor_id() from public;
revoke all on function private.current_actor_type() from public;
revoke all on function private.require_actor_type() from public;
revoke all on function private.current_request_id() from public;
