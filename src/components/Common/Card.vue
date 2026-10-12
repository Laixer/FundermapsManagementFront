<script setup lang="ts">
defineProps({
  title: { type: String, default: null },
  // A card that is the whole page (the "No access" page) carries the page's h1.
  titleTag: { type: String, default: 'h3' },
})
</script>

<template>
  <div class="rounded-md border border-grey-200 bg-white p-5">
    <header v-if="title" class="card__header mb-4">
      <component :is="titleTag" class="text-base font-semibold text-grey-800">{{
        title
      }}</component>
    </header>
    <div class="card__content">
      <slot></slot>
    </div>
    <footer v-if="$slots.footer" class="card__footer mt-4">
      <slot name="footer"></slot>
    </footer>
  </div>
</template>
