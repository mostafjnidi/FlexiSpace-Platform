do $$
begin
  if not exists (
    select 1
    from pg_catalog.pg_publication_tables
    where pubname    = 'supabase_realtime'
      and schemaname = 'public'
      and tablename  = 'device_inventory_read_model'
  ) then
    alter publication supabase_realtime add table public.device_inventory_read_model;
  end if;

  if not exists (
    select 1
    from pg_catalog.pg_publication_tables
    where pubname    = 'supabase_realtime'
      and schemaname = 'public'
      and tablename  = 'access_events_read_model'
  ) then
    alter publication supabase_realtime add table public.access_events_read_model;
  end if;
end;
$$;
