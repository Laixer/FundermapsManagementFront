import { get, post, put } from '../../client'
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

export const updateUser = async function createUser(
  userId: string,
  GivenName: string,
  LastName: string,
  JobTitle: string,
  PhoneNumber: string,
  Avatar: string,
): Promise<IUser> {
  return await put({
    endpoint: `v1/management/user/${userId}`,
    body: {
      GivenName,
      LastName,
      JobTitle,
      PhoneNumber,
      Avatar,
    },
  })
}

export const getUser = async function getUser(userId: string): Promise<IUser> {
  return await get({
    endpoint: `v1/management/user/${userId}`,
  })
}

export const resetPassword = async function resetPassword(userId: string, Password: string) {
  return await post({
    endpoint: `v1/management/user/${userId}/reset-password`,
    body: {
      password: Password,
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
