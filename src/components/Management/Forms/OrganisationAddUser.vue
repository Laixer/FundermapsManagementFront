<script setup lang="ts">
import { z } from 'zod'
import Input from '@/components/Common/Inputs/Input.vue'
import Alert from '@/components/Common/Alert.vue'
import Select from '@/components/Common/Inputs/Select.vue'
import Form from '@/components/Management/Form.vue'

import {
  addUserToOrganisation,
  type IOrg,
} from '@/services/fundermaps/endpoints/management/organisation.ts'

const props = defineProps<{
  record: IOrg | null
}>()

const formData = {
  userid: '',
  role: 'reader',
}
const validationSchema = z
  .object({
    userid: z.string().min(1, 'User id is required.'),
    role: z.enum(['reader', 'writer', 'verifier', 'superuser']),
  })
  .strict()

const formHandler = async function (formData: { userid: string; role: string }) {
  if (!props.record) {
    return
  }
  await addUserToOrganisation(
    props.record.id,
    formData.userid,
    formData.role, // TODO: Hardcoded to only allow 'user' role
  )
}
</script>

<template>
  <Alert> This form is connected to the database </Alert>
  <Form
    class="mt-4"
    title="Add an existing user to the organisation"
    :form-data="formData"
    :validation-schema="validationSchema"
    :formDataHandler="formHandler"
    v-slot="{ formData, getStatus, getError, loading }"
  >
    <Input
      id="userid"
      label="User ID"
      placeholder="Enter the id of the user you want to connect"
      type="text"
      v-model="formData.userid"
      :validationStatus="getStatus('userid')"
      :validationMessage="getError('userid')"
      :disabled="loading"
      :tabindex="1"
    />
    <Select
      class="mt-4"
      id="role"
      label="User role"
      :options="[
        {
          label: 'Reader',
          value: 'reader',
        },
        {
          label: 'Writer',
          value: 'writer',
        },
        {
          label: 'Verifier',
          value: 'verifier',
        },
        {
          label: 'Superuser',
          value: 'superuser',
        },
      ]"
      v-model="formData.role"
      :validationStatus="getStatus('role')"
      :validationMessage="getError('role')"
      :disabled="loading"
      :tabindex="2"
    />
  </Form>
</template>
