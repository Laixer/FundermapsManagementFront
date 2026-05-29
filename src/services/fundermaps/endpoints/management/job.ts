import { get, post } from '../../client'
import type { IJob } from '../../interfaces/IJob'

export const JOBS_LIST_LIMIT = 100

export const getAllJobs = async function getAllJobs(opts?: {
  status?: string
  jobType?: string
}): Promise<IJob[]> {
  const params = new URLSearchParams({ limit: String(JOBS_LIST_LIMIT) })
  if (opts?.status) params.set('status', opts.status)
  if (opts?.jobType) params.set('job_type', opts.jobType)
  return await get({ endpoint: `management/jobs?${params.toString()}` })
}

export const getJob = async function getJob(jobId: number): Promise<IJob> {
  return await get({
    endpoint: `management/jobs/${jobId}`,
  })
}

/** Cancel a pending or retry job (server marks it failed with "Cancelled by admin"). */
export const cancelJob = async function cancelJob(jobId: number): Promise<IJob> {
  return await post({ endpoint: `management/jobs/${jobId}/cancel` })
}
