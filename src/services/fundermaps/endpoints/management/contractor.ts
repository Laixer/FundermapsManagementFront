import { get, post, put } from '../../client'

export interface IContractor {
  id: number
  name: string
}

export const getAllContractors = async function getAllContractors(): Promise<IContractor[]> {
  return await get({
    endpoint: 'management/contractor',
  })
}

export const createContractor = async function createContractor(name: string) {
  return await post({
    endpoint: 'management/contractor',
    body: { name },
  })
}

export const updateContractor = async function updateContractor(
  contractorId: number,
  name: string,
) {
  return await put({
    endpoint: `management/contractor/${contractorId}`,
    body: { name },
  })
}
