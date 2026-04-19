<script setup lang="ts">
import { computed } from 'vue'

type Variant = 'default' | 'success' | 'warning' | 'danger' | 'info'

const props = withDefaults(
  defineProps<{
    variant?: Variant
  }>(),
  { variant: 'default' },
)

const classList = computed<string[]>(() => {
  switch (props.variant) {
    case 'success':
      return ['bg-green-100', 'text-green-800']
    case 'warning':
      return ['bg-yellow-100', 'text-grey-800']
    case 'danger':
      return ['bg-red-50', 'text-red-800']
    case 'info':
      return ['bg-blue-100', 'text-blue-900']
    default:
      return ['bg-grey-200', 'text-grey-800']
  }
})
</script>

<template>
  <span
    class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
    :class="classList"
  >
    <slot />
  </span>
</template>
