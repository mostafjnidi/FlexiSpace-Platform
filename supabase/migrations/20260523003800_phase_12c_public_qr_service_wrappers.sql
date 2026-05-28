create or replace function public.generate_qr_token_v1(
  p_trusted_actor_id   uuid,
  p_trusted_actor_type public.actor_type,
  p_request_id         text default null,
  p_booking_id         uuid default null,
  p_qr_encryption_key  text default null
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

    perform set_config('app.qr_encryption_key', coalesce(p_qr_encryption_key, ''), true);

    v_result := private.generate_qr_token_workflow_v1(
      p_booking_id
    );

    perform private.clear_actor_context();
    perform set_config('app.qr_encryption_key', '', true);

    return v_result;
  exception
    when others then
      perform private.clear_actor_context();
      perform set_config('app.qr_encryption_key', '', true);
      raise;
  end;
end;
$$;

create or replace function public.verify_qr_and_create_access_event_v1(
  p_trusted_actor_id   uuid,
  p_trusted_actor_type public.actor_type,
  p_request_id         text default null,
  p_raw_token          text default null,
  p_device_id          uuid default null
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

    v_result := private.verify_qr_and_create_access_event_workflow_v1(
      p_raw_token,
      p_device_id
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

revoke all on function public.generate_qr_token_v1(uuid, public.actor_type, text, uuid, text) from public;
revoke all on function public.verify_qr_and_create_access_event_v1(uuid, public.actor_type, text, text, uuid) from public;

do $$
begin
  if exists (
    select 1
    from pg_catalog.pg_roles
    where rolname = 'anon'
  ) then
    execute 'revoke all on function public.generate_qr_token_v1(uuid, public.actor_type, text, uuid, text) from anon';
    execute 'revoke all on function public.verify_qr_and_create_access_event_v1(uuid, public.actor_type, text, text, uuid) from anon';
  end if;

  if exists (
    select 1
    from pg_catalog.pg_roles
    where rolname = 'authenticated'
  ) then
    execute 'revoke all on function public.generate_qr_token_v1(uuid, public.actor_type, text, uuid, text) from authenticated';
    execute 'revoke all on function public.verify_qr_and_create_access_event_v1(uuid, public.actor_type, text, text, uuid) from authenticated';
  end if;

  if exists (
    select 1
    from pg_catalog.pg_roles
    where rolname = 'service_role'
  ) then
    execute 'grant execute on function public.generate_qr_token_v1(uuid, public.actor_type, text, uuid, text) to service_role';
    execute 'grant execute on function public.verify_qr_and_create_access_event_v1(uuid, public.actor_type, text, text, uuid) to service_role';
  end if;
end;
$$;