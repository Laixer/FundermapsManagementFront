import { get } from '../../client'
import type { ILayer } from '../../interfaces/ILayer'

export const getAllLayers = async function getAllLayers(): Promise<ILayer[]> {
  return await get({
    endpoint: 'management/layer',
  })
}
