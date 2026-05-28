export type UserRole = 'USER' | 'OPERATOR' | 'OWNER' | 'ADMIN'

export type ActorType = 'USER' | 'OPERATOR' | 'OWNER' | 'ADMIN' | 'JOB' | 'SYSTEM'

export type AccessEventStatus =
  | 'PENDING_ACK'
  | 'ACKED'
  | 'FAILED_NO_ACK'
  | 'DENIED'
  | 'MANUAL_OVERRIDE'
  | 'REVOKED'

export type DeviceStatus = 'ONLINE' | 'OFFLINE' | 'MAINTENANCE' | 'ERROR'

export type Profile = {
  id: string
  role: UserRole
  is_active: boolean
  deleted_at: string | null
}

export type ActorContext = {
  actorId: string | null
  actorType: ActorType
}

export type FlexiErrorCode =
  | 'BAD_REQUEST'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'METHOD_NOT_ALLOWED'
  | 'CONFLICT'
  | 'VALIDATION_ERROR'
  | 'INTERNAL_ERROR'