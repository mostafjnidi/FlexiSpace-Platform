create or replace function private.mock_generate_telemetry_workflow_v1(
  p_device_id         uuid,
  p_event_type        text,
  p_payload           jsonb,
  p_observed_at       timestamptz,
  p_new_device_status public.device_status default null
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
  v_actor_type      public.actor_type;
  v_device          public.iot_devices%rowtype;
  v_telemetry_event public.telemetry_events%rowtype;
  v_device_snapshot public.device_state_snapshots%rowtype;
begin
  -- Step 1: Require trusted actor context
  if not private.has_trusted_actor_context() then
    raise exception 'INVALID_ACTOR_CONTEXT: trusted actor context is required'
      using errcode = 'P0001';
  end if;

  -- Step 2: Actor type must be SYSTEM or JOB only
  v_actor_type := private.current_actor_type();

  if v_actor_type is null or v_actor_type not in (
    'SYSTEM'::public.actor_type,
    'JOB'::public.actor_type
  ) then
    raise exception 'FORBIDDEN: actor type % is not permitted to generate telemetry', v_actor_type
      using errcode = 'P0001';
  end if;

  -- Step 3: Validate inputs
  if p_device_id is null then
    raise exception 'VALIDATION_ERROR: p_device_id must not be null'
      using errcode = 'P0001';
  end if;

  if p_event_type is null or pg_catalog.btrim(p_event_type) = '' then
    raise exception 'VALIDATION_ERROR: p_event_type must not be null or blank'
      using errcode = 'P0001';
  end if;

  if p_payload is null then
    raise exception 'VALIDATION_ERROR: p_payload must not be null'
      using errcode = 'P0001';
  end if;

  if p_observed_at is null then
    raise exception 'VALIDATION_ERROR: p_observed_at must not be null'
      using errcode = 'P0001';
  end if;

  -- Step 4: Load device
  select d.*
    into v_device
  from public.iot_devices as d
  where d.id = p_device_id
    and d.deleted_at is null;

  if not found then
    raise exception 'DEVICE_NOT_FOUND: device was not found'
      using errcode = 'P0001';
  end if;

  -- Step 5: Insert telemetry event
  insert into public.telemetry_events (
    device_id,
    event_type,
    payload,
    observed_at,
    received_at
  ) values (
    p_device_id,
    p_event_type,
    p_payload,
    p_observed_at,
    now()
  )
  returning *
    into v_telemetry_event;

  -- Step 6: Upsert device state snapshot — full state replace, not merge
  insert into public.device_state_snapshots (
    device_id,
    state,
    last_event_id,
    observed_at,
    updated_at
  ) values (
    p_device_id,
    p_payload,
    v_telemetry_event.id,
    p_observed_at,
    now()
  )
  on conflict (device_id) do update set
    state         = excluded.state,
    last_event_id = excluded.last_event_id,
    observed_at   = excluded.observed_at,
    updated_at    = excluded.updated_at
  returning *
    into v_device_snapshot;

  -- Step 7: Update iot_devices — always set last_seen_at; conditionally set status
  update public.iot_devices
  set
    last_seen_at = now(),
    status       = coalesce(p_new_device_status, status),
    updated_at   = now()
  where id = p_device_id;

  -- Step 8: Return result
  return pg_catalog.jsonb_build_object(
    'telemetry_event_id',    v_telemetry_event.id,
    'device_id',             p_device_id,
    'device_snapshot_id',    v_device_snapshot.id,
    'event_type',            p_event_type,
    'device_status_updated', (p_new_device_status is not null)
  );
end;
$$;

revoke execute on function private.mock_generate_telemetry_workflow_v1(uuid, text, jsonb, timestamptz, public.device_status) from public;