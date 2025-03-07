<script setup lang="ts">
import { type ZodTypeAny } from 'zod'

import CloseBtn from '@/components/Common/Buttons/CloseBtn.vue'
import Card from '@/components/Common/Card.vue'
import Form from '@/components/Management/Form.vue'

const emit = defineEmits(['saved', 'cancel'])

withDefaults(
  defineProps<{
    formDataHandler: Function
    title?: string
    formData?: Record<string, unknown>
    validationSchema?: ZodTypeAny
  }>(),
  {
    title: '',
  },
)
</script>

<template>
  <Card class="Details col-span-1">
    <div class="flex items-center justify-between">
      <h3 class="text-lg font-bold">{{ title }}</h3>
      <CloseBtn label="close" @click="emit('cancel')" />
    </div>
    <Form
      :formDataHandler="formDataHandler"
      :formData="formData"
      :validationSchema="validationSchema"
      v-slot="{ formData, getStatus, getError, loading }"
    >
      <slot :formData="formData" :getError="getError" :getStatus="getStatus" :loading="loading" />
    </Form>
  </Card>
</template>
