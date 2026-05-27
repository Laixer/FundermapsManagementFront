<script setup lang="ts">
import { onMounted, onBeforeUnmount, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    open?: boolean
    width?: string
  }>(),
  {
    open: true,
    width: 'w-[28rem]',
  },
)

const emit = defineEmits<{ close: [] }>()

const handleKey = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && props.open) emit('close')
}

onMounted(() => window.addEventListener('keydown', handleKey))
onBeforeUnmount(() => window.removeEventListener('keydown', handleKey))

watch(
  () => props.open,
  (open) => {
    document.body.classList.toggle('drawer-open', open)
  },
  { immediate: true },
)
</script>

<template>
  <Transition name="drawer">
    <aside
      v-if="open"
      class="fixed inset-y-0 right-0 z-50 flex flex-col border-l border-grey-200 bg-white shadow-[-1px_0_0_0_var(--color-grey-200)]"
      :class="width"
      role="dialog"
      aria-modal="false"
    >
      <slot />
    </aside>
  </Transition>
</template>

<style scoped>
.drawer-enter-active,
.drawer-leave-active {
  transition: transform 180ms ease;
}
.drawer-enter-from,
.drawer-leave-to {
  transform: translateX(100%);
}
</style>
