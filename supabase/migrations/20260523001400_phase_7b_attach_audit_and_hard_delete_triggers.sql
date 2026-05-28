drop trigger if exists audit_profiles_row_changes on public.profiles;
create trigger audit_profiles_row_changes
after insert or update or delete on public.profiles
for each row
execute function private.audit_row_change('profile', 'id', '');

drop trigger if exists block_profiles_hard_delete on public.profiles;
create trigger block_profiles_hard_delete
before delete on public.profiles
for each row
execute function private.block_hard_delete();

drop trigger if exists audit_offices_row_changes on public.offices;
create trigger audit_offices_row_changes
after insert or update or delete on public.offices
for each row
execute function private.audit_row_change('office', 'id', '');

drop trigger if exists block_offices_hard_delete on public.offices;
create trigger block_offices_hard_delete
before delete on public.offices
for each row
execute function private.block_hard_delete();

drop trigger if exists audit_operator_offices_row_changes on public.operator_offices;
create trigger audit_operator_offices_row_changes
after insert or update or delete on public.operator_offices
for each row
execute function private.audit_row_change('operator_office', 'id', '');

drop trigger if exists block_operator_offices_hard_delete on public.operator_offices;
create trigger block_operator_offices_hard_delete
before delete on public.operator_offices
for each row
execute function private.block_hard_delete();

drop trigger if exists audit_office_availability_rules_row_changes on public.office_availability_rules;
create trigger audit_office_availability_rules_row_changes
after insert or update or delete on public.office_availability_rules
for each row
execute function private.audit_row_change('office_availability_rule', 'id', '');

drop trigger if exists block_office_availability_rules_hard_delete on public.office_availability_rules;
create trigger block_office_availability_rules_hard_delete
before delete on public.office_availability_rules
for each row
execute function private.block_hard_delete();

drop trigger if exists audit_booking_status_transitions_row_changes on public.booking_status_transitions;
create trigger audit_booking_status_transitions_row_changes
after insert or update or delete on public.booking_status_transitions
for each row
execute function private.audit_row_change('booking_status_transition', 'id', '');

drop trigger if exists block_booking_status_transitions_hard_delete on public.booking_status_transitions;
create trigger block_booking_status_transitions_hard_delete
before delete on public.booking_status_transitions
for each row
execute function private.block_hard_delete();

drop trigger if exists audit_bookings_row_changes on public.bookings;
create trigger audit_bookings_row_changes
after insert or update or delete on public.bookings
for each row
execute function private.audit_row_change('booking', 'id', '');

drop trigger if exists block_bookings_hard_delete on public.bookings;
create trigger block_bookings_hard_delete
before delete on public.bookings
for each row
execute function private.block_hard_delete();

drop trigger if exists audit_payments_row_changes on public.payments;
create trigger audit_payments_row_changes
after insert or update or delete on public.payments
for each row
execute function private.audit_row_change('payment', 'id', '');

drop trigger if exists block_payments_hard_delete on public.payments;
create trigger block_payments_hard_delete
before delete on public.payments
for each row
execute function private.block_hard_delete();

drop trigger if exists audit_webhook_events_row_changes on public.webhook_events;
create trigger audit_webhook_events_row_changes
after insert or update or delete on public.webhook_events
for each row
execute function private.audit_row_change('webhook_event', 'id', 'payload');

drop trigger if exists block_webhook_events_hard_delete on public.webhook_events;
create trigger block_webhook_events_hard_delete
before delete on public.webhook_events
for each row
execute function private.block_hard_delete();

drop trigger if exists audit_qr_tokens_row_changes on public.qr_tokens;
create trigger audit_qr_tokens_row_changes
after insert or update or delete on public.qr_tokens
for each row
execute function private.audit_row_change('qr_token', 'id', 'token_hash,encrypted_token');

drop trigger if exists block_qr_tokens_hard_delete on public.qr_tokens;
create trigger block_qr_tokens_hard_delete
before delete on public.qr_tokens
for each row
execute function private.block_hard_delete();

drop trigger if exists audit_iot_devices_row_changes on public.iot_devices;
create trigger audit_iot_devices_row_changes
after insert or update or delete on public.iot_devices
for each row
execute function private.audit_row_change('iot_device', 'id', 'device_key');

drop trigger if exists block_iot_devices_hard_delete on public.iot_devices;
create trigger block_iot_devices_hard_delete
before delete on public.iot_devices
for each row
execute function private.block_hard_delete();

drop trigger if exists audit_access_events_row_changes on public.access_events;
create trigger audit_access_events_row_changes
after insert or update or delete on public.access_events
for each row
execute function private.audit_row_change('access_event', 'id', '');

drop trigger if exists block_access_events_hard_delete on public.access_events;
create trigger block_access_events_hard_delete
before delete on public.access_events
for each row
execute function private.block_hard_delete();

drop trigger if exists audit_jobs_row_changes on public.jobs;
create trigger audit_jobs_row_changes
after insert or update or delete on public.jobs
for each row
execute function private.audit_row_change('job', 'id', 'payload');

drop trigger if exists block_jobs_hard_delete on public.jobs;
create trigger block_jobs_hard_delete
before delete on public.jobs
for each row
execute function private.block_hard_delete();

drop trigger if exists audit_incidents_row_changes on public.incidents;
create trigger audit_incidents_row_changes
after insert or update or delete on public.incidents
for each row
execute function private.audit_row_change('incident', 'id', '');

drop trigger if exists block_incidents_hard_delete on public.incidents;
create trigger block_incidents_hard_delete
before delete on public.incidents
for each row
execute function private.block_hard_delete();
