<script setup lang="ts">
withDefaults(
  defineProps<{
    width?: string
    height?: string
    rounded?: string
  }>(),
  {
    width: '100%',
    height: '0.85rem',
    rounded: 'rounded',
  },
)
</script>

<template>
  <span
    class="block animate-pulse bg-grey-200"
    :class="rounded"
    :style="{ width, height }"
    aria-hidden="true"
  />
</template>
