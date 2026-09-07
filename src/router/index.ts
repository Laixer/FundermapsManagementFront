import { createRouter, createWebHistory } from 'vue-router'
import { loginRedirect } from '@/services/auth'
import { useSessionStore } from '@/stores/session'
import { storeToRefs } from 'pinia'

import DashboardView from '@/views/DashboardView.vue'
import OrganisationListView from '@/views/OrganisationListView.vue'
import MapsetListView from '@/views/MapsetListView.vue'
import JobListView from '@/views/JobListView.vue'
import SessionListView from '@/views/SessionListView.vue'
import UserListView from '@/views/UserListView.vue'
import RateLimitListView from '@/views/RateLimitListView.vue'
import ContractorListView from '@/views/ContractorListView.vue'
import Login from '@/views/auth/Login.vue'
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
      // Login lives at the auth app — navigate there before the (placeholder)
      // component renders. Come back to the portal root afterwards.
      beforeEnter: () => {
        loginRedirect(window.location.origin + '/')
        return false
      },
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

    {
      name: 'contractors',
      path: '/contractor/:id?',
      component: ContractorListView,
    },
  ],
})

router.beforeEach(async (to) => {
  const sessionStore = useSessionStore()
  const { isAuthenticated, isAdministrator } = storeToRefs(sessionStore)

  // Restore the user from the session cookie on page load.
  if (to.name !== '403' && to.name !== 'login' && !isAuthenticated.value) {
    try {
      await sessionStore.authenticate()
    } catch {
      // no session — handled below
    }
  }

  // Not signed in: go to the auth app, which returns to the requested page.
  if (to.name !== 'login' && to.name !== '403' && !isAuthenticated.value) {
    loginRedirect(window.location.origin + to.fullPath)
    return false
  }

  // Only administrators are allowed access
  if (to.name !== '403' && to.name !== 'login') {
    if (!isAdministrator.value) {
      return { name: '403' }
    }
  }
})

export default router
