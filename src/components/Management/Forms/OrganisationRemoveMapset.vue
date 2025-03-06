<script setup lang="ts">
import { z } from 'zod'
import Input from '@/components/Common/Inputs/Input.vue'
import InlineForm from '@/components/Management/InlineForm.vue'
import {
  removeMapsetFromOrganisation,
  type IOrg,
} from '@/services/fundermaps/endpoints/management/organisation.ts'
import Alert from '@/components/Common/Alert.vue'

const props = defineProps<{
  record: IOrg | null
}>()

const formData = {
  mapsetid: '',
}
const validationSchema = z
  .object({
    mapsetid: z.string().min(1, 'Mapset id is required.'),
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
  <Alert> This form is connected to the database </Alert>
  <InlineForm
    :form-data="formData"
    :validation-schema="validationSchema"
    :formDataHandler="formHandler"
    v-slot="{ formData, getStatus, getError, loading }"
  >
    <Input
      id="mapsetid"
      label="Remove a mapset from the organisation"
      placeholder="Enter id of the mapset you want to remove"
      type="text"
      v-model="formData.mapsetid"
      :validationStatus="getStatus('mapsetid')"
      :validationMessage="getError('mapsetid')"
      :disabled="loading"
      :tabindex="1"
    />
  </InlineForm>
</template>
