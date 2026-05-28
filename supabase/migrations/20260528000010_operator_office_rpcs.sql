-- Operator-office assignment RPCs
-- Pattern matches booking RPCs: Edge Function passes actor context as params,
-- function sets tx-local context before writing to avoid audit trigger error.

-- ── assign ────────────────────────────────────────────────────────────────────
create or replace function public.assign_operator_office_v1(
  p_trusted_actor_id   uuid,
  p_trusted_actor_type public.actor_type,
  p_request_id         text,
  p_operator_id        uuid,
  p_office_id          uuid
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_soft_deleted_id uuid;
  v_id              uuid;
  v_created_at      timestamptz;
begin
  perform private.set_actor_context(p_trusted_actor_id, p_trusted_actor_type, p_request_id);

  -- Restore soft-deleted row if exists
  select id into v_soft_deleted_id
  from public.operator_offices
  where operator_id = p_operator_id
    and office_id   = p_office_id
    and deleted_at is not null
  limit 1;

  if v_soft_deleted_id is not null then
    update public.operator_offices
    set deleted_at = null
    where id = v_soft_deleted_id
    returning id, created_at into v_id, v_created_at;
  else
    insert into public.operator_offices (operator_id, office_id)
    values (p_operator_id, p_office_id)
    on conflict do nothing
    returning id, created_at into v_id, v_created_at;

    -- Conflict = already active row
    if v_id is null then
      select id, created_at into v_id, v_created_at
      from public.operator_offices
      where operator_id = p_operator_id
        and office_id   = p_office_id
        and deleted_at is null;
    end if;
  end if;

  perform private.clear_actor_context();

  return jsonb_build_object(
    'id',          v_id,
    'operator_id', p_operator_id,
    'office_id',   p_office_id,
    'created_at',  v_created_at
  );
exception when others then
  perform private.clear_actor_context();
  raise;
end;
$$;

-- ── unassign ──────────────────────────────────────────────────────────────────
create or replace function public.unassign_operator_office_v1(
  p_trusted_actor_id   uuid,
  p_trusted_actor_type public.actor_type,
  p_request_id         text,
  p_link_id            uuid
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  perform private.set_actor_context(p_trusted_actor_id, p_trusted_actor_type, p_request_id);

  update public.operator_offices
  set deleted_at = now()
  where id = p_link_id
    and deleted_at is null;

  if not found then
    perform private.clear_actor_context();
    raise exception 'OPERATOR_LINK_NOT_FOUND: assignment not found or already removed'
      using errcode = 'P0001';
  end if;

  perform private.clear_actor_context();

  return jsonb_build_object('id', p_link_id);
exception when others then
  perform private.clear_actor_context();
  raise;
end;
$$;

-- Service-role only (same pattern as booking wrappers)
revoke all on function public.assign_operator_office_v1(uuid, public.actor_type, text, uuid, uuid) from public, anon, authenticated;
revoke all on function public.unassign_operator_office_v1(uuid, public.actor_type, text, uuid) from public, anon, authenticated;
grant execute on function public.assign_operator_office_v1(uuid, public.actor_type, text, uuid, uuid) to service_role;
grant execute on function public.unassign_operator_office_v1(uuid, public.actor_type, text, uuid) to service_role;