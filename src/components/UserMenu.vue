<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'

import ExitIcon from '@assets/svg/icons/exit.svg'

import { useSessionStore } from '@/stores/session.ts'

const sessionStore = useSessionStore()
const { currentUser } = storeToRefs(sessionStore)

const userName = computed(() => currentUser.value?.email || 'onbekend')

/**
 * Log the user out, and redirect to the login page
 *
 * Note:
 *  There is no redirect to login. This is intentional.
 *  We let the data store decide.
 *  Perhaps there will still be a public mapset available.
 */
const handleLogout = async function () {
  await sessionStore.logoutAndRedirect()
}
</script>

<template>
  <div class="flex items-center gap-3 text-sm">
    <span class="text-grey-700">{{ userName }}</span>
    <button
      type="button"
      class="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-grey-800 transition-colors hover:bg-red-50 hover:text-red-500"
      title="Log out"
      @click="handleLogout"
    >
      <ExitIcon class="aspect-square h-3.5" aria-hidden="true" />
      <span>Log out</span>
    </button>
  </div>
</template>
