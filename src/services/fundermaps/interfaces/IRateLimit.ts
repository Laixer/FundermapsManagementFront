export type RateLimitSource = 'ba' | 'legacy'
export type RateLimitPeriod = 'day' | 'month'

/** A configured per-(API key, product) billing-event limit. */
export interface IRateLimit {
  api_key_id: string
  source: RateLimitSource
  product: string
  period: RateLimitPeriod
  limit_count: number
  created_at: string | null
  updated_at: string | null
}

/** A selectable API key for the limit picker (from both key tables). */
export interface IRateLimitKey {
  api_key_id: string
  source: RateLimitSource
  name: string | null
  enabled: boolean
  expires_at: string | null
  organization_id: string | null
  organization_name: string | null
}
