<script setup lang="ts">
import GrayLogo from '@/components/Branding/GrayLogo.vue'
import UserMenu from '@/components/UserMenu.vue'
import { RouterLink } from 'vue-router'

const navLinks = [
  { name: 'users', label: 'Users' },
  { name: 'organisations', label: 'Organisations' },
  { name: 'mapsets', label: 'Mapsets' },
  { name: 'jobs', label: 'Jobs' },
]
</script>

<template>
  <header
    class="app-header fixed inset-x-0 top-0 isolate z-50 flex items-center gap-6 border-b border-grey-200 bg-white px-6"
  >
    <GrayLogo class="h-6 flex-shrink-0" />

    <nav class="flex items-center gap-1 text-sm font-semibold">
      <RouterLink
        v-for="link in navLinks"
        :key="link.name"
        :to="{ name: link.name }"
        class="nav-link rounded-md px-3 py-1.5 text-grey-800 transition-colors hover:bg-grey-100"
      >
        {{ link.label }}
      </RouterLink>
    </nav>

    <div class="ml-auto">
      <UserMenu />
    </div>
  </header>
</template>

<style scoped>
.nav-link.router-link-active {
  background-color: theme(colors.green.100);
  color: theme(colors.green.800);
}
</style>
