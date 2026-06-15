# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server at http://localhost:4000
npm run build     # Production build
npm run lint      # ESLint
npm run preview   # Preview production build
```

No test runner is configured. Playwright is installed as a dev dependency but no test scripts are wired up.

The app is served under the base path `/FlexiSpace-Platform/` (set in `vite.config.js`). The dev server uses `strictPort: true` on port 4000.

## Architecture Overview

**FlexiSpace** is a coworking space booking platform. The stack is:
- **Frontend**: React 19 + Vite, Tailwind CSS, React Router v7
- **Backend**: Supabase (Postgres + Auth + Realtime + Edge Functions)
- **Edge Functions**: Deno-based TypeScript, deployed alongside Supabase

### Role System

Four roles drive all access control — `USER`, `OPERATOR`, `OWNER`, `ADMIN`.

| Role | Home route | Purpose |
|---|---|---|
| USER | `/find-workspace` | Books workspaces |
| OPERATOR | `/command-center` | Manages day-to-day ops for assigned offices |
| OWNER | `/owner-dashboard` | Owns offices, approves bookings, sees financials |
| ADMIN | `/admin/users` | Full access |

Role is loaded from `profiles.role` on login (`src/lib/authRoles.js`). `App.jsx` computes `operatorMode = normalizeRole(profileRole) === 'OPERATOR'` and passes it to pages that need to behave differently per role.

### Route Protection (`src/App.jsx`)

Three access tiers are defined as arrays and passed to `<ProtectedRoute>`:
- `operationalRoles = ['ADMIN', 'OWNER', 'OPERATOR']`
- `ownerPages = ['OWNER', 'ADMIN']`
- `userOnly = ['USER']`

OPERATOR can access: `/command-center`, `/access-logs`, `/node-manager`, `/facility-ops-hub`, `/scanner-control`, `/todays-bookings`. Pages that accept `operatorMode={operatorMode}` switch their sidebar and data-fetch logic accordingly.

### Operator vs Owner UI Pattern

Pages shared between OPERATOR and OWNER use this pattern:

```js
export default function SomePage({ operatorMode = false }) {
  const isOperator = operatorMode
  // sidebar: isOperator ? OPERATOR_ITEMS.map(...) : NAV_GROUPS.map(...)
  // data fetch: isOperator → query operator_offices by operator_id; OWNER → query offices by owner_id
}
```

`OPERATOR_ITEMS` is a flat array of nav links (no accordion groups). `NAV_GROUPS` is the grouped accordion structure for owners. Both are defined as module-level constants in each page file.

**Critical data-fetch rule for OPERATORs**: operators are linked to offices via the `operator_offices` join table (`operator_id` → `office_id`), not via `offices.owner_id`. Always check `profiles.role` before deciding which table to query:

```js
if (userRole === 'OPERATOR') {
  // query operator_offices where operator_id = userId
} else {
  // query offices where owner_id = userId
}
```

### API Layer (`src/lib/flexispaceApi.js`)

All mutating operations go through Supabase Edge Functions via `callFlexiFunction(path, { body })`. This function attaches the user's JWT as a Bearer token. All calls are POST. Errors surface as `FlexiApiError` instances with `.code` and `.status`.

Read-only data is fetched directly from Supabase using the JS client (`src/lib/supabase.js`), which uses the anon key + user JWT for RLS enforcement.

### Edge Functions (`supabase/functions/`)

Six edge functions, each handling a domain:
- `bookings/` — create, approve, reject, cancel, checkin, checkout
- `payments/` — mock payment session, confirm, confirm-usage
- `iot/` — app-unlock, ack access events, manual override, Tuya commands
- `offices/` — create, update office
- `qr/` — QR code generation
- `admin/` — admin operations

Each function uses shared helpers from `_shared/`:
- `auth.ts` — `requireAuth(req)` + `requireRole(profile, [...roles])`
- `supabase.ts` — `createAnonClient()` / `createServiceClient()`
- `errors.ts` — `FlexiError`, `errorResponse()`
- `cors.ts` — preflight handling

The pattern in every handler: `requireAuth` → `requireRole` → parse body → call a private Postgres RPC → return result.

### Database / Migrations (`supabase/migrations/`)

82 migrations, numbered by timestamp with a phase prefix. The naming convention is:
`YYYYMMDDHHMMSS_phase_N[a-z]_description.sql`

Key architectural layers in the DB:
- **`private` schema**: all business logic lives here as `SECURITY DEFINER` functions. Direct table mutations from edge functions go through `private.*_v1()` RPCs.
- **`public` schema**: tables with RLS, plus `public.*_wrapper()` functions that edge functions call (these set an actor context then call the private RPC).
- **Actor context**: workflows use `private.set_actor_context(actor_id, actor_type)` to pass identity through the call stack for audit logging. Never call private RPCs directly from the frontend.
- **Realtime**: specific tables are published for realtime subscriptions (see `phase_16a` migration).

Core tables: `profiles`, `offices`, `operator_offices`, `bookings`, `payments`, `iot_devices`, `access_events`, `booking_usage_summaries`, `notifications`.

### i18n (`src/i18n/`)

Supports `en` and `ar`. Language stored in `localStorage` under `flexispace_language`. RTL is applied via `document.documentElement.dir`. The `useI18n()` hook returns `{ t, language, setLanguage, direction }`. Translation keys use dot notation: `t('bookings.payNow')`. Nav label translation goes through `src/components/navigation.js` which maps English strings to i18n keys — add new nav labels there when creating operator nav items.

### Navigation Constants

Each page file that has a sidebar defines its own `NAV_GROUPS` (owner accordion) and/or `OPERATOR_ITEMS` (operator flat list) as module-level constants. When adding a new page to operator navigation, add it to `OPERATOR_ITEMS` in **every** page that uses the operator sidebar: `TodaysBookings.jsx`, `FacilityOpsHub.jsx`, `AccessLogs.jsx`, `NodeManager.jsx`. Also ensure the nav label exists in `src/components/navigation.js` and the icon type is handled in that page's `NavIcon` component.

### Booking Status Flow

```
PENDING_APPROVAL → APPROVED → PAYMENT_PENDING → CONFIRMED → CHECKED_IN → CHECKED_OUT → COMPLETED
```

Cancellable from most non-terminal states. `EXPIRED` and `NO_SHOW` are set by background jobs.