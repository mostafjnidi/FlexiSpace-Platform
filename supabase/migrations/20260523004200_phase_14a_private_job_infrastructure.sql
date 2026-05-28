create or replace function private.create_and_claim_job_v1(
  p_job_type        text,
  p_worker_id       text,
  p_payload         jsonb default '{}'::jsonb,
  p_idempotency_key text default null
)
returns public.jobs
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
  v_job public.jobs%rowtype;
begin
  if p_job_type is null or pg_catalog.btrim(p_job_type) = '' then
    raise exception 'VALIDATION_ERROR: p_job_type must not be null or blank'
      using errcode = 'P0001';
  end if;

  if p_worker_id is null or pg_catalog.btrim(p_worker_id) = '' then
    raise exception 'VALIDATION_ERROR: p_worker_id must not be null or blank'
      using errcode = 'P0001';
  end if;

  insert into public.jobs (
    job_type,
    payload,
    status,
    run_at,
    attempts,
    max_attempts,
    idempotency_key,
    locked_by,
    locked_at
  ) values (
    p_job_type,
    p_payload,
    'RUNNING',
    now(),
    1,
    3,
    p_idempotency_key,
    p_worker_id,
    now()
  )
  returning *
    into v_job;

  return v_job;
end;
$$;


create or replace function private.succeed_job_v1(
  p_job_id uuid
)
returns void
language plpgsql
security definer
set search_path = pg_catalog
as $$
begin
  update public.jobs
  set
    status       = 'SUCCEEDED',
    completed_at = now(),
    updated_at   = now()
  where id = p_job_id
    and status = 'RUNNING';
end;
$$;


create or replace function private.fail_job_v1(
  p_job_id uuid,
  p_error  text
)
returns void
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
  v_job          public.jobs%rowtype;
  v_new_attempts integer;
  v_new_status   text;
begin
  select j.*
    into v_job
  from public.jobs as j
  where j.id = p_job_id;

  if not found then
    return;
  end if;

  v_new_attempts := v_job.attempts + 1;

  if v_new_attempts >= v_job.max_attempts then
    v_new_status := 'DEAD_LETTER';
  else
    v_new_status := 'FAILED';
  end if;

  update public.jobs
  set
    status     = v_new_status,
    attempts   = v_new_attempts,
    last_error = p_error,
    locked_by  = null,
    locked_at  = null,
    updated_at = now()
  where id = p_job_id
    and status = 'RUNNING';
end;
$$;


create or replace function private.reset_stale_jobs_v1(
  p_job_type            text,
  p_stale_after_seconds integer
)
returns integer
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
  v_updated_count integer;
begin
  if p_job_type is null or pg_catalog.btrim(p_job_type) = '' then
    raise exception 'VALIDATION_ERROR: p_job_type must not be null or blank'
      using errcode = 'P0001';
  end if;

  if p_stale_after_seconds is null or p_stale_after_seconds <= 0 then
    raise exception 'VALIDATION_ERROR: p_stale_after_seconds must be greater than zero'
      using errcode = 'P0001';
  end if;

  update public.jobs
  set
    status     = 'PENDING',
    locked_by  = null,
    locked_at  = null,
    updated_at = now()
  where job_type = p_job_type
    and status = 'RUNNING'
    and locked_at < now() - (p_stale_after_seconds * interval '1 second');

  get diagnostics v_updated_count = row_count;

  return v_updated_count;
end;
$$;


revoke execute on function private.create_and_claim_job_v1(text, text, jsonb, text) from PUBLIC;
revoke execute on function private.succeed_job_v1(uuid) from PUBLIC;
revoke execute on function private.fail_job_v1(uuid, text) from PUBLIC;
revoke execute on function private.reset_stale_jobs_v1(text, integer) from PUBLIC;
