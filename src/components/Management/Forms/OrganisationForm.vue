<script setup lang="ts">
import { ref, watch } from 'vue'
import { z } from 'zod'
import Input from '@/components/Common/Inputs/Input.vue'
import FormCard from '@/components/Management/FormCard.vue'

import { updateOrganisation, type IOrg } from '@/services/fundermaps/endpoints/management/organisation.ts'

const props = defineProps<{
  record: IOrg
}>()

const formData = ref({
  name: '',
})

const validationSchema = z
  .object({
    name: z.string().min(1, 'Name is required.'),
  })
  .strict()

watch(
  () => props.record,
  (newRecord) => {
    if (newRecord) {
      formData.value = { name: newRecord.name || '' }
    }
  },
  { immediate: true },
)

const formHandler = async function (formData: { name: string }) {
  await updateOrganisation(props.record.id, formData.name)
}
</script>

<template>
  <FormCard
    :title="`Edit ${record.name}`"
    :form-data="formData"
    :validation-schema="validationSchema"
    :formDataHandler="formHandler"
    v-slot="{ formData, getStatus, getError, loading }"
  >
    <Input
      id="name"
      label="Organisation Name"
      type="text"
      v-model="formData.name"
      placeholder="Enter organisation name"
      :validationStatus="getStatus('name')"
      :validationMessage="getError('name')"
      :disabled="loading"
      :tabindex="1"
      required
    />
  </FormCard>
</template>
