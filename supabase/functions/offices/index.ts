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

async function handleUpdateOffice(req: Request, officeId: string): Promise<Response> {
  const requestId = getOrGenerateRequestId(req, 'edge:offices:update')
  const { profile } = await requireAuth(req)
  requireRole(profile, ['OWNER', 'ADMIN'])

  const body = await parseJsonBody(req)

  const supabase = createServiceClient()

  const { data: office, error: fetchError } = await supabase
    .from('offices')
    .select('id, owner_id')
    .eq('id', officeId)
    .is('deleted_at', null)
    .single()

  if (fetchError || !office) {
    throw new FlexiError('NOT_FOUND', 'Office not found', 404)
  }

  if (profile.role !== 'ADMIN' && (office as { owner_id: string }).owner_id !== profile.id) {
    throw new FlexiError('FORBIDDEN', 'You do not own this office', 403)
  }

  const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() }

  if (body.name !== undefined) {
    if (typeof body.name !== 'string' || body.name.trim().length === 0) {
      throw new FlexiError('BAD_REQUEST', 'name must be a non-empty string', 400)
    }
    updateData.name = body.name.trim()
  }
  if (body.description !== undefined) updateData.description = body.description ?? null
  if (body.building !== undefined) updateData.building = body.building ?? null
  if (body.floor !== undefined) updateData.floor = body.floor ?? null
  if (body.room !== undefined) updateData.room = body.room ?? null
  if (body.image_url !== undefined) updateData.image_url = body.image_url ?? null

  if (body.capacity !== undefined) {
    if (!Number.isInteger(body.capacity) || (body.capacity as number) <= 0) {
      throw new FlexiError('BAD_REQUEST', 'capacity must be a positive integer', 400)
    }
    updateData.capacity = body.capacity
  }
  if (body.hourly_rate_cents !== undefined) {
    if (!Number.isInteger(body.hourly_rate_cents) || (body.hourly_rate_cents as number) < 0) {
      throw new FlexiError('BAD_REQUEST', 'hourly_rate_cents must be a non-negative integer', 400)
    }
    updateData.hourly_rate_cents = body.hourly_rate_cents
  }
  if (body.currency !== undefined) {
    if (typeof body.currency !== 'string' || !CURRENCY_RE.test(body.currency)) {
      throw new FlexiError('BAD_REQUEST', 'currency must be 3 uppercase letters (e.g. USD)', 400)
    }
    updateData.currency = body.currency
  }
  if (body.status !== undefined) {
    if (typeof body.status !== 'string' || !VALID_OFFICE_STATUS.has(body.status)) {
      throw new FlexiError('BAD_REQUEST', `status must be one of: ${[...VALID_OFFICE_STATUS].join(', ')}`, 400)
    }
    updateData.status = body.status
  }

  const { error } = await supabase.from('offices').update(updateData).eq('id', officeId)
  if (error) throw error

  return new Response(
    JSON.stringify({ data: { id: officeId }, meta: { request_id: requestId } }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  )
}

async function handleDeleteOffice(req: Request, officeId: string): Promise<Response> {
  const requestId = getOrGenerateRequestId(req, 'edge:offices:delete')
  const { profile } = await requireAuth(req)
  requireRole(profile, ['OWNER', 'ADMIN'])

  const supabase = createServiceClient()

  const { data: office, error: fetchError } = await supabase
    .from('offices')
    .select('id, owner_id')
    .eq('id', officeId)
    .is('deleted_at', null)
    .single()

  if (fetchError || !office) {
    throw new FlexiError('NOT_FOUND', 'Office not found', 404)
  }

  if (profile.role !== 'ADMIN' && (office as { owner_id: string }).owner_id !== profile.id) {
    throw new FlexiError('FORBIDDEN', 'You do not own this office', 403)
  }

  const { error } = await supabase
    .from('offices')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', officeId)

  if (error) throw error

  return new Response(
    JSON.stringify({ data: { id: officeId }, meta: { request_id: requestId } }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  )
}

Deno.serve(async (req: Request): Promise<Response> => {
  const preflight = handlePreflight(req)
  if (preflight) return preflight

  const pathname = new URL(req.url).pathname

  try {
    const createMatch = /\/offices\/create\/?$/.test(pathname)
    const idMatch = pathname.match(/\/offices\/([^/]+)\/?$/)
    const officeId = idMatch?.[1]

    if (createMatch) {
      if (req.method !== 'POST') throw new FlexiError('METHOD_NOT_ALLOWED', 'Method not allowed', 405)
      const response = await handleCreateOffice(req)
      return addCorsHeaders(response)
    }

    if (officeId && isValidUuid(officeId)) {
      if (req.method === 'PATCH') {
        const response = await handleUpdateOffice(req, officeId)
        return addCorsHeaders(response)
      }
      if (req.method === 'DELETE') {
        const response = await handleDeleteOffice(req, officeId)
        return addCorsHeaders(response)
      }
      throw new FlexiError('METHOD_NOT_ALLOWED', 'Method not allowed', 405)
    }

    throw new FlexiError('NOT_FOUND', 'Route not found', 404)
  } catch (err) {
    return addCorsHeaders(errorResponse(err, req.headers.get('X-Request-ID')))
  }
})