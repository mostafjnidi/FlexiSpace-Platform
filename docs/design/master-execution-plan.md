# FlexiSpace - Final Implementation Master Plan

Project: FlexiSpace - Smart Office Booking Platform with IoT Integration  
Architecture: Supabase-only backend  
Status: Final execution plan before implementation  
Audience: University capstone/thesis, backend implementation roadmap, technical delivery checklist  

---

## 1. Executive Summary

FlexiSpace is a smart office booking platform that supports office reservations, approval workflows, mock payment for V1/demo, QR-based access, mock IoT device flows, telemetry, notifications, auditability, and realtime updates.

The backend architecture is frozen and must not be redesigned. The system will be implemented entirely on Supabase:

- Supabase Auth for authentication.
- PostgreSQL as the single source of truth.
- Supabase Edge Functions as the API/application layer.
- PostgreSQL RPCs for sensitive workflows.
- PostgreSQL triggers for booking state-machine enforcement and audit logging.
- PostgreSQL exclusion constraints for booking overlap prevention.
- RLS enabled across tenant-scoped tables.
- Supabase Realtime for UI updates.
- `pg_cron + jobs` table for background work.
- Mock Payment and Mock IoT for V1/demo.
- MQTT/EMQX only as a future extension.
- Soft delete only.
- UTC timestamps only.

Implementation philosophy:

- Put invariants in PostgreSQL.
- Keep Edge Functions thin and orchestration-focused.
- Make sensitive workflows RPC-first.
- Never trust frontend state for security.
- Treat RLS as mandatory defense in depth.
- Build migration-safe, dependency-safe increments.
- Verify each module before moving forward.

Final readiness score:

```text
10 / 10 for contract readiness
SAFE TO START IMPLEMENTATION
```

---

## 2. Final Frozen Architecture Snapshot

### Backend Architecture

The backend is fully Supabase-based. There is no Node/Nest/Redis/Prisma/BullMQ backend. PostgreSQL owns the domain truth and enforces all critical rules.

### Auth Flow

1. User authenticates with Supabase Auth.
2. Frontend sends Supabase JWT to Edge Function.
3. Edge Function verifies JWT.
4. Edge Function loads user profile/role from `profiles`.
5. Edge Function sets trusted PostgreSQL context.
6. Edge Function calls RPC.
7. RPC enforces authorization and business rules.

### Authorization Model

Roles:

```text
USER
OPERATOR
OWNER
ADMIN
```

Authorization is enforced by:

- Edge Function JWT validation.
- Trusted actor context in PostgreSQL.
- RPC authorization checks.
- RLS policies.

### RLS Strategy

RLS is enabled on important tenant-scoped tables. Frontend users do not directly mutate sensitive tables. Sensitive writes happen through RPCs.

### RPC Strategy

RPCs handle:

- Booking creation.
- Booking approval/rejection/cancellation.
- Mock payment session creation and confirmation.
- QR generation and verification.
- Access events and mock unlock.
- Telemetry generation.
- Jobs dispatch.

RPCs must read actor identity from trusted PostgreSQL session context, not from untrusted client body values.

### Realtime Strategy

Supabase Realtime is used for UI updates on safe tables/events. Sensitive tables such as `qr_tokens`, `audit_logs`, and `webhook_events` must not be exposed through Realtime.

### Jobs Strategy

Background work uses:

```text
jobs table + pg_cron
```

No Redis or BullMQ.

Jobs must be idempotent and auditable.

### QR Flow

QR policy:

- QR is reusable during booking window.
- Existing active QR token is returned.
- Active QR token is not rotated in V1.
- Raw token is not stored in plaintext.
- Store token hash and encrypted token.
- Verify using token hash.
- Encrypt stored token using AES-256-GCM.

QR access window:

```text
valid_from = booking_start - 10 minutes
valid_until = booking_end + 5 minutes
```

`POST /qr/verify` behavior:

```text
verify token -> create access_event -> initiate unlock flow
```

### Payment Flow

V1 uses Mock Payment only.

Flow:

```text
PENDING_APPROVAL -> APPROVED -> PAYMENT_PENDING
payment success -> CONFIRMED
payment failed -> payment.status = FAILED, booking remains PAYMENT_PENDING
unpaid timeout -> EXPIRED
```

Payment idempotency:

- `payments.idempotency_key` for mock session creation.
- `webhook_events` uniqueness for mock confirmation events.

### IoT Flow

V1 uses Mock IoT only:

- Smart door lock.
- Air quality sensor.
- Electricity meter.

MQTT/EMQX is future only. The V1 mock must still persist access events and telemetry into PostgreSQL.

### Cancellation Flow

Cancellation is allowed only when:

```text
status IN (PENDING_APPROVAL, APPROVED, PAYMENT_PENDING, CONFIRMED)
AND now() <= start_time - interval '12 hours'
AND checked_in_at IS NULL
```

Failure code:

```text
CANCELLATION_NOT_ALLOWED
```

### Telemetry Access Policy

```text
USER      -> denied
OWNER     -> own office telemetry
OPERATOR  -> assigned office telemetry
ADMIN     -> full access
```

---

## 3. Final Backend Module Breakdown

### Module 1 - Foundation

Purpose:

Establish project structure, Supabase configuration, secrets, environments, request ID, private schema, and implementation conventions.

Dependencies:

- Supabase project.
- Supabase CLI.
- Environment strategy: `LOCAL`, `DEMO`, `PRODUCTION`.

Tables:

- None yet.

RPCs:

- None.

Edge Functions:

- None.

Triggers:

- None.

Policies:

- None.

Tests:

- Verify Supabase local/project connectivity.
- Verify secrets are available to Edge Functions.
- Verify request ID generation format.

Risks:

- Secrets accidentally committed.
- Service role exposed to frontend.
- Environment drift.

Completion Criteria:

- Required secrets configured.
- Migration folder structure created.
- Request ID format frozen.
- Private schema migration ready.

---

### Module 2 - Core Database Schema

Purpose:

Create all base enums, tables, relationships, soft delete fields, timestamp fields, and core indexes.

Dependencies:

- Module 1.
- Extensions and schemas migration.

Tables:

- `profiles`
- `offices`
- `operator_offices`
- `office_availability_rules`
- `bookings`
- `booking_status_transitions`
- `payments`
- `webhook_events`
- `qr_tokens`
- `iot_devices`
- `access_events`
- `telemetry_events`
- `device_state_snapshots`
- `jobs`
- `audit_logs`
- `outbox_events`
- `notifications`
- `incidents`

RPCs:

- None.

Edge Functions:

- None.

Triggers:

- updated_at trigger if used.

Policies:

- None yet.

Tests:

- Migration applies from empty database.
- All tables exist.
- FK relationships valid.
- UTC timestamp columns use `timestamptz`.

Risks:

- Enum rename pain.
- FK dependency order.
- Missing cancellation metadata.
- Missing QR encrypted token field.

Completion Criteria:

- Schema migrates cleanly.
- All frozen fields exist.
- No direct hard-delete implementation path is needed.

---

### Module 3 - Booking State Machine

Purpose:

Implement canonical booking states, transition matrix, and transition enforcement trigger.

Dependencies:

- Module 2.
- Private helpers if trigger depends on context.

Tables:

- `booking_status_transitions`
- `bookings`

RPCs:

- None yet.

Edge Functions:

- None.

Triggers:

- `validate_booking_transition`.

Policies:

- None yet.

Tests:

- Valid transitions pass.
- Invalid transitions fail.
- `APPROVED -> PAYMENT_PENDING` allowed.
- `CHECKED_OUT -> COMPLETED` allowed.
- `CHECKED_IN -> CANCELLED` rejected.

Risks:

- State machine too permissive.
- State machine blocks legitimate system jobs.

Completion Criteria:

- Transition table seeded.
- Trigger blocks illegal transitions.
- State tests pass.

---

### Module 4 - Booking System

Purpose:

Implement booking creation, approval, rejection, cancellation, overlap prevention, duration rules, and cancellation cutoff.

Dependencies:

- Modules 2 and 3.
- Private helpers.
- Audit system.

Tables:

- `bookings`
- `offices`
- `operator_offices`
- `jobs`
- `payments`

RPCs:

- `create_booking_v1`
- `approve_booking_v1`
- `reject_booking_v1`
- `cancel_booking_v1`

Edge Functions:

- `POST /bookings`
- `POST /bookings/:id/approve`
- `POST /bookings/:id/reject`
- `POST /bookings/:id/cancel`

Triggers:

- booking transition trigger.
- audit trigger.

Policies:

- bookings RLS.
- offices RLS.

Tests:

- Booking minimum 30 minutes.
- Booking maximum 30 days.
- Overlap conflict.
- Back-to-back bookings allowed.
- Cancel before cutoff allowed.
- Cancel within 12 hours rejected.
- Cancel after check-in rejected.

Risks:

- Race condition if overlap prevention is not database enforced.
- Cancellation cutoff implemented only in Edge Function.

Completion Criteria:

- Booking lifecycle works through RPC only.
- Exclusion constraint blocks overlaps.
- Approval creates payment and transitions to `PAYMENT_PENDING`.

---

### Module 5 - Payment System

Purpose:

Implement mock payment session, mock confirmation, payment idempotency, and payment lifecycle.

Dependencies:

- Module 4.
- `payments`
- `webhook_events`

Tables:

- `payments`
- `webhook_events`
- `bookings`
- `jobs`

RPCs:

- `create_mock_payment_session_v1`
- `confirm_mock_payment_v1`

Edge Functions:

- `POST /payments/mock/create-session`
- `POST /payments/mock/confirm`

Triggers:

- audit trigger.

Policies:

- payments RLS.
- webhook_events service-only access.

Tests:

- Duplicate session request returns same payment.
- Successful mock payment confirms booking.
- Failed payment leaves booking in `PAYMENT_PENDING`.
- Duplicate confirm event does not reapply transition.
- Already-final payment rejects new confirm.

Risks:

- Duplicate payments.
- Booking incorrectly marked failed.

Completion Criteria:

- Mock payment is retry-safe.
- Payment success produces `CONFIRMED`.
- Payment failure does not kill booking.

---

### Module 6 - QR Access System

Purpose:

Implement QR generation, encrypted QR storage, hash verification, reusable token behavior, and QR validity window.

Dependencies:

- Module 5.
- Secrets configured.

Tables:

- `qr_tokens`
- `bookings`

RPCs:

- `generate_qr_token_v1`
- `verify_qr_and_create_access_event_v1`

Edge Functions:

- `POST /qr/generate`
- `POST /qr/verify`

Triggers:

- audit trigger.

Policies:

- qr_tokens private/no direct user select.

Tests:

- Generate QR only for confirmed booking.
- Return existing active token.
- Reject expired token.
- Reject revoked token.
- Reject outside QR window.
- Verify uses token hash.

Risks:

- Token leakage.
- Inability to return existing token if encryption not implemented.

Completion Criteria:

- Encrypted token storage works.
- Token hash lookup works.
- QR remains reusable within window.

---

### Module 7 - Access Events + Mock IoT

Purpose:

Implement access events, app unlock, manual override, mock door unlock, and access lifecycle.

Dependencies:

- Module 6.
- IoT device schema.

Tables:

- `access_events`
- `iot_devices`
- `bookings`
- `incidents`

RPCs:

- `mock_unlock_door_v1`

Edge Functions:

- `POST /iot/mock/door/unlock`

Triggers:

- audit trigger.

Policies:

- access_events RLS.
- iot_devices RLS.

Tests:

- QR scan creates `access_event`.
- App unlock creates `access_event` with `APP_UNLOCK`.
- Manual override requires reason.
- Failed unlock creates correct status.
- Door unlock after valid QR can check in booking.

Risks:

- Access method not tracked.
- Manual override not audited.

Completion Criteria:

- All unlock methods persist access event.
- Access method is always stored.
- Mock unlock updates state consistently.

---

### Module 8 - Jobs + pg_cron

Purpose:

Implement durable background jobs, dispatcher, retries, booking expiry, no-show, overstay, complete booking, payment reconciliation, device offline scan, and notifications.

Dependencies:

- Modules 4-7.

Tables:

- `jobs`
- `bookings`
- `payments`
- `iot_devices`
- `notifications`

RPCs:

- `dispatch_due_jobs`
- job handler functions as needed.

Edge Functions:

- None required for pg_cron.

Triggers:

- audit for business transitions.

Policies:

- jobs service/internal only.

Tests:

- Expire unpaid booking.
- Complete checked-out booking.
- Mark no-show.
- Mark overstay.
- Retry failed job.
- Dead-letter after max attempts.

Risks:

- Non-idempotent jobs.
- Cron running without actor context.
- Duplicate scheduler execution.

Completion Criteria:

- `pg_cron` schedule installed.
- Jobs are locked with `FOR UPDATE SKIP LOCKED`.
- Job outcomes are auditable.

---

### Module 9 - Telemetry

Purpose:

Implement mock air quality and electricity telemetry generation, snapshots, and access restrictions.

Dependencies:

- Module 7.

Tables:

- `telemetry_events`
- `device_state_snapshots`
- `iot_devices`

RPCs:

- `mock_generate_telemetry_v1`

Edge Functions:

- `POST /iot/mock/telemetry`
- `GET /telemetry/...` if needed by frontend.

Triggers:

- optional snapshot update trigger or RPC update.

Policies:

- USER denied.
- OWNER own office.
- OPERATOR assigned office.
- ADMIN all.

Tests:

- USER cannot access telemetry.
- OWNER can access own office telemetry.
- OPERATOR can access assigned office telemetry.
- Mock telemetry creates event and snapshot.

Risks:

- Telemetry accidentally exposed to USER.

Completion Criteria:

- Telemetry access policy passes RLS tests.
- Mock telemetry appears in UI/realtime safely.

---

### Module 10 - Notifications

Purpose:

Implement system notifications for booking and operational events.

Dependencies:

- Modules 4-9.

Tables:

- `notifications`

RPCs:

- `mark_notification_read_v1`
- notification creation may be internal.

Edge Functions:

- `GET /notifications`
- `POST /notifications/:id/read`

Triggers:

- audit optional.

Policies:

- users read/update own notifications only.
- system/RPC inserts.

Tests:

- User sees own notifications.
- User cannot see others.
- Mark read works.
- System can create notification.

Risks:

- Notification spam.
- User updates notification owner.

Completion Criteria:

- Core notification types work.
- Read/unread lifecycle works.

---

### Module 11 - Realtime

Purpose:

Configure Supabase Realtime safely for UI updates.

Dependencies:

- RLS policies.

Tables:

- Safe realtime tables only.

RPCs:

- None.

Edge Functions:

- None.

Triggers:

- None unless using outbox.

Policies:

- Realtime must respect RLS.

Tests:

- User receives own booking updates.
- Owner receives own office updates.
- USER does not receive telemetry.
- Sensitive tables are not enabled.

Risks:

- Realtime leaks.

Completion Criteria:

- Sensitive tables excluded.
- Realtime tests pass with real user JWTs.

---

### Module 12 - Security Hardening

Purpose:

Enforce secrets, trusted actor context, service role boundaries, SECURITY DEFINER hardening, RLS verification, and QR safety.

Dependencies:

- All prior modules.

Tables:

- All sensitive tables.

RPCs:

- All SECURITY DEFINER RPCs.

Edge Functions:

- All endpoints.

Triggers:

- audit and state triggers.

Policies:

- all RLS policies.

Tests:

- actor spoofing rejected.
- direct sensitive update denied.
- service role not exposed.
- qr_tokens inaccessible.
- telemetry denied to USER.

Risks:

- service role misuse.
- unsafe search_path.
- actor spoofing.

Completion Criteria:

- Security checklist passes.
- RLS tests run as real users.

---

### Module 13 - Demo/Seed Environment

Purpose:

Create demo-ready data for thesis presentation.

Dependencies:

- Modules 1-12.

Tables:

- all relevant domain tables.

RPCs:

- may use RPCs to seed realistic lifecycle data.

Edge Functions:

- none required.

Triggers:

- active.

Policies:

- active.

Tests:

- Seed data does not violate overlap constraint.
- Demo users/roles work.
- Demo bookings cover key flows.

Risks:

- Seed data bypasses constraints and gives false confidence.

Completion Criteria:

- Demo scenario works end-to-end.
- No RLS disabled in demo.

---

### Module 14 - Testing & Verification

Purpose:

Run complete validation across database, RPC, RLS, API, jobs, realtime, and edge cases.

Dependencies:

- all modules.

Tables:

- all.

RPCs:

- all.

Edge Functions:

- all.

Triggers:

- all.

Policies:

- all.

Tests:

- Complete test roadmap in Section 8.

Risks:

- testing only happy path.
- testing only service role.

Completion Criteria:

- All required pass criteria met.
- Defense demo script validated.
- No blocker remains.

---

## 4. Final Migration Order (Critical)

### 1. Extensions + Schemas

Why:

Required before using GIST equality, UUID generation, cron scheduling, and private helper schema.

Dependencies:

- Supabase project supports extensions.

Common mistakes:

- Creating exclusion constraint before `btree_gist`.
- Using `gen_random_uuid()` before `pgcrypto`.
- Creating helper functions before `private` schema.

Failure risks:

- migration fails immediately.

Required:

```text
btree_gist
pgcrypto
pg_cron
private schema
```

---

### 2. Enums

Why:

Tables depend on enums.

Dependencies:

- Extensions migration complete.

Common mistakes:

- Changing enum values after table creation.
- Adding unused states.

Failure risks:

- painful migrations later.

---

### 3. Tables

Why:

All relationships and core data structures are established.

Dependencies:

- enums.

Common mistakes:

- missing `deleted_at`.
- using `timestamp` instead of `timestamptz`.
- missing `encrypted_token`.
- missing idempotency fields.

Failure risks:

- later refactor of migrations.

---

### 4. Indexes + Exclusion Constraints

Why:

Performance and booking overlap prevention.

Dependencies:

- tables.
- `btree_gist`.

Common mistakes:

- including `CHECKED_OUT` in blocking states.
- using closed ranges instead of half-open `[)`.

Failure risks:

- incorrect availability behavior.

---

### 5. Private Helper Functions

Why:

Audit, triggers, RLS, and RPCs may depend on trusted helpers.

Dependencies:

- private schema.
- relevant tables.

Common mistakes:

- creating triggers before helpers.
- unsafe `SECURITY DEFINER`.

Failure risks:

- migration dependency failure or security gaps.

---

### 6. Audit System

Why:

State changes must be traceable.

Dependencies:

- audit table.
- private helpers.

Common mistakes:

- audit trigger assumes every table has same primary key shape.
- audit logs can be updated/deleted.

Failure risks:

- missing accountability.

---

### 7. Triggers + Transition Enforcement

Why:

Booking state machine must be enforced at database level.

Dependencies:

- transition table.
- helper functions.
- audit system.

Common mistakes:

- trigger blocks system job transitions.
- invalid transition matrix.

Failure risks:

- stuck bookings.

---

### 8. RLS Helper Functions

Why:

Policies need reusable, safe ownership/assignment checks.

Dependencies:

- private schema.
- base tables.

Common mistakes:

- unsafe recursion.
- missing `SECURITY DEFINER`.

Failure risks:

- policy recursion or privilege leak.

---

### 9. RLS Policies

Why:

Authorization enforcement.

Dependencies:

- helper functions.

Common mistakes:

- testing with service role only.
- enabling direct updates on sensitive tables.

Failure risks:

- privilege escalation.

---

### 10. RPCs

Why:

Sensitive workflows are implemented.

Dependencies:

- tables.
- triggers.
- RLS helpers.
- audit context.

Common mistakes:

- trusting actor ID from client.
- missing transaction boundaries.

Failure risks:

- security drift.

---

### 11. pg_cron/jobs

Why:

Background lifecycle operations.

Dependencies:

- jobs table.
- job handler RPCs.
- pg_cron.

Common mistakes:

- non-idempotent jobs.
- no `FOR UPDATE SKIP LOCKED`.

Failure risks:

- duplicate job execution.

---

### 12. Edge Functions

Why:

API layer.

Dependencies:

- RPCs.
- secrets.
- RLS.

Common mistakes:

- using service role without manual authorization.
- DTO validation only on frontend.

Failure risks:

- security gaps.

---

### 13. Realtime

Why:

UI updates.

Dependencies:

- RLS policies.
- safe table publication decisions.

Common mistakes:

- enabling sensitive tables.

Failure risks:

- data leak.

---

### 14. Seed Demo Data

Why:

Thesis demo setup.

Dependencies:

- constraints and policies.

Common mistakes:

- seed data violates overlap constraint.
- seed data bypasses realistic flows.

Failure risks:

- demo breaks.

---

### 15. Tests

Why:

Prove correctness before defense.

Dependencies:

- full implementation.

Common mistakes:

- testing only happy path.
- testing only service role.

Failure risks:

- hidden security failures.

---

## 5. Database Blueprint

### Enums

Checklist:

- `user_role`
- `booking_status`
- `payment_status`
- `payment_gateway`
- `office_status`
- `device_type`
- `device_status`
- `access_event_status`
- `access_method`
- `incident_type`
- `incident_status`
- `notification_type`
- `actor_type`

Definition of Done:

- All enums created.
- No unused V1 enum values except approved future-safe values.
- State machine values match booking transitions.

### Tables

Checklist:

- All required tables created.
- All domain tables include `created_at`, `updated_at`, `deleted_at` where relevant.
- All business timestamps use `timestamptz`.
- `qr_tokens` includes `token_hash` and `encrypted_token`.
- `payments` includes idempotency fields.
- `bookings` includes cancellation metadata.

Definition of Done:

- Schema migrates cleanly from empty DB.
- FK relationships enforce domain ownership.

### Indexes

Checklist:

- FK indexes.
- due jobs index.
- payment idempotency index.
- webhook unique index.
- QR hash unique index.
- booking date/status indexes.

Definition of Done:

- Required queries are index-supported.
- Unique constraints enforce idempotency.

### Constraints

Checklist:

- booking `start_time < end_time`.
- booking duration enforced in RPC/database.
- payment amounts non-negative.
- valid office/device ownership FKs.

Definition of Done:

- Invalid rows rejected by database or RPC.

### Exclusion Constraint

Blocking states:

```text
PENDING_APPROVAL
APPROVED
PAYMENT_PENDING
CONFIRMED
CHECKED_IN
OVERSTAY
```

Definition of Done:

- Overlapping active bookings fail.
- Back-to-back bookings pass.
- `CHECKED_OUT` does not block.

### Triggers

Checklist:

- booking transition trigger.
- audit trigger.
- updated_at trigger if used.
- hard delete prevention or revoked delete privileges.

Definition of Done:

- Invalid status update fails.
- Audit row created for critical changes.

### Audit

Checklist:

- `audit_logs` append-only.
- actor context stored.
- request ID stored.
- before/after snapshots stored.

Definition of Done:

- No update/delete allowed on audit logs.
- Jobs record actor type `JOB`.

### Helper Functions

Checklist:

- trusted actor helpers.
- role helpers.
- ownership helpers.
- operator assignment helpers.
- booking/device access helpers.

Definition of Done:

- `SECURITY DEFINER` functions have safe `search_path`.
- No unsafe recursion.

### RLS

Checklist:

- RLS enabled.
- direct sensitive writes blocked.
- telemetry denied to USER.
- qr_tokens private.

Definition of Done:

- RLS tests pass as real users.

### RPCs

Checklist:

- booking RPCs.
- payment RPCs.
- QR RPCs.
- mock IoT RPCs.
- job dispatcher RPC.
- notification RPCs if needed.

Definition of Done:

- Sensitive workflows do not require direct frontend table updates.

---

## 6. Security Blueprint

| Area | Risk | Level | Required Control |
|---|---|---:|---|
| Service role misuse | RLS bypass | HIGH | only Edge Functions, manual auth checks |
| Actor spoofing | privilege escalation | HIGH | derive actor from verified JWT/context |
| SECURITY DEFINER | search_path attack | HIGH | set `search_path = public, private` |
| QR token leakage | unauthorized access | HIGH | encrypted token + hash verification |
| RLS gaps | data leak | HIGH | policy tests as real users |
| Realtime exposure | sensitive table leak | HIGH | exclude `qr_tokens`, `audit_logs`, `webhook_events` |
| Mock endpoints | fake actions | MEDIUM | auth + role checks |
| Payment duplication | duplicate confirmations | MEDIUM | idempotency key + webhook unique event |
| Telemetry leak | user sees restricted data | MEDIUM | RLS denial for USER |
| Job duplication | repeated transitions | MEDIUM | idempotent jobs + row locks |

Security checklist:

- JWT verified in every protected Edge Function.
- Actor identity never accepted from client body.
- Trusted PostgreSQL context set per request.
- Service role key never sent to frontend.
- `qr_tokens` not directly selectable.
- QR encryption key validates as 32 bytes from Base64.
- All SECURITY DEFINER functions include safe search path.
- RLS enabled in LOCAL, DEMO, and PRODUCTION.
- Realtime enabled only for safe tables.
- Request IDs propagated to audit/jobs/errors.

---

## 7. API Implementation Plan

### `POST /bookings`

Purpose:

Create a booking in `PENDING_APPROVAL`.

Request DTO:

```json
{
  "officeId": "uuid",
  "startTime": "ISO-8601 UTC timestamp",
  "endTime": "ISO-8601 UTC timestamp",
  "idempotencyKey": "uuid"
}
```

Validation:

- UUIDs valid.
- timestamps valid and timezone-aware.
- start < end.
- duration >= 30 minutes.
- duration <= 30 days.

RPC:

- `create_booking_v1`

Auth:

- authenticated user.

Authorization:

- actor creates own booking.

Error codes:

- `INVALID_TIME_RANGE`
- `BOOKING_TOO_SHORT`
- `BOOKING_TOO_LONG`
- `OFFICE_NOT_ACTIVE`
- `BOOKING_OVERLAP`
- `IDEMPOTENCY_CONFLICT`

Tests:

- valid booking.
- overlap.
- too short.
- too long.
- duplicate idempotency.

---

### `POST /bookings/:id/cancel`

Purpose:

Cancel before 12-hour cutoff and before check-in.

Request DTO:

```json
{
  "reason": "text"
}
```

Validation:

- reason required.

RPC:

- `cancel_booking_v1`

Auth:

- user/owner/operator/admin.

Authorization:

- user owns booking or scoped owner/operator/admin.

Error codes:

- `FORBIDDEN`
- `REASON_REQUIRED`
- `CANCELLATION_NOT_ALLOWED`
- `INVALID_STATE`

Tests:

- cancel 13 hours before.
- reject 5 hours before.
- reject checked-in.

---

### `POST /qr/generate`

Purpose:

Return active QR token or create one.

DTO:

```json
{
  "bookingId": "uuid"
}
```

RPC:

- `generate_qr_token_v1`

Auth:

- booking owner.

Error codes:

- `BOOKING_NOT_CONFIRMED`
- `FORBIDDEN`

Tests:

- confirmed booking.
- non-confirmed rejected.
- repeated call returns existing token.

---

### `POST /qr/verify`

Purpose:

Verify QR, create access event, initiate mock unlock.

DTO:

```json
{
  "token": "signed-token",
  "deviceId": "uuid"
}
```

RPC:

- `verify_qr_and_create_access_event_v1`
- mock unlock path.

Auth:

- kiosk/device route must be protected by trusted credential or user context depending UI flow.

Error codes:

- `INVALID_TOKEN`
- `TOKEN_EXPIRED`
- `QR_REVOKED`
- `OUTSIDE_QR_WINDOW`
- `BOOKING_NOT_CONFIRMED`
- `DEVICE_NOT_AVAILABLE`

Tests:

- valid QR.
- expired QR.
- outside window.
- wrong device.

---

### `/payments/mock/*`

Endpoints:

- `POST /payments/mock/create-session`
- `POST /payments/mock/confirm`

Purpose:

Demo payment lifecycle.

DTO create:

```json
{
  "bookingId": "uuid",
  "idempotencyKey": "uuid"
}
```

DTO confirm:

```json
{
  "paymentId": "uuid",
  "result": "SUCCESS",
  "idempotencyKey": "uuid"
}
```

RPC:

- `create_mock_payment_session_v1`
- `confirm_mock_payment_v1`

Tests:

- success.
- failed payment.
- duplicate confirm.
- already final.

---

### `/iot/mock/*`

Endpoints:

- `POST /iot/mock/door/unlock`
- `POST /iot/mock/telemetry`

Purpose:

Mock door and telemetry.

Auth:

- user for own booking unlock.
- owner/operator/admin for telemetry generation.

Tests:

- app unlock.
- manual override.
- telemetry generation.
- USER telemetry denial.

---

### `/telemetry/*`

Purpose:

Read telemetry for owner/operator/admin scopes.

Auth:

- authenticated.

Authorization:

- USER denied.
- OWNER own office.
- OPERATOR assigned office.
- ADMIN all.

Tests:

- RLS denial for USER.
- scoped access.

---

### `/notifications/*`

Purpose:

Read and mark notifications.

Auth:

- authenticated.

Tests:

- own notifications only.
- mark read.

---

## 8. Testing Strategy

### Unit Tests

Pass criteria:

- validation helpers pass.
- token encryption/decryption works.
- request ID format works.

### RPC Tests

Pass criteria:

- each RPC succeeds on valid input.
- each RPC rejects invalid state.
- transactions rollback on failure.

### RLS Tests

Pass criteria:

- USER cannot read telemetry.
- USER cannot read other bookings.
- OPERATOR only assigned offices.
- OWNER only own offices.
- ADMIN all.

### Authorization Tests

Pass criteria:

- actor spoofing fails.
- service role paths enforce manual authorization.

### State-Machine Tests

Pass criteria:

- valid transitions allowed.
- invalid transitions rejected.
- APPROVED transient flow works.

### Overlap Tests

Pass criteria:

- overlapping active bookings rejected.
- back-to-back bookings allowed.
- CHECKED_OUT non-blocking.

### QR Tests

Pass criteria:

- active token returned.
- hash verification works.
- encrypted token is not plaintext.
- revoked/expired tokens fail.

### Payment Tests

Pass criteria:

- idempotent session.
- idempotent confirmation.
- failed payment leaves booking pending.
- success confirms booking.

### Cron/Job Tests

Pass criteria:

- expire unpaid.
- no-show.
- overstay.
- complete checked-out.
- retry/dead-letter.

### Realtime Tests

Pass criteria:

- expected safe events received.
- sensitive tables not exposed.

### Failure/Retry Tests

Pass criteria:

- duplicate requests safe.
- job retry safe.
- partial failures do not corrupt state.

### Edge-Case Tests

Pass criteria:

- 30-minute booking accepted.
- 29-minute booking rejected.
- 30-day booking accepted.
- >30-day booking rejected.
- cancellation exactly at cutoff behavior defined and tested.

---

## 9. Risk Register

| Risk | Probability | Impact | Mitigation | Prevention |
|---|---:|---:|---|---|
| Migration order failure | Medium | High | use frozen order | helper functions before triggers/RLS |
| Enum changes later | Medium | Medium | freeze enums | review before first migration |
| Exclusion constraint failure | Medium | High | test seed data | add constraint before demo seed |
| RLS recursion | Medium | High | private SECURITY DEFINER helpers | test policies |
| Service role misuse | Medium | High | Edge Function auth checks | never expose key |
| QR token leakage | Low | High | AES-GCM encrypted token | no direct qr_tokens select |
| Payment duplication | Medium | Medium | idempotency key/event uniqueness | retry tests |
| Cron race conditions | Medium | Medium | row locks and idempotent handlers | `FOR UPDATE SKIP LOCKED` |
| Realtime leaks | Medium | High | exclude sensitive tables | realtime tests |
| Mock IoT inconsistency | Medium | Medium | persist mock events | test state updates |

---

## 10. Final Coding Roadmap

### Week 1 - Foundation + Core Schema

Coding goals:

- Supabase project setup.
- migrations for extensions/schemas/enums/tables.
- basic indexes.

Deliverables:

- migrations 0001-0003.
- secrets documented.
- schema applies cleanly.

Tests required:

- migration from empty DB.
- table/enum existence.

Stop conditions:

- no coding beyond schema until migrations are repeatable.

---

### Week 2 - Constraints + Helpers + Audit + State Machine

Coding goals:

- exclusion constraint.
- private helpers.
- audit system.
- state-machine trigger.

Deliverables:

- transition matrix seeded.
- audit trigger.
- overlap constraint.

Tests required:

- valid/invalid transitions.
- overlap tests.
- audit tests.

Stop conditions:

- booking RPCs cannot start until constraints and triggers pass.

---

### Week 3 - RLS + Booking RPCs + Booking APIs

Coding goals:

- RLS policies.
- booking RPCs.
- booking Edge Functions.

Deliverables:

- create/approve/reject/cancel flows.

Tests required:

- RLS tests.
- booking duration tests.
- cancellation cutoff tests.

Stop conditions:

- payment cannot start until `PAYMENT_PENDING` flow works.

---

### Week 4 - Mock Payment + QR System

Coding goals:

- mock payment RPCs/functions.
- QR encryption/generation/verification.

Deliverables:

- payment success/failure.
- QR return-existing policy.
- encrypted token storage.

Tests required:

- payment idempotency.
- QR window.
- QR hash verification.

Stop conditions:

- IoT unlock cannot start until QR verify is stable.

---

### Week 5 - Access Events + Mock IoT + Jobs

Coding goals:

- mock unlock.
- access events.
- telemetry generation.
- jobs dispatcher.
- pg_cron schedules.

Deliverables:

- door flow.
- telemetry flow.
- expire/no-show/overstay/complete jobs.

Tests required:

- job retries.
- access lifecycle.
- telemetry authorization.

Stop conditions:

- realtime/demo cannot start until jobs are safe.

---

### Week 6 - Realtime + Notifications + Demo + Full Verification

Coding goals:

- safe realtime configuration.
- notifications.
- demo seed data.
- end-to-end verification.

Deliverables:

- demo-ready dataset.
- thesis demo script.
- final test report.

Tests required:

- full E2E.
- RLS/realtime leak tests.
- demo rehearsal.

Stop conditions:

- defense demo cannot be considered ready until all critical tests pass.

---

## 11. Final Go/No-Go Checklist

Before coding:

- [ ] Frozen contracts respected.
- [ ] Migration order accepted.
- [ ] Required extensions confirmed.
- [ ] Secrets named and stored.
- [ ] Enums frozen.
- [ ] QR encryption strategy frozen.
- [ ] Trusted actor context frozen.
- [ ] RLS strategy frozen.
- [ ] RPC security strategy frozen.
- [ ] Booking overlap logic frozen.
- [ ] Cancellation policy frozen.
- [ ] Payment idempotency frozen.
- [ ] CHECKED_OUT non-blocking frozen.
- [ ] Test roadmap accepted.

Before demo:

- [ ] No direct sensitive table update from frontend.
- [ ] No RLS disabled in DEMO.
- [ ] Service role only in Edge Functions.
- [ ] qr_tokens not exposed.
- [ ] audit_logs not exposed.
- [ ] webhook_events not exposed.
- [ ] all critical tests pass.

---

## 12. Final Verdict

Implementation readiness score:

```text
10 / 10
```

Final verdict:

```text
SAFE TO START IMPLEMENTATION
```

Reason:

The architecture is frozen, implementation contracts are complete, final blockers have been resolved, migration order is safe, and module execution can begin without architectural drift.

