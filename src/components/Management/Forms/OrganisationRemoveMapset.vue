<script setup lang="ts">
import { z } from 'zod'
import Input from '@/components/Common/Inputs/Input.vue'
import Form from '@/components/Management/Form.vue'

import {
  removeMapsetFromOrganisation,
  type IOrg,
} from '@/services/fundermaps/endpoints/management/organisation.ts'

const props = defineProps<{
  record: IOrg | null
}>()

const initialFormData = {
  mapsetid: '',
}
const validationSchema = z
  .object({
    mapsetid: z.string().min(1, 'Mapset ID is required.'),
  })
  .strict()

const formHandler = async function (formData: { mapsetid: string }) {
  if (!props.record) {
    return
  }
  await removeMapsetFromOrganisation(props.record.id, formData.mapsetid)
}
</script>

<template>
  <Form
    :form-data="initialFormData"
    :validation-schema="validationSchema"
    :formDataHandler="formHandler"
    :inline="true"
    v-slot="{ formData, getStatus, getError, loading }"
  >
    <Input
      id="remove-mapset-id"
      label="Remove a mapset from the organisation"
      placeholder="Enter the ID of the mapset you want to remove"
      type="text"
      v-model="formData.mapsetid"
      :validationStatus="getStatus('mapsetid')"
      :validationMessage="getError('mapsetid')"
      :disabled="loading"
      :tabindex="1"
    />
  </Form>
</template>
