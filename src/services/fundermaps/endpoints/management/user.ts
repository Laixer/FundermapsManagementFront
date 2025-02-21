import { get, post } from '../../client'
import type { IUser } from '../../interfaces/IUser'

// export interface IUser {
//   id: string
//   given_name: string
//   last_name: string
//   email: string
//   // avatar: string
//   picture: string
//   job_title: string
//   // PasswordHash: string
//   phone_number: string
//   // AccessFailedCount: number
//   role: string
//   // last_login: string
//   // login_count: number
//   organizations: any[] // TODO: Unknown
// }

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
    endpoint: 'v1/management/user',
  })
}

// TODO: Update user
// TODO: List users
