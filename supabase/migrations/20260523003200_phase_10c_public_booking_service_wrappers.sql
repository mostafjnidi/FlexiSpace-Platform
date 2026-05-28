create or replace function public.create_booking_v1(
  p_trusted_actor_id uuid,
  p_trusted_actor_type public.actor_type,
  p_request_id text default null,
  p_office_id uuid default null,
  p_start_time timestamptz default null,
  p_end_time timestamptz default null,
  p_idempotency_key uuid default null
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

    v_result := private.create_booking_workflow_v1(
      p_office_id,
      p_start_time,
      p_end_time,
      p_idempotency_key
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

create or replace function public.approve_booking_v1(
  p_trusted_actor_id uuid,
  p_trusted_actor_type public.actor_type,
  p_request_id text default null,
  p_booking_id uuid default null,
  p_payment_idempotency_key uuid default null
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

    v_result := private.approve_booking_workflow_v1(
      p_booking_id,
      p_payment_idempotency_key
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

create or replace function public.reject_booking_v1(
  p_trusted_actor_id uuid,
  p_trusted_actor_type public.actor_type,
  p_request_id text default null,
  p_booking_id uuid default null,
  p_reason text default null
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

    v_result := private.reject_booking_workflow_v1(
      p_booking_id,
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

create or replace function public.cancel_booking_v1(
  p_trusted_actor_id uuid,
  p_trusted_actor_type public.actor_type,
  p_request_id text default null,
  p_booking_id uuid default null,
  p_reason text default null
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

    v_result := private.cancel_booking_workflow_v1(
      p_booking_id,
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

revoke all on function public.create_booking_v1(uuid, public.actor_type, text, uuid, timestamptz, timestamptz, uuid) from public;
revoke all on function public.approve_booking_v1(uuid, public.actor_type, text, uuid, uuid) from public;
revoke all on function public.reject_booking_v1(uuid, public.actor_type, text, uuid, text) from public;
revoke all on function public.cancel_booking_v1(uuid, public.actor_type, text, uuid, text) from public;

do $$
begin
  if exists (
    select 1
    from pg_catalog.pg_roles
    where rolname = 'anon'
  ) then
    execute 'revoke all on function public.create_booking_v1(uuid, public.actor_type, text, uuid, timestamptz, timestamptz, uuid) from anon';
    execute 'revoke all on function public.approve_booking_v1(uuid, public.actor_type, text, uuid, uuid) from anon';
    execute 'revoke all on function public.reject_booking_v1(uuid, public.actor_type, text, uuid, text) from anon';
    execute 'revoke all on function public.cancel_booking_v1(uuid, public.actor_type, text, uuid, text) from anon';
  end if;

  if exists (
    select 1
    from pg_catalog.pg_roles
    where rolname = 'authenticated'
  ) then
    execute 'revoke all on function public.create_booking_v1(uuid, public.actor_type, text, uuid, timestamptz, timestamptz, uuid) from authenticated';
    execute 'revoke all on function public.approve_booking_v1(uuid, public.actor_type, text, uuid, uuid) from authenticated';
    execute 'revoke all on function public.reject_booking_v1(uuid, public.actor_type, text, uuid, text) from authenticated';
    execute 'revoke all on function public.cancel_booking_v1(uuid, public.actor_type, text, uuid, text) from authenticated';
  end if;

  if exists (
    select 1
    from pg_catalog.pg_roles
    where rolname = 'service_role'
  ) then
    execute 'grant execute on function public.create_booking_v1(uuid, public.actor_type, text, uuid, timestamptz, timestamptz, uuid) to service_role';
    execute 'grant execute on function public.approve_booking_v1(uuid, public.actor_type, text, uuid, uuid) to service_role';
    execute 'grant execute on function public.reject_booking_v1(uuid, public.actor_type, text, uuid, text) to service_role';
    execute 'grant execute on function public.cancel_booking_v1(uuid, public.actor_type, text, uuid, text) to service_role';
  end if;
end;
$$;
