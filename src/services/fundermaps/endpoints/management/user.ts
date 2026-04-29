import { del, get, post, put } from '../../client'
import type { IUser } from '../../interfaces/IUser'

export const createUser = async function createUser(email: string, password: string) {
  return await post({
    endpoint: 'management/user',
    body: {
      email,
      password,
    },
  })
}

export const updateUser = async function updateUser(
  userId: string,
  GivenName: string,
  LastName: string,
  JobTitle: string,
  PhoneNumber: string,
  Avatar: string,
  Email?: string,
): Promise<IUser> {
  const body: Record<string, string> = {
    given_name: GivenName,
    family_name: LastName,
    job_title: JobTitle,
    phone_number: PhoneNumber,
    picture: Avatar,
  }

  if (Email) {
    body.email = Email
  }

  return await put({
    endpoint: `management/user/${userId}`,
    body,
  })
}

export const getUser = async function getUser(userId: string): Promise<IUser> {
  return await get({
    endpoint: `management/user/${userId}`,
  })
}

export const resetPassword = async function resetPassword(userId: string, Password: string) {
  return await post({
    endpoint: `management/user/${userId}/reset-password`,
    body: {
      password: Password,
    },
  })
}

export const getAPIKeys = async function getAPIKeys(userId: string) {
  return await get({
    endpoint: `management/user/${userId}/api-key`,
  })
}

export const createAPIKey = async function createAPIKey(userId: string) {
  return await post({
    endpoint: `management/user/${userId}/api-key`,
  })
}

export const deleteAPIKey = async function deleteAPIKey(userId: string, id: string) {
  return await del({
    endpoint: `management/user/${userId}/api-key`,
    body: { id },
  })
}

export const USERS_LIST_LIMIT = 1000

export const getAllUsers = async function getAllUsers(): Promise<IUser[]> {
  return await get({
    endpoint: `management/user?limit=${USERS_LIST_LIMIT}`,
  })
}

export const deleteUser = async function deleteUser(userId: string) {
  return await del({
    endpoint: `management/user/${userId}`,
  })
}

export const updateUserRole = async function updateUserRole(userId: string, role: string) {
  return await put({
    endpoint: `management/user/${userId}`,
    body: { role },
  })
}

