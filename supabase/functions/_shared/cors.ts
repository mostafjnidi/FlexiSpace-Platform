export function getAllowedOrigin(): string {
  return Deno.env.get('ALLOWED_ORIGIN') ?? 'http://localhost:5173'
}

export function buildCorsHeaders(): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': getAllowedOrigin(),
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type, X-Request-ID',
    'Access-Control-Max-Age': '86400',
  }
}

export function handlePreflight(req: Request): Response | null {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: buildCorsHeaders() })
  }
  return null
}

export function addCorsHeaders(response: Response): Response {
  const newHeaders = new Headers(response.headers)
  const corsHeaders = buildCorsHeaders()
  for (const [key, value] of Object.entries(corsHeaders)) {
    newHeaders.set(key, value)
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  })
}