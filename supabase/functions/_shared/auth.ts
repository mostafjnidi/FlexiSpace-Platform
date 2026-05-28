import { createAnonClient, createServiceClient } from './supabase.ts'
import type { Profile, UserRole, ActorType } from './types.ts'
import { FlexiError } from './errors.ts'

export function extractBearerToken(req: Request): string | null {
  const authHeader = req.headers.get('Authorization') ?? req.headers.get('authorization')
  if (!authHeader) return null
  if (!authHeader.toLowerCase().startsWith('bearer ')) return null
  const token = authHeader.slice(7).trim()
  return token.length > 0 ? token : null
}

export async function verifyJwt(token: string): Promise<{ id: string } | null> {
  const supabase = createAnonClient()
  const { data, error } = await supabase.auth.getUser(token)
  if (error || !data?.user) return null
  return { id: data.user.id }
}

export async function loadProfile(userId: string): Promise<Profile | null> {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('id, role, is_active, deleted_at')
    .eq('id', userId)
    .single()
  if (error || !data) return null
  return data as Profile
}

export async function requireAuth(
  req: Request,
): Promise<{ userId: string; profile: Profile }> {
  const token = extractBearerToken(req)
  if (!token) {
    throw new FlexiError(
      'UNAUTHORIZED',
      'Missing or malformed Authorization header',
      401,
    )
  }

  const user = await verifyJwt(token)
  if (!user) {
    throw new FlexiError('UNAUTHORIZED', 'Invalid or expired token', 401)
  }

  const profile = await loadProfile(user.id)
  if (!profile) {
    throw new FlexiError('FORBIDDEN', 'Profile not found', 403)
  }

  if (profile.is_active === false) {
    throw new FlexiError('FORBIDDEN', 'Account is inactive', 403)
  }

  if (profile.deleted_at !== null) {
    throw new FlexiError('FORBIDDEN', 'Account has been deleted', 403)
  }

  return { userId: user.id, profile }
}

export function requireRole(profile: Profile, allowedRoles: UserRole[]): void {
  if (!allowedRoles.includes(profile.role)) {
    throw new FlexiError('FORBIDDEN', 'Insufficient role', 403)
  }
}

export function deriveActorType(role: UserRole): ActorType {
  const map: Record<UserRole, ActorType> = {
    USER: 'USER',
    OWNER: 'OWNER',
    OPERATOR: 'OPERATOR',
    ADMIN: 'ADMIN',
  }
  return map[role]
}