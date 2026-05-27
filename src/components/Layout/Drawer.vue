<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue'

import CloseBtn from '@/components/Common/Buttons/CloseBtn.vue'

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
        class="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-grey-200 px-4"
      >
        <h3 class="truncate text-sm font-semibold text-grey-800">
          <slot name="title">{{ title }}</slot>
        </h3>
        <div class="flex items-center gap-1.5">
          <slot name="actions" />
          <CloseBtn label="close" @close="emit('close')" />
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
