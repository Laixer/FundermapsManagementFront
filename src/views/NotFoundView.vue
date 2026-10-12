<script setup lang="ts">
import { RouterLink } from 'vue-router'

import MainWrapper from '@/components/Layout/MainWrapper.vue'
</script>

<template>
  <MainWrapper>
    <header class="mb-4">
      <h2 class="text-xl font-semibold text-grey-800">Page not found</h2>
      <p class="mt-0.5 text-sm text-grey-700">
        There is no page at this address. It may have been moved or removed.
      </p>
    </header>

    <RouterLink :to="{ name: 'dashboard' }" class="text-sm font-semibold text-green-700 hover:underline">
      Go to the dashboard
    </RouterLink>
  </MainWrapper>
</template>
