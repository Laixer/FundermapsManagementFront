<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <RouterView />
</template>

<style>
.page-dashboard {
  max-height: 100vh;
}

.List {
  margin: 2rem;

  /* min-width: 60vw;
  max-width: 70vw;

  margin-right: auto;
  margin-bottom: auto; */
}

.Details {
  margin: 2rem;
  margin-left: 0;
}

/* This applies to all generic Transition elements */
.v-enter-active,
.v-leave-active {
  transition: opacity 0.5s ease;
}

/* This is for the Transitions named "short" */
.short-enter-active,
.short-leave-active {
  transition: opacity 0.25s ease;
}

.v-enter-from,
.v-leave-to,
.short-enter-from,
.short-leave-to {
  opacity: 0;
}
</style>
