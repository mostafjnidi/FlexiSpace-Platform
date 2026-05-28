import { requireAuth, requireRole, deriveActorType } from '../_shared/auth.ts'
import { createServiceClient } from '../_shared/supabase.ts'
import { getOrGenerateRequestId } from '../_shared/request-id.ts'
import { FlexiError, errorResponse } from '../_shared/errors.ts'
import { handlePreflight, addCorsHeaders } from '../_shared/cors.ts'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const CURRENCY_RE = /^[A-Z]{3}$/
const VALID_OFFICE_STATUS = new Set(['ACTIVE', 'INACTIVE', 'MAINTENANCE'])
const VALID_DEVICE_TYPES = new Set(['SMART_LOCK', 'AIR_QUALITY_SENSOR', 'ELECTRICITY_METER'])

function isValidUuid(s: string): boolean {
  return UUID_RE.test(s)
}

async function parseJsonBody(req: Request): Promise<Record<string, unknown>> {
  try {
    const text = await req.text()
    if (!text.trim()) return {}
    const body = JSON.parse(text)
    if (typeof body !== 'object' || body === null || Array.isArray(body)) {
      throw new FlexiError('BAD_REQUEST', 'Request body must be a JSON object', 400)
    }
    return body as Record<string, unknown>
  } catch (err) {
    if (err instanceof FlexiError) throw err
    throw new FlexiError('BAD_REQUEST', 'Invalid JSON body', 400)
  }
}

async function handleCreateOffice(req: Request): Promise<Response> {
  const requestId = getOrGenerateRequestId(req, 'edge:offices:create')
  const { profile } = await requireAuth(req)
  requireRole(profile, ['OWNER', 'ADMIN'])

  const body = await parseJsonBody(req)

  // ── name ──────────────────────────────────────────────────────────────────
  if (typeof body.name !== 'string' || body.name.trim().length === 0) {
    throw new FlexiError('BAD_REQUEST', 'name is required and must be a non-empty string', 400)
  }
  const name = body.name.trim()

  // ── capacity ───────────────────────────────────────────────────────────────
  if (
    body.capacity === undefined ||
    body.capacity === null ||
    !Number.isInteger(body.capacity) ||
    (body.capacity as number) <= 0
  ) {
    throw new FlexiError('BAD_REQUEST', 'capacity is required and must be a positive integer', 400)
  }
  const capacity = body.capacity as number

  // ── hourly_rate_cents ──────────────────────────────────────────────────────
  if (
    body.hourly_rate_cents === undefined ||
    body.hourly_rate_cents === null ||
    !Number.isInteger(body.hourly_rate_cents) ||
    (body.hourly_rate_cents as number) < 0
  ) {
    throw new FlexiError('BAD_REQUEST', 'hourly_rate_cents is required and must be a non-negative integer', 400)
  }
  const hourlyRateCents = body.hourly_rate_cents as number

  // ── currency ───────────────────────────────────────────────────────────────
  const rawCurrency = body.currency ?? 'USD'
  if (typeof rawCurrency !== 'string' || !CURRENCY_RE.test(rawCurrency)) {
    throw new FlexiError('BAD_REQUEST', 'currency must be 3 uppercase letters (e.g. USD)', 400)
  }
  const currency = rawCurrency as string

  // ── status ─────────────────────────────────────────────────────────────────
  const rawStatus = body.status ?? 'ACTIVE'
  if (typeof rawStatus !== 'string' || !VALID_OFFICE_STATUS.has(rawStatus)) {
    throw new FlexiError(
      'BAD_REQUEST',
      `status must be one of: ${[...VALID_OFFICE_STATUS].join(', ')}`,
      400,
    )
  }
  const status = rawStatus as string

  // ── optional text fields ───────────────────────────────────────────────────
  const description = body.description != null
    ? (typeof body.description === 'string' ? body.description : null)
    : null
  const building = body.building != null
    ? (typeof body.building === 'string' ? body.building : null)
    : null
  const floor = body.floor != null
    ? (typeof body.floor === 'string' ? body.floor : null)
    : null
  const room = body.room != null
    ? (typeof body.room === 'string' ? body.room : null)
    : null
  const imageUrl = body.image_url != null
    ? (typeof body.image_url === 'string' ? body.image_url : null)
    : null

  // ── device_types ───────────────────────────────────────────────────────────
  let deviceTypes: string[] = []
  if (body.device_types != null) {
    if (!Array.isArray(body.device_types)) {
      throw new FlexiError('BAD_REQUEST', 'device_types must be an array', 400)
    }
    for (const dt of body.device_types as unknown[]) {
      if (typeof dt !== 'string' || !VALID_DEVICE_TYPES.has(dt)) {
        throw new FlexiError(
          'BAD_REQUEST',
          `device_types contains invalid value "${dt}". Must be one of: ${[...VALID_DEVICE_TYPES].join(', ')}`,
          400,
        )
      }
    }
    deviceTypes = body.device_types as string[]
    const unique = new Set(deviceTypes)
    if (unique.size !== deviceTypes.length) {
      throw new FlexiError('BAD_REQUEST', 'device_types must not contain duplicates', 400)
    }
  }

  // ── idempotency_key ────────────────────────────────────────────────────────
  let idempotencyKey: string
  const rawKey = body.idempotency_key
  if (rawKey === undefined || rawKey === null) {
    idempotencyKey = crypto.randomUUID()
  } else if (typeof rawKey !== 'string' || !isValidUuid(rawKey)) {
    throw new FlexiError('BAD_REQUEST', 'idempotency_key must be a valid UUID', 400)
  } else {
    idempotencyKey = rawKey
  }

  const supabase = createServiceClient()
  const { data, error } = await supabase.rpc('create_office_with_devices_v1', {
    p_trusted_actor_id:   profile.id,
    p_trusted_actor_type: deriveActorType(profile.role),
    p_request_id:         requestId,
    p_name:               name,
    p_description:        description,
    p_building:           building,
    p_floor:              floor,
    p_room:               room,
    p_capacity:           capacity,
    p_hourly_rate_cents:  hourlyRateCents,
    p_currency:           currency,
    p_status:             status,
    p_image_url:          imageUrl,
    p_device_types:       deviceTypes,
    p_idempotency_key:    idempotencyKey,
  })

  if (error) throw error

  return new Response(
    JSON.stringify({
      data,
      meta: { request_id: requestId, idempotency_key: idempotencyKey },
    }),
    { status: 201, headers: { 'Content-Type': 'application/json' } },
  )
}

Deno.serve(async (req: Request): Promise<Response> => {
  const preflight = handlePreflight(req)
  if (preflight) return preflight

  const pathname = new URL(req.url).pathname

  try {
    if (req.method !== 'POST') {
      throw new FlexiError('METHOD_NOT_ALLOWED', 'Method not allowed', 405)
    }

    if (!/\/offices\/create\/?$/.test(pathname)) {
      throw new FlexiError('NOT_FOUND', 'Route not found', 404)
    }

    const response = await handleCreateOffice(req)
    return addCorsHeaders(response)
  } catch (err) {
    return addCorsHeaders(errorResponse(err, req.headers.get('X-Request-ID')))
  }
})