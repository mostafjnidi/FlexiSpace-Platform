# FlexiSpace - Supabase Backend Logic Before Coding

Project: FlexiSpace - Smart Office Booking Platform with IoT Integration  
Architecture mode: Supabase/PostgreSQL-first, as defined in the provided ADRs and diagrams  
Purpose: complete backend logic specification before implementation/coding  
Date: 2026-05-22

## 0. القرار المعماري النهائي قبل التكويد

سيتم الالتزام بالمعمارية الأصلية الموجودة في الوثائق:

- Supabase هو منصة الباكند الأساسية.
- PostgreSQL هو مصدر الحقيقة الوحيد.
- Edge Functions هي طبقة API/orchestration.
- منطق الحجز الحرج داخل PostgreSQL عبر RPC + constraints + triggers.
- لا نستخدم Redis أو BullMQ في هذا المسار.
- المهام المؤجلة تتم عبر `jobs` table + `pg_cron`.
- Realtime يتم عبر Supabase Realtime/logical replication.
- IoT يتم عبر MQTT broker مثل EMQX.
- الدفع يتم عبر gateway خارجي، وقاعدة البيانات هي projection يجب أن تتقارب معه.

أي ذكر سابق لـ NestJS/Prisma/Redis/BullMQ يعتبر مسارًا بديلًا فقط، وليس المسار المعتمد حاليًا.

## 1. Backend Logic Principles

### قواعد غير قابلة للتفاوض

1. لا يمكن وجود حجزين متداخلين لنفس المكتب في الحالات غير النهائية.
2. أي تغيير حالة يجب أن يكون traceable: actor, timestamp, before/after snapshot.
3. بوابة الدفع هي مصدر الحقيقة للمال.
4. PostgreSQL يفرض القواعد الحرجة، وليس التطبيق فقط.
5. كل الحذف soft delete عبر `deleted_at`.
6. كل التواريخ UTC عبر `timestamptz`.
7. QR tokens يجب أن تكون signed ومخزنة كـ hash/JTI فقط.
8. IoT communication عبر MQTT مع ACK/retry/escalation.
9. كل external callback/webhook idempotent.
10. كل async work له سجل واضح في `jobs`.

## 2. Backend Domains

### Auth Domain

المسؤوليات:

- Supabase Auth يدير التسجيل والدخول وJWT.
- JWT يحتوي `sub = auth.users.id`.
- role/profile موجودة في جدول `profiles` أو `users`.
- Edge Functions تتحقق من JWT قبل تنفيذ أي operation.
- RLS تبقى خط الدفاع الثاني.

### Users/Roles Domain

الأدوار:

- `USER`: يحجز مكتبًا، يدفع، يرى حجوزاته، يستخدم QR.
- `OPERATOR`: يراقب المكاتب والأجهزة المعينة، يتعامل مع الأعطال، manual unlock.
- `OWNER`: يدير مكاتبه، يوافق على الحجوزات، يرى الإيرادات، يدير الأجهزة.
- `ADMIN`: صلاحيات منصة كاملة، فقط للعمليات الداخلية.

### Offices Domain

المسؤوليات:

- تعريف المكتب، السعة، السعر، حالة التوفر.
- ربط المكتب بمالك.
- ربط المشغلين بالمكاتب.
- تعريف availability rules.
- ربط الأجهزة بالمكتب.

### Booking Domain

المسؤوليات:

- إنشاء حجز مبدئي.
- منع overlap بواسطة exclusion constraint.
- إدارة state machine.
- إصدار jobs مثل expiry/no-show/reminders.
- إصدار events للـ realtime والnotifications.

### Payment Domain

المسؤوليات:

- إنشاء payment session/intent وهمي مناسب للعرض أمام اللجنة.
- دعم `Mock Payment Provider` بدل بوابة دفع حقيقية في نسخة capstone/demo.
- الحفاظ على نفس منطق webhooks/idempotency حتى لو كان الدفع وهميًا.
- idempotency via `webhook_events`.
- reconciliation job يمكن أن يعمل كـ simulated reconciliation في نسخة العرض.
- تحديث booking status فقط حسب state machine.

ملاحظة تنفيذية:

- في نسخة اللجنة، الدفع لا يتصل بـ Stripe/PayTabs فعليًا.
- يتم إنشاء payment session وهمي ويرجع رابط/حالة دفع تجريبية.
- يمكن للواجهة أن تعرض شاشة دفع وهمية ثم تستدعي endpoint يؤكد الدفع.
- نفس الجداول والـ state machine تبقى كما هي حتى يكون المشروع production-ready نظريًا وقابلًا لاستبدال mock provider بمزود حقيقي لاحقًا.

### Access/QR Domain

المسؤوليات:

- توليد QR token موقّع.
- تخزين hash/JTI/expiry.
- التحقق من token والbooking window.
- إرسال unlock command عبر MQTT.
- تسجيل access_events.

### IoT Domain

المسؤوليات:

- device registry.
- MQTT commands للباب الذكي.
- telemetry ingestion للكهرباء وجودة الهواء.
- ACK handling.
- offline detection.
- incident creation.

وضعيات التشغيل:

- `MOCK_IOT`: بيانات وهمية ومحاكاة ACK/telemetry، مناسب للعرض أمام اللجنة.
- `MQTT_IOT`: تكامل MQTT حقيقي مع EMQX وأجهزة فعلية أو simulators.
- `EXTERNAL_IOT_API`: تكامل مع API متخصص يعطي بيانات الكهرباء/الهواء أو يتحكم بالأجهزة.

الأجهزة المطلوبة في نطاق المشروع:

- باب ذكي / Smart Door Lock.
- عداد كهرباء / Electricity Meter.
- حساس جودة الهواء / Air Quality Sensor.

أي أجهزة أخرى مثل occupancy sensor تعتبر تحسينًا اختياريًا وليست أساسية للنسخة الأولى.

### Audit Domain

المسؤوليات:

- audit triggers على الجداول المهمة.
- immutable append-only logs.
- actor context via `SET LOCAL app.current_user_id`.

### Jobs Domain

المسؤوليات:

- `jobs` table هو مصدر الحقيقة للمهام.
- `pg_cron` يشغل dispatcher.
- workers تستخدم `FOR UPDATE SKIP LOCKED`.
- كل job لها retry, max_attempts, last_error.

## 3. Database Tables

### `profiles`

يمثل user profile المرتبط بـ Supabase Auth.

Fields:

- `id uuid primary key references auth.users(id)`
- `email text not null`
- `full_name text not null`
- `role user_role not null default 'USER'`
- `is_active boolean not null default true`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`
- `deleted_at timestamptz null`

### `offices`

Fields:

- `id uuid primary key default gen_random_uuid()`
- `owner_id uuid not null references profiles(id)`
- `name text not null`
- `description text null`
- `building text not null`
- `floor text null`
- `room text null`
- `capacity int not null check (capacity > 0)`
- `hourly_rate_cents int not null check (hourly_rate_cents >= 0)`
- `currency text not null default 'USD'`
- `requires_approval boolean not null default true`
- `is_active boolean not null default true`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`
- `deleted_at timestamptz null`

### `operator_offices`

Fields:

- `operator_id uuid references profiles(id)`
- `office_id uuid references offices(id)`
- `created_at timestamptz default now()`
- primary key: `(operator_id, office_id)`

### `office_availability_rules`

Fields:

- `id uuid primary key default gen_random_uuid()`
- `office_id uuid not null references offices(id)`
- `day_of_week int not null check (day_of_week between 0 and 6)`
- `start_minute int not null check (start_minute between 0 and 1439)`
- `end_minute int not null check (end_minute between 1 and 1440)`
- `is_available boolean not null default true`
- `created_at timestamptz not null default now()`

### `bookings`

Fields:

- `id uuid primary key default gen_random_uuid()`
- `user_id uuid not null references profiles(id)`
- `office_id uuid not null references offices(id)`
- `status booking_status not null`
- `start_time timestamptz not null`
- `end_time timestamptz not null`
- `amount_cents int not null`
- `currency text not null`
- `idempotency_key uuid null`
- `degraded_mode boolean not null default false`
- `checked_in_at timestamptz null`
- `checked_out_at timestamptz null`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`
- `deleted_at timestamptz null`

Critical constraints:

```sql
CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE bookings
ADD CONSTRAINT bookings_valid_time
CHECK (start_time < end_time);

ALTER TABLE bookings
ADD CONSTRAINT no_overlapping_bookings
EXCLUDE USING GIST (
  office_id WITH =,
  tstzrange(start_time, end_time, '[)') WITH &&
)
WHERE (
  deleted_at IS NULL
  AND status NOT IN ('REJECTED', 'CANCELLED', 'EXPIRED', 'NO_SHOW', 'COMPLETED', 'REFUNDED')
);

CREATE UNIQUE INDEX bookings_user_idempotency_uidx
ON bookings(user_id, idempotency_key)
WHERE idempotency_key IS NOT NULL AND deleted_at IS NULL;
```

### `booking_status_transitions`

Fields:

- `from_status booking_status not null`
- `to_status booking_status not null`
- `allowed_actor_types actor_type[] not null`
- `allowed_roles user_role[] null`
- primary key `(from_status, to_status)`

### `payments`

Fields:

- `id uuid primary key default gen_random_uuid()`
- `booking_id uuid not null references bookings(id)`
- `gateway text not null`
- `gateway_payment_id text null`
- `status payment_status not null default 'PENDING'`
- `amount_cents int not null`
- `currency text not null`
- `paid_at timestamptz null`
- `refunded_at timestamptz null`
- `metadata jsonb not null default '{}'`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Constraints:

```sql
CREATE UNIQUE INDEX payments_gateway_payment_uidx
ON payments(gateway, gateway_payment_id)
WHERE gateway_payment_id IS NOT NULL;
```

### `webhook_events`

Fields:

- `id uuid primary key default gen_random_uuid()`
- `gateway text not null`
- `event_id text not null`
- `event_type text not null`
- `event_created_at timestamptz null`
- `payload jsonb not null`
- `signature_verified boolean not null`
- `received_at timestamptz not null default now()`
- `processed_at timestamptz null`
- `processing_error text null`

Constraint:

```sql
ALTER TABLE webhook_events
ADD CONSTRAINT webhook_events_gateway_event_unique
UNIQUE (gateway, event_id);
```

### `qr_tokens`

Fields:

- `id uuid primary key default gen_random_uuid()`
- `booking_id uuid not null references bookings(id)`
- `jti uuid not null unique`
- `token_hash text not null unique`
- `expires_at timestamptz not null`
- `used_at timestamptz null`
- `revoked_at timestamptz null`
- `created_at timestamptz not null default now()`

### `iot_devices`

Fields:

- `id uuid primary key default gen_random_uuid()`
- `office_id uuid not null references offices(id)`
- `device_key text not null unique`
- `device_type device_type not null`
- `name text not null`
- `status device_status not null default 'PROVISIONING'`
- `firmware_version text null`
- `last_seen_at timestamptz null`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`
- `deleted_at timestamptz null`

### `access_events`

Fields:

- `id uuid primary key default gen_random_uuid()`
- `booking_id uuid null references bookings(id)`
- `device_id uuid not null references iot_devices(id)`
- `actor_id uuid null references profiles(id)`
- `command_id uuid not null unique`
- `status access_event_status not null`
- `attempt int not null default 1`
- `reason text null`
- `requested_at timestamptz not null default now()`
- `acknowledged_at timestamptz null`
- `metadata jsonb not null default '{}'`

### `telemetry_events`

Fields:

- `id uuid primary key default gen_random_uuid()`
- `device_id uuid not null references iot_devices(id)`
- `event_type text not null`
- `payload jsonb not null`
- `observed_at timestamptz not null`
- `received_at timestamptz not null default now()`

### `device_state_snapshots`

Fields:

- `id uuid primary key default gen_random_uuid()`
- `device_id uuid not null references iot_devices(id)`
- `state jsonb not null`
- `observed_at timestamptz not null`
- `created_at timestamptz not null default now()`

### `jobs`

Fields:

- `id uuid primary key default gen_random_uuid()`
- `type text not null`
- `payload jsonb not null`
- `run_at timestamptz not null`
- `status job_status not null default 'PENDING'`
- `attempts int not null default 0`
- `max_attempts int not null default 3`
- `last_error text null`
- `locked_by text null`
- `locked_at timestamptz null`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Indexes:

```sql
CREATE INDEX idx_jobs_due
ON jobs(status, run_at)
WHERE status = 'PENDING';

CREATE INDEX idx_jobs_type
ON jobs(type);
```

### `audit_log`

Fields:

- `id uuid primary key default gen_random_uuid()`
- `occurred_at timestamptz not null default now()`
- `actor_id uuid null`
- `actor_type actor_type not null`
- `entity_type text not null`
- `entity_id uuid not null`
- `action text not null`
- `before_state jsonb null`
- `after_state jsonb null`
- `metadata jsonb not null default '{}'`

### `outbox_events`

Fields:

- `id uuid primary key default gen_random_uuid()`
- `event_type text not null`
- `aggregate_type text not null`
- `aggregate_id uuid not null`
- `version int not null default 1`
- `payload jsonb not null`
- `status text not null default 'PENDING'`
- `created_at timestamptz not null default now()`
- `published_at timestamptz null`
- `last_error text null`

## 4. Enums

```sql
CREATE TYPE user_role AS ENUM ('USER', 'OPERATOR', 'OWNER', 'ADMIN');

CREATE TYPE actor_type AS ENUM ('USER', 'SYSTEM', 'WEBHOOK', 'JOB', 'DEVICE');

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
  'REQUIRES_ACTION',
  'PAID',
  'FAILED',
  'CANCELLED',
  'REFUNDED',
  'PARTIALLY_REFUNDED',
  'DISPUTED'
);

CREATE TYPE job_status AS ENUM (
  'PENDING',
  'RUNNING',
  'COMPLETED',
  'FAILED',
  'CANCELLED',
  'DEAD_LETTER'
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
```

## 5. Booking State Machine

### Allowed Transitions

```sql
INSERT INTO booking_status_transitions
(from_status, to_status, allowed_actor_types, allowed_roles)
VALUES
('PENDING_APPROVAL', 'APPROVED', ARRAY['USER']::actor_type[], ARRAY['OWNER','OPERATOR','ADMIN']::user_role[]),
('PENDING_APPROVAL', 'REJECTED', ARRAY['USER']::actor_type[], ARRAY['OWNER','OPERATOR','ADMIN']::user_role[]),
('PENDING_APPROVAL', 'CANCELLED', ARRAY['USER']::actor_type[], ARRAY['USER','OWNER','ADMIN']::user_role[]),

('APPROVED', 'PAYMENT_PENDING', ARRAY['SYSTEM']::actor_type[], NULL),
('APPROVED', 'CANCELLED', ARRAY['USER']::actor_type[], ARRAY['USER','OWNER','ADMIN']::user_role[]),

('PAYMENT_PENDING', 'CONFIRMED', ARRAY['WEBHOOK','JOB','SYSTEM']::actor_type[], NULL),
('PAYMENT_PENDING', 'EXPIRED', ARRAY['JOB','SYSTEM']::actor_type[], NULL),
('PAYMENT_PENDING', 'CANCELLED', ARRAY['USER']::actor_type[], ARRAY['USER','OWNER','ADMIN']::user_role[]),

('CONFIRMED', 'CHECKED_IN', ARRAY['USER','SYSTEM','DEVICE']::actor_type[], ARRAY['USER','OPERATOR','ADMIN']::user_role[]),
('CONFIRMED', 'NO_SHOW', ARRAY['JOB','SYSTEM']::actor_type[], NULL),
('CONFIRMED', 'CANCELLED', ARRAY['USER']::actor_type[], ARRAY['USER','OWNER','ADMIN']::user_role[]),

('CHECKED_IN', 'CHECKED_OUT', ARRAY['USER','SYSTEM','DEVICE']::actor_type[], ARRAY['USER','OPERATOR','ADMIN']::user_role[]),
('CHECKED_IN', 'OVERSTAY', ARRAY['JOB','SYSTEM']::actor_type[], NULL),

('OVERSTAY', 'CHECKED_OUT', ARRAY['USER','SYSTEM','DEVICE']::actor_type[], ARRAY['OPERATOR','ADMIN']::user_role[]),
('CHECKED_OUT', 'COMPLETED', ARRAY['JOB','SYSTEM']::actor_type[], NULL),

('COMPLETED', 'REFUNDED', ARRAY['WEBHOOK','SYSTEM']::actor_type[], NULL),
('CANCELLED', 'REFUNDED', ARRAY['WEBHOOK','SYSTEM']::actor_type[], NULL);
```

### Transition Trigger Logic

Trigger name: `trg_validate_booking_transition`

Rules:

- Any `status` update must exist in `booking_status_transitions`.
- Actor context is read from transaction settings:
  - `app.current_user_id`
  - `app.current_actor_type`
  - `app.current_user_role`
- Invalid transition raises exception.
- This trigger is mandatory even if Edge Function validates first.

## 6. Audit Logic

### Transaction Context

Every Edge Function that writes must start transaction and run:

```sql
SELECT set_config('app.current_user_id', '<uuid-or-empty>', true);
SELECT set_config('app.current_actor_type', 'USER', true);
SELECT set_config('app.current_user_role', 'OWNER', true);
SELECT set_config('app.request_id', '<request-id>', true);
```

For jobs:

```sql
SELECT set_config('app.current_actor_type', 'JOB', true);
```

For webhooks:

```sql
SELECT set_config('app.current_actor_type', 'WEBHOOK', true);
```

### Audit Trigger

Tracked tables:

- `profiles`
- `offices`
- `operator_offices`
- `bookings`
- `payments`
- `webhook_events`
- `iot_devices`
- `access_events`
- `jobs`
- `qr_tokens`

Audit action mapping:

- INSERT -> `INSERT`
- UPDATE with same status -> `UPDATE`
- UPDATE with changed booking status -> `TRANSITION`
- Soft delete -> `SOFT_DELETE`

No direct update/delete on `audit_log`.

## 7. RLS Logic

### Helper Functions

All helper functions live in private schema and are `SECURITY DEFINER STABLE`.

```sql
private.current_profile_id() returns uuid
private.current_role() returns user_role
private.is_admin() returns boolean
private.is_owner_of_office(p_office_id uuid) returns boolean
private.is_operator_of_office(p_office_id uuid) returns boolean
private.can_access_booking(p_booking_id uuid) returns boolean
private.can_access_device(p_device_id uuid) returns boolean
```

### Policies

`offices`:

- USER can select active offices.
- OPERATOR can select assigned offices.
- OWNER can all actions on own offices.
- ADMIN can all.

`bookings`:

- USER can select/insert own bookings.
- USER can update own booking only through safe RPC, not raw table updates.
- OPERATOR can select/update assigned office bookings through RPC.
- OWNER can select/update own office bookings through RPC.
- ADMIN can all.

`payments`:

- USER can select own booking payments.
- OWNER can select own office payments.
- OPERATOR can select assigned office payments.
- Webhook writes via service role only.

`devices`:

- OWNER can manage devices in own offices.
- OPERATOR can read assigned devices.
- Device telemetry ingestion uses service role or dedicated function.

`audit_log`:

- USER sees own entity audit only if needed.
- OPERATOR sees assigned scope.
- OWNER sees own office scope.
- ADMIN sees all.
- No one updates/deletes.

## 8. RPC Contracts

### `create_booking_v1`

Inputs:

- `p_user_id uuid`
- `p_office_id uuid`
- `p_start_time timestamptz`
- `p_end_time timestamptz`
- `p_idempotency_key uuid`

Output:

```json
{
  "booking_id": "uuid",
  "status": "PENDING_APPROVAL",
  "amount_cents": 1200,
  "currency": "USD",
  "idempotent_replay": false
}
```

Logic:

1. If idempotency key exists for same user, return existing booking.
2. Validate office exists, active, not deleted.
3. Validate time range.
4. Validate office availability rules.
5. Calculate price.
6. If `requires_approval = true`, initial status `PENDING_APPROVAL`.
7. If `requires_approval = false`, initial status `APPROVED`, then schedule payment job or create payment row.
8. Insert booking.
9. Exclusion constraint prevents overlap.
10. Insert outbox event `booking.created.v1`.
11. Return booking.

### `approve_booking_v1`

Inputs:

- `p_actor_id uuid`
- `p_booking_id uuid`
- `p_note text`

Logic:

1. Check actor can approve booking.
2. Transition `PENDING_APPROVAL -> APPROVED`.
3. Create payment row with `PENDING`.
4. Transition `APPROVED -> PAYMENT_PENDING` as system actor inside same function or immediately after.
5. Insert job `EXPIRE_BOOKING` with `run_at = now() + interval '4 hours'`.
6. Insert outbox events:
   - `booking.approved.v1`
   - `booking.payment_pending.v1`

### `reject_booking_v1`

Logic:

1. Check owner/operator scope.
2. Transition `PENDING_APPROVAL -> REJECTED`.
3. Insert outbox event.
4. Notify user.

### `cancel_booking_v1`

Logic:

1. Check cancel permission.
2. Determine if refund required.
3. Transition to `CANCELLED`.
4. Cancel pending jobs for booking.
5. Revoke QR tokens.
6. If paid, insert refund request job or call payment gateway from Edge Function after DB commit.

### `apply_payment_webhook_v1`

Inputs:

- `p_gateway text`
- `p_event_id text`
- `p_event_type text`
- `p_event_created_at timestamptz`
- `p_payload jsonb`

Logic:

1. Insert into `webhook_events`.
2. On conflict, return `{ duplicate: true }`.
3. Load payment/booking referenced by gateway payload.
4. Reject stale event if older than current known payment event.
5. For payment success:
   - payment -> `PAID`
   - booking `PAYMENT_PENDING -> CONFIRMED`
   - cancel `EXPIRE_BOOKING`.
   - generate QR eligibility event, not token automatically unless chosen.
6. For failure:
   - payment -> `FAILED`
   - booking may remain `PAYMENT_PENDING` until expiry unless explicit failure rule says cancel/expired.
7. Set webhook `processed_at`.
8. Insert outbox events.

### `verify_qr_and_create_access_event_v1`

Inputs:

- `p_token_jti uuid`
- `p_token_hash text`
- `p_scanner_device_id uuid`

Logic:

1. Find active QR token.
2. Reject if expired, revoked, or used outside policy.
3. Load booking.
4. Require booking status `CONFIRMED` or `CHECKED_IN` depending action.
5. Require current time within allowed window:
   - default `start_time - 10 minutes` to `end_time + 5 minutes`.
6. Check scanner/device belongs to same office.
7. Insert access event `PENDING_ACK`.
8. Return command data for MQTT publish.

### `record_mqtt_ack_v1`

Inputs:

- `p_command_id uuid`
- `p_device_key text`
- `p_status text`
- `p_payload jsonb`

Logic:

1. Find access_event by command_id.
2. Ensure device matches.
3. Update access_event to `ACKED` or failure state.
4. If successful and booking is `CONFIRMED`, transition to `CHECKED_IN`.
5. Store device snapshot.
6. Insert outbox event.

## 9. Edge Functions

### `/auth/profile`

Method: `GET`

Logic:

1. Verify JWT.
2. Read profile from `profiles`.
3. Return role, permissions, assigned offices.

### `/bookings`

Method: `POST`

DTO:

```json
{
  "officeId": "uuid",
  "startTime": "2026-05-22T10:00:00.000Z",
  "endTime": "2026-05-22T12:00:00.000Z",
  "idempotencyKey": "uuid"
}
```

Logic:

1. Verify JWT.
2. Validate DTO with zod.
3. Call `create_booking_v1`.
4. If result is payment-ready, call payment function or return next action.
5. Return booking.

### `/payments/mock/create-session`

Method: `POST`

Purpose: إنشاء جلسة دفع وهمية للعرض أمام اللجنة.

DTO:

```json
{
  "bookingId": "uuid",
  "idempotencyKey": "uuid"
}
```

Logic:

1. Verify JWT.
2. Check user owns booking or has scoped owner/admin permission.
3. Booking must be `PAYMENT_PENDING`.
4. Create/update payment row with:
   - `gateway = 'MOCK'`
   - `status = 'PENDING'`
   - `metadata.demo = true`
5. Return mock payment session:

```json
{
  "paymentId": "uuid",
  "gateway": "MOCK",
  "checkoutUrl": "/checkout/mock?paymentId=uuid",
  "expiresAt": "2026-05-22T14:00:00.000Z"
}
```

### `/payments/mock/confirm`

Method: `POST`

Purpose: تأكيد الدفع الوهمي بدل webhook حقيقي.

DTO:

```json
{
  "paymentId": "uuid",
  "result": "SUCCESS"
}
```

Allowed results:

- `SUCCESS`
- `FAILED`
- `CANCELLED`

Logic:

1. Verify JWT.
2. In demo mode only, allow confirmation from the booking owner or admin.
3. Insert synthetic row in `webhook_events`:
   - `gateway = 'MOCK'`
   - `event_id = 'mock_' || gen_random_uuid()`
   - `event_type = 'payment.succeeded'` or equivalent.
   - `signature_verified = true`.
4. Call the same payment application logic used by real webhooks.
5. If success:
   - payment -> `PAID`
   - booking `PAYMENT_PENDING -> CONFIRMED`
   - cancel expiry job
   - emit `payment.succeeded.v1` and `booking.confirmed.v1`
6. Return updated booking/payment.

Important:

- لا نكتب منطق منفصل يختصر الـ state machine.
- حتى الدفع الوهمي يجب أن يمر على نفس transitions حتى يكون الدفاع أمام اللجنة قويًا.

### `/bookings/:id/approve`

Method: `POST`

Logic:

1. Verify JWT.
2. Check role owner/operator/admin.
3. Call `approve_booking_v1`.
4. Create payment session via gateway outside DB transaction.
5. Update payment with gateway session ID using RPC.
6. Return payment URL/client secret.

### `/payments/webhook`

Method: `POST`

Logic:

1. Read raw body.
2. Verify gateway signature before parsing business logic.
3. Call `apply_payment_webhook_v1`.
4. Return 200 for duplicate valid event.
5. Return 401 for invalid signature.

### `/qr/generate`

Method: `POST`

Logic:

1. Verify JWT.
2. Check booking ownership/scope.
3. Booking must be `CONFIRMED`.
4. Generate signed token with:
   - `jti`
   - `booking_id`
   - `office_id`
   - `sub`
   - `iat`
   - `exp`
5. Store `sha256(token)` and `jti`.
6. Return token.

### `/qr/verify`

Method: `POST`

Logic:

1. Verify scanner/operator JWT or kiosk secret.
2. Verify QR signature.
3. Hash token and call `verify_qr_and_create_access_event_v1`.
4. Publish MQTT unlock command.
5. Return pending access event.

### `/devices/mqtt-ack`

Usually not public HTTP if MQTT bridge is implemented as Edge Function or worker. If HTTP bridge is used:

1. Verify broker signature/API key.
2. Validate payload.
3. Call `record_mqtt_ack_v1`.

### `/iot/mock/door/unlock`

Method: `POST`

Purpose: محاكاة فتح الباب في نسخة اللجنة بدون جهاز فعلي.

DTO:

```json
{
  "bookingId": "uuid",
  "deviceId": "uuid",
  "simulate": "ACKED"
}
```

Allowed simulate values:

- `ACKED`
- `NO_ACK`
- `DENIED`

Logic:

1. Verify JWT.
2. Check booking access permission.
3. Create `access_events` row with `PENDING_ACK`.
4. If `ACKED`, call `record_mqtt_ack_v1` immediately with simulated payload.
5. If `NO_ACK`, create retry jobs exactly like real MQTT failure path.
6. If `DENIED`, mark access event denied and emit event.

### `/iot/mock/telemetry`

Method: `POST`

Purpose: توليد أو استقبال بيانات وهمية للكهرباء والهواء.

DTO:

```json
{
  "officeId": "uuid",
  "deviceType": "AIR_QUALITY_SENSOR",
  "mode": "GENERATE_SAMPLE"
}
```

Allowed device types:

- `AIR_QUALITY_SENSOR`
- `ELECTRICITY_METER`

Logic:

1. Verify JWT as owner/operator/admin.
2. Select device for the office.
3. Generate realistic sample payload:
   - air: CO2, PM2.5, temperature, humidity.
   - electricity: kWh, current watts, voltage, estimated cost.
4. Insert into `telemetry_events`.
5. Update `device_state_snapshots`.
6. Emit realtime event.

## 10. Job Logic

### Dispatcher

Runs every minute via `pg_cron`.

```sql
SELECT cron.schedule(
  'flexispace-job-dispatcher',
  '* * * * *',
  'SELECT dispatch_due_jobs();'
);
```

`dispatch_due_jobs()`:

1. Select due jobs:

```sql
SELECT *
FROM jobs
WHERE status = 'PENDING'
  AND run_at <= now()
ORDER BY run_at
LIMIT 10
FOR UPDATE SKIP LOCKED;
```

2. Mark `RUNNING`.
3. Execute by type.
4. On success mark `COMPLETED`.
5. On failure:
   - increment attempts.
   - if attempts < max, set `PENDING` with next retry `run_at`.
   - else `DEAD_LETTER`.

### Job Types

#### `EXPIRE_BOOKING`

Payload:

```json
{ "booking_id": "uuid" }
```

Logic:

- If booking is still `PAYMENT_PENDING`, transition to `EXPIRED`.
- Cancel payment session if gateway supports it.
- Emit `booking.expired.v1`.

#### `PAYMENT_RECONCILIATION`

Payload:

```json
{ "payment_id": "uuid" }
```

Logic:

- Poll gateway.
- Compare gateway status with local projection.
- Apply missing success/failure/refund event.
- Flag incident if impossible state appears.

#### `NO_SHOW_SCAN`

Logic:

- At `start_time + 30 minutes`, if booking is `CONFIRMED` and no access ACK/check-in:
  - transition to `NO_SHOW`.
  - release slot.
  - notify user/operator.

#### `OVERSTAY_SCAN`

Logic:

- If booking is `CHECKED_IN` and `end_time + 5 minutes < now()`:
  - transition to `OVERSTAY`.
  - notify operator.
  - optional overtime payment job.

#### `DEVICE_OFFLINE_SCAN`

Logic:

- If `last_seen_at < now() - interval '90 seconds'`, mark device `OFFLINE`.
- Create incident if device is critical for upcoming booking.

#### `IOT_UNLOCK_RETRY`

Logic:

- If access event is `PENDING_ACK` and attempt < 4:
  - publish same command or new signed command with same command_id/correlation.
  - increment attempt.
- If attempt = 4:
  - mark `FAILED_NO_ACK`.
  - create incident.
  - notify operator.
  - set booking `degraded_mode = true`.

## 11. MQTT Contracts

### Topics

```text
flexispace/v1/offices/{office_id}/devices/{device_key}/commands
flexispace/v1/offices/{office_id}/devices/{device_key}/acks
flexispace/v1/offices/{office_id}/devices/{device_key}/telemetry
flexispace/v1/offices/{office_id}/devices/{device_key}/heartbeat
```

### Unlock Command

```json
{
  "schema": "flexispace.iot.command.unlock.v1",
  "commandId": "uuid",
  "issuedAt": "2026-05-22T10:00:00.000Z",
  "expiresAt": "2026-05-22T10:00:10.000Z",
  "officeId": "uuid",
  "deviceKey": "lock-101",
  "bookingId": "uuid",
  "actorId": "uuid",
  "signature": "base64url-hmac"
}
```

### ACK

```json
{
  "schema": "flexispace.iot.ack.v1",
  "commandId": "uuid",
  "deviceKey": "lock-101",
  "status": "ACKED",
  "observedAt": "2026-05-22T10:00:02.000Z",
  "metadata": {
    "lockState": "UNLOCKED",
    "battery": 82
  }
}
```

### Telemetry

```json
{
  "schema": "flexispace.iot.telemetry.v1",
  "eventId": "uuid",
  "deviceKey": "air-101",
  "eventType": "AIR_QUALITY",
  "observedAt": "2026-05-22T10:00:00.000Z",
  "payload": {
    "co2": 620,
    "pm25": 4.2,
    "temperatureC": 22.4
  }
}
```

## 12. Event Contracts

All events:

```json
{
  "eventId": "uuid",
  "eventType": "booking.confirmed.v1",
  "aggregateType": "booking",
  "aggregateId": "uuid",
  "occurredAt": "2026-05-22T10:00:00.000Z",
  "actor": {
    "type": "WEBHOOK",
    "id": null
  },
  "payload": {}
}
```

Required event names:

- `booking.created.v1`
- `booking.approved.v1`
- `booking.rejected.v1`
- `booking.payment_pending.v1`
- `booking.confirmed.v1`
- `booking.cancelled.v1`
- `booking.expired.v1`
- `booking.no_show.v1`
- `booking.checked_in.v1`
- `booking.checked_out.v1`
- `booking.overstay.v1`
- `booking.completed.v1`
- `payment.intent_created.v1`
- `payment.succeeded.v1`
- `payment.failed.v1`
- `payment.refunded.v1`
- `qr.generated.v1`
- `access.unlock_requested.v1`
- `access.unlock_acknowledged.v1`
- `access.unlock_failed.v1`
- `device.telemetry_received.v1`
- `device.offline.v1`
- `incident.created.v1`

## 13. Realtime Logic

Realtime is based on Supabase Realtime.

Tables exposed carefully:

- `bookings`
- `payments`
- `iot_devices`
- `access_events`
- `notifications`
- `incidents`

Client channels:

- `user:{user_id}`
- `office:{office_id}`
- `operator:{operator_id}`
- `owner:{owner_id}`

Realtime rules:

- RLS must apply to realtime publications.
- Client never receives rows outside its permissions.
- After reconnect, frontend must resync via REST/RPC using `updated_at`.
- Realtime is not source of truth.

## 14. Payment Logic

### Demo Payment Mode

في نسخة اللجنة، الدفع سيكون وهميًا:

- `gateway = 'MOCK'`.
- لا يوجد اتصال فعلي مع Stripe/PayTabs.
- لا توجد أسرار دفع حقيقية.
- لا يتم تخزين بيانات بطاقات.
- يتم استخدام شاشة checkout وهمية في الواجهة.
- التأكيد يتم عبر `/payments/mock/confirm`.

لكن من ناحية المعمارية:

- نحافظ على `payments`.
- نحافظ على `webhook_events`.
- نحافظ على idempotency.
- نحافظ على reconciliation logic بشكل simulated.
- نحافظ على نفس booking transitions.

هذا يسمح بشرح أن المشروع demo-safe أمام اللجنة، لكنه قابل للترقية إلى Stripe/PayTabs لاحقًا بدون إعادة بناء الدومين.

### Create Payment Session

Flow:

1. Booking approved.
2. Payment row created as `PENDING`.
3. In demo mode, Edge Function creates mock session.
4. Edge Function updates payment with mock `gateway_payment_id`.
5. Client completes mock payment screen.
6. Mock confirm endpoint creates a synthetic webhook event and applies the same payment result logic.

### Webhook Idempotency

Rules:

- Signature verification before DB mutation for real gateways.
- For `MOCK`, synthetic events are accepted only from trusted Edge Function logic in demo mode.
- Insert `webhook_events`.
- Duplicate event returns 200 and does nothing.
- Out-of-order event rejected or ignored based on gateway timestamp.
- Local payment state updates only through webhook/reconciliation logic.

### Reconciliation

Runs every 15 minutes in production mode. In demo mode it can run as simulated reconciliation:

- Find payments in `PENDING` or `REQUIRES_ACTION`.
- Poll gateway if real provider exists, or read mock status if demo mode.
- If gateway says paid and local is pending:
  - apply success.
- If gateway says failed/cancelled:
  - apply failure.
- If local expired but gateway paid later:
  - do not auto-revive.
  - create incident.
  - refund or manual review based on policy.

## 15. QR Access Logic

### Token Claims

```json
{
  "iss": "flexispace",
  "aud": "flexispace-access",
  "sub": "user_id",
  "booking_id": "uuid",
  "office_id": "uuid",
  "jti": "uuid",
  "iat": 1779450000,
  "exp": 1779453600
}
```

Rules:

- Token signed with server secret/private key.
- Store only hash, never raw token.
- Token tied to booking and user.
- Token invalid if booking cancelled/expired/no-show/refunded.
- Token invalid outside access window.
- Token can be single-use or reusable during booking window; choose policy before coding.

Conservative assumption:

- QR token is reusable only during booking window.
- Each scan creates `access_events`.
- Replay outside window denied.

## 16. Security Checklist

- Supabase Auth JWT verification in every Edge Function.
- RLS enabled on all tenant-scoped tables.
- Service role used only inside trusted Edge Functions.
- HMAC verification for real payment webhooks; mock payment events are generated only by trusted Edge Functions in demo mode.
- HMAC/mTLS or broker credentials for MQTT devices.
- Signed QR tokens only.
- Audit triggers cannot be bypassed by normal users.
- No hard deletes.
- Rate limits:
  - login/register
  - booking creation
  - QR verify
  - unlock commands
  - webhook endpoint
- Store secrets in Supabase secrets, not code.
- Use request ID in logs and audit metadata.

## 17. Implementation Order

1. Create enums.
2. Create core tables.
3. Create helper functions.
4. Enable RLS and policies.
5. Create audit trigger.
6. Create booking exclusion constraint.
7. Create booking state transition table and trigger.
8. Create RPCs:
   - `create_booking_v1`
   - `approve_booking_v1`
   - `reject_booking_v1`
   - `cancel_booking_v1`
   - `apply_payment_webhook_v1`
   - `verify_qr_and_create_access_event_v1`
   - `record_mqtt_ack_v1`
9. Create jobs dispatcher.
10. Create Edge Functions.
11. Wire mock payment provider for committee demo.
12. Wire mock IoT first, then MQTT/API provider if needed.
13. Enable realtime publications.
14. Add integration tests.

## 18. Tests Required Before Defense

### Database Tests

- Two concurrent overlapping bookings: one must fail.
- Back-to-back bookings: both must pass.
- Invalid state transition: must fail.
- Valid state transition: must pass.
- Audit row created on insert/update/transition.
- Hard delete blocked.
- RLS prevents cross-tenant reads.

### Edge Function Tests

- Create booking with valid input.
- Create booking duplicate idempotency key.
- Approve booking as owner.
- Reject booking as unauthorized user.
- Payment webhook duplicate event.
- Payment webhook invalid signature.
- QR generate for confirmed booking.
- QR verify expired token.

### IoT Tests

- Unlock command creates pending access event.
- ACK updates access event.
- Missing ACK retries 4 times.
- Missing ACK creates incident and degraded mode.
- Telemetry updates latest snapshot.
- Offline scan marks device offline.

### Job Tests

- Payment pending expires after 4 hours.
- No-show transitions after policy window.
- Overstay detection works.
- Reconciliation catches missed webhook.

## 19. Open Clarifications

هذه النقاط فقط تحتاج قرار منك قبل التكويد:

1. هل كل الحجوزات تحتاج موافقة owner، أم يوجد `requires_approval=false` لبعض المكاتب؟
2. هل QR token single-use أم reusable خلال مدة الحجز؟
3. هل unlock يتم من QR scan فقط أم يوجد زر unlock داخل التطبيق أيضًا؟
4. هل وضع IoT الأول سيكون `MOCK_IOT` بالكامل، أم نستخدم API خارجي متخصص للكهرباء/الهواء؟
5. إذا استخدمنا MQTT لاحقًا: هل MQTT bridge سيكون Edge Function/Worker خارجي أم integration عبر EMQX webhook؟
6. ما مدة السماح:
   - قبل بداية الحجز للدخول؟
   - بعد نهاية الحجز للخروج؟
   - قبل اعتبار المستخدم no-show؟

## 20. Final Backend Logic Position

المنطق الآن جاهز كخريطة تنفيذ قبل التكويد.  
الخطوة التالية ليست إعادة تصميم، بل تحويل هذه الوثيقة إلى migrations وEdge Functions وRPCs بنفس الترتيب الموجود في قسم Implementation Order.
