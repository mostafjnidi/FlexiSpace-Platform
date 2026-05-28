do $$
begin
  if not exists (
    select 1
    from pg_catalog.pg_extension
    where extname = 'pg_cron'
  ) then
    raise exception 'CRON_EXTENSION_NOT_FOUND: pg_cron extension is not installed'
      using errcode = 'P0001';
  end if;

  -- flixe-expire-unpaid-bookings
  begin
    perform cron.unschedule('flixe-expire-unpaid-bookings');
  exception when others then
    null;
  end;
  perform cron.schedule(
    'flixe-expire-unpaid-bookings',
    '*/5 * * * *',
    $cmd$SELECT public.run_expire_unpaid_bookings_v1('cron:expire-unpaid-bookings')$cmd$
  );

  -- flixe-mark-no-show-bookings
  begin
    perform cron.unschedule('flixe-mark-no-show-bookings');
  exception when others then
    null;
  end;
  perform cron.schedule(
    'flixe-mark-no-show-bookings',
    '*/5 * * * *',
    $cmd$SELECT public.run_mark_no_show_bookings_v1('cron:mark-no-show-bookings')$cmd$
  );

  -- flixe-mark-overstay-bookings
  begin
    perform cron.unschedule('flixe-mark-overstay-bookings');
  exception when others then
    null;
  end;
  perform cron.schedule(
    'flixe-mark-overstay-bookings',
    '*/2 * * * *',
    $cmd$SELECT public.run_mark_overstay_bookings_v1('cron:mark-overstay-bookings')$cmd$
  );

  -- flixe-complete-checked-out-bookings
  begin
    perform cron.unschedule('flixe-complete-checked-out-bookings');
  exception when others then
    null;
  end;
  perform cron.schedule(
    'flixe-complete-checked-out-bookings',
    '*/10 * * * *',
    $cmd$SELECT public.run_complete_checked_out_bookings_v1('cron:complete-checked-out-bookings')$cmd$
  );

  -- flixe-scan-offline-devices
  begin
    perform cron.unschedule('flixe-scan-offline-devices');
  exception when others then
    null;
  end;
  perform cron.schedule(
    'flixe-scan-offline-devices',
    '*/5 * * * *',
    $cmd$SELECT public.run_scan_offline_devices_v1('cron:scan-offline-devices')$cmd$
  );

  -- flixe-recover-stale-jobs
  begin
    perform cron.unschedule('flixe-recover-stale-jobs');
  exception when others then
    null;
  end;
  perform cron.schedule(
    'flixe-recover-stale-jobs',
    '*/10 * * * *',
    $cmd$SELECT public.run_recover_stale_jobs_v1('cron:recover-stale-jobs')$cmd$
  );
end;
$$;