<script setup lang="ts">
import Button from '@/components/Common/Buttons/Button.vue'
import CloseBtn from '@/components/Common/Buttons/CloseBtn.vue'
import Card from '@/components/Common/Card.vue'
import RecordDetails from '@/components/Management/RecordDetails.vue'

const emit = defineEmits(['close', 'edit'])
defineProps({
  title: { type: String, default: 'Record information' },
  record: { type: [Object, null] },
  editable: { type: Boolean },
})
</script>

<template>
  <Card v-show="record" class="Details col-span-1">
    <div class="flex items-center justify-between">
      <Button v-if="editable" outline label="edit" @click="$emit('edit')" />
      <CloseBtn label="close" @click="$emit('close')" />
    </div>
    <RecordDetails :title="title" :record="record" />
    <slot />
  </Card>
</template>
