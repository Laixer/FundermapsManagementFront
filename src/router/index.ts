import { createRouter, createWebHistory } from 'vue-router'
import { loginRedirect } from '@/services/auth'
import { useSessionStore } from '@/stores/session'
import { storeToRefs } from 'pinia'

import DashboardView from '@/views/DashboardView.vue'
import OrganisationListView from '@/views/OrganisationListView.vue'
import MapsetListView from '@/views/MapsetListView.vue'
import SessionListView from '@/views/SessionListView.vue'
import UserListView from '@/views/UserListView.vue'
import RateLimitListView from '@/views/RateLimitListView.vue'
import ContractorListView from '@/views/ContractorListView.vue'
import UsageView from '@/views/UsageView.vue'
import NotFoundView from '@/views/NotFoundView.vue'
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
      meta: { title: 'No access' },
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
    // Usage across all customers (2026-10-23): was Grafana's two usage boards.
    {
      name: 'usage',
      path: '/usage',
      component: UsageView,
      meta: { title: 'Usage' },
    },

    // Anything else: an old bookmark or a mistyped address. Last, so every
    // real route wins; the guard below still asks for an administrator.
    {
      name: 'not-found',
      path: '/:pathMatch(.*)*',
      component: NotFoundView,
      meta: { title: 'Page not found' },
    },
  ],
})

const PORTAL_TITLE = 'FunderMaps Management'

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

// A page that is not a section of the portal ("No access", "Page not found")
// says so in the browser tab; every other page keeps the portal's name.
router.afterEach((to, _from, failure) => {
  if (failure) return

  const page = typeof to.meta.title === 'string' ? to.meta.title : ''
  document.title = page ? `${page} · ${PORTAL_TITLE}` : PORTAL_TITLE
})

export default router
