import { get, post } from '../client'

export interface LoginResponse {
  access_token: string
  token_type: string // e.g. Bearer
  expires_in: number // seconds
  expires_at: string // ISO Date (e.g. 2025-02-19T15:46:03.026738348Z)
  refresh_token: string // currently set to expire in 365 days
}

export interface SessionTokens extends LoginResponse {}

export const login = async function login(email: string, password: string): Promise<LoginResponse> {
  return await post({
    endpoint: '/auth/signin',
    body: {
      email,
      password,
    },
    requireAuth: false,
  })
}

export const refresh = async function refresh(refreshToken: string) {
  return await post({
    endpoint: 'auth/token-refresh',
    body: {
      refresh_token: refreshToken,
    },
    requireAuth: true,
  })
}

/**
 * Send a request to change a password
 *  Note: this is only for users who are logged in
 */
export const changePassword = async function changePassword(
  oldPassword: string,
  newPassword: string,
) {
  return await post({
    endpoint: '/auth/change-password',
    body: {
      oldPassword: oldPassword,
      newPassword: newPassword,
    },
    requireAuth: true,
  })
}

export default {
  login,
  refresh,
  changePassword,
}
