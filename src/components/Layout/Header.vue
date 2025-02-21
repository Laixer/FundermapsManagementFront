<script setup lang="ts">
import GrayLogo from '@/components/Branding/GrayLogo.vue'
import UserMenu from '@/components/UserMenu.vue'
import { RouterLink } from 'vue-router'
</script>

<template>
  <header
    class="app-header fixed left-0 right-0 top-0 isolate z-50 flex items-center gap-8 bg-white px-8 py-5"
  >
    <GrayLogo />

    <div class="flex">
      <RouterLink class="px-2 transition-colors hover:text-green-700" :to="{ name: 'applications' }"
        >Applicaties</RouterLink
      >
      <RouterLink
        class="px-2 transition-colors hover:text-green-700"
        :to="{ name: 'organisations' }"
        >Organisations</RouterLink
      >
      <RouterLink class="px-2 transition-colors hover:text-green-700" :to="{ name: 'mapsets' }"
        >Mapsets</RouterLink
      >
      <RouterLink class="px-2 transition-colors hover:text-green-700" :to="{ name: 'users' }"
        >Users</RouterLink
      >
    </div>

    <div class="flex w-full flex-row-reverse items-center justify-between gap-8">
      <UserMenu />
    </div>
  </header>
</template>
