export const ROLE_HOME = {
  ADMIN: '/admin/users',
  OWNER: '/owner-dashboard',
  OPERATOR: '/command-center',
  USER: '/find-workspace',
}

export function normalizeRole(role) {
  return typeof role === 'string' ? role.trim().toUpperCase() : null
}

export function getRoleHome(role) {
  return ROLE_HOME[normalizeRole(role)] ?? '/'
}

export async function loadProfileRole(supabase, user) {
  if (!user?.id) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  if (!error && data?.role) return normalizeRole(data.role)
  return null
}
