/**
 * Best-effort, human-readable client name from a User-Agent string — enough to
 * tell a browser session from an API client at a glance. Order matters: Edge
 * and Chrome UA strings also contain "Safari"/"Chrome", so check the more
 * specific tokens first.
 */
export const describeClient = (ua: string | null): string => {
  if (!ua) return '—'
  const s = ua.toLowerCase()
  if (s.includes('edg/') || s.includes('edga/') || s.includes('edgios/')) return 'Edge'
  if (s.includes('firefox') || s.includes('fxios')) return 'Firefox'
  if (s.includes('chrome') || s.includes('crios') || s.includes('chromium')) return 'Chrome'
  if (s.includes('safari')) return 'Safari'
  if (s.includes('curl')) return 'curl'
  if (s.includes('postman')) return 'Postman'
  if (/python|node|go-http|okhttp|bun|axios|wget|java\//.test(s)) return 'API client'
  return 'Other'
}
