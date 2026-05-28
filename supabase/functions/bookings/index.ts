import { requireAuth, requireRole, deriveActorType } from '../_shared/auth.ts'
import { createServiceClient } from '../_shared/supabase.ts'
import { getOrGenerateRequestId } from '../_shared/request-id.ts'
import { FlexiError, errorResponse } from '../_shared/errors.ts'
import { handlePreflight, addCorsHeaders } from '../_shared/cors.ts'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

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

function isValidIsoDate(value: string): boolean {
  const date = new Date(value)
  return !Number.isNaN(date.getTime())
}

async function handleCreateBooking(req: Request): Promise<Response> {
  const requestId = getOrGenerateRequestId(req, 'edge:bookings:create')
  const { profile } = await requireAuth(req)
  requireRole(profile, ['USER'])

  const body = await parseJsonBody(req)
  const { office_id, start_time, end_time, idempotency_key: rawKey } = body

  if (typeof office_id !== 'string' || !isValidUuid(office_id)) {
    throw new FlexiError('BAD_REQUEST', 'office_id must be a valid UUID', 400)
  }
  if (typeof start_time !== 'string' || !isValidIsoDate(start_time)) {
    throw new FlexiError('BAD_REQUEST', 'start_time must be a valid ISO date string', 400)
  }
  if (typeof end_time !== 'string' || !isValidIsoDate(end_time)) {
    throw new FlexiError('BAD_REQUEST', 'end_time must be a valid ISO date string', 400)
  }
  if (new Date(start_time) >= new Date(end_time)) {
    throw new FlexiError('BAD_REQUEST', 'start_time must be before end_time', 400)
  }

  let idempotency_key: string
  if (rawKey === undefined || rawKey === null) {
    idempotency_key = crypto.randomUUID()
  } else if (typeof rawKey !== 'string' || !isValidUuid(rawKey)) {
    throw new FlexiError('BAD_REQUEST', 'idempotency_key must be a valid UUID', 400)
  } else {
    idempotency_key = rawKey
  }

  const supabase = createServiceClient()
  const { data, error } = await supabase.rpc('create_booking_v1', {
    p_trusted_actor_id: profile.id,
    p_trusted_actor_type: 'USER',
    p_request_id: requestId,
    p_office_id: office_id,
    p_start_time: start_time,
    p_end_time: end_time,
    p_idempotency_key: idempotency_key,
  })

  if (error) throw error

  return new Response(
    JSON.stringify({
      data,
      meta: { request_id: requestId, idempotency_key },
    }),
    { status: 201, headers: { 'Content-Type': 'application/json' } },
  )
}

async function handleApproveBooking(req: Request, bookingId: string): Promise<Response> {
  const requestId = getOrGenerateRequestId(req, 'edge:bookings:approve')
  const { profile } = await requireAuth(req)
  requireRole(profile, ['OWNER', 'OPERATOR', 'ADMIN'])

  const body = await parseJsonBody(req)
  const { payment_idempotency_key: rawKey } = body

  let paymentIdempotencyKey: string
  if (rawKey === undefined || rawKey === null) {
    paymentIdempotencyKey = crypto.randomUUID()
  } else if (typeof rawKey !== 'string' || !isValidUuid(rawKey)) {
    throw new FlexiError('BAD_REQUEST', 'payment_idempotency_key must be a valid UUID', 400)
  } else {
    paymentIdempotencyKey = rawKey
  }

  const supabase = createServiceClient()
  const { data, error } = await supabase.rpc('approve_booking_v1', {
    p_trusted_actor_id: profile.id,
    p_trusted_actor_type: deriveActorType(profile.role),
    p_request_id: requestId,
    p_booking_id: bookingId,
    p_payment_idempotency_key: paymentIdempotencyKey,
  })

  if (error) throw error

  return new Response(
    JSON.stringify({
      data,
      meta: { request_id: requestId, payment_idempotency_key: paymentIdempotencyKey },
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  )
}

async function handleRejectBooking(req: Request, bookingId: string): Promise<Response> {
  const requestId = getOrGenerateRequestId(req, 'edge:bookings:reject')
  const { profile } = await requireAuth(req)
  requireRole(profile, ['OWNER', 'OPERATOR', 'ADMIN'])

  const body = await parseJsonBody(req)
  const { reason: rawReason } = body

  let reason: string | null = null
  if (rawReason !== undefined && rawReason !== null) {
    if (typeof rawReason !== 'string') {
      throw new FlexiError('BAD_REQUEST', 'reason must be a string', 400)
    }
    const trimmed = rawReason.trim()
    if (trimmed.length > 512) {
      throw new FlexiError('BAD_REQUEST', 'reason must not exceed 512 characters', 400)
    }
    reason = trimmed
  }

  const supabase = createServiceClient()
  const { data, error } = await supabase.rpc('reject_booking_v1', {
    p_trusted_actor_id: profile.id,
    p_trusted_actor_type: deriveActorType(profile.role),
    p_request_id: requestId,
    p_booking_id: bookingId,
    p_reason: reason,
  })

  if (error) throw error

  return new Response(
    JSON.stringify({
      data,
      meta: { request_id: requestId },
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  )
}

async function handleCheckoutBooking(req: Request, bookingId: string): Promise<Response> {
  const requestId = getOrGenerateRequestId(req, 'edge:bookings:checkout')
  const { profile } = await requireAuth(req)
  requireRole(profile, ['USER', 'OWNER', 'OPERATOR', 'ADMIN'])

  const supabase = createServiceClient()
  const { data, error } = await supabase.rpc('checkout_booking_v1', {
    p_trusted_actor_id: profile.id,
    p_trusted_actor_type: deriveActorType(profile.role),
    p_request_id: requestId,
    p_booking_id: bookingId,
  })

  if (error) throw error

  return new Response(
    JSON.stringify({
      data,
      meta: { request_id: requestId },
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  )
}

async function handleCancelBooking(req: Request, bookingId: string): Promise<Response> {
  const requestId = getOrGenerateRequestId(req, 'edge:bookings:cancel')
  const { profile } = await requireAuth(req)

  const body = await parseJsonBody(req)
  const { reason: rawReason } = body

  let reason: string | null = null
  if (rawReason !== undefined && rawReason !== null) {
    if (typeof rawReason !== 'string') {
      throw new FlexiError('BAD_REQUEST', 'reason must be a string', 400)
    }
    const trimmed = rawReason.trim()
    if (trimmed.length > 512) {
      throw new FlexiError('BAD_REQUEST', 'reason must not exceed 512 characters', 400)
    }
    reason = trimmed
  }

  const supabase = createServiceClient()
  const { data, error } = await supabase.rpc('cancel_booking_v1', {
    p_trusted_actor_id: profile.id,
    p_trusted_actor_type: deriveActorType(profile.role),
    p_request_id: requestId,
    p_booking_id: bookingId,
    p_reason: reason,
  })

  if (error) throw error

  return new Response(
    JSON.stringify({
      data,
      meta: { request_id: requestId },
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
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

    const createMatch = /\/bookings\/?$/.test(pathname)
    const actionMatch = pathname.match(/\/bookings\/([^/]+)\/(approve|reject|cancel|checkout)$/)

    let response: Response

    if (createMatch) {
      response = await handleCreateBooking(req)
    } else if (actionMatch) {
      const bookingId = actionMatch[1]
      const action = actionMatch[2]

      if (!isValidUuid(bookingId)) {
        throw new FlexiError('BAD_REQUEST', 'Booking ID must be a valid UUID', 400)
      }

      if (action === 'approve') {
        response = await handleApproveBooking(req, bookingId)
      } else if (action === 'reject') {
        response = await handleRejectBooking(req, bookingId)
      } else if (action === 'cancel') {
        response = await handleCancelBooking(req, bookingId)
      } else {
        response = await handleCheckoutBooking(req, bookingId)
      }
    } else {
      throw new FlexiError('NOT_FOUND', 'Route not found', 404)
    }

    return addCorsHeaders(response)
  } catch (err) {
    return addCorsHeaders(errorResponse(err, req.headers.get('X-Request-ID')))
  }
})