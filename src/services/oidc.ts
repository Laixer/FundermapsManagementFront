/**
 * OIDC (authorization-code + PKCE) client for the FunderMaps auth provider.
 *
 * ManagementFront is a trusted first-party OIDC client. Login happens at the
 * auth app (auth.fundermaps.com); we exchange the returned code for an access
 * token + a refresh token (offline_access). The access token is short-lived
 * (1h); the session store's timer refreshes it ~60s before expiry via the
 * refresh grant, and the router refreshes on a cold start when only the
 * refresh token is still valid.
 *
 * Tokens are mapped into the existing `SessionTokens` shape so the store's
 * expiry checks + refresh timer keep working unchanged.
 */
import {
  getIdToken,
  getRefreshToken,
  removeSessionTokens,
  storeSessionTokens,
} from '@/services/fundermaps/session'

const API = (import.meta.env.VITE_FUNDERMAPS_URL || '').replace(/\/+$/, '')
const CLIENT_ID = 'managementfront'
const VERIFIER_KEY = 'oidc_pkce_verifier'
const STATE_KEY = 'oidc_state'

const redirectUri = (): string => `${window.location.origin}/auth/callback`
const postLogoutUri = (): string => `${window.location.origin}/login`

interface OidcTokenResponse {
  access_token?: string
  refresh_token?: string
  id_token?: string
  token_type?: string
  expires_in?: number
}

function base64url(bytes: Uint8Array): string {
  let bin = ''
  for (const b of bytes) bin += String.fromCharCode(b)
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function randomUrlSafe(byteLength: number): string {
  return base64url(crypto.getRandomValues(new Uint8Array(byteLength)))
}

async function pkceChallenge(verifier: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier))
  return base64url(new Uint8Array(digest))
}

/**
 * Map a provider token response into the SessionTokens blob the store reads.
 * A refresh grant may omit id_token (and, defensively, refresh_token) — keep
 * the previously stored values in that case.
 */
function storeFromTokenResponse(tokens: OidcTokenResponse): void {
  const expiresIn = Number(tokens.expires_in) || 3600
  storeSessionTokens({
    access_token: tokens.access_token as string,
    token_type: tokens.token_type || 'Bearer',
    expires_in: expiresIn,
    expires_at: new Date(Date.now() + expiresIn * 1000).toISOString(),
    refresh_token: tokens.refresh_token || getRefreshToken() || '',
    id_token: tokens.id_token || getIdToken() || undefined,
  })
}

/** Begin login: stash PKCE verifier + state, navigate to /oauth2/authorize. */
export async function loginRedirect(): Promise<void> {
  const verifier = randomUrlSafe(48)
  const state = randomUrlSafe(16)
  sessionStorage.setItem(VERIFIER_KEY, verifier)
  sessionStorage.setItem(STATE_KEY, state)

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: 'code',
    redirect_uri: redirectUri(),
    // offline_access → the provider also issues a refresh token.
    scope: 'openid email profile offline_access',
    state,
    code_challenge: await pkceChallenge(verifier),
    code_challenge_method: 'S256',
  })
  window.location.assign(`${API}/api/auth/oauth2/authorize?${params.toString()}`)
}

/** Finish login: validate state, exchange the code for tokens, store them. */
export async function exchangeCode(code: string, state: string): Promise<void> {
  const verifier = sessionStorage.getItem(VERIFIER_KEY)
  const expectedState = sessionStorage.getItem(STATE_KEY)
  if (!verifier || !state || state !== expectedState) {
    throw new Error('Invalid OIDC state')
  }

  const res = await fetch(`${API}/api/auth/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri(),
      client_id: CLIENT_ID,
      code_verifier: verifier,
    }),
  })
  if (!res.ok) throw new Error(`Token exchange failed (${res.status})`)
  const tokens: OidcTokenResponse = await res.json()
  if (!tokens.access_token) throw new Error('No access token in token response')

  storeFromTokenResponse(tokens)
  sessionStorage.removeItem(VERIFIER_KEY)
  sessionStorage.removeItem(STATE_KEY)
}

// Single-flight refresh: concurrent callers share one refresh round-trip.
let refreshInFlight: Promise<boolean> | null = null

/**
 * Exchange the (rotated) refresh token for a fresh access token. Returns true
 * on success (tokens stored). Returns false if there's no refresh token or the
 * provider rejects it — the caller then treats the session as expired.
 */
export function refresh(): Promise<boolean> {
  if (refreshInFlight) return refreshInFlight
  refreshInFlight = doRefresh().finally(() => {
    refreshInFlight = null
  })
  return refreshInFlight
}

async function doRefresh(): Promise<boolean> {
  const refreshToken = getRefreshToken()
  if (!refreshToken) return false
  try {
    const res = await fetch(`${API}/api/auth/oauth2/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: CLIENT_ID,
      }),
    })
    if (!res.ok) return false
    const tokens: OidcTokenResponse = await res.json()
    if (!tokens.access_token) return false
    storeFromTokenResponse(tokens) // rotates the refresh token too
    return true
  } catch {
    return false
  }
}

/**
 * RP-initiated logout: clear local tokens, then end the SSO session at the
 * provider and return to the login page. Falls back to a plain navigation to
 * /login if there's no id_token to hint with.
 */
export function logoutRedirect(): void {
  const idToken = getIdToken()
  removeSessionTokens()
  if (!idToken) {
    window.location.assign(postLogoutUri())
    return
  }
  const params = new URLSearchParams({
    id_token_hint: idToken,
    post_logout_redirect_uri: postLogoutUri(),
    client_id: CLIENT_ID,
  })
  window.location.assign(`${API}/api/auth/oauth2/end-session?${params.toString()}`)
}
