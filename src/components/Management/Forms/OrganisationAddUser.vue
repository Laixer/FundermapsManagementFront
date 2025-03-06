<script setup lang="ts">
import { z } from 'zod'
import Input from '@/components/Common/Inputs/Input.vue'
import InlineForm from '@/components/Management/InlineForm.vue'
import {
  addUserToOrganisation,
  type IOrg,
} from '@/services/fundermaps/endpoints/management/organisation.ts'
import Alert from '@/components/Common/Alert.vue'

const props = defineProps<{
  record: IOrg | null
}>()

const formData = {
  userid: '',
}
const validationSchema = z
  .object({
    userid: z.string().min(1, 'User id is required.'),
  })
  .strict()

const formHandler = async function (formData: { userid: string }) {
  if (!props.record) {
    return
  }
  await addUserToOrganisation(
    props.record.id,
    formData.userid,
    'user', // TODO: Hardcoded to only allow 'user' role
  )
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
      id="userid"
      label="Add an existing user to the organisation"
      placeholder="Enter id of the user you want to connect"
      type="text"
      v-model="formData.userid"
      :validationStatus="getStatus('userid')"
      :validationMessage="getError('userid')"
      :disabled="loading"
      :tabindex="1"
    />
  </InlineForm>
</template>
