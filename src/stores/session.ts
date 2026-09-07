import { computed, type ShallowRef, shallowRef } from 'vue'
import { defineStore } from 'pinia'

import type { IUser } from '@/services/fundermaps/interfaces/IUser'
import api from '@/services/fundermaps'
import { loginRedirect, logoutRedirect } from '@/services/auth'

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
 * Load the user behind the session cookie. Throws when there is no session
 * (the API answers 401), so the router guard can send the user to log in.
 */
async function authenticate() {
  try {
    currentUser.value = await api.user.me()
  } catch (e) {
    clearLocalSession()
    throw e
  }
}

/**
 * Clear local session state without touching the server.
 */
function clearLocalSession() {
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
  /**
   * User-initiated logout: end the session at the API (clears the cookie)
   * and land on the auth app's login page. Null the user first so the
   * authed shell doesn't flash before the browser navigates away.
   */
  function logoutAndRedirect() {
    currentUser.value = null
    void logoutRedirect()
  }

  /**
   * Session lapsed: drop local state and go log in again; the auth app
   * returns the user to the current page afterwards.
   */
  function sessionExpiredRedirect() {
    clearLocalSession()
    loginRedirect()
  }

  return {
    currentUser,
    isAuthenticated,
    isAdministrator,
    authenticate,
    logout,
    logoutAndRedirect,
    sessionExpiredRedirect,
  }
}

export const useSessionStore = defineStore('session', useSession)
