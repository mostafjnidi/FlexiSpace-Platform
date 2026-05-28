create or replace function public.create_mock_payment_session_v1(
  p_trusted_actor_id   uuid,
  p_trusted_actor_type public.actor_type,
  p_request_id         text default null,
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

    v_result := private.create_mock_payment_session_workflow_v1(
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

create or replace function public.confirm_mock_payment_v1(
  p_trusted_actor_id   uuid,
  p_trusted_actor_type public.actor_type,
  p_request_id         text default null,
  p_booking_id         uuid default null,
  p_idempotency_key    uuid default null,
  p_simulate_success   boolean default true
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

    v_result := private.confirm_mock_payment_workflow_v1(
      p_booking_id,
      p_idempotency_key,
      p_simulate_success
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

revoke all on function public.create_mock_payment_session_v1(uuid, public.actor_type, text, uuid) from public;
revoke all on function public.confirm_mock_payment_v1(uuid, public.actor_type, text, uuid, uuid, boolean) from public;

do $$
begin
  if exists (
    select 1
    from pg_catalog.pg_roles
    where rolname = 'anon'
  ) then
    execute 'revoke all on function public.create_mock_payment_session_v1(uuid, public.actor_type, text, uuid) from anon';
    execute 'revoke all on function public.confirm_mock_payment_v1(uuid, public.actor_type, text, uuid, uuid, boolean) from anon';
  end if;

  if exists (
    select 1
    from pg_catalog.pg_roles
    where rolname = 'authenticated'
  ) then
    execute 'revoke all on function public.create_mock_payment_session_v1(uuid, public.actor_type, text, uuid) from authenticated';
    execute 'revoke all on function public.confirm_mock_payment_v1(uuid, public.actor_type, text, uuid, uuid, boolean) from authenticated';
  end if;

  if exists (
    select 1
    from pg_catalog.pg_roles
    where rolname = 'service_role'
  ) then
    execute 'grant execute on function public.create_mock_payment_session_v1(uuid, public.actor_type, text, uuid) to service_role';
    execute 'grant execute on function public.confirm_mock_payment_v1(uuid, public.actor_type, text, uuid, uuid, boolean) to service_role';
  end if;
end;
$$;