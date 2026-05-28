create or replace function private.create_notification_once_v1(
  p_user_id         uuid,
  p_type            public.notification_type,
  p_title           text,
  p_body            text,
  p_data            jsonb,
  p_idempotency_key text
)
returns void
language plpgsql
security definer
set search_path = pg_catalog
as $$
begin
  insert into public.notifications (
    user_id,
    type,
    title,
    body,
    data,
    idempotency_key
  )
  values (
    p_user_id,
    p_type,
    p_title,
    p_body,
    coalesce(p_data, '{}'::jsonb),
    p_idempotency_key
  )
  on conflict (idempotency_key)
    where idempotency_key is not null
  do nothing;
end;
$$;

revoke all on function private.create_notification_once_v1(uuid, public.notification_type, text, text, jsonb, text) from public;