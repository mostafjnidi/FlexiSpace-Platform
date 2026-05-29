-- Maintenance Tasks RPCs
-- create_maintenance_task_v1  — inserts a new task
-- advance_task_status_v1      — open→assigned→in_progress→done

-- ── create_maintenance_task_v1 ────────────────────────────────────────────────

create or replace function public.create_maintenance_task_v1(
  p_trusted_actor_id   uuid,
  p_trusted_actor_type public.actor_type,
  p_request_id         text    default null,
  p_office_id          uuid    default null,
  p_title              text    default null,
  p_task_type          text    default 'other',
  p_priority           text    default 'normal',
  p_location           text    default null,
  p_assigned_to        text    default null
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_task_id uuid;
begin
  if p_office_id is null then
    raise exception 'VALIDATION: office_id is required' using errcode = 'P0001';
  end if;
  if p_title is null or pg_catalog.btrim(p_title) = '' then
    raise exception 'VALIDATION: title is required' using errcode = 'P0001';
  end if;
  if p_task_type not in ('cleaning','hvac','it','security','other') then
    raise exception 'VALIDATION: task_type must be cleaning|hvac|it|security|other' using errcode = 'P0001';
  end if;
  if p_priority not in ('high','normal') then
    raise exception 'VALIDATION: priority must be high|normal' using errcode = 'P0001';
  end if;

  perform private.set_actor_context(p_trusted_actor_id, p_trusted_actor_type, p_request_id);

  insert into public.maintenance_tasks (
    office_id, created_by, assigned_to, title, location, task_type, priority, status
  ) values (
    p_office_id,
    p_trusted_actor_id,
    p_assigned_to,
    pg_catalog.btrim(p_title),
    p_location,
    p_task_type,
    p_priority,
    'open'
  )
  returning id into v_task_id;

  perform private.clear_actor_context();

  return pg_catalog.jsonb_build_object(
    'id',        v_task_id,
    'office_id', p_office_id,
    'status',    'open'
  );
exception when others then
  perform private.clear_actor_context();
  raise;
end;
$$;

revoke all on function public.create_maintenance_task_v1(uuid, public.actor_type, text, uuid, text, text, text, text, text)
  from public, anon, authenticated;
grant  execute on function public.create_maintenance_task_v1(uuid, public.actor_type, text, uuid, text, text, text, text, text)
  to service_role;

-- ── advance_task_status_v1 ────────────────────────────────────────────────────

create or replace function public.advance_task_status_v1(
  p_trusted_actor_id   uuid,
  p_trusted_actor_type public.actor_type,
  p_request_id         text    default null,
  p_task_id            uuid    default null,
  p_new_status         text    default null,
  p_assigned_to        text    default null
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_task public.maintenance_tasks%rowtype;
  v_allowed_next text[];
begin
  if p_task_id is null then
    raise exception 'VALIDATION: task_id is required' using errcode = 'P0001';
  end if;
  if p_new_status is null or p_new_status not in ('assigned','in_progress','done') then
    raise exception 'VALIDATION: new_status must be assigned|in_progress|done' using errcode = 'P0001';
  end if;

  select t.*
    into v_task
  from public.maintenance_tasks as t
  where t.id = p_task_id
    and t.deleted_at is null
  for update;

  if not found then
    raise exception 'NOT_FOUND: maintenance task not found' using errcode = 'P0001';
  end if;

  -- Validate forward-only transition
  v_allowed_next := case v_task.status
    when 'open'        then array['assigned']
    when 'assigned'    then array['in_progress']
    when 'in_progress' then array['done']
    else array[]::text[]
  end;

  if not (p_new_status = any(v_allowed_next)) then
    raise exception 'INVALID_STATE: cannot transition from % to %', v_task.status, p_new_status
      using errcode = 'P0001';
  end if;

  perform private.set_actor_context(p_trusted_actor_id, p_trusted_actor_type, p_request_id);

  update public.maintenance_tasks
  set status      = p_new_status,
      assigned_to = coalesce(p_assigned_to, assigned_to),
      updated_at  = now()
  where id = p_task_id;

  perform private.clear_actor_context();

  return pg_catalog.jsonb_build_object(
    'id',     p_task_id,
    'status', p_new_status
  );
exception when others then
  perform private.clear_actor_context();
  raise;
end;
$$;

revoke all on function public.advance_task_status_v1(uuid, public.actor_type, text, uuid, text, text)
  from public, anon, authenticated;
grant  execute on function public.advance_task_status_v1(uuid, public.actor_type, text, uuid, text, text)
  to service_role;