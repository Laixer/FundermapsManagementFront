export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'retry'

export interface IJob {
  id: number
  job_type: string
  payload: Record<string, unknown> | null
  status: JobStatus
  priority: number
  retry_count: number
  max_retries: number
  last_error: string | null
  process_after: string | null
  created_at: string
  updated_at: string
}
