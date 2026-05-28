<div dir="rtl" align="right">

# FlexiSpace - Final Pre-Coding Implementation Review

الدور: Principal Backend Architect / Senior Supabase Systems Engineer  
النطاق: مراجعة جاهزية التنفيذ قبل كتابة الكود  
القرار المعماري: Supabase-only backend  
الحكم العام: المعمارية صالحة للتنفيذ، لكن يجب تجميد العقود التالية قبل البدء بالكود.

---

## 0. Final Readiness Verdict

المنطق العام جاهز بنسبة جيدة، لكن ليس جاهزًا للتكويد بدون تجميد هذه الأشياء:

- قائمة enums نهائية.
- عقود RPC دقيقة.
- RLS matrix نهائية.
- Edge Function DTOs.
- booking transition matrix.
- قواعد idempotency.
- أسماء realtime events.
- failure codes موحدة.

لا يوجد سبب لتغيير المعمارية.  
لا تضف Node/Nest/Redis/Prisma.  
المشكلة ليست في التصميم العام، بل في عقود التنفيذ.

---

# 1. ENUM FREEZE

## 1.1 Review Result

القائمة الحالية جيدة لكنها ناقصة في هذه النقاط:

- لا يوجد `office_status` محدد.
- `PAYMENT_FAILED` يجب ألا يكون booking state، لكنه يجب أن يكون payment status.
- يجب إضافة `access_method` لأنه مهم جدًا للـ audit.
- يجب تثبيت `incident_type` و `notification_type`.
- يجب تحديد `payment_gateway = MOCK` الآن، مع ترك قابلية مستقبلية بدون استخدامها في V1.
- لا تخلط soft delete مع status. الحذف يكون دائمًا عبر `deleted_at`.

---

## 1.2 Final Recommended Enums

</div>

```sql
CREATE TYPE user_role AS ENUM (
  'USER',
  'OPERATOR',
  'OWNER',
  'ADMIN'
);

CREATE TYPE booking_status AS ENUM (
  'PENDING_APPROVAL',
  'APPROVED',
  'PAYMENT_PENDING',
  'CONFIRMED',
  'CHECKED_IN',
  'CHECKED_OUT',
  'COMPLETED',
  'REJECTED',
  'CANCELLED',
  'EXPIRED',
  'NO_SHOW',
  'OVERSTAY',
  'REFUNDED'
);

CREATE TYPE payment_status AS ENUM (
  'PENDING',
  'PAID',
  'FAILED',
  'CANCELLED',
  'REFUNDED'
);

CREATE TYPE payment_gateway AS ENUM (
  'MOCK'
);

CREATE TYPE office_status AS ENUM (
  'ACTIVE',
  'INACTIVE',
  'MAINTENANCE'
);

CREATE TYPE device_type AS ENUM (
  'SMART_LOCK',
  'AIR_QUALITY_SENSOR',
  'ELECTRICITY_METER'
);

CREATE TYPE device_status AS ENUM (
  'PROVISIONING',
  'ONLINE',
  'OFFLINE',
  'DEGRADED',
  'RETIRED'
);

CREATE TYPE access_event_status AS ENUM (
  'PENDING_ACK',
  'ACKED',
  'FAILED_NO_ACK',
  'DENIED',
  'MANUAL_OVERRIDE',
  'REVOKED'
);

CREATE TYPE access_method AS ENUM (
  'QR_SCAN',
  'APP_UNLOCK',
  'MANUAL_OVERRIDE'
);

CREATE TYPE incident_type AS ENUM (
  'DEVICE_OFFLINE',
  'DOOR_UNLOCK_FAILED',
  'REPEATED_QR_DENIED',
  'SENSOR_TIMEOUT'
);

CREATE TYPE incident_status AS ENUM (
  'OPEN',
  'IN_PROGRESS',
  'RESOLVED',
  'CLOSED'
);

CREATE TYPE notification_type AS ENUM (
  'BOOKING_APPROVED',
  'BOOKING_REJECTED',
  'PAYMENT_REQUIRED',
  'PAYMENT_SUCCESS',
  'CHECKIN_REMINDER',
  'NO_SHOW_WARNING',
  'OVERSTAY_ALERT',
  'DEVICE_OFFLINE'
);
```

<div dir="rtl" align="right">

## 1.3 Explicit Decisions

- لا تضف `PAYMENT_FAILED` إلى `booking_status`.
- أضف `FAILED` إلى `payment_status`.
- لا تضف `DOOR_UNLOCKED` إلى notifications في V1. يكفي `access_events`.
- لا تضف Stripe/PayTabs في V1.
- لا تضف `OCCUPANCY_SENSOR` في V1.

---

# 2. RPC CONTRACT FREEZE

## 2.1 RPC Summary Table

| RPC | جاهز؟ | ملاحظة |
|---|---:|---|
| `create_booking_v1` | نعم بعد ضبط العقد | يحتاج idempotency وفحص office status |
| `approve_booking_v1` | نعم | يجب أن ينقل إلى `PAYMENT_PENDING` داخل نفس transaction |
| `reject_booking_v1` | نعم | واضح |
| `cancel_booking_v1` | نعم | يحتاج تحديد الحالات القابلة للإلغاء |
| `create_mock_payment_session_v1` | نعم | لا يؤكد الدفع |
| `confirm_mock_payment_v1` | نعم | يجب أن ينشئ synthetic webhook event |
| `generate_qr_token_v1` | نعم | يحتاج explicit grace window |
| `verify_qr_and_create_access_event_v1` | نعم | يحتاج `access_method` |
| `mock_unlock_door_v1` | نعم | V1 demo |
| `mock_generate_telemetry_v1` | نعم | V1 demo |
| `record_mqtt_ack_v1` | اختياري V1 | يبقى future-compatible |
| `dispatch_due_jobs` | نعم | مهم للـ lifecycle |

---

## 2.2 Canonical RPC Contracts

### `create_booking_v1`

Purpose:

- إنشاء booking جديد في حالة `PENDING_APPROVAL`.
- منع overlap عبر database constraint.

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

Authorization:

- `USER`, `OWNER`, `OPERATOR`, `ADMIN` can create own booking.
- If operator creates for someone else, that is NOT supported in V1.

Transaction:

- Single transaction.
- Set audit context before insert.

Failure states:

- `OFFICE_NOT_FOUND`
- `OFFICE_NOT_ACTIVE`
- `INVALID_TIME_RANGE`
- `BOOKING_OVERLAP`
- `IDEMPOTENCY_CONFLICT`

Idempotency:

- Required by `(user_id, idempotency_key)`.

Realtime events:

- `booking.created`

Audit:

- Insert booking audit required.

---

### `approve_booking_v1`

Purpose:

- قبول الحجز بواسطة مالك أو مشغل.
- نقل الحجز إلى الدفع.

Input:

</div>

```json
{
  "p_actor_id": "uuid",
  "p_booking_id": "uuid",
  "p_note": "text|null"
}
```

<div dir="rtl" align="right">

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

Authorization:

- `OWNER` for own office.
- `OPERATOR` for assigned office.
- `ADMIN` all.

Transaction:

- One transaction.
- Transition `PENDING_APPROVAL -> APPROVED`.
- Create payment row `PENDING`.
- Transition `APPROVED -> PAYMENT_PENDING`.
- Insert expiry job.

Failure states:

- `BOOKING_NOT_FOUND`
- `FORBIDDEN`
- `INVALID_STATE`
- `PAYMENT_ALREADY_EXISTS`

Idempotency:

- Re-running approval on already `PAYMENT_PENDING` should return current payment.

Realtime events:

- `booking.approved`
- `payment.required`

Audit:

- Status transition audit required.

---

### `reject_booking_v1`

Purpose:

- رفض حجز قبل الدفع.

Input:

</div>

```json
{
  "p_actor_id": "uuid",
  "p_booking_id": "uuid",
  "p_reason": "text"
}
```

<div dir="rtl" align="right">

Output:

</div>

```json
{
  "booking_id": "uuid",
  "status": "REJECTED"
}
```

<div dir="rtl" align="right">

Authorization:

- `OWNER`, `OPERATOR`, `ADMIN`.

Transaction:

- One transaction.

Failure states:

- `FORBIDDEN`
- `INVALID_STATE`
- `REASON_REQUIRED`

Idempotency:

- If already `REJECTED`, return current state.

Realtime events:

- `booking.rejected`

Audit:

- Required.

---

### `cancel_booking_v1`

Purpose:

- إلغاء الحجز.

Input:

</div>

```json
{
  "p_actor_id": "uuid",
  "p_booking_id": "uuid",
  "p_reason": "text"
}
```

<div dir="rtl" align="right">

Output:

</div>

```json
{
  "booking_id": "uuid",
  "status": "CANCELLED"
}
```

<div dir="rtl" align="right">

Authorization:

- User can cancel own booking if not checked in.
- Owner/operator can cancel scoped booking.
- Admin all.

Allowed source states:

- `PENDING_APPROVAL`
- `APPROVED`
- `PAYMENT_PENDING`
- `CONFIRMED`

Failure states:

- `INVALID_STATE`
- `FORBIDDEN`
- `REASON_REQUIRED`

Side effects:

- Cancel pending jobs.
- Revoke QR tokens.
- If payment was paid, V1 can mark refund as future/manual.

Realtime events:

- `booking.cancelled`

Audit:

- Required.

---

### `create_mock_payment_session_v1`

Purpose:

- إنشاء جلسة دفع وهمية.

Input:

</div>

```json
{
  "p_user_id": "uuid",
  "p_booking_id": "uuid",
  "p_idempotency_key": "uuid"
}
```

<div dir="rtl" align="right">

Output:

</div>

```json
{
  "payment_id": "uuid",
  "gateway": "MOCK",
  "checkout_url": "/checkout/mock?paymentId=uuid",
  "status": "PENDING"
}
```

<div dir="rtl" align="right">

Authorization:

- Booking owner only.
- Admin allowed for demo support.

Required booking state:

- `PAYMENT_PENDING`

Failure states:

- `BOOKING_NOT_PAYMENT_PENDING`
- `PAYMENT_ALREADY_PAID`
- `FORBIDDEN`

Idempotency:

- Required.

Realtime:

- `payment.required`

Audit:

- Payment row creation/update required.

---

### `confirm_mock_payment_v1`

Purpose:

- تأكيد أو فشل دفع وهمي.

Input:

</div>

```json
{
  "p_user_id": "uuid",
  "p_payment_id": "uuid",
  "p_result": "SUCCESS|FAILED|CANCELLED",
  "p_idempotency_key": "uuid"
}
```

<div dir="rtl" align="right">

Output:

</div>

```json
{
  "payment_id": "uuid",
  "payment_status": "PAID",
  "booking_id": "uuid",
  "booking_status": "CONFIRMED"
}
```

<div dir="rtl" align="right">

Authorization:

- Booking owner.
- Admin.

Transaction:

- Insert synthetic `webhook_events`.
- Update payment.
- If success: transition booking `PAYMENT_PENDING -> CONFIRMED`.
- Cancel `EXPIRE_BOOKING` job.

Failure states:

- `PAYMENT_NOT_FOUND`
- `PAYMENT_ALREADY_FINAL`
- `BOOKING_EXPIRED`
- `DUPLICATE_EVENT`

Idempotency:

- Required via synthetic event id or idempotency key.

Realtime:

- `payment.succeeded` or `payment.failed`
- `booking.confirmed` on success

Audit:

- Required for payment and booking transition.

---

### `generate_qr_token_v1`

Purpose:

- توليد QR token لحجز مؤكد.

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
  "token": "signed-token",
  "jti": "uuid",
  "valid_from": "timestamptz",
  "valid_until": "timestamptz"
}
```

<div dir="rtl" align="right">

Authorization:

- Booking owner.
- Operator/owner/admin can generate only for support if allowed; otherwise deny in V1.

Required booking state:

- `CONFIRMED`

Rules:

- `valid_from = start_time - 10 minutes`
- `valid_until = end_time + 5 minutes`

Failure states:

- `BOOKING_NOT_CONFIRMED`
- `FORBIDDEN`
- `QR_ALREADY_ACTIVE`

Idempotency:

- If active token exists, return existing or revoke-and-create. Choose one before coding.
- Recommended: return existing active token.

Realtime:

- none required.

Audit:

- QR token creation required.

---

### `verify_qr_and_create_access_event_v1`

Purpose:

- التحقق من QR وإنشاء access event.

Input:

</div>

```json
{
  "p_token": "text",
  "p_device_id": "uuid",
  "p_access_method": "QR_SCAN"
}
```

<div dir="rtl" align="right">

Output:

</div>

```json
{
  "access_event_id": "uuid",
  "booking_id": "uuid",
  "device_id": "uuid",
  "status": "PENDING_ACK"
}
```

<div dir="rtl" align="right">

Authorization:

- Public kiosk/device path must be protected by device credential or Edge Function service role.

Failure states:

- `INVALID_TOKEN`
- `TOKEN_EXPIRED`
- `BOOKING_NOT_CONFIRMED`
- `OUTSIDE_GRACE_WINDOW`
- `DEVICE_NOT_FOR_OFFICE`
- `QR_REVOKED`

Idempotency:

- Each scan creates event. No idempotency required unless client retries same scan request.

Realtime:

- `access.unlock_requested`

Audit:

- Required.

---

### `mock_unlock_door_v1`

Purpose:

- محاكاة فتح الباب.

Input:

</div>

```json
{
  "p_actor_id": "uuid",
  "p_booking_id": "uuid",
  "p_device_id": "uuid",
  "p_access_method": "QR_SCAN|APP_UNLOCK|MANUAL_OVERRIDE",
  "p_simulate_result": "ACKED|FAILED_NO_ACK|DENIED",
  "p_reason": "text|null"
}
```

<div dir="rtl" align="right">

Output:

</div>

```json
{
  "access_event_id": "uuid",
  "status": "ACKED"
}
```

<div dir="rtl" align="right">

Authorization:

- User for own booking.
- Operator/owner for scoped office.
- Manual override requires reason.

Failure states:

- `FORBIDDEN`
- `REASON_REQUIRED`
- `INVALID_ACCESS_WINDOW`
- `DEVICE_NOT_FOUND`

Realtime:

- `access.unlock_requested`
- `access.unlock_acknowledged` or `access.unlock_failed`

Audit:

- Required.

---

### `mock_generate_telemetry_v1`

Purpose:

- توليد بيانات وهمية للكهرباء والهواء.

Input:

</div>

```json
{
  "p_actor_id": "uuid",
  "p_office_id": "uuid",
  "p_device_type": "AIR_QUALITY_SENSOR|ELECTRICITY_METER"
}
```

<div dir="rtl" align="right">

Output:

</div>

```json
{
  "telemetry_event_id": "uuid",
  "device_id": "uuid",
  "payload": {}
}
```

<div dir="rtl" align="right">

Authorization:

- Owner/operator/admin only.

Failure states:

- `DEVICE_NOT_FOUND`
- `FORBIDDEN`

Realtime:

- `device.telemetry_received`

Audit:

- Optional for raw telemetry, required for device status changes.

---

### `record_mqtt_ack_v1`

Purpose:

- مستقبلًا: تسجيل ACK من EMQX/MQTT.

V1 status:

- Not required for demo.
- Keep contract for future extension.

Authorization:

- Service role only.

---

### `dispatch_due_jobs`

Purpose:

- تنفيذ jobs المستحقة عبر pg_cron.

Authorization:

- Database internal / service role only.

Transaction:

- Lock jobs using `FOR UPDATE SKIP LOCKED`.

Failure states:

- Job failure increments attempts.
- After max attempts -> failed/dead.

Realtime:

- Depends on job type.

Audit:

- Required for business state changes, not every scheduler tick.

---

## 2.3 Missing RPCs

أنصح بإضافة هذه RPCs قبل التكويد:

</div>

```text
check_in_booking_v1
check_out_booking_v1
complete_booking_v1
mark_no_show_v1
mark_overstay_v1
resolve_incident_v1
mark_notification_read_v1
```

<div dir="rtl" align="right">

ليست إعادة تصميم. هذه gaps تنفيذية.  
إذا لم تضفها، ستضطر Edge Functions إلى تحديث الجداول مباشرة، وهذا يكسر قرارك أن workflows الحساسة تكون عبر RPC.

---

# 3. RLS POLICY FREEZE

## 3.1 General RLS Rule

- الجداول المهمة يجب أن تكون RLS enabled.
- المستخدم العادي لا يحدث الجداول الحساسة مباشرة.
- التحديثات الحساسة تتم عبر RPC بـ `SECURITY DEFINER` مع checks داخلية.
- `service_role` فقط للـ Edge Functions trusted paths.

---

## 3.2 Final RLS Matrix

### `profiles`

SELECT:

- User sees own profile.
- Owner/operator/admin as needed for scoped workflows.

INSERT:

- Trigger after auth user creation or service role only.

UPDATE:

- User can update limited own fields, not role.
- Admin can update role/status.

DELETE:

- No hard delete.

Risk:

- If users can update `role`, full privilege escalation.

---

### `offices`

SELECT:

- USER sees active offices.
- OPERATOR sees assigned offices.
- OWNER sees own offices.
- ADMIN all.

INSERT:

- OWNER and ADMIN only.

UPDATE:

- OWNER own offices.
- ADMIN all.
- OPERATOR no.

DELETE:

- Soft delete only by OWNER/ADMIN.

Ownership:

- `offices.owner_id = auth.uid()`.

---

### `bookings`

SELECT:

- USER own bookings.
- OWNER bookings for own offices.
- OPERATOR bookings for assigned offices.
- ADMIN all.

INSERT:

- USER can insert only via `create_booking_v1`.
- Direct table insert should be blocked or heavily restricted.

UPDATE:

- No direct status update.
- Use RPC only.

DELETE:

- No hard delete.

Risk:

- Direct update on `status` is dangerous even with trigger. Block direct updates.

---

### `payments`

SELECT:

- USER payments for own bookings.
- OWNER payments for own offices.
- OPERATOR scoped read only.
- ADMIN all.

INSERT:

- Service/RPC only.

UPDATE:

- Service/RPC only.

DELETE:

- No.

Risk:

- User must never update payment status.

---

### `qr_tokens`

SELECT:

- Prefer no direct SELECT for users.
- Return token only through RPC.

INSERT:

- RPC only.

UPDATE:

- RPC only for revoke/use.

DELETE:

- No.

Risk:

- Exposing token hashes is unnecessary. Keep table private.

---

### `access_events`

SELECT:

- USER own booking access events.
- OWNER own office events.
- OPERATOR assigned office events.
- ADMIN all.

INSERT:

- RPC only.

UPDATE:

- RPC/service only.

DELETE:

- No.

---

### `telemetry_events`

SELECT:

- OWNER own office devices.
- OPERATOR assigned office devices.
- ADMIN all.
- USER no, unless you want office public environmental display.

INSERT:

- Service/RPC only.

UPDATE:

- No.

DELETE:

- No.

---

### `incidents`

SELECT:

- OWNER own office incidents.
- OPERATOR assigned incidents.
- ADMIN all.

INSERT:

- System/RPC only.

UPDATE:

- OPERATOR/OWNER scoped status updates.
- ADMIN all.

DELETE:

- No.

---

### `notifications`

SELECT:

- User sees own notifications.

INSERT:

- System/RPC only.

UPDATE:

- User can mark own notification read.

DELETE:

- Soft delete optional, no hard delete.

---

### `iot_devices`

SELECT:

- OWNER own office devices.
- OPERATOR assigned devices.
- ADMIN all.

INSERT:

- OWNER/ADMIN.

UPDATE:

- OWNER/ADMIN for metadata.
- System/RPC for status.

DELETE:

- Soft delete only.

Risk:

- OPERATOR should not be able to reassign devices.

---

# 4. EDGE FUNCTION API CONTRACTS

## 4.1 Common Response Format

</div>

```json
{
  "data": {},
  "error": null,
  "requestId": "req_..."
}
```

```json
{
  "data": null,
  "error": {
    "code": "INVALID_STATE",
    "message": "Booking cannot transition from current state",
    "details": {}
  },
  "requestId": "req_..."
}
```

<div dir="rtl" align="right">

## 4.2 Endpoint Contracts

### `GET /auth/profile`

Auth:

- Required.

Response:

</div>

```json
{
  "id": "uuid",
  "email": "user@example.com",
  "fullName": "User Name",
  "role": "USER"
}
```

<div dir="rtl" align="right">

Status:

- `200`
- `401`
- `403` if inactive.

RPC:

- Direct select or `get_profile_v1` optional.

---

### `POST /bookings`

Request:

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

Response:

</div>

```json
{
  "bookingId": "uuid",
  "status": "PENDING_APPROVAL",
  "amountCents": 1000,
  "currency": "USD"
}
```

<div dir="rtl" align="right">

Auth:

- Required.

Validation:

- ISO timestamps.
- UTC.
- start < end.
- duration limits.

Status:

- `201`
- `400`
- `401`
- `409` overlap.

RPC:

- `create_booking_v1`

---

### `POST /bookings/:id/approve`

Request:

</div>

```json
{
  "note": "Approved"
}
```

<div dir="rtl" align="right">

Response:

</div>

```json
{
  "bookingId": "uuid",
  "status": "PAYMENT_PENDING",
  "paymentId": "uuid"
}
```

<div dir="rtl" align="right">

Auth:

- OWNER/OPERATOR/ADMIN.

Status:

- `200`
- `403`
- `404`
- `409` invalid state.

RPC:

- `approve_booking_v1`

---

### `POST /bookings/:id/reject`

Request:

</div>

```json
{
  "reason": "Not available"
}
```

<div dir="rtl" align="right">

Auth:

- OWNER/OPERATOR/ADMIN.

RPC:

- `reject_booking_v1`

Status:

- `200`, `400`, `403`, `404`, `409`

---

### `POST /bookings/:id/cancel`

Request:

</div>

```json
{
  "reason": "User cancelled"
}
```

<div dir="rtl" align="right">

Auth:

- USER own booking, OWNER/OPERATOR scoped, ADMIN.

RPC:

- `cancel_booking_v1`

---

### `POST /payments/mock/create-session`

Request:

</div>

```json
{
  "bookingId": "uuid",
  "idempotencyKey": "uuid"
}
```

<div dir="rtl" align="right">

Response:

</div>

```json
{
  "paymentId": "uuid",
  "gateway": "MOCK",
  "checkoutUrl": "/checkout/mock?paymentId=uuid"
}
```

<div dir="rtl" align="right">

RPC:

- `create_mock_payment_session_v1`

---

### `POST /payments/mock/confirm`

Request:

</div>

```json
{
  "paymentId": "uuid",
  "result": "SUCCESS",
  "idempotencyKey": "uuid"
}
```

<div dir="rtl" align="right">

Allowed:

- `SUCCESS`
- `FAILED`
- `CANCELLED`

RPC:

- `confirm_mock_payment_v1`

---

### `POST /qr/generate`

Request:

</div>

```json
{
  "bookingId": "uuid"
}
```

<div dir="rtl" align="right">

Response:

</div>

```json
{
  "token": "signed-token",
  "validFrom": "timestamp",
  "validUntil": "timestamp"
}
```

<div dir="rtl" align="right">

RPC:

- `generate_qr_token_v1`

---

### `POST /qr/verify`

Request:

</div>

```json
{
  "token": "signed-token",
  "deviceId": "uuid"
}
```

<div dir="rtl" align="right">

RPC:

- `verify_qr_and_create_access_event_v1`
- then `mock_unlock_door_v1` if demo path combines verify + unlock.

Naming warning:

- Decide if `/qr/verify` only verifies or also opens door. Do not leave ambiguous.

Recommended:

- `/qr/verify` verifies and creates access event.
- `/iot/mock/door/unlock` simulates opening.

---

### `POST /iot/mock/door/unlock`

Request:

</div>

```json
{
  "bookingId": "uuid",
  "deviceId": "uuid",
  "accessMethod": "APP_UNLOCK",
  "simulateResult": "ACKED",
  "reason": null
}
```

<div dir="rtl" align="right">

RPC:

- `mock_unlock_door_v1`

---

### `POST /iot/mock/telemetry`

Request:

</div>

```json
{
  "officeId": "uuid",
  "deviceType": "AIR_QUALITY_SENSOR"
}
```

<div dir="rtl" align="right">

RPC:

- `mock_generate_telemetry_v1`

---

### `POST /devices/mqtt-ack`

V1:

- Optional/future.

Auth:

- Service secret only.

RPC:

- `record_mqtt_ack_v1`

Risk:

- Do not expose this publicly without a secret. It would allow fake door ACKs.

---

# 5. BOOKING STATE MACHINE VALIDATION

## 5.1 State Review

States are mostly valid.

Weak points:

- `APPROVED` should be transient. Do not let it stay indefinitely.
- `REFUNDED` is acceptable, but V1 mock may not need actual refunds.
- `PAYMENT_FAILED` should not be added.
- `NO_SHOW` must release the office by being terminal/non-blocking.
- `OVERSTAY` should still block the office until checkout.

---

## 5.2 Canonical Transition Matrix

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

## 5.3 Terminal States

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

## 5.4 Blocking States For Overlap Constraint

These should block office availability:

</div>

```text
PENDING_APPROVAL
APPROVED
PAYMENT_PENDING
CONFIRMED
CHECKED_IN
CHECKED_OUT
OVERSTAY
```

<div dir="rtl" align="right">

Critical note:

Including `CHECKED_OUT` as blocking is debatable.  
If checkout has occurred, the office should probably stop blocking.  
Better:

- `CHECKED_OUT` should quickly move to `COMPLETED`.
- Or exclude `CHECKED_OUT` from blocking.

Recommended for V1:

</div>

```text
CHECKED_OUT is non-blocking
```

<div dir="rtl" align="right">

Because the booking physically ended.

---

# 6. Missing Implementation Contracts

Must define before coding:

1. Error code list.
2. Request ID strategy.
3. Idempotency key format.
4. QR signing secret and hash algorithm.
5. Token valid_from / valid_until.
6. Max booking duration.
7. Min booking duration.
8. Cancellation allowed until when.
9. Operator assignment table exact rules.
10. Whether users can see telemetry or only owner/operator.
11. Whether QR generation returns existing active token or rotates it.
12. Whether `APPROVED` is stored as intermediate event only or real state.

---

# 7. Final Implementation Readiness Score

| Category | Score |
|---|---:|
| Enum readiness | 8/10 |
| RPC readiness | 7/10 |
| RLS readiness | 7.5/10 |
| Edge Function readiness | 7.5/10 |
| State machine readiness | 8/10 |
| Overall coding readiness | 7.5/10 |

Final judgment:

Ready for coding only after freezing:

- final enum SQL,
- canonical transition matrix,
- RPC signatures,
- RLS matrix,
- DTO response/error format.

Do not code before that.  
If coding starts before freezing these contracts, the implementation will drift and you will rewrite migrations.

</div>
