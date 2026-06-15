import { del, get, put } from '../../client'
import type {
  IRateLimit,
  IRateLimitKey,
  RateLimitPeriod,
  RateLimitSource,
} from '../../interfaces/IRateLimit'

// Mirror the values the Webservice enforces against (api side: routes/product.ts
// rateLimit(<product>) + rate-limit.ts). Used to drive the form selects.
export const RATE_LIMIT_PRODUCTS = ['analysis3', 'risk3', 'light3', 'statistics3'] as const
export const RATE_LIMIT_PERIODS: RateLimitPeriod[] = ['day', 'month']

export const getRateLimits = async function getRateLimits(): Promise<IRateLimit[]> {
  return await get({ endpoint: 'management/rate-limit' })
}

export const getRateLimitKeys = async function getRateLimitKeys(): Promise<IRateLimitKey[]> {
  return await get({ endpoint: 'management/rate-limit/keys' })
}

export const upsertRateLimit = async function upsertRateLimit(body: {
  api_key_id: string
  source: RateLimitSource
  product: string
  period: RateLimitPeriod
  limit_count: number
}): Promise<IRateLimit> {
  return await put({ endpoint: 'management/rate-limit', body })
}

export const deleteRateLimit = async function deleteRateLimit(
  source: RateLimitSource,
  apiKeyId: string,
  product: string,
) {
  return await del({
    endpoint: `management/rate-limit/${source}/${encodeURIComponent(apiKeyId)}/${product}`,
  })
}
