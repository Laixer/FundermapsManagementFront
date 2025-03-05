import { createRouter, createWebHistory } from 'vue-router'
import { hasAccessToken, hasValidAccessToken } from '@/services/fundermaps/session'
import { useSessionStore } from '@/stores/session'
import { storeToRefs } from 'pinia'

import HomeView from '@/views/HomeView.vue'
import ApplicationListView from '@/views/ApplicationListView.vue'
import OrganisationListView from '@/views/OrganisationListView.vue'
import MapsetListView from '@/views/MapsetListView.vue'
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

    /**************************************************************************
     * Application
     */
    {
      name: 'home',
      path: '/',
      component: HomeView,
    },
    {
      name: 'applications',
      path: '/application',
      component: ApplicationListView,
    },
    {
      path: '/application/:applicationId',
      name: 'application',
      component: ApplicationListView,
    },

    {
      name: 'organisations',
      path: '/organisation',
      component: OrganisationListView,
    },
    {
      name: 'organisation',
      path: '/organisation/:orgId',
      component: OrganisationListView,
    },

    {
      name: 'mapsets',
      path: '/mapset',
      component: MapsetListView,
    },
    {
      name: 'mapset',
      path: '/mapset/:mapsetId',
      component: MapsetListView,
    },

    {
      name: 'users',
      path: '/user',
      component: UserListView,
    },
    {
      name: 'user',
      path: '/user/:userId',
      component: UserListView,
    },
  ],
})

router.beforeEach(async (to, from) => {
  const sessionStore = useSessionStore()
  const { isAuthenticated, isAdministrator } = storeToRefs(sessionStore)

  // Try to authenticate the user from the refresh token
  if (
    // to.name !== 'login' &&
    to.name !== '403' &&
    !isAuthenticated.value &&
    hasAccessToken() &&
    hasValidAccessToken()
  ) {
    console.log('login using refresh token')
    try {
      // await sessionStore.authenticateFromAccessToken()
      await sessionStore.loginFromRefreshToken()
    } catch (e) {
      console.log('login from refresh token failed')
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

  // Only administorators are allowed access
  if (to.name !== '403' && to.name !== 'login') {
    if (!isAdministrator.value) {
      return { name: '403' }
    }
  }
})
export default router
