-- Phase 20C-C: public.create_office_with_devices_v1
--
-- Service-role-only public wrapper following the Phase 10C/13C pattern.
-- Sets trusted actor context, calls the private workflow, clears context.
-- Execute revoked from public/anon/authenticated; granted to service_role only.

create or replace function public.create_office_with_devices_v1(
  p_trusted_actor_id   uuid,
  p_trusted_actor_type public.actor_type,
  p_request_id         text                 default null,
  p_name               text                 default null,
  p_description        text                 default null,
  p_building           text                 default null,
  p_floor              text                 default null,
  p_room               text                 default null,
  p_capacity           integer              default null,
  p_hourly_rate_cents  integer              default null,
  p_currency           text                 default 'USD',
  p_status             public.office_status default 'ACTIVE',
  p_image_url          text                 default null,
  p_device_types       public.device_type[] default '{}',
  p_idempotency_key    uuid                 default null
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

revoke all on function public.create_office_with_devices_v1(
  uuid, public.actor_type, text,
  text, text, text, text, text,
  integer, integer, text,
  public.office_status, text,
  public.device_type[], uuid
) from public;

do $$
begin
  if exists (
    select 1 from pg_catalog.pg_roles where rolname = 'anon'
  ) then
    execute 'revoke all on function public.create_office_with_devices_v1('
      || 'uuid, public.actor_type, text, '
      || 'text, text, text, text, text, '
      || 'integer, integer, text, '
      || 'public.office_status, text, '
      || 'public.device_type[], uuid'
      || ') from anon';
  end if;

  if exists (
    select 1 from pg_catalog.pg_roles where rolname = 'authenticated'
  ) then
    execute 'revoke all on function public.create_office_with_devices_v1('
      || 'uuid, public.actor_type, text, '
      || 'text, text, text, text, text, '
      || 'integer, integer, text, '
      || 'public.office_status, text, '
      || 'public.device_type[], uuid'
      || ') from authenticated';
  end if;

  if exists (
    select 1 from pg_catalog.pg_roles where rolname = 'service_role'
  ) then
    execute 'grant execute on function public.create_office_with_devices_v1('
      || 'uuid, public.actor_type, text, '
      || 'text, text, text, text, text, '
      || 'integer, integer, text, '
      || 'public.office_status, text, '
      || 'public.device_type[], uuid'
      || ') to service_role';
  end if;
end;
$$;