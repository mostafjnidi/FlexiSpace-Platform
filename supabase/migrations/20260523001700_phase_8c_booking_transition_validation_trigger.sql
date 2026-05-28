create or replace function private.validate_booking_transition()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog
as $$
begin
  if NEW.status is not distinct from OLD.status then
    return NEW;
  end if;

  perform private.require_trusted_actor_context();

  if OLD.status is null or NEW.status is null then
    raise exception 'invalid booking transition: status cannot be null'
      using errcode = 'P0001';
  end if;

  if not private.can_transition_booking_status(OLD.status, NEW.status) then
    raise exception 'invalid booking transition: % -> %', OLD.status, NEW.status
      using errcode = 'P0001';
  end if;

  if NEW.status = 'CANCELLED'::public.booking_status then
    if OLD.status not in (
      'PENDING_APPROVAL'::public.booking_status,
      'APPROVED'::public.booking_status,
      'PAYMENT_PENDING'::public.booking_status,
      'CONFIRMED'::public.booking_status
    )
      or now() > OLD.start_time - interval '12 hours'
      or OLD.checked_in_at is not null
      or NEW.checked_in_at is not null
    then
      raise exception 'CANCELLATION_NOT_ALLOWED: booking cancellation is not allowed from status %', OLD.status
        using errcode = 'P0001';
    end if;
  end if;

  return NEW;
end;
$$;

drop trigger if exists validate_booking_transition on public.bookings;
create trigger validate_booking_transition
before update of status on public.bookings
for each row
execute function private.validate_booking_transition();

revoke all on function private.validate_booking_transition() from public;
