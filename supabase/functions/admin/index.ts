import { requireAuth, requireRole, deriveActorType } from '../_shared/auth.ts'
import { createServiceClient } from '../_shared/supabase.ts'
import { FlexiError, errorResponse } from '../_shared/errors.ts'
import { handlePreflight, addCorsHeaders } from '../_shared/cors.ts'
import { getOrGenerateRequestId } from '../_shared/request-id.ts'

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

async function handleListOperators(req: Request): Promise<Response> {
  const requestId = getOrGenerateRequestId(req, 'edge:admin:list-operators')
  const { profile } = await requireAuth(req)
  requireRole(profile, ['OWNER', 'ADMIN'])

  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, email, role')
    .in('role', ['OPERATOR', 'USER'])
    .eq('is_active', true)
    .is('deleted_at', null)
    .order('full_name')

  if (error) throw error

  return new Response(
    JSON.stringify({ data: data ?? [], meta: { request_id: requestId } }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  )
}

async function handleAssignOperator(req: Request): Promise<Response> {
  const requestId = getOrGenerateRequestId(req, 'edge:admin:assign-operator')
  const { profile } = await requireAuth(req)
  requireRole(profile, ['OWNER', 'ADMIN'])

  const body = await parseJsonBody(req)
  const { operator_id, office_id } = body

  if (typeof operator_id !== 'string' || !isValidUuid(operator_id)) {
    throw new FlexiError('BAD_REQUEST', 'operator_id must be a valid UUID', 400)
  }
  if (typeof office_id !== 'string' || !isValidUuid(office_id)) {
    throw new FlexiError('BAD_REQUEST', 'office_id must be a valid UUID', 400)
  }

  const supabase = createServiceClient()

  if (profile.role === 'OWNER') {
    const { data: office, error: officeErr } = await supabase
      .from('offices')
      .select('id')
      .eq('id', office_id)
      .eq('owner_id', profile.id)
      .is('deleted_at', null)
      .maybeSingle()
    if (officeErr || !office) {
      throw new FlexiError('FORBIDDEN', 'You do not own this office', 403)
    }
  }

  const { data: operator, error: operatorErr } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', operator_id)
    .in('role', ['OPERATOR', 'USER'])
    .eq('is_active', true)
    .is('deleted_at', null)
    .maybeSingle()
  if (operatorErr || !operator) {
    throw new FlexiError('NOT_FOUND', 'Operator not found or not eligible', 404)
  }

  const { data: row, error: rpcErr } = await supabase.rpc('assign_operator_office_v1', {
    p_trusted_actor_id:   profile.id,
    p_trusted_actor_type: deriveActorType(profile.role),
    p_request_id:         requestId,
    p_operator_id:        operator_id,
    p_office_id:          office_id,
  })
  if (rpcErr) throw rpcErr

  return new Response(
    JSON.stringify({ data: row, meta: { request_id: requestId } }),
    { status: 201, headers: { 'Content-Type': 'application/json' } },
  )
}

async function handleUnassignOperator(req: Request, linkId: string): Promise<Response> {
  const requestId = getOrGenerateRequestId(req, 'edge:admin:unassign-operator')
  const { profile } = await requireAuth(req)
  requireRole(profile, ['OWNER', 'ADMIN'])

  if (!isValidUuid(linkId)) {
    throw new FlexiError('BAD_REQUEST', 'Link ID must be a valid UUID', 400)
  }

  const supabase = createServiceClient()

  const { data: link, error: linkErr } = await supabase
    .from('operator_offices')
    .select('id, office_id')
    .eq('id', linkId)
    .is('deleted_at', null)
    .maybeSingle()

  if (linkErr || !link) {
    throw new FlexiError('NOT_FOUND', 'Operator assignment not found', 404)
  }

  if (profile.role === 'OWNER') {
    const { data: office, error: officeErr } = await supabase
      .from('offices')
      .select('id')
      .eq('id', link.office_id)
      .eq('owner_id', profile.id)
      .is('deleted_at', null)
      .maybeSingle()
    if (officeErr || !office) {
      throw new FlexiError('FORBIDDEN', 'You do not own this office', 403)
    }
  }

  const { error: rpcErr } = await supabase.rpc('unassign_operator_office_v1', {
    p_trusted_actor_id:   profile.id,
    p_trusted_actor_type: deriveActorType(profile.role),
    p_request_id:         requestId,
    p_link_id:            linkId,
  })
  if (rpcErr) throw rpcErr

  return new Response(
    JSON.stringify({ data: { id: linkId }, meta: { request_id: requestId } }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  )
}

// ── Maintenance Tasks ─────────────────────────────────────────────────────────

async function handleListMaintenanceTasks(req: Request): Promise<Response> {
  const requestId = getOrGenerateRequestId(req, 'edge:admin:list-maintenance-tasks')
  const { profile } = await requireAuth(req)
  requireRole(profile, ['OWNER', 'OPERATOR', 'ADMIN'])

  const supabase = createServiceClient()

  // Collect all office IDs the caller can manage (owner + operator)
  const [{ data: ownedOffices }, { data: operatedLinks }] = await Promise.all([
    supabase
      .from('offices')
      .select('id')
      .eq('owner_id', profile.id)
      .is('deleted_at', null),
    supabase
      .from('operator_offices')
      .select('office_id')
      .eq('operator_id', profile.id)
      .is('deleted_at', null),
  ])

  if (profile.role === 'ADMIN') {
    // ADMIN sees all tasks
    const { data, error } = await supabase
      .from('maintenance_tasks')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
    if (error) throw error
    return new Response(
      JSON.stringify({ data: data ?? [], meta: { request_id: requestId } }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    )
  }

  const ownedIds = new Set((ownedOffices ?? []).map((o: { id: string }) => o.id))
  const operatedIds = (operatedLinks ?? [])
    .map((o: { office_id: string }) => o.office_id)
    .filter((id: string) => !ownedIds.has(id))
  const allOfficeIds = [...ownedIds, ...operatedIds]

  if (allOfficeIds.length === 0) {
    return new Response(
      JSON.stringify({ data: [], meta: { request_id: requestId } }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    )
  }

  const { data, error } = await supabase
    .from('maintenance_tasks')
    .select('*')
    .in('office_id', allOfficeIds)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (error) throw error

  return new Response(
    JSON.stringify({ data: data ?? [], meta: { request_id: requestId } }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  )
}

async function handleCreateMaintenanceTask(req: Request): Promise<Response> {
  const requestId = getOrGenerateRequestId(req, 'edge:admin:create-maintenance-task')
  const { profile } = await requireAuth(req)
  requireRole(profile, ['OWNER', 'OPERATOR', 'ADMIN'])

  const body = await parseJsonBody(req)
  const { office_id, title, task_type, priority, location, assigned_to } = body

  if (typeof office_id !== 'string' || !isValidUuid(office_id)) {
    throw new FlexiError('BAD_REQUEST', 'office_id must be a valid UUID', 400)
  }
  if (typeof title !== 'string' || !title.trim()) {
    throw new FlexiError('BAD_REQUEST', 'title is required', 400)
  }

  const supabase = createServiceClient()
  const { data, error } = await supabase.rpc('create_maintenance_task_v1', {
    p_trusted_actor_id:   profile.id,
    p_trusted_actor_type: deriveActorType(profile.role),
    p_request_id:         requestId,
    p_office_id:          office_id,
    p_title:              (title as string).trim(),
    p_task_type:          typeof task_type === 'string' ? task_type : 'other',
    p_priority:           typeof priority === 'string' ? priority : 'normal',
    p_location:           typeof location === 'string' ? location : null,
    p_assigned_to:        typeof assigned_to === 'string' ? assigned_to : null,
  })

  if (error) throw error

  return new Response(
    JSON.stringify({ data, meta: { request_id: requestId } }),
    { status: 201, headers: { 'Content-Type': 'application/json' } },
  )
}

async function handleAdvanceTaskStatus(req: Request, taskId: string): Promise<Response> {
  const requestId = getOrGenerateRequestId(req, 'edge:admin:advance-task-status')
  const { profile } = await requireAuth(req)
  requireRole(profile, ['OWNER', 'OPERATOR', 'ADMIN'])

  if (!isValidUuid(taskId)) {
    throw new FlexiError('BAD_REQUEST', 'task ID must be a valid UUID', 400)
  }

  const body = await parseJsonBody(req)
  const { new_status, assigned_to } = body

  if (typeof new_status !== 'string') {
    throw new FlexiError('BAD_REQUEST', 'new_status is required', 400)
  }

  const supabase = createServiceClient()
  const { data, error } = await supabase.rpc('advance_task_status_v1', {
    p_trusted_actor_id:   profile.id,
    p_trusted_actor_type: deriveActorType(profile.role),
    p_request_id:         requestId,
    p_task_id:            taskId,
    p_new_status:         new_status,
    p_assigned_to:        typeof assigned_to === 'string' ? assigned_to : null,
  })

  if (error) throw error

  return new Response(
    JSON.stringify({ data, meta: { request_id: requestId } }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  )
}

Deno.serve(async (req: Request): Promise<Response> => {
  const preflight = handlePreflight(req)
  if (preflight) return preflight

  const pathname = new URL(req.url).pathname

  try {
    const isListOperatorsRoute    = /\/admin\/operators\/?$/.test(pathname)
    const isAssignRoute           = /\/admin\/operator-offices\/?$/.test(pathname)
    const unassignMatch           = pathname.match(/\/admin\/operator-offices\/([^/]+)$/)
    const isMaintenanceTasksRoute = /\/admin\/maintenance\/tasks\/?$/.test(pathname)
    const maintenanceTaskMatch    = pathname.match(/\/admin\/maintenance\/tasks\/([^/]+)$/)

    if (req.method === 'OPTIONS') {
      return addCorsHeaders(new Response(null, { status: 200 }))
    } else if (isListOperatorsRoute && req.method === 'GET') {
      return addCorsHeaders(await handleListOperators(req))
    } else if (isAssignRoute && req.method === 'POST') {
      return addCorsHeaders(await handleAssignOperator(req))
    } else if (unassignMatch && req.method === 'DELETE') {
      return addCorsHeaders(await handleUnassignOperator(req, unassignMatch[1]))
    } else if (isMaintenanceTasksRoute && req.method === 'GET') {
      return addCorsHeaders(await handleListMaintenanceTasks(req))
    } else if (isMaintenanceTasksRoute && req.method === 'POST') {
      return addCorsHeaders(await handleCreateMaintenanceTask(req))
    } else if (maintenanceTaskMatch && req.method === 'PATCH') {
      return addCorsHeaders(await handleAdvanceTaskStatus(req, maintenanceTaskMatch[1]))
    } else {
      throw new FlexiError('NOT_FOUND', 'Route not found', 404)
    }
  } catch (err) {
    return addCorsHeaders(errorResponse(err, req.headers.get('X-Request-ID')))
  }
})