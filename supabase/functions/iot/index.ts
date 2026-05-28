import { requireAuth, requireRole, deriveActorType } from '../_shared/auth.ts'
import { createServiceClient } from '../_shared/supabase.ts'
import { getOrGenerateRequestId } from '../_shared/request-id.ts'
import { FlexiError, errorResponse } from '../_shared/errors.ts'
import { handlePreflight, addCorsHeaders } from '../_shared/cors.ts'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const VALID_ACK_RESULTS: string[] = ['ACKED', 'FAILED_NO_ACK']
const VALID_DEVICE_STATUSES: string[] = ['ONLINE', 'OFFLINE', 'MAINTENANCE', 'ERROR']

function isValidUuid(s: string): boolean {
  return UUID_RE.test(s)
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

async function parseJsonBody(req: Request): Promise<Record<string, unknown>> {
  try {
    const text = await req.text()
    if (!text.trim()) return {}
    const body = JSON.parse(text)
    if (!isPlainObject(body)) {
      throw new FlexiError('BAD_REQUEST', 'Request body must be a JSON object', 400)
    }
    return body
  } catch (err) {
    if (err instanceof FlexiError) throw err
    throw new FlexiError('BAD_REQUEST', 'Invalid JSON body', 400)
  }
}

function isValidIsoDate(value: string): boolean {
  const date = new Date(value)
  return !Number.isNaN(date.getTime())
}

async function autoAckAndSeedTelemetry(
  supabase: ReturnType<typeof createServiceClient>,
  requestId: string,
  bookingId: string,
  accessEventId: string,
): Promise<void> {
  try {
    // ACK the access event — transitions booking CONFIRMED → CHECKED_IN
    const { error: ackError } = await supabase.rpc('mock_ack_access_event_v1', {
      p_trusted_actor_id: null,
      p_trusted_actor_type: 'SYSTEM',
      p_request_id: requestId + ':autoack',
      p_access_event_id: accessEventId,
      p_ack_result: 'ACKED',
      p_reason: null,
    })
    if (ackError) return

    // Get office_id for the device query
    const { data: booking } = await supabase
      .from('bookings')
      .select('office_id')
      .eq('id', bookingId)
      .single()
    if (!booking?.office_id) return

    // Find all IoT devices for this office (lock + sensors)
    const { data: devices } = await supabase
      .from('iot_devices')
      .select('id, device_type')
      .eq('office_id', booking.office_id)
      .in('device_type', ['ELECTRICITY_METER', 'AIR_QUALITY_SENSOR', 'SMART_LOCK'])
      .is('deleted_at', null)
    if (!devices?.length) return

    const typedDevices = devices as Array<{ id: string; device_type: string }>

    // Step 1 — Tuya unlock (best-effort, booking already CHECKED_IN)
    const smartLock = typedDevices.find((d) => d.device_type === 'SMART_LOCK')
    if (smartLock) {
      try {
        const clientId = Deno.env.get('TUYA_CLIENT_ID')
        const clientSecret = Deno.env.get('TUYA_CLIENT_SECRET')
        const tuyaDeviceId = Deno.env.get('TUYA_DEVICE_ID')
        let source = 'demo'
        if (clientId && clientSecret && tuyaDeviceId) {
          const token = await tuyaGetToken(clientId, clientSecret)
          await tuyaSendCommand(clientId, clientSecret, token, tuyaDeviceId, true)
          source = 'tuya'
        }
        await supabase.from('device_state_snapshots').upsert(
          {
            device_id: smartLock.id,
            state: {
              lock_state: 'UNLOCKED',
              battery: deterministicBattery(smartLock.id),
              last_command: 'unlock',
              source,
              command_at: new Date().toISOString(),
            },
            last_event_id: null,
            observed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'device_id' },
        )
      } catch {
        // Tuya unreachable — booking is already CHECKED_IN, door state stays unchanged
      }
    }

    // Step 2 — Seed electricity + air quality telemetry
    const baseTime = Date.now()
    const telemetryPromises: Promise<unknown>[] = []

    for (const device of typedDevices) {
      if (device.device_type === 'SMART_LOCK') continue
      const isElec = device.device_type === 'ELECTRICITY_METER'
      const count = isElec ? 5 : 4

      for (let i = 0; i < count; i++) {
        const observedAt = new Date(baseTime + i * 2_000).toISOString()
        const payload = isElec
          ? { current_kw: parseFloat((0.8 + Math.random() * 2.0).toFixed(2)) }
          : {
              temperature_c: parseFloat((20.0 + Math.random() * 5.0).toFixed(1)),
              humidity_percent: Math.floor(38 + Math.random() * 22),
              co2_ppm: Math.floor(580 + Math.random() * 320),
              pm25_ug_m3: parseFloat((4.0 + Math.random() * 12.0).toFixed(1)),
            }

        telemetryPromises.push(
          supabase.rpc('mock_generate_telemetry_v1', {
            p_trusted_actor_id: null,
            p_trusted_actor_type: 'SYSTEM',
            p_request_id: `${requestId}:tel:${device.id.slice(0, 8)}:${i}`,
            p_device_id: device.id,
            p_event_type: isElec ? 'ELECTRICITY_READING' : 'AIR_QUALITY_READING',
            p_payload: payload,
            p_observed_at: observedAt,
            p_new_device_status: null,
          }),
        )
      }
    }

    await Promise.allSettled(telemetryPromises)
  } catch {
    // Non-critical — booking is already CHECKED_IN
  }
}

async function handleAck(req: Request, accessEventId: string): Promise<Response> {
  const requestId = getOrGenerateRequestId(req, 'edge:iot:ack')
  const { profile } = await requireAuth(req)
  requireRole(profile, ['OPERATOR', 'OWNER', 'ADMIN'])

  const body = await parseJsonBody(req)
  const { ack_result, reason: rawReason } = body

  if (typeof ack_result !== 'string' || !VALID_ACK_RESULTS.includes(ack_result)) {
    throw new FlexiError('BAD_REQUEST', `ack_result must be one of: ${VALID_ACK_RESULTS.join(', ')}`, 400)
  }

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
  const { data, error } = await supabase.rpc('mock_ack_access_event_v1', {
    p_trusted_actor_id: null,
    p_trusted_actor_type: 'SYSTEM',
    p_request_id: requestId,
    p_access_event_id: accessEventId,
    p_ack_result: ack_result,
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

async function handleAppUnlock(req: Request): Promise<Response> {
  const requestId = getOrGenerateRequestId(req, 'edge:iot:app-unlock')
  const { profile } = await requireAuth(req)

  const body = await parseJsonBody(req)
  const { booking_id, device_id: rawDeviceId } = body

  if (typeof booking_id !== 'string' || !isValidUuid(booking_id)) {
    throw new FlexiError('BAD_REQUEST', 'booking_id must be a valid UUID', 400)
  }

  const supabase = createServiceClient()

  // Resolve device_id server-side if not provided (or invalid) — tenants cannot query
  // device_inventory_read_model directly due to RLS, so we look up iot_devices here.
  let device_id: string
  if (typeof rawDeviceId === 'string' && isValidUuid(rawDeviceId)) {
    device_id = rawDeviceId
  } else {
    const { data: booking } = await supabase
      .from('bookings')
      .select('office_id')
      .eq('id', booking_id)
      .single()
    if (!booking?.office_id) {
      throw new FlexiError('NOT_FOUND', 'Booking not found', 404)
    }
    const { data: lockDevices } = await supabase
      .from('iot_devices')
      .select('id')
      .eq('office_id', booking.office_id)
      .eq('device_type', 'SMART_LOCK')
      .is('deleted_at', null)
      .limit(1)
    if (!lockDevices?.length) {
      throw new FlexiError('NOT_FOUND', 'No smart lock device is linked to this office', 404)
    }
    device_id = lockDevices[0].id
  }

  const { data, error } = await supabase.rpc('mock_app_unlock_v1', {
    p_trusted_actor_id: profile.id,
    p_trusted_actor_type: deriveActorType(profile.role),
    p_request_id: requestId,
    p_booking_id: booking_id,
    p_device_id: device_id,
  })

  if (error) throw error

  // Auto-ACK + telemetry seed (best-effort; errors never fail the unlock response)
  const accessEventId = (data as Record<string, unknown>)?.access_event_id
  if (typeof accessEventId === 'string' && isValidUuid(accessEventId)) {
    await autoAckAndSeedTelemetry(supabase, requestId, booking_id, accessEventId)
  }

  return new Response(
    JSON.stringify({
      data,
      meta: { request_id: requestId },
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  )
}

async function handleManualOverride(req: Request): Promise<Response> {
  const requestId = getOrGenerateRequestId(req, 'edge:iot:manual-override')
  const { profile } = await requireAuth(req)
  requireRole(profile, ['OWNER', 'OPERATOR', 'ADMIN'])

  const body = await parseJsonBody(req)
  const { device_id, reason: rawReason, booking_id: rawBookingId } = body

  if (typeof device_id !== 'string' || !isValidUuid(device_id)) {
    throw new FlexiError('BAD_REQUEST', 'device_id must be a valid UUID', 400)
  }

  if (typeof rawReason !== 'string') {
    throw new FlexiError('BAD_REQUEST', 'reason must be a string', 400)
  }
  const reason = rawReason.trim()
  if (reason.length === 0) {
    throw new FlexiError('BAD_REQUEST', 'reason must not be blank', 400)
  }
  if (reason.length > 512) {
    throw new FlexiError('BAD_REQUEST', 'reason must not exceed 512 characters', 400)
  }

  let booking_id: string | null = null
  if (rawBookingId !== undefined && rawBookingId !== null) {
    if (typeof rawBookingId !== 'string' || !isValidUuid(rawBookingId)) {
      throw new FlexiError('BAD_REQUEST', 'booking_id must be a valid UUID', 400)
    }
    booking_id = rawBookingId
  }

  const supabase = createServiceClient()
  const { data, error } = await supabase.rpc('mock_manual_override_access_v1', {
    p_trusted_actor_id: profile.id,
    p_trusted_actor_type: deriveActorType(profile.role),
    p_request_id: requestId,
    p_device_id: device_id,
    p_reason: reason,
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

async function handleTelemetry(req: Request): Promise<Response> {
  const requestId = getOrGenerateRequestId(req, 'edge:iot:telemetry')
  const { profile } = await requireAuth(req)
  requireRole(profile, ['OPERATOR', 'OWNER', 'ADMIN'])

  const body = await parseJsonBody(req)
  const { device_id, event_type: rawEventType, payload, observed_at, new_device_status: rawStatus } = body

  if (typeof device_id !== 'string' || !isValidUuid(device_id)) {
    throw new FlexiError('BAD_REQUEST', 'device_id must be a valid UUID', 400)
  }

  if (typeof rawEventType !== 'string') {
    throw new FlexiError('BAD_REQUEST', 'event_type must be a string', 400)
  }
  const event_type = rawEventType.trim()
  if (event_type.length === 0) {
    throw new FlexiError('BAD_REQUEST', 'event_type must not be blank', 400)
  }
  if (event_type.length > 128) {
    throw new FlexiError('BAD_REQUEST', 'event_type must not exceed 128 characters', 400)
  }

  if (!isPlainObject(payload)) {
    throw new FlexiError('BAD_REQUEST', 'payload must be a plain object', 400)
  }

  if (typeof observed_at !== 'string' || !isValidIsoDate(observed_at)) {
    throw new FlexiError('BAD_REQUEST', 'observed_at must be a valid ISO date string', 400)
  }

  let new_device_status: string | null = null
  if (rawStatus !== undefined && rawStatus !== null) {
    if (typeof rawStatus !== 'string' || !VALID_DEVICE_STATUSES.includes(rawStatus)) {
      throw new FlexiError(
        'BAD_REQUEST',
        `new_device_status must be one of: ${VALID_DEVICE_STATUSES.join(', ')}`,
        400,
      )
    }
    new_device_status = rawStatus
  }

  const supabase = createServiceClient()
  const { data, error } = await supabase.rpc('mock_generate_telemetry_v1', {
    p_trusted_actor_id: null,
    p_trusted_actor_type: 'SYSTEM',
    p_request_id: requestId,
    p_device_id: device_id,
    p_event_type: event_type,
    p_payload: payload,
    p_observed_at: observed_at,
    p_new_device_status: new_device_status,
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

// ─── Tuya IoT Cloud Integration ──────────────────────────────────────────────

const TUYA_BASE_URL = 'https://openapi.tuyaeu.com'

function deterministicBattery(deviceId: string): number {
  const chars = deviceId.replace(/-/g, '')
  const sum = chars.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return 60 + (sum % 36) // 60–95 %
}

async function sha256Hex(message: string): Promise<string> {
  const data = new TextEncoder().encode(message)
  const buf = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

async function hmacSha256Hex(key: string, message: string): Promise<string> {
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(key),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const sig = await crypto.subtle.sign('HMAC', cryptoKey, new TextEncoder().encode(message))
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase()
}

async function tuyaGetToken(clientId: string, clientSecret: string): Promise<string> {
  const t = Date.now().toString()
  const path = '/v1.0/token?grant_type=1'
  const bodyHash = await sha256Hex('')
  const sign = await hmacSha256Hex(clientSecret, `${clientId}${t}\nGET\n${bodyHash}\n\n${path}`)
  const res = await fetch(`${TUYA_BASE_URL}${path}`, {
    headers: { client_id: clientId, sign_method: 'HMAC-SHA256', t, sign },
  })
  const json = await res.json() as Record<string, unknown>
  if (!json.success) throw new Error(`Tuya token: ${json.msg}`)
  return ((json.result as Record<string, unknown>).access_token) as string
}

async function tuyaSendCommand(
  clientId: string,
  clientSecret: string,
  token: string,
  tuyaDeviceId: string,
  unlock: boolean,
): Promise<void> {
  const t = Date.now().toString()
  const path = `/v1.0/devices/${tuyaDeviceId}/commands`
  const body = JSON.stringify({ commands: [{ code: 'switch_1', value: unlock }] })
  const bodyHash = await sha256Hex(body)
  const sign = await hmacSha256Hex(clientSecret, `${clientId}${token}${t}\nPOST\n${bodyHash}\n\n${path}`)
  const res = await fetch(`${TUYA_BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      client_id: clientId,
      access_token: token,
      sign_method: 'HMAC-SHA256',
      t,
      sign,
      'Content-Type': 'application/json',
    },
    body,
  })
  const json = await res.json() as Record<string, unknown>
  if (!json.success) throw new Error(`Tuya command: ${json.msg}`)
}

async function handleTuyaCommand(req: Request): Promise<Response> {
  const requestId = getOrGenerateRequestId(req, 'edge:iot:tuya')
  const { profile } = await requireAuth(req)
  requireRole(profile, ['OWNER', 'OPERATOR', 'ADMIN'])

  const body = await parseJsonBody(req)
  const { device_id, command } = body

  if (typeof device_id !== 'string' || !isValidUuid(device_id)) {
    throw new FlexiError('BAD_REQUEST', 'device_id must be a valid UUID', 400)
  }
  if (command !== 'lock' && command !== 'unlock') {
    throw new FlexiError('BAD_REQUEST', 'command must be "lock" or "unlock"', 400)
  }

  const clientId = Deno.env.get('TUYA_CLIENT_ID')
  const clientSecret = Deno.env.get('TUYA_CLIENT_SECRET')
  const tuyaDeviceId = Deno.env.get('TUYA_DEVICE_ID')
  const isLive = Boolean(clientId && clientSecret && tuyaDeviceId)

  const lockState = command === 'unlock' ? 'UNLOCKED' : 'LOCKED'
  const battery = deterministicBattery(device_id)
  let source = 'demo'

  if (isLive) {
    try {
      const token = await tuyaGetToken(clientId!, clientSecret!)
      await tuyaSendCommand(clientId!, clientSecret!, token, tuyaDeviceId!, command === 'unlock')
      source = 'tuya'
    } catch {
      // Tuya unreachable — fall through to demo response
    }
  }

  const supabase = createServiceClient()
  await supabase.from('device_state_snapshots').upsert(
    {
      device_id,
      state: {
        lock_state: lockState,
        battery,
        last_command: command,
        source,
        command_at: new Date().toISOString(),
      },
      last_event_id: null,
      observed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'device_id' },
  )

  return new Response(
    JSON.stringify({
      data: { device_id, lock_state: lockState, battery, source, demo_mode: source === 'demo' },
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

    const ackMatch = pathname.match(/\/iot\/mock\/access-events\/([^/]+)\/ack$/)

    if (ackMatch) {
      const accessEventId = ackMatch[1]
      if (!isValidUuid(accessEventId)) {
        throw new FlexiError('BAD_REQUEST', 'Access event ID must be a valid UUID', 400)
      }
      response = await handleAck(req, accessEventId)
    } else if (/\/iot\/mock\/app-unlock$/.test(pathname)) {
      response = await handleAppUnlock(req)
    } else if (/\/iot\/mock\/manual-override$/.test(pathname)) {
      response = await handleManualOverride(req)
    } else if (/\/iot\/mock\/telemetry$/.test(pathname)) {
      response = await handleTelemetry(req)
    } else if (/\/iot\/tuya\/command$/.test(pathname)) {
      response = await handleTuyaCommand(req)
    } else {
      throw new FlexiError('NOT_FOUND', 'Route not found', 404)
    }

    return addCorsHeaders(response)
  } catch (err) {
    return addCorsHeaders(errorResponse(err, req.headers.get('X-Request-ID')))
  }
})