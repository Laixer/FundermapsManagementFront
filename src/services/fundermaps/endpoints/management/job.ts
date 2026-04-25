import { get } from '../../client'
import type { IJob } from '../../interfaces/IJob'

export const JOBS_LIST_LIMIT = 100

export const getAllJobs = async function getAllJobs(): Promise<IJob[]> {
  return await get({
    endpoint: `management/jobs?limit=${JOBS_LIST_LIMIT}`,
  })
}

export const getJob = async function getJob(jobId: number): Promise<IJob> {
  return await get({
    endpoint: `management/jobs/${jobId}`,
  })
}
