<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { z } from 'zod'
import Input from '@/components/Common/Inputs/Input.vue'
import Select, { type SelectOption } from '@/components/Common/Inputs/Select.vue'
import FormCard from '@/components/Management/FormCard.vue'
import { generateStrongPassword } from '@/utils/password.ts'

import { createUser, updateUser } from '@/services/fundermaps/endpoints/management/user.ts'
import {
  getAllOrganisations,
  addUserToOrganisation,
} from '@/services/fundermaps/endpoints/management/organisation.ts'

// Org list for the dropdown. The leading empty option is the unselected
// sentinel — it keeps the native <select> in sync with the empty default
// and lets the required `organization_id` validation fire.
const organisationOptions = ref<SelectOption[]>([{ value: '', label: 'Select an organisation…' }])

const organisationRoleOptions: SelectOption[] = [
  { value: 'reader', label: 'Reader' },
  { value: 'writer', label: 'Writer' },
  { value: 'verifier', label: 'Verifier' },
  { value: 'superuser', label: 'Superuser' },
]

onMounted(async () => {
  const organisations = await getAllOrganisations()
  organisationOptions.value = [
    { value: '', label: 'Select an organisation…' },
    ...organisations.map((org) => ({ value: org.id, label: org.name })),
  ]
})

const formData = ref({
  email: '',
  password: '',
  given_name: '',
  family_name: '',
  organization_id: '',
  organization_role: 'reader',
  phone_number: '',
  job_title: '',
})
const validationSchema = z
  .object({
    email: z.string().min(1, 'Email is required.'),
    password: z.string().min(1, 'Password is required.'),
    given_name: z.string(),
    family_name: z.string(),
    organization_id: z.string().min(1, 'Organisation is required.'),
    organization_role: z.enum(['reader', 'writer', 'verifier', 'superuser']),
    phone_number: z.string(),
    job_title: z.string(),
  })
  .strict()

const formHandler = async function (formData: {
  email: string
  password: string
  given_name: string
  family_name: string
  organization_id: string
  organization_role: string
  phone_number: string
  job_title: string
}) {
  const user = await createUser(formData.email, formData.password)

  if (user) {
    // Attach the new user to the selected organisation before filling in
    // profile details — a user without an org membership is rejected by
    // every org-scoped API route.
    await addUserToOrganisation(formData.organization_id, user.id, formData.organization_role)

    await updateUser(
      user.id,
      formData.given_name,
      formData.family_name,
      formData.job_title,
      formData.phone_number,
      '', // avatar
    )
  }
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
    v-slot="{ formData, getStatus, getError }"
  >
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
        <label for="password" class="text-grey-800 block text-sm font-medium">Password *</label>
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
      <Select
        id="organization_id"
        label="Organisation *"
        :options="organisationOptions"
        v-model="formData.organization_id"
        :validationStatus="getStatus('organization_id')"
        :validationMessage="getError('organization_id')"
        :tabindex="4"
        required
      />

      <Select
        id="organization_role"
        label="Organisation role"
        :options="organisationRoleOptions"
        v-model="formData.organization_role"
        :validationStatus="getStatus('organization_role')"
        :validationMessage="getError('organization_role')"
        :tabindex="5"
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
        :tabindex="6"
      />

      <Input
        id="family_name"
        label="Family Name"
        type="text"
        v-model="formData.family_name"
        placeholder="Enter family name"
        :validationStatus="getStatus('family_name')"
        :validationMessage="getError('family_name')"
        :tabindex="7"
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
      :tabindex="8"
    />

    <Input
      id="job_title"
      label="Job Title"
      type="text"
      v-model="formData.job_title"
      placeholder="Enter job title"
      :validationStatus="getStatus('job_title')"
      :validationMessage="getError('job_title')"
      :tabindex="9"
    />
  </FormCard>
</template>
