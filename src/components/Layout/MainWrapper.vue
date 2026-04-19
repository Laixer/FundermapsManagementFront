<script setup lang="ts">
/**
 * This is the wrapper for all pages, except the auth pages
 */

import Header from '@/components/Layout/Header.vue'
</script>

<template>
  <div class="page-dashboard">
    <Header />

    <div class="app-view | grid grid-flow-row-dense grid-cols-3 gap-6 bg-grey-100 px-6 py-6">
      <slot />
    </div>
  </div>
</template>
