<div dir="rtl" align="right">

# FlexiSpace - Final Backend Contract Freeze

Project: FlexiSpace - Smart Office Booking Platform with IoT Integration  
Phase: Final contract freeze before backend coding  
Architecture: Supabase-only backend  
Status: Frozen for implementation  

---

## 0. Architecture Boundaries

هذه الوثيقة لا تعيد تصميم المعمارية.

القرارات النهائية التي لا تتغير:

- الباكند بالكامل على Supabase.
- PostgreSQL هو مصدر الحقيقة الوحيد.
- Supabase Auth للمصادقة.
- Supabase Edge Functions هي طبقة API.
- PostgreSQL RPC للعمليات الحساسة.
- PostgreSQL Triggers لفرض state machine و audit logging.
- PostgreSQL Constraints لمنع تداخل الحجوزات.
- Supabase Realtime لتحديث الواجهة.
- `pg_cron + jobs table` بدل Redis/BullMQ.
- Mock Payment في V1/demo.
- Mock IoT في V1/demo.
- MQTT/EMQX امتداد مستقبلي فقط.
- Soft delete فقط.
- كل timestamps تكون UTC.

---

# 1. Booking Duration Rules

## 1.1 Frozen Rule

مدة الحجز النهائية:

| Rule | Value |
|---|---:|
| Minimum booking duration | 30 minutes |
| Maximum booking duration | 30 days |

يجب فرض هذه القاعدة داخل RPC/database، وليس فقط في الواجهة.

---

## 1.2 Canonical Validation Logic

</div>

```text
duration = end_time - start_time

if start_time >= end_time:
  fail INVALID_TIME_RANGE

if duration < 30 minutes:
  fail BOOKING_TOO_SHORT

if duration > 30 days:
  fail BOOKING_TOO_LONG
```

<div dir="rtl" align="right">

## 1.3 RPC Enforcement

يجب تطبيق هذه القاعدة داخل:

</div>

```text
create_booking_v1
```

<div dir="rtl" align="right">

ولا يكفي تطبيقها في Edge Function فقط.

---

## 1.4 DTO Validation Requirements

Endpoint:

</div>

```text
POST /bookings
```

<div dir="rtl" align="right">

Request DTO:

</div>

```json
{
  "officeId": "uuid",
  "startTime": "2026-05-22T10:00:00.000Z",
  "endTime": "2026-05-22T12:00:00.000Z",
  "idempotencyKey": "uuid"
}
```

<div dir="rtl" align="right">

DTO rules:

- `officeId` must be UUID.
- `startTime` must be ISO-8601 timestamp.
- `endTime` must be ISO-8601 timestamp.
- timestamps must include timezone or be normalized to UTC.
- `startTime < endTime`.
- duration must be at least 30 minutes.
- duration must not exceed 30 days.
- `idempotencyKey` must be UUID.

Failure codes:

</div>

```text
INVALID_TIME_RANGE
BOOKING_TOO_SHORT
BOOKING_TOO_LONG
```

<div dir="rtl" align="right">

---

# 2. Cancellation Policy

## 2.1 Frozen Rule

إلغاء الحجز مسموح فقط قبل أن يبدأ الاستخدام الفعلي للمكتب.

بمجرد وصول الحجز إلى:

</div>

```text
CHECKED_IN
```

<div dir="rtl" align="right">

لا يسمح بالإلغاء.

Reason:

بعد `CHECKED_IN`، المستخدم بدأ استخدام المكتب فعليًا.

---

## 2.2 Allowed Cancellation Source States

</div>

```text
PENDING_APPROVAL -> CANCELLED
APPROVED -> CANCELLED
PAYMENT_PENDING -> CANCELLED
CONFIRMED -> CANCELLED
```

<div dir="rtl" align="right">

---

## 2.3 Forbidden Cancellation Source States

</div>

```text
CHECKED_IN
CHECKED_OUT
COMPLETED
NO_SHOW
OVERSTAY
EXPIRED
REFUNDED
REJECTED
CANCELLED
```

<div dir="rtl" align="right">

---

## 2.4 RPC Enforcement

RPC:

</div>

```text
cancel_booking_v1
```

<div dir="rtl" align="right">

must:

- verify actor permission.
- verify booking is in cancellable state.
- reject cancellation after check-in.
- require cancellation reason.
- revoke active QR tokens.
- cancel pending jobs related to the booking.
- emit realtime event.
- write audit log.

Required failure code:

</div>

```text
CANCELLATION_NOT_ALLOWED
```

<div dir="rtl" align="right">

---

# 3. QR Token Policy

## 3.1 Frozen Rule

إذا كان يوجد QR token فعال لنفس الحجز:

</div>

```text
RETURN EXISTING ACTIVE TOKEN
```

<div dir="rtl" align="right">

ولا يتم تدوير token في V1.

Reason:

حتى لا ينكسر الدخول إذا قام التطبيق بعمل refresh أو reconnect.

---

## 3.2 Active Token Definition

QR token يعتبر active إذا:

- مرتبط بنفس booking.
- `revoked_at IS NULL`.
- `expires_at > now()`.
- booking status is `CONFIRMED` أو `CHECKED_IN` حسب سياق الوصول.
- current time inside QR access window.

---

## 3.3 QR Access Window

القيم النهائية:

</div>

```text
valid_from  = booking.start_time - 10 minutes
valid_until = booking.end_time + 5 minutes
```

<div dir="rtl" align="right">

---

## 3.4 `generate_qr_token_v1` Frozen Contract

Purpose:

- توليد QR token لحجز مؤكد.
- إعادة token فعال موجود بدل تدويره.

Input:

</div>

```json
{
  "p_user_id": "uuid",
  "p_booking_id": "uuid"
}
```

<div dir="rtl" align="right">

Output:

</div>

```json
{
  "booking_id": "uuid",
  "token": "signed-token",
  "jti": "uuid",
  "valid_from": "timestamp",
  "valid_until": "timestamp",
  "returned_existing": true
}
```

<div dir="rtl" align="right">

Rules:

- Booking must be `CONFIRMED`.
- User must own booking, or admin support path must be explicit.
- If active token exists, return it.
- If no active token exists, create one.
- Store token hash, not raw token.
- Never rotate active token in V1.

Failure codes:

</div>

```text
FORBIDDEN
BOOKING_NOT_FOUND
BOOKING_NOT_CONFIRMED
TOKEN_EXPIRED
QR_REVOKED
```

<div dir="rtl" align="right">

---

# 4. APPROVED State Behavior

## 4.1 Frozen Rule

`APPROVED` is a transient state.

Canonical workflow:

</div>

```text
PENDING_APPROVAL
-> APPROVED
-> PAYMENT_PENDING
```

<div dir="rtl" align="right">

`APPROVED` must not persist for long.

---

## 4.2 `approve_booking_v1` Behavior

Inside the same database transaction:

1. Verify actor authorization.
2. Transition booking:

</div>

```text
PENDING_APPROVAL -> APPROVED
```

<div dir="rtl" align="right">

3. Record approval audit event.
4. Create payment row with `PENDING`.
5. Transition booking:

</div>

```text
APPROVED -> PAYMENT_PENDING
```

<div dir="rtl" align="right">

6. Insert expiry job.
7. Emit realtime events.

Output status must be:

</div>

```text
PAYMENT_PENDING
```

<div dir="rtl" align="right">

not `APPROVED`.

---

## 4.3 Realtime Events

The RPC should produce:

</div>

```text
booking.approved
payment.required
```

<div dir="rtl" align="right">

No UI should wait on a long-lived `APPROVED` state.

---

# 5. CHECKED_OUT Behavior

## 5.1 Frozen Rule

`CHECKED_OUT` is non-blocking for office availability.

After checkout:

</div>

```text
CHECKED_OUT -> COMPLETED
```

<div dir="rtl" align="right">

should happen quickly by system job or immediate RPC flow.

---

## 5.2 Overlap Blocking Rules

Blocking states:

</div>

```text
PENDING_APPROVAL
APPROVED
PAYMENT_PENDING
CONFIRMED
CHECKED_IN
OVERSTAY
```

<div dir="rtl" align="right">

Non-blocking states:

</div>

```text
CHECKED_OUT
COMPLETED
REJECTED
CANCELLED
EXPIRED
NO_SHOW
REFUNDED
```

<div dir="rtl" align="right">

Important:

`CHECKED_OUT` must be excluded from the overlap constraint.

---

## 5.3 Job Behavior

When booking becomes `CHECKED_OUT`:

- create immediate or near-immediate job:

</div>

```text
COMPLETE_BOOKING
```

<div dir="rtl" align="right">

Recommended run delay:

</div>

```text
0-1 minute
```

<div dir="rtl" align="right">

Job behavior:

- If booking is still `CHECKED_OUT`, transition to `COMPLETED`.
- Emit `booking.completed`.
- Audit transition.

---

# 6. QR Access Flow

## 6.1 Frozen API Behavior

</div>

```text
POST /qr/verify
```

<div dir="rtl" align="right">

does all three:

</div>

```text
Verify token
-> create access_event
-> initiate unlock flow
```

<div dir="rtl" align="right">

It is not just validation.

---

## 6.2 Access Event Lifecycle

For V1 Mock IoT:

</div>

```text
POST /qr/verify
-> verify QR
-> create access_event with access_method = QR_SCAN
-> simulate unlock
-> update access_event to ACKED / DENIED / FAILED_NO_ACK
```

<div dir="rtl" align="right">

Access event statuses:

</div>

```text
PENDING_ACK
ACKED
FAILED_NO_ACK
DENIED
MANUAL_OVERRIDE
REVOKED
```

<div dir="rtl" align="right">

Access method:

</div>

```text
QR_SCAN
APP_UNLOCK
MANUAL_OVERRIDE
```

<div dir="rtl" align="right">

---

## 6.3 `/qr/verify` Response

Response:

</div>

```json
{
  "bookingId": "uuid",
  "accessEventId": "uuid",
  "deviceId": "uuid",
  "accessMethod": "QR_SCAN",
  "unlockStatus": "ACKED",
  "message": "Access granted"
}
```

<div dir="rtl" align="right">

Failure examples:

</div>

```text
TOKEN_EXPIRED
QR_REVOKED
BOOKING_NOT_CONFIRMED
OUTSIDE_QR_WINDOW
DEVICE_NOT_AVAILABLE
ACCESS_DENIED
```

<div dir="rtl" align="right">

---

# 7. Telemetry Access Policy

## 7.1 Frozen Policy

USER:

- لا يستطيع الوصول إلى telemetry.

OWNER:

- يستطيع الوصول إلى telemetry الخاصة بمكاتبه.

OPERATOR:

- يستطيع الوصول إلى telemetry الخاصة بالمكاتب المعيّن عليها.

ADMIN:

- full access.

---

## 7.2 RLS Rule

Tables:

</div>

```text
telemetry_events
device_state_snapshots
iot_devices
```

<div dir="rtl" align="right">

SELECT:

- USER: denied.
- OWNER: office ownership.
- OPERATOR: operator assignment.
- ADMIN: allowed.

INSERT:

- service/RPC only.

UPDATE:

- telemetry rows are immutable.
- device state updates service/RPC only.

DELETE:

- no hard delete.

---

# 8. Environment Strategy

## 8.1 Frozen Environments

</div>

```text
LOCAL
DEMO
PRODUCTION
```

<div dir="rtl" align="right">

No staging environment in V1.

---

## 8.2 Environment Purpose

| Environment | Purpose |
|---|---|
| LOCAL | development on local machine / Supabase local |
| DEMO | committee demo, seeded data, mock payment, mock IoT |
| PRODUCTION | real deployment-ready settings, still can use mock unless provider added later |

---

## 8.3 Mock Behavior by Environment

| Feature | LOCAL | DEMO | PRODUCTION |
|---|---|---|---|
| Mock Payment | yes | yes | configurable |
| Mock IoT | yes | yes | configurable |
| Seed demo data | yes | yes | no |
| Verbose logs | yes | limited | no |
| Service secrets | local | demo secrets | production secrets |
| RLS | enabled | enabled | enabled |

Important:

RLS must never be disabled in DEMO.  
Demo must prove security, not bypass it.

---

# 9. Canonical Backend Error Codes

## 9.1 Final Error Code List

</div>

```text
FORBIDDEN
UNAUTHORIZED
VALIDATION_ERROR
INVALID_TIME_RANGE
INVALID_STATE
BOOKING_NOT_FOUND
OFFICE_NOT_FOUND
OFFICE_NOT_ACTIVE
BOOKING_OVERLAP
BOOKING_TOO_SHORT
BOOKING_TOO_LONG
CANCELLATION_NOT_ALLOWED
IDEMPOTENCY_CONFLICT
PAYMENT_NOT_FOUND
PAYMENT_ALREADY_FINAL
PAYMENT_REQUIRED
BOOKING_NOT_CONFIRMED
TOKEN_EXPIRED
QR_REVOKED
INVALID_TOKEN
OUTSIDE_QR_WINDOW
DEVICE_NOT_FOUND
DEVICE_NOT_AVAILABLE
ACCESS_DENIED
REASON_REQUIRED
TELEMETRY_FORBIDDEN
JOB_NOT_FOUND
INTERNAL_ERROR
```

<div dir="rtl" align="right">

## 9.2 Error Response Shape

</div>

```json
{
  "data": null,
  "error": {
    "code": "BOOKING_TOO_SHORT",
    "message": "Minimum booking duration is 30 minutes",
    "details": {
      "minimumMinutes": 30
    }
  },
  "requestId": "req_..."
}
```

<div dir="rtl" align="right">

---

# 10. Updated RPC Contracts

## 10.1 `create_booking_v1`

Input:

</div>

```json
{
  "p_user_id": "uuid",
  "p_office_id": "uuid",
  "p_start_time": "timestamptz",
  "p_end_time": "timestamptz",
  "p_idempotency_key": "uuid"
}
```

<div dir="rtl" align="right">

Output:

</div>

```json
{
  "booking_id": "uuid",
  "status": "PENDING_APPROVAL",
  "amount_cents": 1000,
  "currency": "USD",
  "idempotent_replay": false
}
```

<div dir="rtl" align="right">

Required validations:

- office exists.
- office status is `ACTIVE`.
- start < end.
- duration >= 30 minutes.
- duration <= 30 days.
- no overlap via exclusion constraint.
- idempotency key not conflicting.

Failure codes:

</div>

```text
OFFICE_NOT_FOUND
OFFICE_NOT_ACTIVE
INVALID_TIME_RANGE
BOOKING_TOO_SHORT
BOOKING_TOO_LONG
BOOKING_OVERLAP
IDEMPOTENCY_CONFLICT
```

<div dir="rtl" align="right">

Realtime:

</div>

```text
booking.created
```

<div dir="rtl" align="right">

---

## 10.2 `approve_booking_v1`

Frozen behavior:

</div>

```text
PENDING_APPROVAL -> APPROVED -> PAYMENT_PENDING
```

<div dir="rtl" align="right">

in one transaction.

Output:

</div>

```json
{
  "booking_id": "uuid",
  "status": "PAYMENT_PENDING",
  "payment_id": "uuid"
}
```

<div dir="rtl" align="right">

Failure codes:

</div>

```text
FORBIDDEN
BOOKING_NOT_FOUND
INVALID_STATE
PAYMENT_ALREADY_FINAL
```

<div dir="rtl" align="right">

Realtime:

</div>

```text
booking.approved
payment.required
```

<div dir="rtl" align="right">

Audit:

- Must record approval.
- Must record payment pending transition.

---

## 10.3 `cancel_booking_v1`

Allowed states:

</div>

```text
PENDING_APPROVAL
APPROVED
PAYMENT_PENDING
CONFIRMED
```

<div dir="rtl" align="right">

Forbidden after:

</div>

```text
CHECKED_IN
```

<div dir="rtl" align="right">

Failure:

</div>

```text
CANCELLATION_NOT_ALLOWED
```

<div dir="rtl" align="right">

Side effects:

- revoke QR tokens.
- cancel pending jobs.
- emit `booking.cancelled`.
- audit required.

---

## 10.4 `generate_qr_token_v1`

Frozen behavior:

- Return existing active token.
- Do not rotate in V1.

Output must include:

</div>

```json
{
  "token": "signed-token",
  "validFrom": "timestamp",
  "validUntil": "timestamp",
  "returnedExisting": true
}
```

<div dir="rtl" align="right">

---

## 10.5 `verify_qr_and_create_access_event_v1`

Frozen behavior:

- verify token.
- create access event.
- initiate unlock flow.

Output:

</div>

```json
{
  "access_event_id": "uuid",
  "unlock_status": "ACKED",
  "access_method": "QR_SCAN"
}
```

<div dir="rtl" align="right">

---

## 10.6 `dispatch_due_jobs`

Must support:

</div>

```text
EXPIRE_BOOKING
NO_SHOW_SCAN
OVERSTAY_SCAN
COMPLETE_BOOKING
PAYMENT_RECONCILIATION
DEVICE_OFFLINE_SCAN
SEND_NOTIFICATION
```

<div dir="rtl" align="right">

`COMPLETE_BOOKING` is required because `CHECKED_OUT` should quickly become `COMPLETED`.

---

# 11. Updated Transition Matrix

</div>

```text
PENDING_APPROVAL -> APPROVED
PENDING_APPROVAL -> REJECTED
PENDING_APPROVAL -> CANCELLED

APPROVED -> PAYMENT_PENDING
APPROVED -> CANCELLED

PAYMENT_PENDING -> CONFIRMED
PAYMENT_PENDING -> EXPIRED
PAYMENT_PENDING -> CANCELLED

CONFIRMED -> CHECKED_IN
CONFIRMED -> NO_SHOW
CONFIRMED -> CANCELLED

CHECKED_IN -> CHECKED_OUT
CHECKED_IN -> OVERSTAY

OVERSTAY -> CHECKED_OUT

CHECKED_OUT -> COMPLETED

COMPLETED -> REFUNDED
CANCELLED -> REFUNDED
```

<div dir="rtl" align="right">

Forbidden:

</div>

```text
CHECKED_IN -> CANCELLED
CHECKED_OUT -> CANCELLED
COMPLETED -> CANCELLED
NO_SHOW -> CANCELLED
OVERSTAY -> CANCELLED
EXPIRED -> CANCELLED
REFUNDED -> CANCELLED
```

<div dir="rtl" align="right">

Terminal states:

</div>

```text
REJECTED
CANCELLED
EXPIRED
NO_SHOW
COMPLETED
REFUNDED
```

<div dir="rtl" align="right">

Non-blocking states:

</div>

```text
CHECKED_OUT
COMPLETED
REJECTED
CANCELLED
EXPIRED
NO_SHOW
REFUNDED
```

<div dir="rtl" align="right">

---

# 12. Updated RLS Matrix

## 12.1 Telemetry

Frozen:

| Role | telemetry_events SELECT |
|---|---|
| USER | denied |
| OWNER | own offices |
| OPERATOR | assigned offices |
| ADMIN | all |

INSERT:

- service/RPC only.

UPDATE:

- no direct update.

DELETE:

- no hard delete.

---

## 12.2 Bookings

SELECT:

- USER own bookings.
- OWNER bookings for own offices.
- OPERATOR bookings for assigned offices.
- ADMIN all.

INSERT:

- via `create_booking_v1`.

UPDATE:

- status only via RPC.

DELETE:

- no hard delete.

---

## 12.3 QR Tokens

SELECT:

- no direct user select.
- token returned only through `generate_qr_token_v1`.

INSERT/UPDATE:

- RPC only.

DELETE:

- no.

---

## 12.4 Access Events

SELECT:

- USER own booking access events.
- OWNER own office access events.
- OPERATOR assigned office access events.
- ADMIN all.

INSERT/UPDATE:

- RPC/service only.

---

# 13. Updated Edge Function API Behavior

## 13.1 `POST /bookings`

Must validate:

- minimum 30 minutes.
- maximum 30 days.
- UTC timestamps.

Maps to:

</div>

```text
create_booking_v1
```

<div dir="rtl" align="right">

---

## 13.2 `POST /bookings/:id/cancel`

Must fail with:

</div>

```text
CANCELLATION_NOT_ALLOWED
```

<div dir="rtl" align="right">

if booking is checked-in or later.

---

## 13.3 `POST /qr/generate`

If active token exists:

</div>

```text
return existing token
```

<div dir="rtl" align="right">

Response includes:

</div>

```json
{
  "returnedExisting": true
}
```

<div dir="rtl" align="right">

---

## 13.4 `POST /qr/verify`

Frozen behavior:

</div>

```text
verify + create access_event + initiate unlock
```

<div dir="rtl" align="right">

Not only validation.

---

## 13.5 `POST /iot/mock/telemetry`

Authorization:

- USER denied.
- OWNER own office.
- OPERATOR assigned office.
- ADMIN all.

---

# 14. DTO Rule Freeze

## 14.1 Create Booking DTO

</div>

```json
{
  "officeId": "uuid",
  "startTime": "ISO-8601 UTC timestamp",
  "endTime": "ISO-8601 UTC timestamp",
  "idempotencyKey": "uuid"
}
```

<div dir="rtl" align="right">

Validation:

</div>

```text
officeId required uuid
startTime required timestamp
endTime required timestamp
idempotencyKey required uuid
startTime < endTime
duration >= 30 minutes
duration <= 30 days
```

<div dir="rtl" align="right">

---

## 14.2 Cancel Booking DTO

</div>

```json
{
  "reason": "text"
}
```

<div dir="rtl" align="right">

Validation:

- reason required.
- min length recommended: 3.

---

## 14.3 QR Verify DTO

</div>

```json
{
  "token": "signed-token",
  "deviceId": "uuid"
}
```

<div dir="rtl" align="right">

Server sets:

</div>

```text
access_method = QR_SCAN
```

<div dir="rtl" align="right">

---

## 14.4 App Unlock DTO

</div>

```json
{
  "bookingId": "uuid",
  "deviceId": "uuid"
}
```

<div dir="rtl" align="right">

Server sets:

</div>

```text
access_method = APP_UNLOCK
```

<div dir="rtl" align="right">

---

## 14.5 Manual Override DTO

</div>

```json
{
  "bookingId": "uuid",
  "deviceId": "uuid",
  "reason": "text"
}
```

<div dir="rtl" align="right">

Server sets:

</div>

```text
access_method = MANUAL_OVERRIDE
```

<div dir="rtl" align="right">

Reason is required.

---

# 15. Final Readiness Verdict

## 15.1 Contract Freeze Result

The backend is ready to enter coding only if this document is treated as the contract source.

Frozen decisions:

- Booking duration: 30 minutes to 30 days.
- Cancellation only before check-in.
- Existing active QR token is returned, not rotated.
- `APPROVED` is transient.
- `CHECKED_OUT` is non-blocking.
- `/qr/verify` verifies and initiates unlock.
- USER cannot access telemetry.
- Environments: LOCAL, DEMO, PRODUCTION.
- Canonical error codes are frozen.

---

## 15.2 Coding Readiness Score

</div>

```text
Final coding readiness: 9 / 10
```

<div dir="rtl" align="right">

Remaining 1 point:

- actual migration implementation may reveal small SQL syntax/policy adjustments.
- but architecturally, contracts are now ready.

---

## 15.3 Final Instruction Before Coding

Do not start Edge Functions first.

Correct order:

1. enums.
2. tables.
3. constraints.
4. transition matrix.
5. triggers.
6. RLS helper functions.
7. RLS policies.
8. RPCs.
9. pg_cron jobs.
10. Edge Functions.
11. Realtime subscriptions.
12. tests.

</div>
