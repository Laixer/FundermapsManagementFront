<script setup lang="ts">
defineProps({
  title: { type: String, default: null },
})
</script>

<template>
  <div class="card bg-white | rounded-md border border-grey-200 p-5">
    <header v-if="title" class="card__header mb-4">
      <h3 class="text-base font-semibold text-grey-800">{{ title }}</h3>
    </header>
    <div class="card__content space-y-6">
      <slot></slot>
    </div>
    <footer v-if="$slots.footer" class="card__footer mt-4">
      <slot name="footer"></slot>
    </footer>
  </div>
</template>
