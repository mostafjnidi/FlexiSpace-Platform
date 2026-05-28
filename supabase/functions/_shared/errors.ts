import type { FlexiErrorCode } from './types.ts'

export class FlexiError extends Error {
  readonly code: FlexiErrorCode
  readonly status: number
  readonly detail?: string

  constructor(
    code: FlexiErrorCode,
    message: string,
    status: number,
    detail?: string,
  ) {
    super(message)
    this.name = 'FlexiError'
    this.code = code
    this.status = status
    this.detail = detail
  }
}

interface PostgrestErrorLike {
  code?: unknown
  message?: unknown
  details?: unknown
  hint?: unknown
}

function isPostgrestErrorLike(err: unknown): err is PostgrestErrorLike {
  return typeof err === 'object' && err !== null
}

const NOT_FOUND_PREFIXES = new Set([
  'BOOKING_NOT_FOUND',
  'OFFICE_NOT_FOUND',
  'DEVICE_NOT_FOUND',
  'ACCESS_EVENT_NOT_FOUND',
  'PAYMENT_NOT_FOUND',
  'QR_TOKEN_NOT_FOUND',
  'TOKEN_NOT_FOUND',
])

const CONFLICT_PREFIXES = new Set([
  'IDEMPOTENCY_CONFLICT',
  'INVALID_STATE',
  'BOOKING_NOT_CONFIRMED',
  'ACCESS_EVENT_WRONG_STATUS',
  'CANCELLATION_NOT_ALLOWED',
  'TOKEN_DELETED',
  'TOKEN_REVOKED',
  'TOKEN_EXPIRED',
  'ACCESS_WINDOW_VIOLATION',
  'DEVICE_NOT_IN_OFFICE',
  'PAYMENT_ALREADY_FINAL',
])

const INTERNAL_PREFIXES = new Set([
  'INVALID_ACTOR_CONTEXT',
  'ENCRYPTION_CONFIG_ERROR',
])

function mapP0001Message(rawMessage: string): FlexiError {
  const colonIdx = rawMessage.indexOf(':')
  const prefix = colonIdx > 0
    ? rawMessage.slice(0, colonIdx).trim()
    : rawMessage.trim()
  const detail = colonIdx > 0
    ? rawMessage.slice(colonIdx + 1).trim()
    : ''

  if (NOT_FOUND_PREFIXES.has(prefix)) {
    return new FlexiError('NOT_FOUND', detail || 'Resource not found', 404)
  }
  if (prefix === 'FORBIDDEN') {
    return new FlexiError('FORBIDDEN', detail || 'Forbidden', 403)
  }
  if (prefix === 'VALIDATION_ERROR') {
    return new FlexiError('VALIDATION_ERROR', detail || 'Validation failed', 422)
  }
  if (CONFLICT_PREFIXES.has(prefix)) {
    return new FlexiError('CONFLICT', detail || 'Conflict', 409)
  }
  if (INTERNAL_PREFIXES.has(prefix)) {
    return new FlexiError('INTERNAL_ERROR', 'An unexpected error occurred', 500)
  }

  return new FlexiError('INTERNAL_ERROR', 'An unexpected error occurred', 500)
}

export function mapPostgresError(err: unknown): FlexiError {
  if (err instanceof FlexiError) return err

  if (!isPostgrestErrorLike(err)) {
    return new FlexiError('INTERNAL_ERROR', 'An unexpected error occurred', 500)
  }

  const pgCode = typeof err.code === 'string' ? err.code : null
  const message = typeof err.message === 'string' ? err.message : ''

  if (pgCode === '23505') {
    return new FlexiError('CONFLICT', 'A conflict occurred', 409)
  }
  if (pgCode === '23514') {
    return new FlexiError('VALIDATION_ERROR', 'A constraint validation failed', 422)
  }
  if (pgCode === '23503') {
    return new FlexiError('VALIDATION_ERROR', 'A referenced record was not found', 422)
  }
  if (pgCode === 'P0001') {
    return mapP0001Message(message)
  }

  return new FlexiError('INTERNAL_ERROR', 'An unexpected error occurred', 500)
}

export function errorResponse(
  err: unknown,
  requestId: string | null,
): Response {
  const flexiErr = err instanceof FlexiError ? err : mapPostgresError(err)

  const body = JSON.stringify({
    error: {
      code: flexiErr.code,
      message: flexiErr.message,
      ...(requestId !== null ? { request_id: requestId } : {}),
    },
  })

  return new Response(body, {
    status: flexiErr.status,
    headers: { 'Content-Type': 'application/json' },
  })
}