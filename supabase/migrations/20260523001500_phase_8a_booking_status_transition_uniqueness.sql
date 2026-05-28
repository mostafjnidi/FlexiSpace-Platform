create unique index if not exists booking_status_transitions_from_to_uidx
  on public.booking_status_transitions (from_status, to_status);
