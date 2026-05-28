export function generateRequestId(prefix: string): string {
  const id = `${prefix}:${crypto.randomUUID()}`
  return id.length > 128 ? id.slice(0, 128) : id
}

export function getOrGenerateRequestId(req: Request, prefix: string): string {
  const header = req.headers.get('X-Request-ID')
  if (header !== null && header.length > 0 && header.length <= 128) {
    return header
  }
  return generateRequestId(prefix)
}