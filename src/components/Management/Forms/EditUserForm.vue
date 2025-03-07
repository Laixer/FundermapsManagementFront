<script setup lang="ts">
import { ref } from 'vue'
import { z } from 'zod'
import Input from '@/components/Common/Inputs/Input.vue'
import FormCard from '@/components/Management/FormCard.vue'

import { updateUser } from '@/services/fundermaps/endpoints/management/user.ts'
import Alert from '@/components/Common/Alert.vue'
import type { IUser } from '@/services/fundermaps/interfaces/IUser.ts'

const props = defineProps<{
  record: IUser | null
}>()

const formData = ref({
  given_name: '',
  family_name: '',
  phone_number: '',
  job_title: '',
})
const validationSchema = z
  .object({
    given_name: z.string(),
    family_name: z.string(),
    phone_number: z.string(),
    job_title: z.string(),
  })
  .strict()

const formHandler = async function (formData: {
  given_name: string
  family_name: string
  phone_number: string
  job_title: string
}) {
  console.log('save', formData)
  if (!props.record) {
    return
  }

  await updateUser(
    props.record.id,
    formData.given_name,
    formData.family_name,
    formData.job_title,
    formData.phone_number,
    '', // avatar
  )
}
</script>

<template>
  <FormCard
    :title="`Edit ${record?.email}`"
    :form-data="formData"
    :validation-schema="validationSchema"
    :formDataHandler="formHandler"
    v-slot="{ formData, getStatus, getError, loading }"
  >
    <Alert> This form is connected to the database </Alert>

    <div class="grid grid-cols-2 gap-4">
      <Input
        id="given_name"
        label="Given Name"
        type="text"
        v-model="formData.given_name"
        placeholder="Enter given name"
        :validationStatus="getStatus('given_name')"
        :validationMessage="getError('given_name')"
        :tabindex="4"
      />

      <Input
        id="family_name"
        label="Family Name"
        type="text"
        v-model="formData.family_name"
        placeholder="Enter family name"
        :validationStatus="getStatus('family_name')"
        :validationMessage="getError('family_name')"
        :tabindex="5"
      />
    </div>

    <Input
      id="phone_number"
      label="Phone Number"
      type="tel"
      v-model="formData.phone_number"
      placeholder="Enter phone number"
      :validationStatus="getStatus('phone_number')"
      :validationMessage="getError('phone_number')"
      :tabindex="6"
    />

    <Input
      id="job_title"
      label="Job Title"
      type="text"
      v-model="formData.job_title"
      placeholder="Enter job title"
      :validationStatus="getStatus('job_title')"
      :validationMessage="getError('job_title')"
      :tabindex="7"
    />
  </FormCard>
</template>
