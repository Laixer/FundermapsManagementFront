import { get } from '../../client'

/**
 * Usage across all customers (API GET /api/management/usage, 2026-10-23):
 * Grafana's two usage boards moved into the portal. The product tracker is the
 * billing record; a product ending in its API version (analysis3) is the
 * billable webservice, one without (analysis) a map or Studio lookup.
 */
export interface IUsageOrganisation {
  id: string
  name: string
  /** This month through yesterday: the rollup is refreshed per day. */
  month_to_date: number
  last_month: number
  last_30_days: number
  previous_30_days: number
  products: { product: string; last_30_days: number }[]
}

export interface IUsageKind {
  calls_today: number
  /** Per product along `months`, largest first. */
  products: { product: string; calls: number[] }[]
  organizations: IUsageOrganisation[]
}

export interface IUsageKey {
  name: string | null
  kind: 'fmsk' | 'legacy'
  owner: string | null
  last_used: string | null
  request_count: number | null
}

export interface IUsage {
  generated_at: string
  /** The last day in the rollup (yesterday, normally). */
  through: string | null
  /** 'YYYY-MM', oldest first, this month last. */
  months: string[]
  webservice: IUsageKind & { last_call_at: string | null }
  maps: IUsageKind
  keys: { active: number; stale_30_days: number; list: IUsageKey[] }
}

export const getUsage = async function getUsage(): Promise<IUsage> {
  return await get({ endpoint: 'management/usage' })
}
