create or replace function private.audit_log_insert(
  p_entity_type text,
  p_entity_id uuid,
  p_action text,
  p_before_state jsonb,
  p_after_state jsonb,
  p_metadata jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
  v_actor_id uuid;
  v_actor_type public.actor_type;
  v_request_id text;
begin
  perform private.require_trusted_actor_context();

  v_actor_id := private.current_actor_id();
  v_actor_type := private.require_actor_type();
  v_request_id := private.current_request_id();

  if v_actor_type in (
    'USER'::public.actor_type,
    'OWNER'::public.actor_type,
    'OPERATOR'::public.actor_type,
    'ADMIN'::public.actor_type
  ) and v_actor_id is null then
    raise exception 'actor id is required for actor type %', v_actor_type;
  end if;

  if nullif(btrim(p_entity_type), '') is null then
    raise exception 'entity type is required';
  end if;

  if nullif(btrim(p_action), '') is null then
    raise exception 'audit action is required';
  end if;

  insert into public.audit_logs (
    actor_id,
    actor_type,
    entity_type,
    entity_id,
    action,
    request_id,
    before_state,
    after_state,
    metadata
  )
  values (
    v_actor_id,
    v_actor_type,
    btrim(p_entity_type),
    p_entity_id,
    btrim(p_action),
    v_request_id,
    p_before_state,
    p_after_state,
    coalesce(p_metadata, '{}'::jsonb)
  );
end;
$$;

create or replace function private.audit_row_change()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
  v_entity_type text;
  v_entity_id_column text;
  v_redacted_columns_csv text;
  v_redacted_columns text[];
  v_redacted_column text;
  v_action text;
  v_before_state jsonb;
  v_after_state jsonb;
  v_source_state jsonb;
  v_entity_id_text text;
  v_entity_id uuid;
  v_changed_columns jsonb;
  v_metadata jsonb := '{}'::jsonb;
begin
  if TG_TABLE_SCHEMA = 'public' and TG_TABLE_NAME = 'audit_logs' then
    raise exception 'audit_row_change must not run on public.audit_logs';
  end if;

  perform private.require_trusted_actor_context();

  if TG_NARGS < 2 then
    raise exception 'audit_row_change requires entity type and entity id column arguments';
  end if;

  v_entity_type := nullif(btrim(TG_ARGV[0]), '');
  v_entity_id_column := nullif(btrim(TG_ARGV[1]), '');

  if TG_NARGS >= 3 then
    v_redacted_columns_csv := TG_ARGV[2];
  end if;

  if v_entity_type is null then
    raise exception 'audit entity type trigger argument is required';
  end if;

  if v_entity_id_column is null then
    raise exception 'audit entity id column trigger argument is required';
  end if;

  if nullif(btrim(coalesce(v_redacted_columns_csv, '')), '') is not null then
    select coalesce(array_agg(redacted_column), array[]::text[])
      into v_redacted_columns
    from (
      select nullif(btrim(raw_column), '') as redacted_column
      from unnest(string_to_array(v_redacted_columns_csv, ',')) as raw(raw_column)
    ) as parsed
    where redacted_column is not null;
  else
    v_redacted_columns := array[]::text[];
  end if;

  if TG_OP = 'INSERT' then
    v_action := 'INSERT';
    v_after_state := to_jsonb(NEW);
    v_source_state := v_after_state;
  elsif TG_OP = 'UPDATE' then
    v_before_state := to_jsonb(OLD);
    v_after_state := to_jsonb(NEW);
    v_source_state := v_after_state;

    if v_before_state ? 'deleted_at'
      and v_after_state ? 'deleted_at'
      and v_before_state -> 'deleted_at' = 'null'::jsonb
      and v_after_state -> 'deleted_at' <> 'null'::jsonb
    then
      v_action := 'SOFT_DELETE';
    elsif v_before_state ? 'deleted_at'
      and v_after_state ? 'deleted_at'
      and v_before_state -> 'deleted_at' <> 'null'::jsonb
      and v_after_state -> 'deleted_at' = 'null'::jsonb
    then
      v_action := 'RESTORE';
    else
      v_action := 'UPDATE';
    end if;
  elsif TG_OP = 'DELETE' then
    v_action := 'DELETE';
    v_before_state := to_jsonb(OLD);
    v_source_state := v_before_state;
  else
    raise exception 'unsupported audit trigger operation %', TG_OP;
  end if;

  foreach v_redacted_column in array v_redacted_columns loop
    if v_before_state is not null then
      v_before_state := v_before_state - v_redacted_column;
    end if;

    if v_after_state is not null then
      v_after_state := v_after_state - v_redacted_column;
    end if;
  end loop;

  v_entity_id_text := nullif(v_source_state ->> v_entity_id_column, '');

  if v_entity_id_text is null then
    raise exception 'audit entity id is required from column %', v_entity_id_column;
  end if;

  begin
    v_entity_id := v_entity_id_text::uuid;
  exception
    when invalid_text_representation then
      raise exception 'audit entity id from column % is not a valid uuid', v_entity_id_column;
  end;

  if v_action in ('UPDATE', 'SOFT_DELETE', 'RESTORE') then
    select coalesce(jsonb_agg(changed_column order by changed_column), '[]'::jsonb)
      into v_changed_columns
    from (
      select audit_key as changed_column
      from (
        select jsonb_object_keys(coalesce(v_before_state, '{}'::jsonb)) as audit_key
        union
        select jsonb_object_keys(coalesce(v_after_state, '{}'::jsonb)) as audit_key
      ) as audit_keys
      where v_before_state -> audit_key is distinct from v_after_state -> audit_key
    ) as changed;

    v_metadata := jsonb_build_object('changed_columns', v_changed_columns);
  end if;

  perform private.audit_log_insert(
    v_entity_type,
    v_entity_id,
    v_action,
    v_before_state,
    v_after_state,
    v_metadata
  );

  if TG_OP = 'DELETE' then
    return OLD;
  end if;

  return NEW;
end;
$$;

create or replace function private.block_hard_delete()
returns trigger
language plpgsql
set search_path = pg_catalog
as $$
begin
  if TG_OP = 'DELETE' then
    raise exception 'hard deletes are blocked on %.%', TG_TABLE_SCHEMA, TG_TABLE_NAME;
  end if;

  return NEW;
end;
$$;

create or replace function private.protect_audit_logs_append_only()
returns trigger
language plpgsql
set search_path = pg_catalog
as $$
begin
  if TG_TABLE_SCHEMA <> 'public' or TG_TABLE_NAME <> 'audit_logs' then
    raise exception 'protect_audit_logs_append_only may only be used on public.audit_logs';
  end if;

  if TG_OP in ('UPDATE', 'DELETE') then
    raise exception 'public.audit_logs is append-only';
  end if;

  return NEW;
end;
$$;

create trigger audit_logs_block_update_delete
before update or delete on public.audit_logs
for each row
execute function private.protect_audit_logs_append_only();

revoke all on function private.audit_log_insert(text, uuid, text, jsonb, jsonb, jsonb) from public;
revoke all on function private.audit_row_change() from public;
revoke all on function private.block_hard_delete() from public;
revoke all on function private.protect_audit_logs_append_only() from public;

revoke insert, update, delete on public.audit_logs from public;

do $$
declare
  v_role_name text;
begin
  foreach v_role_name in array array['anon', 'authenticated'] loop
    if exists (
      select 1
      from pg_catalog.pg_roles
      where rolname = v_role_name
    ) then
      execute format(
        'revoke insert, update, delete on table public.audit_logs from %I',
        v_role_name
      );
    end if;
  end loop;
end;
$$;
