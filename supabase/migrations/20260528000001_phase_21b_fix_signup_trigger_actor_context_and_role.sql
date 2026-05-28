-- Phase 21b: Fix handle_new_auth_user
--   1. Set SYSTEM actor context before INSERT (required by audit trigger on profiles)
--   2. Map requested_role from raw_user_meta_data to DB role
--   3. Clear actor context after INSERT
--
-- Before this fix: every new signup failed silently — profile was never created
-- because audit_profiles_row_changes raised "trusted actor context is required".

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
  v_role   public.user_role;
  v_raw    text;
begin
  v_raw  := lower(coalesce(new.raw_user_meta_data->>'requested_role', ''));
  v_role := case v_raw
    when 'owner'    then 'OWNER'::public.user_role
    when 'operator' then 'OPERATOR'::public.user_role
    else                 'USER'::public.user_role
  end;

  perform private.set_actor_context(
    null,
    'SYSTEM'::public.actor_type,
    'system:signup'
  );

  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    v_role
  )
  on conflict (id) do nothing;

  perform private.clear_actor_context();

  return new;
exception when others then
  perform private.clear_actor_context();
  return new;
end;
$$;