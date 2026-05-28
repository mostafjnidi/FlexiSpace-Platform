import { requireAuth, deriveActorType } from '../_shared/auth.ts'
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

async function handleCreateSession(req: Request): Promise<Response> {
  const requestId = getOrGenerateRequestId(req, 'edge:payments:create-session')
  const { profile } = await requireAuth(req)

  const body = await parseJsonBody(req)
  const { booking_id } = body

  if (typeof booking_id !== 'string' || !isValidUuid(booking_id)) {
    throw new FlexiError('BAD_REQUEST', 'booking_id must be a valid UUID', 400)
  }

  const supabase = createServiceClient()
  const { data, error } = await supabase.rpc('create_mock_payment_session_v1', {
    p_trusted_actor_id: profile.id,
    p_trusted_actor_type: deriveActorType(profile.role),
    p_request_id: requestId,
    p_booking_id: booking_id,
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

async function handleConfirm(req: Request): Promise<Response> {
  const requestId = getOrGenerateRequestId(req, 'edge:payments:confirm')
  await requireAuth(req)

  const body = await parseJsonBody(req)
  const { booking_id, idempotency_key: rawKey, simulate_success: rawSimulate } = body

  if (typeof booking_id !== 'string' || !isValidUuid(booking_id)) {
    throw new FlexiError('BAD_REQUEST', 'booking_id must be a valid UUID', 400)
  }

  let idempotency_key: string
  if (rawKey === undefined || rawKey === null) {
    idempotency_key = crypto.randomUUID()
  } else if (typeof rawKey !== 'string' || !isValidUuid(rawKey)) {
    throw new FlexiError('BAD_REQUEST', 'idempotency_key must be a valid UUID', 400)
  } else {
    idempotency_key = rawKey
  }

  let simulate_success: boolean
  if (rawSimulate === undefined || rawSimulate === null) {
    simulate_success = true
  } else if (typeof rawSimulate !== 'boolean') {
    throw new FlexiError('VALIDATION_ERROR', 'simulate_success must be a boolean', 422)
  } else {
    simulate_success = rawSimulate
  }

  const supabase = createServiceClient()
  const { data, error } = await supabase.rpc('confirm_mock_payment_v1', {
    p_trusted_actor_id: null,
    p_trusted_actor_type: 'SYSTEM',
    p_request_id: requestId,
    p_booking_id: booking_id,
    p_idempotency_key: idempotency_key,
    p_simulate_success: simulate_success,
  })

  if (error) throw error

  return new Response(
    JSON.stringify({
      data,
      meta: { request_id: requestId, idempotency_key },
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  )
}

async function handleConfirmUsage(req: Request): Promise<Response> {
  const requestId = getOrGenerateRequestId(req, 'edge:payments:confirm-usage')
  await requireAuth(req)

  const body = await parseJsonBody(req)
  const { booking_id, idempotency_key: rawKey, simulate_success: rawSimulate } = body

  if (typeof booking_id !== 'string' || !isValidUuid(booking_id)) {
    throw new FlexiError('BAD_REQUEST', 'booking_id must be a valid UUID', 400)
  }

  let idempotency_key: string
  if (rawKey === undefined || rawKey === null) {
    idempotency_key = crypto.randomUUID()
  } else if (typeof rawKey !== 'string' || !isValidUuid(rawKey)) {
    throw new FlexiError('BAD_REQUEST', 'idempotency_key must be a valid UUID', 400)
  } else {
    idempotency_key = rawKey
  }

  let simulate_success: boolean
  if (rawSimulate === undefined || rawSimulate === null) {
    simulate_success = true
  } else if (typeof rawSimulate !== 'boolean') {
    throw new FlexiError('VALIDATION_ERROR', 'simulate_success must be a boolean', 422)
  } else {
    simulate_success = rawSimulate
  }

  const supabase = createServiceClient()
  const { data, error } = await supabase.rpc('confirm_usage_payment_v1', {
    p_trusted_actor_id: null,
    p_trusted_actor_type: 'SYSTEM',
    p_request_id: requestId,
    p_booking_id: booking_id,
    p_idempotency_key: idempotency_key,
    p_simulate_success: simulate_success,
  })

  if (error) throw error

  return new Response(
    JSON.stringify({
      data,
      meta: { request_id: requestId, idempotency_key },
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

    let response: Response

    if (/\/payments\/mock\/create-session$/.test(pathname)) {
      response = await handleCreateSession(req)
    } else if (/\/payments\/mock\/confirm$/.test(pathname)) {
      response = await handleConfirm(req)
    } else if (/\/payments\/mock\/confirm-usage$/.test(pathname)) {
      response = await handleConfirmUsage(req)
    } else {
      throw new FlexiError('NOT_FOUND', 'Route not found', 404)
    }

    return addCorsHeaders(response)
  } catch (err) {
    return addCorsHeaders(errorResponse(err, req.headers.get('X-Request-ID')))
  }
})