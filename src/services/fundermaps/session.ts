/**
 * The OIDC token set, stored as one JSON blob. `expires_at` is derived from
 * `expires_in` at store time so the refresh timer + validity checks can read
 * it back without re-decoding anything.
 */
export interface SessionTokens {
  access_token: string
  token_type: string // e.g. Bearer
  expires_in: number // seconds
  expires_at: string // ISO date (e.g. 2026-05-22T15:46:03.000Z)
  refresh_token: string // OIDC refresh token (offline_access); rotates each refresh grant
  id_token?: string // OIDC id_token, kept only for end-session's id_token_hint
}

// ****************************************************************************
//  Private
// ****************************************************************************

// localStorage keys
const token_key = 'session_token'

/**
 * Retrieve the session object
 */
function getSessionTokens(): SessionTokens | null {
  try {
    const token = localStorage.getItem(token_key)
    if (token === null) {
      return token
    }

    return JSON.parse(token)
  } catch {
    return null
  }
}

// ****************************************************************************
//  Public
// ****************************************************************************

/**
 * Store the session token information
 */
export function storeSessionTokens(tokens: SessionTokens): void {
  localStorage.setItem(token_key, JSON.stringify(tokens))
}

export function removeSessionTokens(): void {
  localStorage.removeItem(token_key)
}

/**
 * Gets the stored access token.
 */
export function getAccessToken(): string | null {
  return getSessionTokens()?.access_token || null
}

/**
 * Gets the store refresh token
 */
export function getRefreshToken(): string | null {
  return getSessionTokens()?.refresh_token || null
}

/**
 * Gets the stored OIDC id_token (used only as id_token_hint on RP-logout).
 */
export function getIdToken(): string | null {
  return getSessionTokens()?.id_token || null
}

/**
 * Whether an access token is available, expired or not
 */
export function hasAccessToken(): boolean {
  return getAccessToken() !== null
}

/**
 * Whether an refresh token is available, expired or not
 */
export function hasRefreshToken(): boolean {
  return getRefreshToken() !== null
}

/**
 * Whether a valid access token is available (not yet expired)
 */
export function hasValidAccessToken(): boolean {
  const expires_at = getSessionTokens()?.expires_at
  return !!(expires_at && new Date(expires_at) > new Date())
}

/**
 * The amount of seconds it takes for the access token to expire
 */
export function getExpiresIn() {
  return getSessionTokens()?.expires_in || null
}
