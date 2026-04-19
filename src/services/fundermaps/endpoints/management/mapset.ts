import { get, put } from '../../client'
import type { IMapset } from '../../interfaces/IMapset'

export const getAllMapsets = async function getAllMapsets(): Promise<IMapset[]> {
  return await get({
    endpoint: 'v1/management/mapset',
  })
}

export const getMapset = async function getMapset(mapsetId: string): Promise<IMapset> {
  return await get({
    endpoint: `v1/management/mapset/${mapsetId}`,
  })
}

export const replaceMapsetLayers = async function replaceMapsetLayers(
  mapsetId: string,
  layerIds: string[],
) {
  return await put({
    endpoint: `v1/management/mapset/${mapsetId}/layers`,
    body: { layers: layerIds },
  })
}
