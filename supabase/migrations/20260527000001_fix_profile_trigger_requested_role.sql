create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
  v_role text;
begin
  v_role := coalesce(new.raw_user_meta_data->>'requested_role', 'client');
  -- Map frontend values to enum values
  v_role := case lower(v_role)
    when 'operator' then 'OPERATOR'
    when 'admin'    then 'ADMIN'
    when 'owner'    then 'OWNER'
    else                 'USER'
  end;

  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    v_role
  )
  on conflict (id) do nothing;
  return new;
end;
$$;