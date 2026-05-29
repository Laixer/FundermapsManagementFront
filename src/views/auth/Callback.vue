<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { exchangeCode, logoutRedirect } from '@/services/oidc'
import { useSessionStore } from '@/stores/session'

const route = useRoute()
const router = useRouter()
const sessionStore = useSessionStore()

const error = ref(false)

onMounted(async () => {
  const code = route.query.code
  const state = route.query.state
  if (typeof code !== 'string') {
    error.value = true
    return
  }
  try {
    await exchangeCode(code, typeof state === 'string' ? state : '')
    await sessionStore.authenticateFromAccessToken()
    router.replace({ name: 'home' })
  } catch (e) {
    console.error('OIDC callback failed:', e)
    error.value = true
  }
})

// End the SSO session at the provider, then land on /login for a fresh sign-in.
// A plain link back to /login would silently re-authenticate via the still-alive
// SSO session — straight back into the same account (which, if it lacks admin
// access, loops back to this error). RP-initiated logout breaks that. See oidc.ts.
function signOut() {
  logoutRedirect()
}
</script>

<template>
  <!-- Neutral loading during the code exchange — not the login chrome. -->
  <div class="grid min-h-screen place-content-center text-center text-grey-700">
    <p v-if="error" class="text-sm">
      Login failed. The active account may not have access to this app.
      <button type="button" class="text-green-700 underline" @click="signOut">
        Sign in with a different account
      </button>
    </p>
    <p v-else class="text-sm">Signing in…</p>
  </div>
</template>
