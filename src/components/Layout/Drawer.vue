<script setup lang="ts">
withDefaults(
  defineProps<{
    title?: string
  }>(),
  {
    title: '',
  },
)
</script>

<template>
  <aside
    class="drawer flex w-[34rem] shrink-0 flex-col self-stretch border-l border-grey-200 bg-white"
    role="complementary"
  >
    <header class="flex h-14 shrink-0 items-center gap-3 border-b border-grey-200 px-4">
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
</template>
