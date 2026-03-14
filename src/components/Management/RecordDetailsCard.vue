<script setup lang="ts">
import Button from '@/components/Common/Buttons/Button.vue'
import CloseBtn from '@/components/Common/Buttons/CloseBtn.vue'
import Card from '@/components/Common/Card.vue'

defineEmits(['close', 'edit'])
defineProps({
  title: { type: String, default: 'Record information' },
  record: { type: [Object, null] },
  editable: { type: Boolean },
})
</script>

<template>
  <Card v-if="record" class="Details col-span-1">
    <div class="flex items-center justify-between">
      <h3 class="text-lg font-bold">{{ title }}</h3>
      <div class="flex items-center gap-2">
        <Button v-if="editable" outline label="Edit" @click="$emit('edit')" />
        <CloseBtn @click="$emit('close')" />
      </div>
    </div>
    <slot />
  </Card>
</template>
