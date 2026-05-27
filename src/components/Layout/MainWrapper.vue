<script setup lang="ts">
import Sidebar from '@/components/Layout/Sidebar.vue'
</script>

<template>
  <div class="min-h-screen bg-grey-100">
    <Sidebar />
    <div class="ml-56 flex min-h-screen items-stretch">
      <main class="min-w-0 flex-1 overflow-x-auto p-6">
        <slot />
      </main>
      <slot name="aside" />
    </div>
  </div>
</template>
