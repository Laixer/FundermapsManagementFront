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
})
</script>

<template>
  <Card v-if="record" class="Details col-span-1">
    <div class="flex items-center justify-between">
      <h3 class="text-lg font-bold">{{ title }}</h3>
      <div class="flex items-center gap-2">
        <Button v-if="editable" outline label="Edit" @click="$emit('edit')" />
        <Button v-if="deletable" label="Delete" class="bg-red-600 hover:bg-red-700" @click="$emit('delete')" />
        <CloseBtn @click="$emit('close')" />
      </div>
    </div>
    <slot />
  </Card>
</template>
