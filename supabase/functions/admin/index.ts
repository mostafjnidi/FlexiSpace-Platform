import { requireAuth, requireRole } from '../_shared/auth.ts'
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

  // Restore soft-deleted row if it exists
  const { data: softDeleted } = await supabase
    .from('operator_offices')
    .select('id')
    .eq('operator_id', operator_id)
    .eq('office_id', office_id)
    .not('deleted_at', 'is', null)
    .maybeSingle()

  let row
  if (softDeleted) {
    const { data: restored, error: restoreErr } = await supabase
      .from('operator_offices')
      .update({ deleted_at: null })
      .eq('id', softDeleted.id)
      .select('id, operator_id, office_id, created_at')
      .single()
    if (restoreErr) throw restoreErr
    row = restored
  } else {
    const { data: inserted, error: insertErr } = await supabase
      .from('operator_offices')
      .insert({ operator_id, office_id })
      .select('id, operator_id, office_id, created_at')
      .single()
    if (insertErr) {
      if (insertErr.code === '23505') {
        // Already active — return existing row
        const { data: active } = await supabase
          .from('operator_offices')
          .select('id, operator_id, office_id, created_at')
          .eq('operator_id', operator_id)
          .eq('office_id', office_id)
          .is('deleted_at', null)
          .single()
        row = active
      } else {
        throw insertErr
      }
    } else {
      row = inserted
    }
  }

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

  const { error: deleteErr } = await supabase
    .from('operator_offices')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', linkId)

  if (deleteErr) throw deleteErr

  return new Response(
    JSON.stringify({ data: { id: linkId }, meta: { request_id: requestId } }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  )
}

Deno.serve(async (req: Request): Promise<Response> => {
  const preflight = handlePreflight(req)
  if (preflight) return preflight

  const pathname = new URL(req.url).pathname

  try {
    const isListOperatorsRoute = /\/admin\/operators\/?$/.test(pathname)
    const isAssignRoute = /\/admin\/operator-offices\/?$/.test(pathname)
    const unassignMatch = pathname.match(/\/admin\/operator-offices\/([^/]+)$/)

    if (isListOperatorsRoute && req.method === 'GET') {
      return addCorsHeaders(await handleListOperators(req))
    } else if (isAssignRoute && req.method === 'POST') {
      return addCorsHeaders(await handleAssignOperator(req))
    } else if (unassignMatch && req.method === 'DELETE') {
      return addCorsHeaders(await handleUnassignOperator(req, unassignMatch[1]))
    } else if (req.method === 'OPTIONS') {
      return addCorsHeaders(new Response(null, { status: 200 }))
    } else if (!isListOperatorsRoute && !isAssignRoute && !unassignMatch) {
      throw new FlexiError('NOT_FOUND', 'Route not found', 404)
    } else {
      throw new FlexiError('METHOD_NOT_ALLOWED', 'Method not allowed', 405)
    }
  } catch (err) {
    return addCorsHeaders(errorResponse(err, req.headers.get('X-Request-ID')))
  }
})