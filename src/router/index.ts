import { createRouter, createWebHistory } from 'vue-router'
import { hasAccessToken, hasValidAccessToken } from '@/services/fundermaps/session'
import { useSessionStore } from '@/stores/session'
import { storeToRefs } from 'pinia'

import OrganisationListView from '@/views/OrganisationListView.vue'
import MapsetListView from '@/views/MapsetListView.vue'
import JobListView from '@/views/JobListView.vue'
import UserListView from '@/views/UserListView.vue'
import Login from '@/views/auth/Login.vue'
import NoAccess from '@/views/auth/403.vue'

const router = createRouter({
  linkActiveClass: 'font-bold',
  linkExactActiveClass: 'font-bold',
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    /**************************************************************************
     * Authentication
     */
    {
      name: 'login',
      path: '/login',
      component: Login,
    },

    {
      name: '403',
      path: '/403',
      component: NoAccess,
    },

    {
      name: 'home',
      path: '/',
      redirect: { name: 'users' },
    },
    {
      name: 'organisations',
      path: '/organisation',
      component: OrganisationListView,
    },

    {
      name: 'mapsets',
      path: '/mapset',
      component: MapsetListView,
    },

    {
      name: 'users',
      path: '/user',
      component: UserListView,
    },

    {
      name: 'jobs',
      path: '/job',
      component: JobListView,
    },
  ],
})

router.beforeEach(async (to) => {
  const sessionStore = useSessionStore()
  const { isAuthenticated, isAdministrator } = storeToRefs(sessionStore)

  // Restore session on page load: Better Auth uses long-lived bearer
  // tokens, not refresh tokens, so we just verify the stored access
  // token by calling /user/me. (loginFromRefreshToken would always
  // logout since refresh_token is always '' under BA.)
  if (
    to.name !== '403' &&
    !isAuthenticated.value &&
    hasAccessToken() &&
    hasValidAccessToken()
  ) {
    try {
      await sessionStore.authenticateFromAccessToken()
    } catch {
      // session validation failed — store has already cleaned up
    }
  }

  // make sure the user is authenticated
  if (
    // Avoid an infinite redirect
    to.name !== 'login' &&
    !isAuthenticated.value
  ) {
    // redirect the user to the login page
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
