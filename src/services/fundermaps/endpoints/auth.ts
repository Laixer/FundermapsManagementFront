import { post, get } from '../client'

export interface LoginResponse {
  access_token: string
  token_type: string // e.g. Bearer
  expires_in: number // seconds
  expires_at: string // ISO Date (e.g. 2025-02-19T15:46:03.026738348Z)
  refresh_token: string // legacy field; Better Auth doesn't use refresh tokens
}

export type SessionTokens = LoginResponse

interface BetterAuthSession {
  token: string
  expiresAt: string
  userId: string
  id: string
}

interface BetterAuthSignInResponse {
  redirect: boolean
  token: string
  user: { id: string; email: string; role?: string }
}

interface BetterAuthGetSessionResponse {
  session: BetterAuthSession
  user: { id: string; email: string; role?: string }
}

/**
 * Translate Better Auth's sign-in response into the LoginResponse shape the
 * rest of the frontend expects.
 */
function shapeFromBA(token: string, expiresAtIso: string): LoginResponse {
  const expiresIn = Math.max(
    0,
    Math.floor((new Date(expiresAtIso).getTime() - Date.now()) / 1000),
  )
  return {
    access_token: token,
    token_type: 'Bearer',
    expires_in: expiresIn,
    expires_at: expiresAtIso,
    refresh_token: '',
  }
}

// Better Auth default session length. Hard-coded because the sign-in
// response doesn't include the session expiry; refresh() corrects it
// using the real /get-session value once the bearer is stored.
const BA_DEFAULT_SESSION_SEC = 7 * 24 * 60 * 60

export const login = async function login(
  email: string,
  password: string,
): Promise<LoginResponse> {
  const res: BetterAuthSignInResponse = await post({
    endpoint: '/auth/sign-in/email',
    body: { email, password },
    requireAuth: false,
  })
  const expiresAt = new Date(Date.now() + BA_DEFAULT_SESSION_SEC * 1000).toISOString()
  return shapeFromBA(res.token, expiresAt)
}

/**
 * Better Auth has no refresh token concept — sessions are extended in-place
 * via /get-session as long as the bearer is still valid. This call serves
 * the same purpose as the legacy refresh: confirm the session is alive and
 * return a fresh expires_at.
 *
 * If the session is dead, this throws and the caller redirects to login.
 */
export const refresh = async function refresh(
  _refreshToken: string,
): Promise<LoginResponse> {
  const res: BetterAuthGetSessionResponse = await get({
    endpoint: '/auth/get-session',
    requireAuth: true,
  })
  if (!res?.session?.token) throw new Error('Session expired')
  return shapeFromBA(res.session.token, res.session.expiresAt)
}

/**
 * Change a logged-in user's password.
 * Better Auth's body is { currentPassword, newPassword } (camelCase).
 */
export const changePassword = async function changePassword(
  oldPassword: string,
  newPassword: string,
) {
  return await post({
    endpoint: '/auth/change-password',
    body: {
      currentPassword: oldPassword,
      newPassword,
    },
    requireAuth: true,
  })
}

/**
 * Invalidate the current Better Auth session server-side. Caller is
 * responsible for clearing local tokens afterwards.
 */
export const signOut = async function signOut() {
  return await post({
    endpoint: '/auth/sign-out',
    requireAuth: true,
    autoredirect: false,
  })
}

export default {
  login,
  refresh,
  changePassword,
  signOut,
}
