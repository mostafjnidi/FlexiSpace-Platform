create or replace function public.mock_ack_access_event_v1(
  p_trusted_actor_id   uuid,
  p_trusted_actor_type public.actor_type,
  p_request_id         text default null,
  p_access_event_id    uuid default null,
  p_ack_result         public.access_event_status default null,
  p_reason             text default null
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

    v_result := private.mock_ack_access_event_workflow_v1(
      p_access_event_id,
      p_ack_result,
      p_reason
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


create or replace function public.mock_app_unlock_v1(
  p_trusted_actor_id   uuid,
  p_trusted_actor_type public.actor_type,
  p_request_id         text default null,
  p_booking_id         uuid default null,
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

    v_result := private.mock_app_unlock_workflow_v1(
      p_booking_id,
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


create or replace function public.mock_manual_override_access_v1(
  p_trusted_actor_id   uuid,
  p_trusted_actor_type public.actor_type,
  p_request_id         text default null,
  p_device_id          uuid default null,
  p_reason             text default null,
  p_booking_id         uuid default null
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

    v_result := private.mock_manual_override_access_workflow_v1(
      p_device_id,
      p_reason,
      p_booking_id
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


create or replace function public.mock_generate_telemetry_v1(
  p_trusted_actor_id   uuid,
  p_trusted_actor_type public.actor_type,
  p_request_id         text default null,
  p_device_id          uuid default null,
  p_event_type         text default null,
  p_payload            jsonb default null,
  p_observed_at        timestamptz default null,
  p_new_device_status  public.device_status default null
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

    v_result := private.mock_generate_telemetry_workflow_v1(
      p_device_id,
      p_event_type,
      p_payload,
      p_observed_at,
      p_new_device_status
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


revoke all on function public.mock_ack_access_event_v1(uuid, public.actor_type, text, uuid, public.access_event_status, text) from public;
revoke all on function public.mock_app_unlock_v1(uuid, public.actor_type, text, uuid, uuid) from public;
revoke all on function public.mock_manual_override_access_v1(uuid, public.actor_type, text, uuid, text, uuid) from public;
revoke all on function public.mock_generate_telemetry_v1(uuid, public.actor_type, text, uuid, text, jsonb, timestamptz, public.device_status) from public;

do $$
begin
  if exists (
    select 1
    from pg_catalog.pg_roles
    where rolname = 'anon'
  ) then
    execute 'revoke all on function public.mock_ack_access_event_v1(uuid, public.actor_type, text, uuid, public.access_event_status, text) from anon';
    execute 'revoke all on function public.mock_app_unlock_v1(uuid, public.actor_type, text, uuid, uuid) from anon';
    execute 'revoke all on function public.mock_manual_override_access_v1(uuid, public.actor_type, text, uuid, text, uuid) from anon';
    execute 'revoke all on function public.mock_generate_telemetry_v1(uuid, public.actor_type, text, uuid, text, jsonb, timestamptz, public.device_status) from anon';
  end if;

  if exists (
    select 1
    from pg_catalog.pg_roles
    where rolname = 'authenticated'
  ) then
    execute 'revoke all on function public.mock_ack_access_event_v1(uuid, public.actor_type, text, uuid, public.access_event_status, text) from authenticated';
    execute 'revoke all on function public.mock_app_unlock_v1(uuid, public.actor_type, text, uuid, uuid) from authenticated';
    execute 'revoke all on function public.mock_manual_override_access_v1(uuid, public.actor_type, text, uuid, text, uuid) from authenticated';
    execute 'revoke all on function public.mock_generate_telemetry_v1(uuid, public.actor_type, text, uuid, text, jsonb, timestamptz, public.device_status) from authenticated';
  end if;

  if exists (
    select 1
    from pg_catalog.pg_roles
    where rolname = 'service_role'
  ) then
    execute 'grant execute on function public.mock_ack_access_event_v1(uuid, public.actor_type, text, uuid, public.access_event_status, text) to service_role';
    execute 'grant execute on function public.mock_app_unlock_v1(uuid, public.actor_type, text, uuid, uuid) to service_role';
    execute 'grant execute on function public.mock_manual_override_access_v1(uuid, public.actor_type, text, uuid, text, uuid) to service_role';
    execute 'grant execute on function public.mock_generate_telemetry_v1(uuid, public.actor_type, text, uuid, text, jsonb, timestamptz, public.device_status) to service_role';
  end if;
end;
$$;