-- Manual Checkin Booking - Public Wrapper
--
-- public.manual_checkin_booking_v1(...) returns jsonb
-- Service-role only. Sets trusted actor context, calls private workflow, clears context.

create or replace function public.manual_checkin_booking_v1(
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

    v_result := private.manual_checkin_booking_workflow_v1(p_booking_id);

    perform private.clear_actor_context();

    return v_result;
  exception
    when others then
      perform private.clear_actor_context();
      raise;
  end;
end;
$$;

revoke all on function public.manual_checkin_booking_v1(uuid, public.actor_type, text, uuid) from public;

do $$
begin
  if exists (
    select 1 from pg_catalog.pg_roles where rolname = 'anon'
  ) then
    execute 'revoke all on function public.manual_checkin_booking_v1(uuid, public.actor_type, text, uuid) from anon';
  end if;

  if exists (
    select 1 from pg_catalog.pg_roles where rolname = 'authenticated'
  ) then
    execute 'revoke all on function public.manual_checkin_booking_v1(uuid, public.actor_type, text, uuid) from authenticated';
  end if;

  if exists (
    select 1 from pg_catalog.pg_roles where rolname = 'service_role'
  ) then
    execute 'grant execute on function public.manual_checkin_booking_v1(uuid, public.actor_type, text, uuid) to service_role';
  end if;
end;
$$;