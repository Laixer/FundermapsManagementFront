<script setup lang="ts">
import { z } from 'zod'
import Input from '@/components/Common/Inputs/Input.vue'
import FormCard from '@/components/Management/FormCard.vue'

import { createContractor } from '@/services/fundermaps/endpoints/management/contractor.ts'

const initialFormData = {
  name: '',
}
const validationSchema = z
  .object({
    name: z.string().min(1, 'Name is required.'),
  })
  .strict()

const formHandler = async function (formData: { name: string }) {
  await createContractor(formData.name)
}
</script>

<template>
  <FormCard
    title="Add contractor"
    :form-data="initialFormData"
    :validation-schema="validationSchema"
    :formDataHandler="formHandler"
    v-slot="{ formData, getStatus, getError, loading }"
  >
    <Input
      id="name"
      label="Contractor Name *"
      placeholder="Enter the contractor name"
      type="text"
      v-model="formData.name"
      :validationStatus="getStatus('name')"
      :validationMessage="getError('name')"
      :disabled="loading"
      :tabindex="1"
    />
  </FormCard>
</template>
