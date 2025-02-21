import { computed, type ShallowRef, shallowRef, watch } from 'vue'
import { defineStore } from 'pinia'
import { useRouter } from 'vue-router'

import type { IUser } from '@/services/fundermaps/interfaces/IUser'
import api from '@/services/fundermaps'
import {
  getExpiresIn,
  getRefreshToken,
  hasValidAccessToken,
  removeSessionTokens,
  storeSessionTokens,
} from '@/services/fundermaps/session'

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
 * Login, store the tokens and obtain the user information
 */
async function login(email: string, password: string) {
  try {
    const response = await api.auth.login(email, password)
    storeSessionTokens(response)

    currentUser.value = await api.user.me()
  } catch (e) {
    console.log(e)

    try {
      // clean up a partial success if need be
      logout()
    } catch (e) {}

    throw e // pass on the unhappy news
  }
}

async function loginFromRefreshToken() {
  try {
    const refreshToken = getRefreshToken()
    if (!refreshToken) {
      logout()
      return
    }

    const response = await api.auth.refresh(refreshToken)
    storeSessionTokens(response)

    currentUser.value = await api.user.me()
  } catch (e) {
    console.log(e)

    try {
      // clean up a partial success if need be
      logout()
    } catch (e) {}

    throw e // pass on the unhappy news
  }
}

async function authenticateFromAccessToken() {
  try {
    if (!hasValidAccessToken()) {
      logout()
      return
    }

    currentUser.value = await api.user.me()
  } catch (e) {
    console.log(e)

    try {
      // clean up a partial success if need be
      logout()
    } catch (e) {}

    throw e // pass on the unhappy news
  }
}

/**
 * Clean up the session information
 */
function logout() {
  console.log('LOGOUT')
  removeSessionTokens()
  currentUser.value = null
}

/**
 *
 */
function useSession() {
  const router = useRouter()

  /**
   * Clean up the session information and redirect to the login page
   */
  function logoutAndRedirect() {
    logout()

    router.push({ name: 'login' })
  }
  /**
   * Refresh the access token. Logout and redirect whenever something is wrong
   */
  async function refreshSessionToken() {
    const refreshToken = getRefreshToken()
    if (!refreshToken) {
      logoutAndRedirect()
      return
    }

    await api.auth
      .refresh(refreshToken)
      .then((response) => {
        // Make sure we're still authenticated
        if (!isAuthenticated.value) {
          logoutAndRedirect()
          return
        }

        storeSessionTokens(response)
      })
      .catch(logoutAndRedirect)
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
          logoutAndRedirect()
          return
        }

        refreshInterval = setInterval(refreshSessionToken, (expiresIn - 60) * 1000)
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
    login,
    loginFromRefreshToken,
    logout,
    logoutAndRedirect,
  }
}

export const useSessionStore = defineStore('session', useSession)
