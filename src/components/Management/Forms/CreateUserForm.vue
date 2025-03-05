<script setup lang="ts">
import { ref } from 'vue'
import { z } from 'zod'
import Input from '@/components/Common/Inputs/Input.vue'
import FormCard from '@/components/Management/FormCard.vue'
import { generateStrongPassword } from '@/utils/password.ts'

import { createUser } from '@/services/fundermaps/endpoints/management/user.ts'
import Alert from '@/components/Common/Alert.vue'
// import type { IUser } from '@/services/fundermaps/interfaces/IUser.ts'

const formData = ref({
  email: '',
  password: '',
  given_name: '',
  family_name: '',
  role: 'User', // Default role
  phone_number: '',
  job_title: '',
})
const validationSchema = z
  .object({
    email: z.string().min(1, 'Email is required.'),
    password: z.string().min(1, 'Password is required.'),
    given_name: z.string(),
    family_name: z.string(),
    role: z.string(),
    phone_number: z.string(),
    job_title: z.string(),
  })
  .strict()

const formHandler = async function (formData: { email: string; password: string }) {
  console.log('save', formData)

  await createUser(formData.email, formData.password)

  // TODO: update user profile
}

/**
 * Generates a password and sets it to the password field
 */
const handleGeneratePassword = () => {
  formData.value.password = generateStrongPassword()
}
</script>

<template>
  <FormCard
    title="Add User"
    :form-data="formData"
    :validation-schema="validationSchema"
    :formDataHandler="formHandler"
    v-slot="{ formData, getStatus, getError, loading }"
  >
    <Alert> WIP: Currently only e-mail & password are stored. </Alert>
    <Input
      id="email"
      label="Email *"
      type="email"
      v-model="formData.email"
      placeholder="Enter email address"
      :validationStatus="getStatus('email')"
      :validationMessage="getError('email')"
      :tabindex="1"
      required
    />

    <div class="space-y-2">
      <div class="flex items-center justify-between">
        <label for="password" class="text-gray-700 block text-sm font-medium">Password *</label>
        <button
          type="button"
          class="text-xs text-blue-600 hover:text-blue-800"
          @click="handleGeneratePassword"
          tabindex="3"
        >
          Generate Strong Password
        </button>
      </div>
      <Input
        id="password"
        type="text"
        v-model="formData.password"
        placeholder="Enter password"
        :validationStatus="getStatus('password')"
        :validationMessage="getError('password')"
        :tabindex="2"
        required
        hideLabel
      />
    </div>

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
