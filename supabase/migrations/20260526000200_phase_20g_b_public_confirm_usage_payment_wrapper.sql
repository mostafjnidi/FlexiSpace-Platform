-- Phase 20G-fix: public wrapper for confirm_usage_payment_workflow_v1
-- Callable by service_role only (Edge Function uses service_role key).

create or replace function public.confirm_usage_payment_v1(
  p_trusted_actor_id    uuid,
  p_trusted_actor_type  public.actor_type,
  p_request_id          text,
  p_booking_id          uuid,
  p_idempotency_key     uuid,
  p_simulate_success    boolean default true
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog
as $$
begin
  perform private.set_trusted_actor(p_trusted_actor_id, p_trusted_actor_type);
  perform private.set_request_id(p_request_id);

  return private.confirm_usage_payment_workflow_v1(
    p_booking_id,
    p_idempotency_key,
    p_simulate_success
  );
end;
$$;

-- Restrict to service_role only (same pattern as other public wrappers)
revoke execute on function public.confirm_usage_payment_v1(uuid, public.actor_type, text, uuid, uuid, boolean) from public, anon, authenticated;