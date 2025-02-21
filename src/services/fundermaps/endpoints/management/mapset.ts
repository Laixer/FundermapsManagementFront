import { get } from '../../client'
import type { IMapset } from '../../interfaces/IMapset'

export const getAllMapsets = async function getAllMapsets(): Promise<IMapset[]> {
  return await get({
    endpoint: 'v1/management/mapset',
  })
}
