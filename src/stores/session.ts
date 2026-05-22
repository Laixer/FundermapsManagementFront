import { computed, type ShallowRef, shallowRef, watch } from 'vue'
import { defineStore } from 'pinia'
import { useRouter } from 'vue-router'

import type { IUser } from '@/services/fundermaps/interfaces/IUser'
import api from '@/services/fundermaps'
import {
  getExpiresIn,
  hasRefreshToken,
  hasValidAccessToken,
  removeSessionTokens,
} from '@/services/fundermaps/session'
import { refresh as oidcRefresh, logoutRedirect as oidcLogoutRedirect } from '@/services/oidc'

/**
 * Holds the information of the logged in user
 */
const currentUser: ShallowRef<IUser | null> = shallowRef(null)

/**
 * If we have user info, we can consider the user authenticated
 */
const isAuthenticated = computed<boolean>(() => {
  return currentUser.value !== null
})

/**
 * Whether the logged in user is an administrator
 */
const isAdministrator = computed<boolean>(() => {
  return currentUser.value !== null && currentUser.value.role === 'administrator'
})

/**
 * reference to the interval loop in which the access token is refreshed
 */
let refreshInterval: ReturnType<typeof setInterval> | null = null

/**
 * Restore the user from a still-valid access token (page load within the
 * token's 1h lifetime). Used by the router guard and the OIDC callback.
 */
async function authenticateFromAccessToken() {
  try {
    if (!hasValidAccessToken()) {
      clearLocalSession()
      return
    }

    currentUser.value = await api.user.me()
  } catch (e) {
    console.error(e)

    // clean up a partial success if need be
    clearLocalSession()

    throw e // pass on the unhappy news
  }
}

/**
 * Cold start with an expired access token but a live refresh token
 * (offline_access): swap the refresh token for a fresh access token, then
 * load the user. Lets a returning admin skip the login round-trip.
 */
async function loginFromRefreshToken() {
  try {
    if (!hasRefreshToken()) {
      clearLocalSession()
      return
    }

    const ok = await oidcRefresh()
    if (!ok) {
      clearLocalSession()
      return
    }

    currentUser.value = await api.user.me()
  } catch (e) {
    console.error(e)

    // clean up a partial success if need be
    clearLocalSession()

    throw e // pass on the unhappy news
  }
}

/**
 * Clear local session state without touching the server.
 */
function clearLocalSession() {
  removeSessionTokens()
  currentUser.value = null
}

/**
 * Local logout: drop the session client-side without ending the SSO session
 * at the provider. Used when the component is already navigating away.
 */
function logout() {
  clearLocalSession()
}

/**
 *
 */
function useSession() {
  const router = useRouter()

  /**
   * User-initiated logout: end the SSO session at the provider
   * (RP-initiated, via /oauth2/end-session), which returns to /login. Null
   * the user first so the authed shell doesn't flash before the browser
   * navigates away. No router.push — `oidcLogoutRedirect` does a full-page
   * navigation.
   */
  function logoutAndRedirect() {
    currentUser.value = null
    oidcLogoutRedirect()
  }

  /**
   * Session lapsed (refresh rejected): drop local state and bounce to
   * /login, whose guard re-runs the OIDC flow — a live SSO session re-auths
   * silently, a dead one lands on the auth app's login form. Distinct from
   * logoutAndRedirect, which deliberately ends the SSO session.
   */
  function sessionExpiredRedirect() {
    clearLocalSession()
    if (router.currentRoute.value.name !== 'login') {
      router.push({ name: 'login' })
    }
  }

  /**
   * Refresh the access token via the OIDC refresh grant. On failure the
   * session has lapsed — bounce to login to re-auth.
   */
  async function refreshSessionToken() {
    const ok = await oidcRefresh()
    if (!ok) {
      sessionExpiredRedirect()
    }
  }

  /**
   * Start a loop to refresh the access token upon authentication
   */
  watch(
    () => isAdministrator.value,
    () => {
      if (isAdministrator.value) {
        const expiresIn = getExpiresIn()

        if (expiresIn === null) {
          sessionExpiredRedirect()
          return
        }

        refreshInterval = setInterval(refreshSessionToken, Math.max(30, expiresIn - 60) * 1000)
      } else if (refreshInterval !== null) {
        clearInterval(refreshInterval)
        refreshInterval = null
      }
    },
  )

  return {
    currentUser,
    isAuthenticated,
    isAdministrator,
    authenticateFromAccessToken,
    loginFromRefreshToken,
    logout,
    logoutAndRedirect,
  }
}

export const useSessionStore = defineStore('session', useSession)
