<script setup lang="ts">
import { type ZodType } from 'zod'

import Form from '@/components/Management/Form.vue'

const emit = defineEmits(['saved', 'cancel'])

defineProps<{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formDataHandler: (formData: any) => void | Promise<void>
  formData?: Record<string, unknown>
  validationSchema?: ZodType
}>()
</script>

<template>
  <Form
    :formDataHandler="formDataHandler"
    :formData="formData"
    :validationSchema="validationSchema"
    @saved="emit('saved')"
    @cancel="emit('cancel')"
    v-slot="{ formData, getStatus, getError, loading }"
  >
    <slot :formData="formData" :getError="getError" :getStatus="getStatus" :loading="loading" />
  </Form>
</template>
