import { get } from '../../client'
import type { IJob } from '../../interfaces/IJob'

export const JOBS_LIST_LIMIT = 100

export const getAllJobs = async function getAllJobs(): Promise<IJob[]> {
  return await get({
    endpoint: `v1/management/jobs?limit=${JOBS_LIST_LIMIT}`,
  })
}
