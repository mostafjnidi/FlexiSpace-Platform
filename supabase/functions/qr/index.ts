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

async function handleGenerate(req: Request): Promise<Response> {
  const requestId = getOrGenerateRequestId(req, 'edge:qr:generate')
  const { profile } = await requireAuth(req)

  const qrKey = Deno.env.get('QR_ENCRYPTION_KEY') ?? ''
  if (!qrKey) {
    throw new FlexiError('INTERNAL_ERROR', 'Service is misconfigured', 500)
  }

  const body = await parseJsonBody(req)
  const { booking_id } = body

  if (typeof booking_id !== 'string' || !isValidUuid(booking_id)) {
    throw new FlexiError('BAD_REQUEST', 'booking_id must be a valid UUID', 400)
  }

  const supabase = createServiceClient()
  const { data, error } = await supabase.rpc('generate_qr_token_v1', {
    p_trusted_actor_id: profile.id,
    p_trusted_actor_type: deriveActorType(profile.role),
    p_request_id: requestId,
    p_booking_id: booking_id,
    p_qr_encryption_key: qrKey,
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

async function handleVerify(req: Request): Promise<Response> {
  const requestId = getOrGenerateRequestId(req, 'edge:qr:verify')
  await requireAuth(req)

  const body = await parseJsonBody(req)
  const { raw_token, device_id } = body

  if (typeof raw_token !== 'string' || raw_token.length === 0) {
    throw new FlexiError('BAD_REQUEST', 'raw_token must be a non-empty string', 400)
  }
  if (typeof device_id !== 'string' || !isValidUuid(device_id)) {
    throw new FlexiError('BAD_REQUEST', 'device_id must be a valid UUID', 400)
  }

  const supabase = createServiceClient()
  const { data, error } = await supabase.rpc('verify_qr_and_create_access_event_v1', {
    p_trusted_actor_id: null,
    p_trusted_actor_type: 'SYSTEM',
    p_request_id: requestId,
    p_raw_token: raw_token,
    p_device_id: device_id,
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

    let response: Response

    if (/\/qr\/generate$/.test(pathname)) {
      response = await handleGenerate(req)
    } else if (/\/qr\/verify$/.test(pathname)) {
      response = await handleVerify(req)
    } else {
      throw new FlexiError('NOT_FOUND', 'Route not found', 404)
    }

    return addCorsHeaders(response)
  } catch (err) {
    return addCorsHeaders(errorResponse(err, req.headers.get('X-Request-ID')))
  }
})