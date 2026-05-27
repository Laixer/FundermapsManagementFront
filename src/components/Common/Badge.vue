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
      return ['border-green-200', 'bg-green-50', 'text-green-800']
    case 'warning':
      return ['border-yellow-500/40', 'bg-yellow-100', 'text-grey-800']
    case 'danger':
      return ['border-red-200', 'bg-red-50', 'text-red-800']
    case 'info':
      return ['border-blue-200', 'bg-blue-100', 'text-blue-900']
    default:
      return ['border-grey-200', 'bg-grey-100', 'text-grey-800']
  }
})
</script>

<template>
  <span
    class="inline-flex items-center rounded border px-1.5 py-0.5 text-xs font-medium"
    :class="classList"
  >
    <slot />
  </span>
</template>
