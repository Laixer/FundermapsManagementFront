import { del, get, post } from '../../client'

export interface IOrg {
  id: string
  name: string
}

export const getAllOrganisations = async function getAllOrganisations(): Promise<IOrg[]> {
  return await get({
    endpoint: 'v1/management/org',
  })
}

export const createOrganisation = async function createOrganisation(Name: string) {
  return await post({
    endpoint: 'v1/management/org',
    body: {
      name: Name,
    },
  })
}

export const addMapsetToOrganisation = async function addMapsetToOrganisation(
  orgId: string,
  MapsetID: string,
) {
  return await post({
    endpoint: `v1/management/org/${orgId}/mapset`,
    body: {
      mapset_id: MapsetID,
    },
  })
}

export const removeMapsetFromOrganisation = async function removeMapsetFromOrganisation(
  orgId: string,
  MapsetID: string,
) {
  return await del({
    endpoint: `v1/management/org/${orgId}/mapset`,
    body: {
      mapset_id: MapsetID,
    },
  })
}

export const getAllOrganisationUsers = async function getAllOrganisationUsers(orgId: string) {
  return await get({
    endpoint: `v1/management/org/${orgId}/user`,
  })
}

export const addUserToOrganisation = async function addUserToOrganisation(
  orgId: string,
  UserID: string,
  Role: string,
) {
  return await post({
    endpoint: `v1/management/org/${orgId}/user`,
    body: {
      user_id: UserID,
      role: Role,
    },
  })
}

export const removeUserFromOrganisation = async function removeUserFromOrganisation(
  orgId: string,
  UserID: string,
) {
  return await del({
    endpoint: `v1/management/org/${orgId}/user`,
    body: {
      user_id: UserID,
    },
  })
}
