import { get, post } from '../../client'
import type { IUser } from '../../interfaces/IUser'

export const createUser = async function createUser(Email: string, Password: string) {
  return await post({
    endpoint: 'v1/management/user',
    body: {
      Email,
      Password,
    },
  })
}

export const resetPassword = async function resetPassword(userId: string, Password: string) {
  return await post({
    endpoint: `v1/management/user/${userId}/reset-password`,
    body: {
      Password,
    },
  })
}

export const createAuthKey = async function createAuthKey(userId: string, Password: string) {
  return await get({
    endpoint: `v1/management/user/${userId}/auth-token`,
  })
}

export const getAllUsers = async function getAllUsers(): Promise<IUser[]> {
  return await get({
    endpoint: 'v1/management/user?limit=1000',
  })
}

// TODO: Update user
// TODO: Search users by (partial) email or name (for add to org)
