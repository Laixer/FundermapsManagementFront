<script setup lang="ts">
import { z } from 'zod'
import Input from '@/components/Common/Inputs/Input.vue'
import Alert from '@/components/Common/Alert.vue'
import Form from '@/components/Management/Form.vue'

import type { IUser } from '@/services/fundermaps/interfaces/IUser.ts'
import { resetPassword } from '@/services/fundermaps/endpoints/management/user.ts'

const props = defineProps<{
  record: IUser | null
}>()

const formData = {
  password: '',
}
const validationSchema = z
  .object({
    password: z.string().min(6, 'The password has to be at least 6 characters'),
  })
  .strict()

const formHandler = async function (formData: { password: string }) {
  if (!props.record) {
    return
  }
  await resetPassword(props.record.id, formData.password)
}
</script>

<template>
  <Alert> This form is connected to the database </Alert>
  <Form
    :form-data="formData"
    :validation-schema="validationSchema"
    :formDataHandler="formHandler"
    :inline="true"
    v-slot="{ formData, getStatus, getError, loading }"
  >
    <Input
      id="password"
      label="Change the password of the user"
      placeholder="Enter the new password"
      type="text"
      v-model="formData.password"
      :validationStatus="getStatus('password')"
      :validationMessage="getError('password')"
      :disabled="loading"
      :tabindex="1"
    />
  </Form>
</template>
