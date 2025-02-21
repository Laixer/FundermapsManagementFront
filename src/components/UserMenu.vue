<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'

import ExitIcon from '@assets/svg/icons/exit.svg'

import { useSessionStore } from '@/stores/session.ts'

const sessionStore = useSessionStore()
const { currentUser } = storeToRefs(sessionStore)

/**
 * Component related data
 */
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
  <div class="relative flex items-center">
    <div>{{ userName }}</div>
    <a
      href="#"
      @click.prevent="handleLogout"
      class="flex w-full items-center gap-2 px-8 py-4 transition-colors hover:text-red-500"
    >
      <ExitIcon class="aspect-square h-3.5" aria-hidden="true" />
      <span>Log out</span>
    </a>
  </div>
</template>
