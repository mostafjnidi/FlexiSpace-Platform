<div dir="rtl" align="right">

# FlexiSpace - Final Implementation Hardening Freeze

Project: FlexiSpace - Smart Office Booking Platform with IoT Integration  
Phase: Last pre-coding lock  
Architecture: Supabase-only backend  
Status: Final hardening decisions frozen  

---

## 0. Scope

هذه الوثيقة لا تغيّر المعمارية.

القرارات التالية تبقى ثابتة:

- Supabase-only backend.
- PostgreSQL source of truth.
- Supabase Auth.
- Edge Functions API.
- PostgreSQL RPC for sensitive workflows.
- Triggers for state machine and audit logging.
- RLS authorization.
- pg_cron + jobs table.
- Mock Payment V1.
- Mock IoT V1.
- MQTT/EMQX future only.
- Soft delete only.
- UTC timestamps.

---

# 1. Secrets Naming Freeze

## 1.1 Canonical Secret Names

Final secret names:

</div>

```text
QR_ENCRYPTION_KEY
JWT_SIGNING_SECRET
SERVICE_ROLE_KEY
REQUEST_SIGNING_SECRET
```

<div dir="rtl" align="right">

## 1.2 Meaning

| Secret | Purpose |
|---|---|
| `QR_ENCRYPTION_KEY` | AES-256-GCM encryption key for stored encrypted QR tokens |
| `JWT_SIGNING_SECRET` | Signing secret for FlexiSpace signed QR/access tokens, not Supabase Auth JWT replacement |
| `SERVICE_ROLE_KEY` | Supabase service role key used only inside trusted Edge Functions |
| `REQUEST_SIGNING_SECRET` | HMAC secret for trusted internal/demo callbacks such as future MQTT/EMQX webhook or protected internal requests |

## 1.3 QR Encryption Requirements

</div>

```text
Algorithm: AES-256-GCM
Key length: 32 bytes
Encoding: Base64
```

<div dir="rtl" align="right">

`QR_ENCRYPTION_KEY` must decode from Base64 to exactly 32 bytes.

## 1.4 Supabase Secret Management

Secrets must be stored using Supabase secrets, not `.env` committed to repository.

Expected usage:

</div>

```text
supabase secrets set QR_ENCRYPTION_KEY=...
supabase secrets set JWT_SIGNING_SECRET=...
supabase secrets set SERVICE_ROLE_KEY=...
supabase secrets set REQUEST_SIGNING_SECRET=...
```

<div dir="rtl" align="right">

Edge Functions read them using:

</div>

```ts
Deno.env.get("QR_ENCRYPTION_KEY")
Deno.env.get("JWT_SIGNING_SECRET")
Deno.env.get("SERVICE_ROLE_KEY")
Deno.env.get("REQUEST_SIGNING_SECRET")
```

<div dir="rtl" align="right">

## 1.5 Rotation Policy

V1 rotation policy:

- `SERVICE_ROLE_KEY`: rotate if leaked or before production handoff.
- `REQUEST_SIGNING_SECRET`: rotate by accepting old and new signatures during a short transition if any external callback exists.
- `JWT_SIGNING_SECRET`: rotation invalidates active QR tokens unless key versioning is added. In V1, rotate only by revoking active QR tokens.
- `QR_ENCRYPTION_KEY`: rotation requires decrypting and re-encrypting active QR tokens. In V1, simplest safe rotation is revoke active QR tokens and regenerate.

Final V1 rule:

If `JWT_SIGNING_SECRET` or `QR_ENCRYPTION_KEY` rotates, revoke all active QR tokens.

---

# 2. PostgreSQL Private Schema Freeze

## 2.1 Canonical Private Schema

</div>

```sql
CREATE SCHEMA IF NOT EXISTS private;
```

<div dir="rtl" align="right">

The `private` schema is for trusted helper functions only.

## 2.2 Frozen Helper Functions

Final required helpers:

</div>

```text
private.current_user_id()
private.current_user_role()
private.require_role()
private.is_owner_of_office()
private.is_operator_of_office()
private.can_access_booking()
private.can_access_device()
private.audit_log_insert()
```

<div dir="rtl" align="right">

Added helpers that are truly necessary:

- `private.can_access_booking()` because many policies and RPCs need the same booking scope rule.
- `private.can_access_device()` because device, telemetry, and access events need office/device scope checks.

## 2.3 SECURITY DEFINER Rule

All `SECURITY DEFINER` functions must include:

</div>

```sql
SET search_path = public, private;
```

<div dir="rtl" align="right">

Additional hardening:

- Do not use dynamic SQL unless unavoidable.
- Function owner must be a trusted database role.
- Revoke public execution by default.
- Grant execution only to roles that need it.
- RLS helper functions must avoid unsafe recursion by querying related tables, not the same protected table when possible.

Example:

</div>

```sql
REVOKE ALL ON FUNCTION private.is_owner_of_office(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.is_owner_of_office(uuid) TO authenticated;
```

<div dir="rtl" align="right">

## 2.4 RLS Recursion Rule

Do not write a policy on `bookings` that calls a helper which recursively queries `bookings` in a way that triggers the same policy again.

Safe pattern:

- helpers for office ownership query `offices`.
- helpers for operator assignment query `operator_offices`.
- booking access helpers should be `SECURITY DEFINER` and carefully scoped.

---

# 3. Request ID Strategy Freeze

## 3.1 Canonical Format

</div>

```text
req_<uuid>
```

<div dir="rtl" align="right">

Example:

</div>

```text
req_550e8400-e29b-41d4-a716-446655440000
```

<div dir="rtl" align="right">

This is suitable for distributed tracing in Supabase V1.

## 3.2 Generation Rule

Edge Function must:

1. Accept `x-request-id` only if it matches the canonical format.
2. Otherwise generate a new request ID.
3. Include request ID in every response.

## 3.3 PostgreSQL Context

Before calling RPC inside a transaction:

</div>

```sql
SELECT set_config('app.request_id', '<request_id>', true);
```

<div dir="rtl" align="right">

## 3.4 Propagation Path

Request ID must be propagated through:

| Layer | Requirement |
|---|---|
| Edge Functions | generated/validated at request start |
| RPCs | stored in `app.request_id` session context |
| audit logs | written in audit metadata |
| webhook_events | stored in `metadata.request_id` or payload metadata |
| jobs | stored in `jobs.payload.request_id` when created from a request |
| error responses | returned as `requestId` |
| realtime events | included in event payload when event comes from request flow |

Final response shape:

</div>

```json
{
  "data": {},
  "error": null,
  "requestId": "req_550e8400-e29b-41d4-a716-446655440000"
}
```

<div dir="rtl" align="right">

---

# 4. Audit Actor Type Freeze

## 4.1 Final Enum

</div>

```sql
CREATE TYPE actor_type AS ENUM (
  'USER',
  'ADMIN',
  'OWNER',
  'OPERATOR',
  'JOB',
  'SYSTEM'
);
```

<div dir="rtl" align="right">

This enum is sufficient for V1.

No `WEBHOOK` actor is required in V1 because payment is mock and confirmation is initiated through trusted Edge Function logic.

No `DEVICE` actor is required in V1 because IoT is mock. Future MQTT may add it later if needed.

## 4.2 Mapping

| Source | actor_type |
|---|---|
| Normal user action | `USER` |
| Owner action | `OWNER` |
| Operator action | `OPERATOR` |
| Admin action | `ADMIN` |
| pg_cron job | `JOB` |
| Internal automation | `SYSTEM` |

## 4.3 pg_cron Mapping

All scheduled jobs run as:

</div>

```text
actor_type = JOB
```

<div dir="rtl" align="right">

When a job creates a business transition, audit metadata must include:

</div>

```json
{
  "job_id": "uuid",
  "job_type": "EXPIRE_BOOKING",
  "request_id": "req_..."
}
```

<div dir="rtl" align="right">

---

# 5. Time Policy Freeze

## 5.1 Frozen Rule

</div>

```text
All timestamps stored in UTC.
Frontend converts to local timezone only for display.
Database comparisons always happen in UTC.
```

<div dir="rtl" align="right">

This is correct for booking systems.

## 5.2 PostgreSQL Type Strategy

Use:

</div>

```sql
timestamptz
```

<div dir="rtl" align="right">

for all business timestamps:

- booking start/end.
- cancellation cutoff.
- QR validity.
- job run time.
- audit occurred time.
- payment timestamps.
- telemetry observed/received times.

Do not use `timestamp without time zone` for business events.

## 5.3 Hidden Timezone Edge Cases

The following must be handled:

1. Frontend must send ISO timestamps with timezone.
2. Edge Functions must reject ambiguous local timestamps.
3. Office local timezone is display/business UI metadata only, not storage format.
4. Daylight saving time affects UI display, not DB comparisons.

## 5.4 Critical Comparisons

Booking overlap:

</div>

```sql
tstzrange(start_time, end_time, '[)')
```

<div dir="rtl" align="right">

Cancellation cutoff:

</div>

```sql
now() <= start_time - interval '12 hours'
```

<div dir="rtl" align="right">

QR window:

</div>

```sql
valid_from = start_time - interval '10 minutes'
valid_until = end_time + interval '5 minutes'
```

<div dir="rtl" align="right">

Jobs:

</div>

```sql
run_at timestamptz not null
```

<div dir="rtl" align="right">

Realtime events:

- include UTC `occurred_at`.
- frontend formats for display.

---

# 6. Migration Strategy Freeze

## 6.1 Canonical Rule

</div>

```text
Never edit old migrations.
Always create forward-only migrations.
```

<div dir="rtl" align="right">

Correct for Supabase/Postgres.

## 6.2 Final Migration Order

</div>

```text
1. Extensions + schemas
2. Enums
3. Tables
4. Indexes + exclusion constraints
5. Triggers + transition enforcement
6. Audit system
7. Helper functions
8. RLS policies
9. RPCs
10. pg_cron/jobs
11. Edge Functions
12. Realtime
13. Seed demo data
14. Tests
```

<div dir="rtl" align="right">

This order is valid.

## 6.3 Migration Organization

Recommended thesis-scale organization:

</div>

```text
0001_extensions_schemas.sql
0002_enums.sql
0003_core_tables.sql
0004_indexes_constraints.sql
0005_state_machine_triggers.sql
0006_audit.sql
0007_private_helpers.sql
0008_rls_policies.sql
0009_rpcs.sql
0010_jobs_cron.sql
0011_realtime.sql
0012_demo_seed.sql
```

<div dir="rtl" align="right">

## 6.4 Migration Pitfalls

Enums:

- Add enum values carefully.
- Avoid renaming enum values after use.
- Freeze enum names before first implementation migration.

RLS:

- Create helper functions before policies that depend on them.
- Test policies as real authenticated users, not only service role.

Triggers:

- Create tables before triggers.
- Create trigger functions before attaching triggers.
- Audit trigger must not break on tables without expected ID.

Exclusion constraints:

- Must create `btree_gist` first.
- Must ensure seed data does not violate overlap rules.
- Must exclude `CHECKED_OUT`.

pg_cron:

- Extension must be available/enabled in Supabase project.
- Jobs must be idempotent because cron can retry or overlap operationally.

---

# 7. Final Hardening Review Answers

## 7.1 Are These Freezes Technically Correct for Supabase V1?

Yes.

They are technically correct for Supabase V1.

The decisions are aligned with:

- Edge Functions.
- Supabase secrets.
- PostgreSQL RPC.
- RLS.
- pg_cron.
- audit triggers.
- Mock Payment/IoT demo constraints.

## 7.2 Is Anything Still Missing That Would Realistically Block Implementation?

No blocking architecture gap remains.

Only implementation details remain:

- exact SQL syntax.
- exact Edge Function DTO validation code.
- exact policy tests.
- exact seed data.

These do not block starting implementation.

## 7.3 Any Hidden Security or Migration Risk Still Unresolved?

No unresolved blocker remains, but these must be enforced during coding:

- never trust actor IDs from client request body.
- never expose `qr_tokens` direct SELECT to users.
- always set `search_path` in `SECURITY DEFINER` functions.
- do not run tests only with service role.
- keep `SERVICE_ROLE_KEY` inside Edge Functions only.
- never disable RLS in DEMO.
- verify `QR_ENCRYPTION_KEY` decodes to 32 bytes at Edge Function startup.

## 7.4 Is Backend Safe to Start Implementation?

</div>

```text
SAFE TO START IMPLEMENTATION
```

<div dir="rtl" align="right">

Final readiness:

</div>

```text
10 / 10 for contract readiness
```

<div dir="rtl" align="right">

Implementation can start with the frozen order:

</div>

```text
Extensions + schemas
-> Enums
-> Tables
-> Constraints
-> Triggers
-> Audit
-> Helpers
-> RLS
-> RPCs
-> Jobs
-> Edge Functions
-> Realtime
-> Seeds
-> Tests
```

</div>
