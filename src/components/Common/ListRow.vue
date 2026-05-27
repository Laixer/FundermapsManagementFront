<script setup lang="ts">
withDefaults(
  defineProps<{
    selected?: boolean
    clickable?: boolean
  }>(),
  { selected: false, clickable: true },
)

defineEmits<{ select: [] }>()
</script>

<template>
  <div
    class="list-row group flex items-center gap-4 border-b border-grey-200 px-4 py-3 text-sm transition-colors last:border-b-0"
    :class="[
      clickable && 'cursor-pointer hover:bg-grey-100',
      selected && '!bg-grey-100 ring-1 ring-inset ring-green-500/30',
    ]"
    @click="clickable && $emit('select')"
  >
    <div v-if="$slots.lead" class="shrink-0">
      <slot name="lead" />
    </div>
    <div class="min-w-0 flex-1">
      <slot />
    </div>
    <div v-if="$slots.actions" class="flex shrink-0 items-center gap-1">
      <slot name="actions" />
    </div>
  </div>
</template>
