import { del, get, post, put } from '../../client'

export interface IOrg {
  id: string
  name: string
}

export const getAllOrganisations = async function getAllOrganisations(): Promise<IOrg[]> {
  return await get({
    endpoint: 'management/org',
  })
}

export const createOrganisation = async function createOrganisation(Name: string) {
  return await post({
    endpoint: 'management/org',
    body: {
      name: Name,
    },
  })
}

export const getOrganisationMapsets = async function getOrganisationMapsets(orgId: string) {
  return await get({
    endpoint: `management/org/${orgId}/mapset`,
  })
}

export const addMapsetToOrganisation = async function addMapsetToOrganisation(
  orgId: string,
  MapsetID: string,
) {
  return await post({
    endpoint: `management/org/${orgId}/mapset`,
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
    endpoint: `management/org/${orgId}/mapset`,
    body: {
      mapset_id: MapsetID,
    },
  })
}

export const getAllOrganisationUsers = async function getAllOrganisationUsers(orgId: string) {
  return await get({
    endpoint: `management/org/${orgId}/user`,
  })
}

export const addUserToOrganisation = async function addUserToOrganisation(
  orgId: string,
  UserID: string,
  Role: string,
) {
  return await post({
    endpoint: `management/org/${orgId}/user`,
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
    endpoint: `management/org/${orgId}/user`,
    body: {
      user_id: UserID,
    },
  })
}

export const updateOrganisation = async function updateOrganisation(orgId: string, name: string) {
  return await put({
    endpoint: `management/org/${orgId}`,
    body: { name },
  })
}

export const deleteOrganisation = async function deleteOrganisation(orgId: string) {
  return await del({
    endpoint: `management/org/${orgId}`,
  })
}

// Geolock endpoints

export interface IGeolock {
  organization_id: string
  district_id?: string
  municipality_id?: string
  neighborhood_id?: string
}

export const getGeolockDistricts = async function getGeolockDistricts(
  orgId: string,
): Promise<IGeolock[]> {
  return await get({ endpoint: `management/org/${orgId}/district` })
}

export const addGeolockDistrict = async function addGeolockDistrict(
  orgId: string,
  districtId: string,
) {
  return await post({
    endpoint: `management/org/${orgId}/district`,
    body: { district_id: districtId },
  })
}

export const removeGeolockDistrict = async function removeGeolockDistrict(
  orgId: string,
  districtId: string,
) {
  return await del({
    endpoint: `management/org/${orgId}/district`,
    body: { district_id: districtId },
  })
}

export const getGeolockMunicipalities = async function getGeolockMunicipalities(
  orgId: string,
): Promise<IGeolock[]> {
  return await get({ endpoint: `management/org/${orgId}/municipality` })
}

export const addGeolockMunicipality = async function addGeolockMunicipality(
  orgId: string,
  municipalityId: string,
) {
  return await post({
    endpoint: `management/org/${orgId}/municipality`,
    body: { municipality_id: municipalityId },
  })
}

export const removeGeolockMunicipality = async function removeGeolockMunicipality(
  orgId: string,
  municipalityId: string,
) {
  return await del({
    endpoint: `management/org/${orgId}/municipality`,
    body: { municipality_id: municipalityId },
  })
}

export const getGeolockNeighborhoods = async function getGeolockNeighborhoods(
  orgId: string,
): Promise<IGeolock[]> {
  return await get({ endpoint: `management/org/${orgId}/neighborhood` })
}

export const addGeolockNeighborhood = async function addGeolockNeighborhood(
  orgId: string,
  neighborhoodId: string,
) {
  return await post({
    endpoint: `management/org/${orgId}/neighborhood`,
    body: { neighborhood_id: neighborhoodId },
  })
}

export const removeGeolockNeighborhood = async function removeGeolockNeighborhood(
  orgId: string,
  neighborhoodId: string,
) {
  return await del({
    endpoint: `management/org/${orgId}/neighborhood`,
    body: { neighborhood_id: neighborhoodId },
  })
}

