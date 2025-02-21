import { get, post } from '../../client'

export interface IApplication {
  id: string
  name: string
  data: string
}

export const getAllApplications = async function getAllApplications(): Promise<IApplication[]> {
  return await get({
    endpoint: 'v1/management/app',
  })
}

// TODO: Allow application data
// TODO: Allow application id (to allow usage of id as slug)
export const createApplication = async function createApplication(Name: string) {
  return await post({
    endpoint: `v1/management/app`,
    body: {
      Name,
    },
  })
}

// TODO: Get application
// TODO: Update application
// TODO: Remove application
