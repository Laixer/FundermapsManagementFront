import { get } from '../client'
import type { IUser } from '../interfaces/IUser'

export const me = async function me(): Promise<IUser> {
  return await get({
    endpoint: '/user/me',
    requireAuth: true,
  })
}

// TODO: Profile update

export default {
  me,
}
