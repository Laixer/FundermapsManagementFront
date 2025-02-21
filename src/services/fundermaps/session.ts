import type { SessionTokens } from './endpoints/auth'

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
  } catch (err) {
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
  if (expires_at) {
    console.log(
      expires_at,
      new Date(expires_at) > new Date(),
      !!(expires_at && new Date(expires_at) > new Date()),
    )
  }
  return !!(expires_at && new Date(expires_at) > new Date())
}

/**
 * The amount of seconds it takes for the access token to expire
 */
export function getExpiresIn() {
  return getSessionTokens()?.expires_in || null
}

/**
 * The ISO Date at which the access token expires
 */
export function getExpiresAt() {
  return getSessionTokens()?.expires_at || null
}
