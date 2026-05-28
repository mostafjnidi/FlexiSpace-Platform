grant execute on function private.auth_user_role() to anon, authenticated;
grant execute on function private.auth_user_is_admin() to anon, authenticated;
grant execute on function private.auth_is_owner_of_office(uuid) to anon, authenticated;
grant execute on function private.auth_is_operator_of_office(uuid) to anon, authenticated;
grant execute on function private.auth_can_manage_office(uuid) to anon, authenticated;
grant execute on function private.auth_can_access_booking(uuid) to anon, authenticated;
grant execute on function private.auth_can_access_device(uuid) to anon, authenticated;
grant execute on function private.auth_can_read_device_telemetry(uuid) to anon, authenticated;
