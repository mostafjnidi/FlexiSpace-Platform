# FlexiSpace Backend Implementation Blueprint

Project: FlexiSpace - Smart Office Booking Platform with IoT Integration  
Prepared from: `FlexiSpace_Backend_Blueprint.docx`, `FlexiSpace_Professional_Backend_Blueprint.docx`, and supplied architecture diagrams  
Date: 2026-05-22

## 0. ADR Consistency Validation

### Source Comparison Result

The two Word documents and the supplied diagram are broadly consistent with each other for a Supabase-first architecture:

- API runtime: Supabase Edge Functions.
- Database: PostgreSQL/Supabase is the source of truth.
- Auth: Supabase Auth JWTs, RLS, helper functions, and service role execution.
- Background work: Postgres `jobs` table plus `pg_cron`, not Redis.
- Realtime: Supabase Realtime/logical replication.
- IoT: MQTT broker, smart locks, sensors, telemetry, command ACKs.
- Critical invariants: exclusion constraints, trigger-enforced state machine, immutable audit logging, idempotent webhooks.

### Blocking Conflicts Introduced by the Requested Target Stack

These conflicts must be resolved before coding a production backend.

| Area | Architecture Documents / Diagram | Requested Stack | Conflict |
|---|---|---|---|
| API runtime | Supabase Edge Functions running Deno | Node.js + TypeScript, Express or NestJS | Direct runtime/platform conflict |
| ORM/data access | SQL/RPC-first, database invariants, Supabase Auth/RLS | Prisma ORM | Prisma can coexist only if DB constraints/triggers remain in raw SQL migrations |
| Background jobs | `jobs` table + `pg_cron`; ADR says "No Redis" | Redis + BullMQ | Direct ADR-007 conflict |
| Realtime | Supabase Realtime/WebSocket | Custom WebSocket architecture | Needs explicit replacement or adapter decision |
| Auth | Supabase Auth `auth.users`, RLS helpers with `auth.uid()` | JWT authentication | JWT is compatible only if issuer/claims are clarified; non-Supabase JWT changes RLS assumptions |
| Deployment | Supabase Edge Functions, Supabase DB, Cloudflare, EMQX | Node/Nest service deployment | Deployment topology changes |

### Conservative Resolution

Because the user explicitly requires Node.js, TypeScript, PostgreSQL, Prisma, Redis, MQTT, BullMQ, JWT, RBAC, and event-driven architecture, this plan uses:

- NestJS over Express because the documented system is service-heavy, role-guarded, event-driven, and production-oriented.
- PostgreSQL remains the source of truth.
- Prisma is used for typed application access, but all invariants Prisma cannot model are implemented by raw SQL migrations.
- Redis/BullMQ are used for delayed execution and retries only after recording every job in PostgreSQL; PostgreSQL keeps the durable job/audit record.
- MQTT remains the IoT command/telemetry transport.
- JWT remains mandatory, with claims mapped to RBAC and database session variables.

This is not strictly identical to the Supabase ADR baseline. It is a Node/NestJS implementation binding of the same domain rules and requires ADR amendments for runtime, queue, realtime, and auth provider choices.

## 1. Gap Analysis

### What Already Exists

From the architecture documents and diagram:

- Domain model: users, roles, offices, bookings, payments, webhook events, devices, telemetry, access events, audit logs, jobs, notifications, QR tokens.
- Booking invariant: no overlapping non-terminal bookings for the same office.
- Booking lifecycle: state machine with pending approval, approved, payment pending, confirmed, checked in, checked out, completed, cancelled, expired, no-show, overstay, rejected, refunded.
- Payment strategy: gateway is source of truth; webhook deduplication; reconciliation job.
- Audit strategy: append-only audit log with before/after snapshots and actor metadata.
- IoT strategy: MQTT broker, device commands, telemetry events, retry/ACK handling, incidents on failure.
- RBAC: user, operator, owner permissions.
- Realtime: booking/payment/device status updates.
- Deployment shape: CDN/WAF, API/backend, PostgreSQL, MQTT broker, monitoring, external services.

The local repository currently contains a React/Vite frontend and Supabase config. It does not contain a Node/Nest backend implementation.

### What Is Missing

- Concrete Node/NestJS backend folder structure.
- Prisma schema and raw SQL migration plan.
- Full REST API contracts beyond the small list in the addendum.
- DTO validation contracts and error response shape.
- JWT issuer, token claims, refresh-token model, and revocation rules.
- RBAC guard implementation details.
- Database trigger bodies for soft delete, audit, state machine, timestamp enforcement, QR token revocation, and payment idempotency.
- Event contracts with versioning and idempotency keys.
- BullMQ queue naming, payloads, retry/backoff, dedupe strategy, and dead-letter handling.
- MQTT topic naming, QoS, payload schema, command correlation, ACK/retry policy.
- WebSocket gateway rooms, authorization, event names, and delivery semantics.
- Observability standards: correlation IDs, logs, metrics, traces, dashboards, alerts.
- Production hardening: rate limits, secret rotation, migration gates, backups, PITR, load tests, threat model.

### What Is Ambiguous

- Whether Supabase must remain the backend runtime or may be replaced by a Node/Nest service.
- Whether Redis/BullMQ supersedes or augments the documented `jobs` table + `pg_cron`.
- Payment provider: diagram mentions Stripe/PayTabs; final provider must be chosen or abstracted.
- QR flow: token TTL, offline behavior, kiosk scanner identity, and replay handling.
- Office approval rules: which offices require owner approval versus automatic approval.
- Operator assignment model: per office, per floor/building, time-shift based, or organization-wide.
- Pricing model: hourly, daily, discounts, cancellation/refund fees, overstay billing.
- Multi-tenancy model: one owner per office versus organization/team ownership.
- IoT device provisioning: certificate auth, shared secrets, EMQX ACLs, device registry lifecycle.
- Realtime durability: whether missed WebSocket events are replayable via event log.

### What Must Be Clarified Before Coding

1. Approve either the original Supabase/Deno architecture or the requested Node/NestJS architecture.
2. If Node/NestJS is approved, approve amended ADR-007 allowing Redis/BullMQ while keeping PostgreSQL as durable job source.
3. Confirm the JWT issuer: Supabase Auth, custom Nest auth, Auth0/Clerk, or another provider.
4. Confirm the payment gateway: Stripe, PayTabs, or both through a provider interface.
5. Confirm whether owner approval is required for all bookings or only configurable offices.
6. Confirm QR token TTL and whether QR can be used only inside the booking time window.
7. Confirm IoT MQTT security mode: mTLS certificates, username/password per device, or broker-issued credentials.

## 2. Final Backend Implementation Plan

### Architecture Choice

Use NestJS as a modular monolith:

- `AuthModule`
- `UsersModule`
- `OfficesModule`
- `BookingsModule`
- `PaymentsModule`
- `DevicesModule`
- `AccessModule`
- `TelemetryModule`
- `NotificationsModule`
- `RealtimeModule`
- `QueueModule`
- `EventsModule`
- `AuditModule`
- `ReportsModule`
- `HealthModule`

Database remains the authority. Application services orchestrate; PostgreSQL enforces invariants.

## A. Full Backend Folder Structure

```text
backend/
  package.json
  tsconfig.json
  nest-cli.json
  Dockerfile
  docker-compose.yml
  .env.example
  prisma/
    schema.prisma
    migrations/
      0001_init/
        migration.sql
      0002_constraints_triggers/
        migration.sql
      0003_seed_state_machine/
        migration.sql
    seed.ts
  src/
    main.ts
    app.module.ts
    config/
      env.schema.ts
      app.config.ts
      database.config.ts
      jwt.config.ts
      mqtt.config.ts
      queue.config.ts
    common/
      decorators/
        current-user.decorator.ts
        roles.decorator.ts
        request-id.decorator.ts
      filters/
        http-exception.filter.ts
        prisma-exception.filter.ts
      guards/
        jwt-auth.guard.ts
        roles.guard.ts
        office-access.guard.ts
      interceptors/
        audit-context.interceptor.ts
        response-envelope.interceptor.ts
        request-id.interceptor.ts
      pipes/
        zod-validation.pipe.ts
      types/
        actor.type.ts
        api-response.type.ts
      utils/
        utc.ts
        idempotency.ts
        crypto.ts
    prisma/
      prisma.module.ts
      prisma.service.ts
      tx-context.ts
    auth/
      auth.module.ts
      auth.controller.ts
      auth.service.ts
      dto/
      strategies/
    users/
    offices/
    bookings/
      bookings.controller.ts
      bookings.service.ts
      booking-state.service.ts
      booking-pricing.service.ts
      dto/
      events/
    payments/
      payments.controller.ts
      payments.service.ts
      payment-provider.interface.ts
      providers/stripe.provider.ts
      providers/paytabs.provider.ts
      dto/
    devices/
      devices.controller.ts
      devices.service.ts
      mqtt/
        mqtt.module.ts
        mqtt.service.ts
        mqtt-contracts.ts
      dto/
    access/
      access.controller.ts
      access.service.ts
      qr-token.service.ts
      dto/
    telemetry/
    notifications/
    realtime/
      realtime.gateway.ts
      realtime-auth.guard.ts
    queues/
      queue.module.ts
      queue.constants.ts
      processors/
        booking-expiry.processor.ts
        payment-reconciliation.processor.ts
        reminder.processor.ts
        iot-command-retry.processor.ts
        telemetry-rollup.processor.ts
    events/
      domain-event.interface.ts
      event-bus.service.ts
      outbox.publisher.ts
    audit/
    reports/
    health/
  test/
    unit/
    integration/
    e2e/
```

## B. Database Schema

Core tables:

- `users`: authenticated people; role is `USER`, `OPERATOR`, `OWNER`, `ADMIN`.
- `refresh_tokens`: hashed refresh tokens, rotation and revocation.
- `offices`: bookable spaces, ownership, location, capacity, pricing, approval policy.
- `operator_offices`: assignment table for operators.
- `office_availability_rules`: weekly business hours and blackout windows.
- `bookings`: stateful reservations with time range, status, QR/payment refs.
- `booking_status_transitions`: allowed state transitions.
- `payments`: payment projection linked to booking.
- `webhook_events`: idempotent gateway event ledger.
- `qr_tokens`: signed access token ledger and revocation state.
- `iot_devices`: smart locks, sensors, meters.
- `device_state_snapshots`: latest observed reality per device.
- `telemetry_events`: raw IoT events.
- `telemetry_hourly_rollups`: reporting data.
- `access_events`: unlock attempts, ACKs, manual override, failures.
- `jobs`: durable record for async work even when BullMQ executes it.
- `outbox_events`: domain events waiting to be published.
- `audit_logs`: append-only before/after snapshots.
- `notifications`: push/email/SMS/in-app notification records.
- `incidents`: operator-visible operational failures.

Mandatory raw SQL constraints/triggers:

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE bookings
ADD CONSTRAINT bookings_valid_time CHECK (start_time < end_time);

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

CREATE UNIQUE INDEX webhook_events_gateway_event_uidx
ON webhook_events(gateway, event_id);

CREATE UNIQUE INDEX payments_gateway_intent_uidx
ON payments(gateway, gateway_payment_id)
WHERE gateway_payment_id IS NOT NULL;

CREATE UNIQUE INDEX bookings_idempotency_uidx
ON bookings(user_id, idempotency_key)
WHERE deleted_at IS NULL AND idempotency_key IS NOT NULL;
```

State-machine seed data:

```sql
INSERT INTO booking_status_transitions (from_status, to_status, actor_roles) VALUES
('PENDING_APPROVAL', 'APPROVED', ARRAY['OWNER','OPERATOR','ADMIN']),
('PENDING_APPROVAL', 'REJECTED', ARRAY['OWNER','OPERATOR','ADMIN']),
('PENDING_APPROVAL', 'CANCELLED', ARRAY['USER','OWNER','ADMIN']),
('APPROVED', 'PAYMENT_PENDING', ARRAY['SYSTEM','ADMIN']),
('APPROVED', 'CANCELLED', ARRAY['USER','OWNER','ADMIN']),
('PAYMENT_PENDING', 'CONFIRMED', ARRAY['WEBHOOK','JOB','ADMIN']),
('PAYMENT_PENDING', 'EXPIRED', ARRAY['JOB','ADMIN']),
('PAYMENT_PENDING', 'CANCELLED', ARRAY['USER','OWNER','ADMIN']),
('CONFIRMED', 'CHECKED_IN', ARRAY['USER','OPERATOR','SYSTEM','ADMIN']),
('CONFIRMED', 'NO_SHOW', ARRAY['JOB','ADMIN']),
('CONFIRMED', 'CANCELLED', ARRAY['USER','OWNER','ADMIN']),
('CHECKED_IN', 'CHECKED_OUT', ARRAY['USER','OPERATOR','SYSTEM','ADMIN']),
('CHECKED_IN', 'OVERSTAY', ARRAY['JOB','OPERATOR','ADMIN']),
('OVERSTAY', 'CHECKED_OUT', ARRAY['OPERATOR','SYSTEM','ADMIN']),
('CHECKED_OUT', 'COMPLETED', ARRAY['SYSTEM','OPERATOR','ADMIN']),
('COMPLETED', 'REFUNDED', ARRAY['WEBHOOK','ADMIN']),
('CANCELLED', 'REFUNDED', ARRAY['WEBHOOK','ADMIN']);
```

Transition trigger:

```sql
CREATE OR REPLACE FUNCTION validate_booking_transition()
RETURNS TRIGGER AS $$
DECLARE
  actor_role text := current_setting('app.current_actor_role', true);
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    IF NOT EXISTS (
      SELECT 1
      FROM booking_status_transitions
      WHERE from_status = OLD.status
        AND to_status = NEW.status
        AND actor_role = ANY(actor_roles::text[])
    ) THEN
      RAISE EXCEPTION 'invalid_booking_transition: % -> % by %',
        OLD.status, NEW.status, actor_role
        USING ERRCODE = 'P0001';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_booking_transition
BEFORE UPDATE OF status ON bookings
FOR EACH ROW
EXECUTE FUNCTION validate_booking_transition();
```

Audit trigger:

```sql
CREATE OR REPLACE FUNCTION audit_row_change()
RETURNS TRIGGER AS $$
DECLARE
  actor_id uuid := NULLIF(current_setting('app.current_user_id', true), '')::uuid;
  actor_type text := COALESCE(NULLIF(current_setting('app.current_actor_type', true), ''), 'SYSTEM');
  req_id text := current_setting('app.request_id', true);
BEGIN
  INSERT INTO audit_logs (
    actor_id, actor_type, entity_type, entity_id, action,
    before_state, after_state, metadata
  ) VALUES (
    actor_id,
    actor_type::actor_type,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    TG_OP,
    CASE WHEN TG_OP IN ('UPDATE','DELETE') THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT','UPDATE') THEN to_jsonb(NEW) ELSE NULL END,
    jsonb_build_object('requestId', req_id)
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

Soft-delete enforcement:

```sql
CREATE OR REPLACE FUNCTION prevent_hard_delete()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'hard_delete_forbidden: use deleted_at soft delete';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_prevent_booking_delete
BEFORE DELETE ON bookings
FOR EACH ROW EXECUTE FUNCTION prevent_hard_delete();
```

## C. Complete Prisma Schema

Prisma cannot express PostgreSQL exclusion constraints, triggers, partial indexes, or `tstzrange`; those must live in SQL migrations. The Prisma schema below is the typed application model.

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum UserRole { USER OPERATOR OWNER ADMIN }
enum ActorType { USER SYSTEM WEBHOOK JOB DEVICE }
enum BookingStatus {
  PENDING_APPROVAL
  APPROVED
  PAYMENT_PENDING
  CONFIRMED
  CHECKED_IN
  CHECKED_OUT
  COMPLETED
  REJECTED
  CANCELLED
  EXPIRED
  NO_SHOW
  OVERSTAY
  REFUNDED
}
enum PaymentStatus { PENDING REQUIRES_ACTION PAID FAILED CANCELLED REFUNDED PARTIALLY_REFUNDED DISPUTED }
enum PaymentGateway { STRIPE PAYTABS }
enum DeviceType { SMART_LOCK AIR_QUALITY_SENSOR ELECTRICITY_METER OCCUPANCY_SENSOR }
enum DeviceStatus { PROVISIONING ONLINE OFFLINE DEGRADED RETIRED }
enum AccessEventStatus { PENDING_ACK ACKED FAILED_NO_ACK DENIED MANUAL_OVERRIDE REVOKED }
enum JobStatus { PENDING RUNNING COMPLETED FAILED CANCELLED DEAD_LETTER }
enum NotificationChannel { EMAIL SMS PUSH IN_APP }
enum NotificationStatus { PENDING SENT FAILED CANCELLED }
enum IncidentStatus { OPEN ACKNOWLEDGED RESOLVED CANCELLED }
enum DomainEventStatus { PENDING PUBLISHED FAILED }

model User {
  id             String    @id @default(uuid()) @db.Uuid
  email          String    @unique
  passwordHash   String?   @map("password_hash")
  fullName       String    @map("full_name")
  role           UserRole  @default(USER)
  isActive       Boolean   @default(true) @map("is_active")
  createdAt      DateTime  @default(now()) @map("created_at") @db.Timestamptz(6)
  updatedAt      DateTime  @updatedAt @map("updated_at") @db.Timestamptz(6)
  deletedAt      DateTime? @map("deleted_at") @db.Timestamptz(6)

  ownedOffices   Office[]  @relation("OfficeOwner")
  bookings       Booking[]
  refreshTokens  RefreshToken[]
  operatorOffices OperatorOffice[]

  @@map("users")
}

model RefreshToken {
  id         String    @id @default(uuid()) @db.Uuid
  userId     String    @map("user_id") @db.Uuid
  tokenHash  String    @map("token_hash")
  expiresAt  DateTime  @map("expires_at") @db.Timestamptz(6)
  revokedAt  DateTime? @map("revoked_at") @db.Timestamptz(6)
  createdAt  DateTime  @default(now()) @map("created_at") @db.Timestamptz(6)
  user       User      @relation(fields: [userId], references: [id])

  @@index([userId])
  @@map("refresh_tokens")
}

model Office {
  id               String    @id @default(uuid()) @db.Uuid
  ownerId          String    @map("owner_id") @db.Uuid
  name             String
  description      String?
  building         String
  floor            String?
  room             String?
  capacity         Int
  timezone         String    @default("UTC")
  hourlyRateCents  Int       @map("hourly_rate_cents")
  currency         String    @default("USD")
  requiresApproval Boolean   @default(true) @map("requires_approval")
  isActive         Boolean   @default(true) @map("is_active")
  createdAt        DateTime  @default(now()) @map("created_at") @db.Timestamptz(6)
  updatedAt        DateTime  @updatedAt @map("updated_at") @db.Timestamptz(6)
  deletedAt        DateTime? @map("deleted_at") @db.Timestamptz(6)

  owner             User       @relation("OfficeOwner", fields: [ownerId], references: [id])
  bookings          Booking[]
  devices           IoTDevice[]
  operatorOffices   OperatorOffice[]
  availabilityRules OfficeAvailabilityRule[]

  @@index([ownerId])
  @@map("offices")
}

model OperatorOffice {
  operatorId String   @map("operator_id") @db.Uuid
  officeId   String   @map("office_id") @db.Uuid
  createdAt  DateTime @default(now()) @map("created_at") @db.Timestamptz(6)

  operator User   @relation(fields: [operatorId], references: [id])
  office   Office @relation(fields: [officeId], references: [id])

  @@id([operatorId, officeId])
  @@map("operator_offices")
}

model OfficeAvailabilityRule {
  id          String    @id @default(uuid()) @db.Uuid
  officeId    String    @map("office_id") @db.Uuid
  dayOfWeek   Int       @map("day_of_week")
  startMinute Int       @map("start_minute")
  endMinute   Int       @map("end_minute")
  isAvailable Boolean   @default(true) @map("is_available")
  createdAt   DateTime  @default(now()) @map("created_at") @db.Timestamptz(6)
  office      Office    @relation(fields: [officeId], references: [id])

  @@index([officeId, dayOfWeek])
  @@map("office_availability_rules")
}

model Booking {
  id             String        @id @default(uuid()) @db.Uuid
  userId         String        @map("user_id") @db.Uuid
  officeId       String        @map("office_id") @db.Uuid
  status         BookingStatus @default(PENDING_APPROVAL)
  startTime      DateTime      @map("start_time") @db.Timestamptz(6)
  endTime        DateTime      @map("end_time") @db.Timestamptz(6)
  amountCents    Int           @map("amount_cents")
  currency       String        @default("USD")
  idempotencyKey String?       @map("idempotency_key")
  degradedMode   Boolean       @default(false) @map("degraded_mode")
  checkedInAt    DateTime?     @map("checked_in_at") @db.Timestamptz(6)
  checkedOutAt   DateTime?     @map("checked_out_at") @db.Timestamptz(6)
  createdAt      DateTime      @default(now()) @map("created_at") @db.Timestamptz(6)
  updatedAt      DateTime      @updatedAt @map("updated_at") @db.Timestamptz(6)
  deletedAt      DateTime?     @map("deleted_at") @db.Timestamptz(6)

  user         User          @relation(fields: [userId], references: [id])
  office       Office        @relation(fields: [officeId], references: [id])
  payments     Payment[]
  qrTokens     QrToken[]
  accessEvents AccessEvent[]

  @@index([userId, startTime])
  @@index([officeId, startTime, endTime])
  @@index([status, startTime])
  @@map("bookings")
}

model BookingStatusTransition {
  fromStatus BookingStatus @map("from_status")
  toStatus   BookingStatus @map("to_status")
  actorRoles String[]      @map("actor_roles")
  createdAt  DateTime      @default(now()) @map("created_at") @db.Timestamptz(6)

  @@id([fromStatus, toStatus])
  @@map("booking_status_transitions")
}

model Payment {
  id               String         @id @default(uuid()) @db.Uuid
  bookingId        String         @map("booking_id") @db.Uuid
  gateway          PaymentGateway
  gatewayPaymentId String?        @map("gateway_payment_id")
  status           PaymentStatus  @default(PENDING)
  amountCents      Int            @map("amount_cents")
  currency         String
  paidAt           DateTime?      @map("paid_at") @db.Timestamptz(6)
  refundedAt       DateTime?      @map("refunded_at") @db.Timestamptz(6)
  metadata         Json           @default("{}")
  createdAt        DateTime       @default(now()) @map("created_at") @db.Timestamptz(6)
  updatedAt        DateTime       @updatedAt @map("updated_at") @db.Timestamptz(6)

  booking Booking @relation(fields: [bookingId], references: [id])

  @@index([bookingId])
  @@index([status])
  @@map("payments")
}

model WebhookEvent {
  id                 String         @id @default(uuid()) @db.Uuid
  gateway            PaymentGateway
  eventId            String         @map("event_id")
  eventType          String         @map("event_type")
  eventCreatedAt     DateTime?      @map("event_created_at") @db.Timestamptz(6)
  payload            Json
  signatureVerified  Boolean        @map("signature_verified")
  receivedAt         DateTime       @default(now()) @map("received_at") @db.Timestamptz(6)
  processedAt        DateTime?      @map("processed_at") @db.Timestamptz(6)
  processingError    String?        @map("processing_error")

  @@unique([gateway, eventId])
  @@index([processedAt])
  @@map("webhook_events")
}

model QrToken {
  id          String    @id @default(uuid()) @db.Uuid
  bookingId   String    @map("booking_id") @db.Uuid
  tokenHash   String    @unique @map("token_hash")
  jti         String    @unique
  expiresAt   DateTime  @map("expires_at") @db.Timestamptz(6)
  usedAt      DateTime? @map("used_at") @db.Timestamptz(6)
  revokedAt   DateTime? @map("revoked_at") @db.Timestamptz(6)
  createdAt   DateTime  @default(now()) @map("created_at") @db.Timestamptz(6)

  booking Booking @relation(fields: [bookingId], references: [id])

  @@index([bookingId])
  @@map("qr_tokens")
}

model IoTDevice {
  id           String       @id @default(uuid()) @db.Uuid
  officeId     String       @map("office_id") @db.Uuid
  deviceKey    String       @unique @map("device_key")
  name         String
  type         DeviceType
  status       DeviceStatus @default(PROVISIONING)
  firmware     String?
  lastSeenAt   DateTime?    @map("last_seen_at") @db.Timestamptz(6)
  createdAt    DateTime     @default(now()) @map("created_at") @db.Timestamptz(6)
  updatedAt    DateTime     @updatedAt @map("updated_at") @db.Timestamptz(6)
  deletedAt    DateTime?    @map("deleted_at") @db.Timestamptz(6)

  office       Office                @relation(fields: [officeId], references: [id])
  telemetry    TelemetryEvent[]
  snapshots    DeviceStateSnapshot[]
  accessEvents AccessEvent[]

  @@index([officeId])
  @@map("iot_devices")
}

model DeviceStateSnapshot {
  id         String    @id @default(uuid()) @db.Uuid
  deviceId   String    @map("device_id") @db.Uuid
  state      Json
  observedAt DateTime  @map("observed_at") @db.Timestamptz(6)
  createdAt  DateTime  @default(now()) @map("created_at") @db.Timestamptz(6)
  device     IoTDevice @relation(fields: [deviceId], references: [id])

  @@index([deviceId, observedAt])
  @@map("device_state_snapshots")
}

model TelemetryEvent {
  id         String    @id @default(uuid()) @db.Uuid
  deviceId   String    @map("device_id") @db.Uuid
  eventType  String    @map("event_type")
  payload    Json
  observedAt DateTime  @map("observed_at") @db.Timestamptz(6)
  receivedAt DateTime  @default(now()) @map("received_at") @db.Timestamptz(6)
  device     IoTDevice @relation(fields: [deviceId], references: [id])

  @@index([deviceId, observedAt])
  @@index([eventType, observedAt])
  @@map("telemetry_events")
}

model AccessEvent {
  id            String            @id @default(uuid()) @db.Uuid
  bookingId     String?           @map("booking_id") @db.Uuid
  deviceId      String            @map("device_id") @db.Uuid
  actorId       String?           @map("actor_id") @db.Uuid
  commandId     String            @unique @map("command_id")
  status        AccessEventStatus
  attempt       Int               @default(1)
  reason        String?
  requestedAt   DateTime          @default(now()) @map("requested_at") @db.Timestamptz(6)
  acknowledgedAt DateTime?        @map("acknowledged_at") @db.Timestamptz(6)
  metadata      Json              @default("{}")

  booking Booking?  @relation(fields: [bookingId], references: [id])
  device  IoTDevice @relation(fields: [deviceId], references: [id])

  @@index([bookingId])
  @@index([deviceId, requestedAt])
  @@map("access_events")
}

model Job {
  id          String    @id @default(uuid()) @db.Uuid
  type        String
  bullJobId   String?   @map("bull_job_id")
  payload     Json
  runAt       DateTime  @map("run_at") @db.Timestamptz(6)
  status      JobStatus @default(PENDING)
  attempts    Int       @default(0)
  maxAttempts Int       @default(3) @map("max_attempts")
  lastError   String?   @map("last_error")
  lockedBy    String?   @map("locked_by")
  lockedAt    DateTime? @map("locked_at") @db.Timestamptz(6)
  createdAt   DateTime  @default(now()) @map("created_at") @db.Timestamptz(6)
  updatedAt   DateTime  @updatedAt @map("updated_at") @db.Timestamptz(6)

  @@index([status, runAt])
  @@index([type])
  @@map("jobs")
}

model OutboxEvent {
  id             String            @id @default(uuid()) @db.Uuid
  eventType      String            @map("event_type")
  aggregateType  String            @map("aggregate_type")
  aggregateId    String            @map("aggregate_id") @db.Uuid
  version        Int               @default(1)
  payload        Json
  idempotencyKey String?           @map("idempotency_key")
  status         DomainEventStatus @default(PENDING)
  createdAt      DateTime          @default(now()) @map("created_at") @db.Timestamptz(6)
  publishedAt    DateTime?         @map("published_at") @db.Timestamptz(6)
  lastError      String?           @map("last_error")

  @@index([status, createdAt])
  @@map("outbox_events")
}

model AuditLog {
  id          String    @id @default(uuid()) @db.Uuid
  occurredAt  DateTime  @default(now()) @map("occurred_at") @db.Timestamptz(6)
  actorId     String?   @map("actor_id") @db.Uuid
  actorType   ActorType @map("actor_type")
  entityType  String    @map("entity_type")
  entityId    String    @map("entity_id") @db.Uuid
  action      String
  beforeState Json?     @map("before_state")
  afterState  Json?     @map("after_state")
  metadata    Json      @default("{}")

  @@index([entityType, entityId])
  @@index([actorId, occurredAt])
  @@map("audit_logs")
}

model Notification {
  id        String             @id @default(uuid()) @db.Uuid
  userId    String?            @map("user_id") @db.Uuid
  channel   NotificationChannel
  status    NotificationStatus @default(PENDING)
  template  String
  payload   Json
  sentAt    DateTime?          @map("sent_at") @db.Timestamptz(6)
  createdAt DateTime           @default(now()) @map("created_at") @db.Timestamptz(6)

  @@index([userId, createdAt])
  @@map("notifications")
}

model Incident {
  id          String         @id @default(uuid()) @db.Uuid
  type        String
  severity    String
  status      IncidentStatus @default(OPEN)
  officeId    String?        @map("office_id") @db.Uuid
  deviceId    String?        @map("device_id") @db.Uuid
  bookingId   String?        @map("booking_id") @db.Uuid
  description String
  metadata    Json           @default("{}")
  createdAt   DateTime       @default(now()) @map("created_at") @db.Timestamptz(6)
  resolvedAt  DateTime?      @map("resolved_at") @db.Timestamptz(6)

  @@index([status, createdAt])
  @@map("incidents")
}
```

## D. REST API Contracts

All endpoints return:

```json
{
  "requestId": "req_...",
  "data": {},
  "error": null
}
```

Error response:

```json
{
  "requestId": "req_...",
  "data": null,
  "error": {
    "code": "BOOKING_OVERLAP",
    "message": "Office is unavailable for the selected time range",
    "details": {}
  }
}
```

### Auth

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `GET /auth/me`

### Offices

- `GET /offices?from=&to=&capacity=&building=`
- `POST /offices` owner/admin
- `GET /offices/:id`
- `PATCH /offices/:id` owner/admin
- `DELETE /offices/:id` owner/admin; soft delete
- `POST /offices/:id/operators` owner/admin
- `DELETE /offices/:id/operators/:operatorId` owner/admin

### Bookings

- `POST /bookings`
  - Headers: `Authorization`, `Idempotency-Key`.
  - Request: `CreateBookingDto`.
  - Success: `201 { id, status, officeId, startTime, endTime, amountCents, paymentRequired }`.
  - Errors: `BOOKING_OVERLAP`, `OFFICE_UNAVAILABLE`, `INVALID_TIME_RANGE`, `FORBIDDEN`.
- `GET /bookings/me?status=&from=&to=&cursor=&limit=`
  - Success: paginated booking list.
- `GET /bookings/:id`
  - Success: booking detail with office, latest payment, QR eligibility, access events.
- `PATCH /bookings/:id/approve` owner/operator
  - Transition: `PENDING_APPROVAL -> APPROVED -> PAYMENT_PENDING`.
  - Side effects: create payment row, schedule expiry job.
- `PATCH /bookings/:id/reject` owner/operator
  - Transition: `PENDING_APPROVAL -> REJECTED`.
- `PATCH /bookings/:id/cancel`
  - User can cancel own eligible booking; owner/operator/admin can cancel scoped booking.
  - Side effects: cancel pending jobs, revoke QR tokens, request refund when applicable.
- `POST /bookings/:id/check-in`
  - Requires confirmed booking and valid QR/access policy.
- `POST /bookings/:id/check-out`
  - Transitions `CHECKED_IN` or `OVERSTAY` to `CHECKED_OUT`.
- `POST /bookings/:id/complete` system/operator
  - Transitions `CHECKED_OUT -> COMPLETED`.
- `GET /bookings/office/:officeId?from=&to=&status=`
  - Owner/operator scoped calendar view.

### Payments

- `POST /payments/create-intent`
  - Headers: `Authorization`, `Idempotency-Key`.
  - Request: `{ bookingId, gateway }`.
  - Success: `{ paymentId, gateway, clientSecret, redirectUrl?, expiresAt }`.
- `GET /payments/:id`
  - User gets own payment; owner/operator scoped by office.
- `POST /payments/webhooks/:gateway`
  - Public endpoint with provider signature header.
  - Always returns `200` for duplicate already-processed valid events.
  - Invalid signature returns `401`.
- `POST /payments/:id/refund` owner/admin/system
  - Request: `{ amountCents?, reason, idempotencyKey }`.
  - Gateway remains source of truth; DB updates only after provider confirmation/webhook.

### Access / QR

- `POST /access/qr/:bookingId/generate`
  - Allowed only for `CONFIRMED` bookings.
  - Returns signed JWT-like QR token once per active token generation policy.
- `POST /access/qr/verify`
  - Request: `VerifyQrTokenDto`.
  - Verifies signature, JTI, hash, expiry, booking window, status, scanner permission.
- `POST /access/unlock`
  - Request: `UnlockDoorDto`.
  - Creates `access_events` row before MQTT publish.
- `POST /access/manual-override` operator/owner
  - Requires incident or explicit reason.
- `GET /access/events?bookingId=&deviceId=`
  - Scoped audit trail for access attempts.

### Devices and Telemetry

- `POST /devices` owner/admin
- `GET /devices`
- `GET /devices/:id`
- `PATCH /devices/:id`
- `DELETE /devices/:id` soft delete
- `POST /devices/:id/commands/unlock`
- `GET /devices/:id/status`
- `GET /devices/:id/telemetry`
- `POST /devices/:id/rotate-credentials`

### Reports

- `GET /reports/revenue?officeId=&month=`
- `GET /reports/occupancy?officeId=&from=&to=`
- `GET /reports/device-health?officeId=`

## E. DTO Validation Contracts

Use `class-validator` in NestJS. All date-times must be ISO-8601 with UTC offset. Server normalizes to UTC.

```ts
export class CreateBookingDto {
  @IsUUID()
  officeId!: string;

  @IsISO8601({ strict: true })
  startTime!: string;

  @IsISO8601({ strict: true })
  endTime!: string;

  @IsUUID()
  idempotencyKey!: string;
}

export class ApproveBookingDto {
  @IsOptional()
  @IsString()
  note?: string;
}

export class CreatePaymentIntentDto {
  @IsUUID()
  bookingId!: string;

  @IsEnum(PaymentGateway)
  gateway!: 'STRIPE' | 'PAYTABS';

  @IsUUID()
  idempotencyKey!: string;
}

export class VerifyQrTokenDto {
  @IsString()
  token!: string;

  @IsUUID()
  scannerDeviceId!: string;
}

export class UnlockDoorDto {
  @IsUUID()
  bookingId!: string;

  @IsUUID()
  deviceId!: string;

  @IsOptional()
  @IsString()
  reason?: string;
}

export class PaymentWebhookDto {
  @IsString()
  eventId!: string;

  @IsString()
  eventType!: string;

  @IsObject()
  payload!: Record<string, unknown>;
}
```

Validation rules:

- `startTime < endTime`.
- Minimum booking duration: configurable, default 15 minutes.
- Maximum booking duration: configurable, default 8 hours.
- Booking must be inside office availability rules.
- All mutation requests require `Idempotency-Key` header where retry safety matters.

## F. RBAC Implementation

Roles:

- `USER`: search offices, create/cancel own bookings, pay own bookings, use valid QR.
- `OPERATOR`: monitor assigned offices/devices, handle incidents, manual unlock, check-in assistance.
- `OWNER`: manage own offices, approve/reject bookings, view revenue, manage devices/operators.
- `ADMIN`: platform support and break-glass operations.

Implementation:

- JWT guard verifies token signature, expiry, issuer, audience.
- Claims: `sub`, `role`, `email`, `sessionId`.
- `RolesGuard` checks endpoint role metadata.
- Resource guards verify ownership/assignment:
  - owner can access offices where `office.owner_id = actor.id`.
  - operator can access offices in `operator_offices`.
  - user can access own bookings/payments.
- Every transaction sets local session variables:

```sql
SELECT set_config('app.current_user_id', $1, true);
SELECT set_config('app.current_actor_type', $2, true);
SELECT set_config('app.request_id', $3, true);
```

RBAC matrix:

| Permission | USER | OPERATOR | OWNER | ADMIN |
|---|---:|---:|---:|---:|
| Book office | yes | yes | yes | yes |
| Approve booking | no | assigned | own office | yes |
| Manage office | no | no | own office | yes |
| Unlock door | own confirmed booking | assigned | own office | yes |
| View telemetry | no | assigned | own office | yes |
| Handle incidents | no | assigned | own office | yes |
| View revenue | no | no | own office | yes |
| Monitor system | no | assigned scope | own scope | yes |

## G. Service Layer Architecture

Services must not bypass database invariants.

- `BookingsService`
  - validates request intent, office access, availability window.
  - writes booking in transaction.
  - relies on exclusion constraint for race-free overlap prevention.
  - emits `booking.created.v1`.
- `BookingStateService`
  - central transition method.
  - checks requested transition intent.
  - database trigger rejects illegal transitions.
- `PaymentsService`
  - creates gateway intent after booking/payment row exists.
  - processes webhook idempotently.
  - schedules reconciliation.
- `AccessService`
  - validates QR signature, booking status, booking window, token revocation.
  - creates `access_events` before sending MQTT command.
- `DevicesService`
  - provisions devices, maintains snapshots, handles telemetry ingestion.
- `QueueSchedulerService`
  - inserts durable `jobs` table row and BullMQ delayed job in one application unit.
  - job execution updates `jobs` row status.
- `OutboxPublisher`
  - publishes `outbox_events` to WebSocket, queue, notification, or MQTT bridge.

## H. MQTT Message Contracts

Topic format:

```text
flexispace/v1/offices/{officeId}/devices/{deviceKey}/commands
flexispace/v1/offices/{officeId}/devices/{deviceKey}/acks
flexispace/v1/offices/{officeId}/devices/{deviceKey}/telemetry
flexispace/v1/offices/{officeId}/devices/{deviceKey}/heartbeat
```

Unlock command:

```json
{
  "schema": "flexispace.iot.command.unlock.v1",
  "commandId": "uuid",
  "issuedAt": "2026-05-22T19:00:00.000Z",
  "expiresAt": "2026-05-22T19:00:10.000Z",
  "officeId": "uuid",
  "deviceKey": "lock-101",
  "bookingId": "uuid",
  "actorId": "uuid",
  "signature": "base64url-hmac"
}
```

ACK:

```json
{
  "schema": "flexispace.iot.ack.v1",
  "commandId": "uuid",
  "deviceKey": "lock-101",
  "status": "ACKED",
  "observedAt": "2026-05-22T19:00:02.000Z",
  "metadata": {
    "lockState": "UNLOCKED",
    "battery": 82
  }
}
```

Telemetry:

```json
{
  "schema": "flexispace.iot.telemetry.v1",
  "eventId": "uuid",
  "deviceKey": "air-101",
  "eventType": "AIR_QUALITY",
  "observedAt": "2026-05-22T19:00:00.000Z",
  "payload": {
    "co2": 620,
    "pm25": 4.2,
    "temperatureC": 22.4
  }
}
```

MQTT policy:

- Commands use QoS 1.
- Telemetry uses QoS 0 or 1 depending on criticality.
- Each command has a `commandId` and expiry.
- Device ACLs restrict publish/subscribe to own topics.
- ACK timeout: 5 seconds.
- Retry attempts: 4 total.
- Final failure creates incident and operator notification.

## I. Event Contracts

All domain events:

```json
{
  "eventId": "uuid",
  "eventType": "booking.confirmed.v1",
  "occurredAt": "2026-05-22T19:00:00.000Z",
  "aggregateType": "booking",
  "aggregateId": "uuid",
  "actor": {
    "type": "USER",
    "id": "uuid"
  },
  "idempotencyKey": "string",
  "payload": {}
}
```

Required events:

- `booking.created.v1`
- `booking.approved.v1`
- `booking.payment_pending.v1`
- `booking.confirmed.v1`
- `booking.cancelled.v1`
- `booking.expired.v1`
- `booking.no_show.v1`
- `booking.checked_in.v1`
- `booking.checked_out.v1`
- `booking.overstay.v1`
- `payment.intent_created.v1`
- `payment.succeeded.v1`
- `payment.failed.v1`
- `payment.refunded.v1`
- `device.telemetry_received.v1`
- `device.offline.v1`
- `access.unlock_requested.v1`
- `access.unlock_acknowledged.v1`
- `access.unlock_failed.v1`
- `incident.created.v1`

Events are persisted to `outbox_events` in the same transaction as the domain change.

## J. Queue Contracts

BullMQ queues:

| Queue | Job | Delay / Schedule | Idempotency |
|---|---|---|---|
| `booking-lifecycle` | `EXPIRE_BOOKING` | 4h after approval/payment pending | `bookingId:expire` |
| `booking-lifecycle` | `NO_SHOW_SCAN` | 15/30/60 min after start | `bookingId:no-show` |
| `payments` | `RECONCILE_PAYMENT` | every 15 min for pending payments | `paymentId:reconcile` |
| `notifications` | `SEND_REMINDER` | configurable | `bookingId:reminder:type` |
| `iot` | `RETRY_UNLOCK_COMMAND` | 5s backoff | `commandId:attempt` |
| `telemetry` | `ROLLUP_TELEMETRY_HOURLY` | hourly | `hour:deviceId` |

Every BullMQ job must have a corresponding `jobs` row. Processor lifecycle:

1. Mark `jobs.status = RUNNING`.
2. Execute idempotent handler.
3. Mark `COMPLETED`, `FAILED`, `CANCELLED`, or `DEAD_LETTER`.
4. Emit domain event on meaningful business result.

Retry policy:

- payment reconciliation: exponential backoff, max 8.
- IoT unlock retry: fixed 5 seconds, max 4.
- notifications: exponential backoff, max 5.
- lifecycle state jobs: low retry count, alert on failure.

## K. WebSocket Realtime Architecture

Use NestJS Gateway with Socket.IO or native WebSocket. JWT is required at connection.

Rooms:

- `user:{userId}`
- `office:{officeId}`
- `owner:{ownerId}`
- `operator:{operatorId}`
- `booking:{bookingId}`
- `system:admins`

Events:

- `booking.created`
- `booking.status_changed`
- `payment.status_changed`
- `access.unlock_requested`
- `access.unlock_acknowledged`
- `device.status_changed`
- `device.telemetry`
- `incident.created`
- `notification.created`

Delivery:

- WebSocket is best-effort live delivery.
- Durable truth remains PostgreSQL.
- Clients resync by REST using `updatedAt` cursors after reconnect.
- Server never trusts client room subscriptions; rooms are assigned from RBAC checks.

## L. Security Implementation

Mandatory controls:

- TLS everywhere.
- JWT access tokens short-lived, default 15 minutes.
- Refresh-token rotation with hashed tokens and revocation.
- Passwords with Argon2id if custom auth is used.
- Signed QR tokens only; store token hash/JTI; support revocation.
- UTC timestamps only; reject ambiguous local timestamps.
- Soft delete only via `deleted_at`; direct hard deletes blocked for domain tables.
- Audit logging via database triggers, not only application code.
- Rate limiting:
  - auth endpoints: strict IP/user limits.
  - QR verify/unlock: strict per scanner/device/booking.
  - webhook endpoint: signature-first, provider IP allowlist where possible.
- HMAC verification for payment webhooks.
- Idempotency keys for bookings, payments, webhooks, MQTT commands.
- EMQX ACLs and mTLS or per-device credentials.
- Secrets in a managed vault; never in repo.
- Structured logs with `requestId`, `actorId`, `bookingId`, `officeId`.
- No PII in logs except stable IDs.

## M. Deployment Architecture

Node/NestJS target deployment:

```text
Clients
  -> Cloudflare CDN/WAF
  -> Load Balancer
  -> NestJS API containers
       -> PostgreSQL primary/read replica
       -> Redis for BullMQ
       -> EMQX MQTT broker
       -> Payment gateway
       -> Email/SMS/push providers
  -> WebSocket gateway containers
  -> BullMQ worker containers
  -> Observability: OpenTelemetry + Prometheus/Grafana + Sentry
```

Runtime processes:

- `api`: REST + WebSocket.
- `worker`: BullMQ processors.
- `mqtt-bridge`: subscribes to telemetry/ACK topics and persists events.
- `scheduler`: creates recurring jobs if not using BullMQ repeatables from worker.

PostgreSQL:

- PITR enabled.
- Daily backups.
- Migration pipeline with preflight checks.
- Connection pooling.
- Read replicas for reports if needed.

Redis:

- Managed Redis with persistence enabled where supported.
- Used for BullMQ and realtime adapter only.
- Not a source of business truth.

## N. Missing Improvements Required for Production Readiness

- Final ADR update approving Node/NestJS and Redis/BullMQ or reverting to Supabase/Deno and `pg_cron`.
- Complete SQL migrations for triggers, state machine seed data, soft-delete protection, and audit immutability.
- Payment provider adapter selected and certified in test mode.
- Device provisioning and EMQX ACL automation.
- End-to-end tests for concurrent booking creation proving the exclusion constraint works.
- State-machine transition tests at application and database levels.
- Webhook replay/dedup/out-of-order tests.
- IoT command retry and no-ACK incident tests.
- Load tests for booking creation, webhook ingestion, WebSocket fanout, and telemetry ingestion.
- Security threat model and QR replay testing.
- Observability dashboards and alert runbooks.
- Disaster recovery runbook with restore drill.
- Data retention policy for audit logs, telemetry, and webhook payloads.
- Privacy review for user/payment metadata.

## Implementation Milestones

1. Resolve ADR conflict and approve runtime/queue/auth decisions.
2. Scaffold NestJS backend and Prisma.
3. Write database migrations first: enums, tables, exclusion constraint, state trigger, audit trigger, soft-delete protections.
4. Implement auth, RBAC, transaction context, and audit session variables.
5. Implement booking creation and transition flows.
6. Implement payment intent, webhook, reconciliation.
7. Implement MQTT bridge, access events, QR signing/verification.
8. Implement BullMQ jobs backed by durable `jobs` table.
9. Implement WebSocket gateway and event outbox publisher.
10. Add integration/e2e tests and production observability.

## Final Position

The architecture can be implemented production-grade, but not under all instructions simultaneously without an ADR amendment. The safest production path is to keep PostgreSQL as the enforcement layer and treat NestJS, Prisma, Redis, and BullMQ as orchestration infrastructure around those database guarantees.
