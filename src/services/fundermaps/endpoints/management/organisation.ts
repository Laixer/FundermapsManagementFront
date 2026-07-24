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

export const updateOrganisationUserRole = async function updateOrganisationUserRole(
  orgId: string,
  UserID: string,
  Role: string,
) {
  return await put({
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

// Roles endpoints (#1006 dynamic custom roles)

// A permission map: resource → granted actions (e.g. { inquiry: ['read'] }).
export type IPermissionMap = Record<string, string[]>

// API response shape for /api/management/org/:id/role (Drizzle row keys).
export interface ICustomRole {
  id: string
  organizationId: string
  role: string
  permission: IPermissionMap
  createdAt: string
  updatedAt: string | null
}

// Static metadata for the permission matrix: the resources/actions a custom
// role may grant, plus what the four fixed roles resolve to (read-only).
export interface IPermissionMetadata {
  resources: IPermissionMap
  fixed_roles: Record<string, IPermissionMap>
}

export const getPermissionMetadata = async function getPermissionMetadata(): Promise<IPermissionMetadata> {
  return await get({ endpoint: 'management/permission' })
}

export const getOrganisationRoles = async function getOrganisationRoles(
  orgId: string,
): Promise<ICustomRole[]> {
  return await get({ endpoint: `management/org/${orgId}/role` })
}

export const createOrganisationRole = async function createOrganisationRole(
  orgId: string,
  name: string,
  permission: IPermissionMap,
): Promise<ICustomRole> {
  return await post({
    endpoint: `management/org/${orgId}/role`,
    body: { name, permission },
  })
}

export const updateOrganisationRole = async function updateOrganisationRole(
  orgId: string,
  roleId: string,
  payload: { name?: string; permission?: IPermissionMap },
): Promise<ICustomRole> {
  return await put({
    endpoint: `management/org/${orgId}/role/${roleId}`,
    body: payload,
  })
}

export const deleteOrganisationRole = async function deleteOrganisationRole(
  orgId: string,
  roleId: string,
) {
  return await del({ endpoint: `management/org/${orgId}/role/${roleId}` })
}

// Geolock endpoints

// API response shape for /api/management/org/:id/{district|municipality|neighborhood}
// — the BAG code as `id`, plus the geocoder name (may be null if a
// junction row references a code that no longer exists in geocoder).
export interface IGeolock {
  id: string
  name: string | null
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


// Billable product usage from application.product_tracker. Grafana
// (analytics.fundermaps.com) remains the home for trends and alerting; this
// is the in-context "what is this customer consuming right now" lookup.
export interface IUsageProduct {
  product: string
  month_to_date: number
  last_30_days: number
}

export interface IOrgUsage {
  products: IUsageProduct[]
  total: {
    month_to_date: number
    last_30_days: number
  }
}

export const getOrganisationUsage = async function getOrganisationUsage(
  orgId: string,
): Promise<IOrgUsage> {
  return await get({ endpoint: `management/org/${orgId}/usage` })
}
