import { supabase } from './supabase'

const functionsBaseUrl = (
  import.meta.env.VITE_SUPABASE_FUNCTIONS_URL ||
  `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`
).replace(/\/$/, '')

export class FlexiApiError extends Error {
  constructor(message, { code, status, requestId } = {}) {
    super(message)
    this.name = 'FlexiApiError'
    this.code = code
    this.status = status
    this.requestId = requestId
  }
}

function makeRequestId(scope) {
  const suffix = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`
  return `${scope}:${suffix}`
}

async function getAccessToken() {
  const { data, error } = await supabase.auth.getSession()
  if (error) {
    throw new FlexiApiError('Unable to read the current session.', { code: 'AUTH_SESSION_ERROR' })
  }
  const token = data.session?.access_token
  if (!token) {
    throw new FlexiApiError('Please sign in again before continuing.', { code: 'UNAUTHORIZED', status: 401 })
  }
  return token
}

async function parseJsonResponse(response) {
  const text = await response.text()
  if (!text.trim()) return {}
  try {
    return JSON.parse(text)
  } catch {
    throw new FlexiApiError('The server returned an unreadable response.', {
      code: 'BAD_RESPONSE',
      status: response.status,
    })
  }
}

export async function callFlexiFunction(path, { body, requestId, signal } = {}) {
  const token = await getAccessToken()
  const normalizedPath = path.replace(/^\/+/, '')
  const response = await fetch(`${functionsBaseUrl}/${normalizedPath}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'X-Request-ID': requestId ?? makeRequestId(`web:${normalizedPath.replaceAll('/', ':')}`),
    },
    body: JSON.stringify(body ?? {}),
    signal,
  })

  const payload = await parseJsonResponse(response)

  if (!response.ok) {
    const err = payload.error ?? {}
    throw new FlexiApiError(err.message || 'The request could not be completed.', {
      code: err.code,
      status: response.status,
      requestId: err.request_id,
    })
  }

  return payload
}

export function createBooking({ officeId, startTime, endTime, idempotencyKey, signal }) {
  return callFlexiFunction('bookings', {
    signal,
    body: {
      office_id: officeId,
      start_time: startTime,
      end_time: endTime,
      idempotency_key: idempotencyKey,
    },
  })
}

export function cancelBooking({ bookingId, reason, signal }) {
  return callFlexiFunction(`bookings/${bookingId}/cancel`, {
    signal,
    body: { reason },
  })
}

export function approveBooking({ bookingId, paymentIdempotencyKey, signal }) {
  return callFlexiFunction(`bookings/${bookingId}/approve`, {
    signal,
    body: paymentIdempotencyKey ? { payment_idempotency_key: paymentIdempotencyKey } : {},
  })
}

export function rejectBooking({ bookingId, reason, signal }) {
  return callFlexiFunction(`bookings/${bookingId}/reject`, {
    signal,
    body: reason ? { reason } : {},
  })
}

export function createPaymentSession({ bookingId, signal }) {
  return callFlexiFunction('payments/mock/create-session', {
    signal,
    body: { booking_id: bookingId },
  })
}

export function confirmPayment({ bookingId, idempotencyKey, simulateSuccess = true, signal }) {
  return callFlexiFunction('payments/mock/confirm', {
    signal,
    body: {
      booking_id: bookingId,
      ...(idempotencyKey ? { idempotency_key: idempotencyKey } : {}),
      simulate_success: simulateSuccess,
    },
  })
}

export function generateQrToken({ bookingId, signal }) {
  return callFlexiFunction('qr/generate', {
    signal,
    body: { booking_id: bookingId },
  })
}

export function verifyQrToken({ rawToken, deviceId, signal }) {
  return callFlexiFunction('qr/verify', {
    signal,
    body: { raw_token: rawToken, device_id: deviceId },
  })
}

export function appUnlock({ bookingId, deviceId, signal }) {
  return callFlexiFunction('iot/mock/app-unlock', {
    signal,
    body: {
      booking_id: bookingId,
      ...(deviceId ? { device_id: deviceId } : {}),
    },
  })
}

export function manualOverride({ deviceId, reason, bookingId, signal }) {
  return callFlexiFunction('iot/mock/manual-override', {
    signal,
    body: {
      device_id: deviceId,
      reason,
      ...(bookingId ? { booking_id: bookingId } : {}),
    },
  })
}

export function ackAccessEvent({ accessEventId, ackResult, reason, signal }) {
  return callFlexiFunction(`iot/mock/access-events/${accessEventId}/ack`, {
    signal,
    body: {
      ack_result: ackResult,
      ...(reason ? { reason } : {}),
    },
  })
}

export function sendTelemetry({ deviceId, eventType, payload, observedAt, newDeviceStatus, signal }) {
  return callFlexiFunction('iot/mock/telemetry', {
    signal,
    body: {
      device_id: deviceId,
      event_type: eventType,
      payload,
      observed_at: observedAt,
      ...(newDeviceStatus ? { new_device_status: newDeviceStatus } : {}),
    },
  })
}

export function sendTuyaCommand({ deviceId, command, signal }) {
  return callFlexiFunction('iot/tuya/command', {
    signal,
    body: { device_id: deviceId, command },
  })
}

export function checkOutBooking({ bookingId, signal }) {
  return callFlexiFunction(`bookings/${bookingId}/checkout`, { signal, body: {} })
}

export function confirmUsagePayment({ bookingId, idempotencyKey, simulateSuccess = true, signal }) {
  return callFlexiFunction('payments/mock/confirm-usage', {
    signal,
    body: {
      booking_id: bookingId,
      ...(idempotencyKey ? { idempotency_key: idempotencyKey } : {}),
      simulate_success: simulateSuccess,
    },
  })
}

export function createOffice({
  name, description, building, floor, room,
  capacity, hourlyRateCents, currency, status,
  imageUrl, deviceTypes, idempotencyKey, signal,
}) {
  return callFlexiFunction('offices/create', {
    signal,
    body: {
      name,
      description,
      building,
      floor,
      room,
      capacity,
      hourly_rate_cents: hourlyRateCents,
      currency,
      status,
      image_url: imageUrl,
      device_types: deviceTypes,
      idempotency_key: idempotencyKey,
    },
  })
}
