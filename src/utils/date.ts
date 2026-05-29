const DATE_FORMAT: Intl.DateTimeFormatOptions = {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
}

/** Format an ISO date string as e.g. "5 May 2026, 14:30" (en-GB), or "—" if null. */
export const formatDate = (date: string | null): string =>
  date ? new Date(date).toLocaleString('en-GB', DATE_FORMAT) : '—'

/**
 * Human-readable time remaining until `expiresAt`, relative to `now` (ms since
 * epoch). Coarse-grained (minutes/hours/days) — callers typically tick `now`
 * once a minute, so finer units would just look stale.
 */
export const formatValidFor = (expiresAt: string, now: number): string => {
  const diffMs = new Date(expiresAt).getTime() - now
  if (diffMs <= 0) return 'expired'

  const minutes = Math.floor(diffMs / 60_000)
  if (minutes < 60) return `${minutes}m`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) {
    const m = minutes % 60
    return m ? `${hours}h ${m}m` : `${hours}h`
  }

  const days = Math.floor(hours / 24)
  const h = hours % 24
  return h ? `${days}d ${h}h` : `${days}d`
}

/**
 * Normalise an IP address for display. IPv6 from the proxy arrives expanded
 * (e.g. 2a02:a473:7505:0000:…); the WHATWG URL parser compresses it to
 * RFC 5952. IPv4 and unparseable strings pass through unchanged.
 */
export const formatIpAddress = (ip: string | null): string => {
  if (!ip) return '—'
  if (!ip.includes(':')) return ip
  try {
    return new URL(`http://[${ip}]`).hostname.replace(/^\[|\]$/g, '')
  } catch {
    return ip
  }
}
