import { createRouter, createWebHistory } from 'vue-router'
import {
  hasAccessToken,
  hasRefreshToken,
  hasValidAccessToken,
} from '@/services/fundermaps/session'
import { loginRedirect } from '@/services/oidc'
import { useSessionStore } from '@/stores/session'
import { storeToRefs } from 'pinia'

import DashboardView from '@/views/DashboardView.vue'
import OrganisationListView from '@/views/OrganisationListView.vue'
import MapsetListView from '@/views/MapsetListView.vue'
import JobListView from '@/views/JobListView.vue'
import SessionListView from '@/views/SessionListView.vue'
import UserListView from '@/views/UserListView.vue'
import RateLimitListView from '@/views/RateLimitListView.vue'
import Login from '@/views/auth/Login.vue'
import Callback from '@/views/auth/Callback.vue'
import NoAccess from '@/views/auth/403.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    /**************************************************************************
     * Authentication
     */
    {
      name: 'login',
      path: '/login',
      component: Login,
      // Login lives at the auth app — kick off the OIDC redirect before the
      // (placeholder) component renders, so the old login form never flashes.
      beforeEnter: async () => {
        await loginRedirect()
        return false
      },
    },

    {
      // OIDC redirect target: exchanges the code for tokens (Callback.vue).
      name: 'auth-callback',
      path: '/auth/callback',
      component: Callback,
    },

    {
      name: '403',
      path: '/403',
      component: NoAccess,
    },

    {
      name: 'home',
      path: '/',
      redirect: { name: 'dashboard' },
    },
    {
      name: 'dashboard',
      path: '/dashboard',
      component: DashboardView,
    },
    {
      name: 'organisations',
      path: '/organisation/:id?',
      component: OrganisationListView,
    },

    {
      name: 'mapsets',
      path: '/mapset/:id?',
      component: MapsetListView,
    },

    {
      name: 'users',
      path: '/user/:id?',
      component: UserListView,
    },

    {
      name: 'jobs',
      path: '/job/:id?',
      component: JobListView,
    },

    {
      name: 'sessions',
      path: '/session/:id?',
      component: SessionListView,
    },

    {
      name: 'rate-limits',
      path: '/rate-limit/:id?',
      component: RateLimitListView,
    },
  ],
})

router.beforeEach(async (to) => {
  // The OIDC callback owns its own auth (it exchanges the code for tokens);
  // never gate it or it'd bounce to login before the exchange runs.
  if (to.name === 'auth-callback') return

  const sessionStore = useSessionStore()
  const { isAuthenticated, isAdministrator } = storeToRefs(sessionStore)

  // Restore the session on page load. Prefer a still-valid access token;
  // otherwise fall back to the refresh token (offline_access) so a returning
  // admin re-mints a session without a login round-trip.
  if (to.name !== '403' && !isAuthenticated.value) {
    try {
      if (hasAccessToken() && hasValidAccessToken()) {
        await sessionStore.authenticateFromAccessToken()
      } else if (hasRefreshToken()) {
        await sessionStore.loginFromRefreshToken()
      }
    } catch {
      // session validation/refresh failed — store has already cleaned up
    }
  }

  // make sure the user is authenticated
  if (
    // Avoid an infinite redirect
    to.name !== 'login' &&
    !isAuthenticated.value
  ) {
    // redirect the user to the login page (its beforeEnter starts the OIDC flow)
    return { name: 'login' }
  }

  // Only administrators are allowed access
  if (to.name !== '403' && to.name !== 'login') {
    if (!isAdministrator.value) {
      return { name: '403' }
    }
  }
})
export default router
