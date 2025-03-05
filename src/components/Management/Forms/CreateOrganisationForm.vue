<script setup lang="ts">
import { z } from 'zod'
import Input from '@/components/Common/Inputs/Input.vue'
import FormCard from '@/components/Management/FormCard.vue'

import { createOrganisation } from '@/services/fundermaps/endpoints/management/organisation.ts'
import Alert from '@/components/Common/Alert.vue'

const formData = {
  name: '',
}
const validationSchema = z
  .object({
    name: z.string().min(1, 'Name is required.'),
  })
  .strict()

const formHandler = async function (formData: { name: string }) {
  console.log('save', formData)
  await createOrganisation(formData.name)
}
</script>

<template>
  <FormCard
    title="Add organisation"
    :form-data="formData"
    :validation-schema="validationSchema"
    :formDataHandler="formHandler"
    v-slot="{ formData, getStatus, getError, loading }"
  >
    <Alert> This form is connected to the database </Alert>
    <Input
      id="name"
      label="Organisation Name *"
      placeholder="Enter the organisation name"
      type="text"
      v-model="formData.name"
      :validationStatus="getStatus('name')"
      :validationMessage="getError('name')"
      :disabled="loading"
      :tabindex="1"
    />
  </FormCard>
</template>
