<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { storeToRefs } from 'pinia'

import { useSessionStore } from '@/stores/session.ts'
import fundermapsLogo from '@assets/svg/fundermaps.svg?url'
import ExitIcon from '@assets/svg/icons/exit.svg'

interface NavItem {
  name: string
  label: string
}

const navLinks: NavItem[] = [
  { name: 'users', label: 'Users' },
  { name: 'sessions', label: 'Sessions' },
  { name: 'organisations', label: 'Organisations' },
  { name: 'mapsets', label: 'Mapsets' },
  { name: 'jobs', label: 'Jobs' },
]

const sessionStore = useSessionStore()
const { currentUser } = storeToRefs(sessionStore)

const userName = computed(() => currentUser.value?.email ?? '—')
const initials = computed(() => {
  const email = currentUser.value?.email ?? ''
  return email.slice(0, 2).toUpperCase() || '??'
})

const handleLogout = async function () {
  await sessionStore.logoutAndRedirect()
}
</script>

<template>
  <aside
    class="sidebar fixed inset-y-0 left-0 z-40 flex w-56 flex-col border-r border-grey-200 bg-white"
  >
    <div class="flex h-14 items-center border-b border-grey-200 px-4">
      <RouterLink :to="{ name: 'users' }" class="inline-flex items-center gap-2" aria-label="Fundermaps">
        <img :src="fundermapsLogo" alt="Fundermaps" class="h-6 w-auto" />
      </RouterLink>
    </div>

    <nav class="flex-1 overflow-y-auto px-2 py-3">
      <ul class="flex flex-col gap-0.5">
        <li v-for="link in navLinks" :key="link.name">
          <RouterLink
            :to="{ name: link.name }"
            class="nav-link flex items-center rounded-md px-3 py-2 text-sm font-medium text-grey-700 transition-colors hover:bg-grey-100 hover:text-grey-800"
          >
            {{ link.label }}
          </RouterLink>
        </li>
      </ul>
    </nav>

    <div class="border-t border-grey-200 p-3">
      <div class="flex items-center gap-2">
        <span
          class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-green-100 text-xs font-bold text-green-800"
          aria-hidden="true"
        >
          {{ initials }}
        </span>
        <span class="min-w-0 flex-1 truncate text-xs text-grey-800" :title="userName">
          {{ userName }}
        </span>
        <button
          type="button"
          class="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-grey-700 transition-colors hover:bg-red-50 hover:text-red-500"
          :aria-label="`Log out ${userName}`"
          title="Log out"
          @click="handleLogout"
        >
          <ExitIcon class="aspect-square h-3.5" aria-hidden="true" />
        </button>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.nav-link.router-link-active {
  background: var(--color-grey-100);
  color: var(--color-grey-800);
  font-weight: 600;
}

.nav-link.router-link-active::before {
  content: '';
  display: block;
  width: 3px;
  height: 1rem;
  margin-right: 0.5rem;
  margin-left: -0.75rem;
  border-radius: 0 2px 2px 0;
  background: var(--color-green-500);
}
</style>
