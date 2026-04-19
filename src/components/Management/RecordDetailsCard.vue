<script setup lang="ts">
import Button from '@/components/Common/Buttons/Button.vue'
import CloseBtn from '@/components/Common/Buttons/CloseBtn.vue'
import Card from '@/components/Common/Card.vue'

defineEmits(['close', 'edit', 'delete'])
defineProps({
  title: { type: String, default: 'Record information' },
  record: { type: [Object, null] },
  editable: { type: Boolean },
  deletable: { type: Boolean },
  emptyMessage: { type: String, default: 'Select a record to view its details.' },
})
</script>

<template>
  <Card class="Details col-span-1">
    <template v-if="record">
      <header
        class="-mx-8 -mt-8 flex items-center justify-between gap-2 border-b border-grey-200 px-8 pb-5 pt-6"
      >
        <h3 class="heading-4">{{ title }}</h3>
        <div class="flex items-center gap-2">
          <Button v-if="editable" outline label="Edit" @click="$emit('edit')" />
          <Button v-if="deletable" danger label="Delete" @click="$emit('delete')" />
          <CloseBtn @click="$emit('close')" />
        </div>
      </header>
      <slot />
    </template>
    <div
      v-else
      class="flex min-h-[12rem] flex-col items-center justify-center gap-2 py-10 text-center text-sm text-grey-700"
    >
      <div class="inline-flex h-10 w-10 items-center justify-center rounded-full bg-grey-200">
        <svg
          class="h-4 w-4 text-grey-700"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </div>
      <p>{{ emptyMessage }}</p>
    </div>
  </Card>
</template>
