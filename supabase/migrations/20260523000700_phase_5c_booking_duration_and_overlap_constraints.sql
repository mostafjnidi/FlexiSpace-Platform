alter table bookings
  add constraint bookings_duration_bounds_check
  check (
    end_time >= start_time + interval '30 minutes'
    and end_time <= start_time + interval '30 days'
  );

alter table bookings
  add constraint bookings_no_overlapping_blocking_excl
  exclude using gist (
    office_id with =,
    tstzrange(start_time, end_time, '[)') with &&
  )
  where (
    deleted_at is null
    and status in (
      'PENDING_APPROVAL',
      'APPROVED',
      'PAYMENT_PENDING',
      'CONFIRMED',
      'CHECKED_IN',
      'OVERSTAY'
    )
  );
