<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue'

import ChevronRightIcon from '@assets/svg/icons/chevron-right.svg'

const props = withDefaults(
  defineProps<{
    open?: boolean
    title?: string
  }>(),
  {
    open: true,
    title: '',
  },
)

const emit = defineEmits<{ close: [] }>()

const handleKey = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && props.open) emit('close')
}

onMounted(() => window.addEventListener('keydown', handleKey))
onBeforeUnmount(() => window.removeEventListener('keydown', handleKey))
</script>

<template>
  <Transition name="drawer">
    <aside
      v-if="open"
      class="drawer flex w-[34rem] shrink-0 flex-col self-stretch border-l border-grey-200 bg-white"
      role="complementary"
    >
      <header
        class="flex h-14 shrink-0 items-center gap-3 border-b border-grey-200 pl-2 pr-4"
      >
        <button
          type="button"
          class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded text-grey-700 transition-colors hover:bg-grey-100 hover:text-grey-800"
          aria-label="Close panel"
          title="Close panel (Esc)"
          @click="emit('close')"
        >
          <ChevronRightIcon class="aspect-square h-4" aria-hidden="true" />
        </button>
        <h3 class="min-w-0 flex-1 truncate text-sm font-semibold text-grey-800">
          <slot name="title">{{ title }}</slot>
        </h3>
        <div v-if="$slots.actions" class="flex shrink-0 items-center gap-1.5">
          <slot name="actions" />
        </div>
      </header>
      <div class="flex-1 overflow-y-auto p-4">
        <slot />
      </div>
    </aside>
  </Transition>
</template>

<style scoped>
.drawer-enter-active,
.drawer-leave-active {
  transition: transform 200ms ease;
}
.drawer-enter-from,
.drawer-leave-to {
  transform: translateX(100%);
}
</style>
