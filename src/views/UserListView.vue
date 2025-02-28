<script setup lang="ts">
import { onBeforeMount, ref, type Ref } from 'vue'

// @ts-ignore TODO: PR to fix TS
import Vue3Datatable from '@bhplugin/vue3-datatable'

import '@bhplugin/vue3-datatable/dist/style.css'

import Card from '@/components/Common/Card.vue'
import Button from '@/components/Common/Buttons/Button.vue'
import CloseBtn from '@/components/Common/Buttons/CloseBtn.vue'
import MainWrapper from '@/components/Layout/MainWrapper.vue'
import Input from '@/components/Common/Inputs/Input.vue'

import { getAllUsers, createUser } from '@/services/fundermaps/endpoints/management/user.ts'
import type { IUser } from '@/services/fundermaps/interfaces/IUser.ts'

const cols = [
  { field: 'id', title: 'ID', isUnique: true, width: '20rem' },
  { field: 'given_name', title: 'Name' },
  { field: 'email', title: 'Email' },
  { field: 'role', title: 'Rol' },
]
const rows: Ref<IUser[]> = ref([])

const loading = ref(true)

const showDetails: Ref<IUser | null> = ref(null)
const showCreate = ref(false)

onBeforeMount(async () => {
  try {
    rows.value = await getAllUsers()

    loading.value = false
  } catch (e) {
    // TODO: Show error
  }
})
const handleRowClick = function (row: IUser) {
  console.log('Open details modal')
  console.log(row)
  showCreate.value = false
  showDetails.value = row
}
const handleOpenModal = function () {
  console.log('Open create modal')
  showDetails.value = null
  showCreate.value = true
}

// Form state for creating a new user
const newUser = ref({
  email: '',
  password: '',
  given_name: '',
  family_name: '',
  role: 'User', // Default role
  phone_number: '',
  job_title: ''
})

const formError = ref('')
const isSubmitting = ref(false)
const submitSuccess = ref(false)

// Validation status and messages for input fields
const validationStatus = ref({
  email: '',
  password: '',
  given_name: '',
  family_name: '',
  role: '',
  phone_number: '',
  job_title: ''
})

const validationMessages = ref({
  email: '',
  password: '',
  given_name: '',
  family_name: '',
  role: '',
  phone_number: '',
  job_title: ''
})

// Reset form fields
const resetForm = () => {
  newUser.value = {
    email: '',
    password: '',
    given_name: '',
    family_name: '',
    role: 'User',
    phone_number: '',
    job_title: ''
  }
  formError.value = ''
  submitSuccess.value = false
  
  // Reset validation status and messages
  Object.keys(validationStatus.value).forEach(key => {
    validationStatus.value[key as keyof typeof validationStatus.value] = ''
    validationMessages.value[key as keyof typeof validationMessages.value] = ''
  })
}

// Basic validation before submission
const validateForm = () => {
  let isValid = true
  
  // Reset validation statuses
  Object.keys(validationStatus.value).forEach(key => {
    validationStatus.value[key as keyof typeof validationStatus.value] = ''
    validationMessages.value[key as keyof typeof validationMessages.value] = ''
  })
  
  // Check required fields
  if (!newUser.value.email) {
    validationStatus.value.email = 'error'
    validationMessages.value.email = 'Email is required'
    isValid = false
  }
  
  if (!newUser.value.password) {
    validationStatus.value.password = 'error'
    validationMessages.value.password = 'Password is required'
    isValid = false
  }
  
  return isValid
}

// Handle form submission
const handleSubmit = async () => {
  formError.value = ''
  submitSuccess.value = false
  
  // Validate form
  if (!validateForm()) {
    return
  }
  
  isSubmitting.value = true
  
  try {
    await createUser(newUser.value.email, newUser.value.password)
    
    // Refresh user list
    rows.value = await getAllUsers()
    
    submitSuccess.value = true
    
    // Reset form after successful submission
    setTimeout(() => {
      resetForm()
      showCreate.value = false
    }, 1500)
    
  } catch (error: any) {
    formError.value = error.message || 'Failed to create user'
    console.error('Error creating user:', error)
  } finally {
    isSubmitting.value = false
  }
}

// Make sure to reset the form when closing the modal
const handleCloseModal = function () {
  console.log('Close modal')
  showCreate.value = false
  showDetails.value = null
  resetForm()
}

// TODO: Prep before display
const renderName = function (data: IUser) {
  if (data.given_name && data.family_name) {
    return `${data.given_name} ${data.family_name}`
  }
  if (data.given_name) {
    return data.given_name
  }
  if (data.family_name) {
    return data.family_name
  }
  return ''
}

/**
 * Generates a strong random password
 * @param length Length of the password
 * @returns A strong random password
 */
const generateStrongPassword = (length = 12): string => {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz'
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const numbers = '0123456789'
  // const specialChars = '!@#$%^&*()-_=+[]{}|;:,.<>?'
  
  // Ensure at least one character from each group
  let password = ''
  password += lowercase.charAt(Math.floor(Math.random() * lowercase.length))
  password += uppercase.charAt(Math.floor(Math.random() * uppercase.length))
  password += numbers.charAt(Math.floor(Math.random() * numbers.length))
  // password += specialChars.charAt(Math.floor(Math.random() * specialChars.length))
  
  // Fill the rest with random characters from all groups
  const allChars = lowercase + uppercase + numbers //+ specialChars
  for (let i = 4; i < length; i++) {
    password += allChars.charAt(Math.floor(Math.random() * allChars.length))
  }
  
  // Shuffle the password to make it more random
  return password
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('')
}

/**
 * Generates a password and sets it to the password field
 */
const handleGeneratePassword = () => {
  // Generate a strong password
  const strongPassword = generateStrongPassword()
  
  // Set it to the form
  newUser.value.password = strongPassword
  
  // Reset validation if there was an error
  if (validationStatus.value.password === 'error') {
    validationStatus.value.password = ''
    validationMessages.value.password = ''
  }
}
</script>

<template>
  <MainWrapper>
    <Card class="List col-span-2">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-bold">Users</h3>
        <Button label="Add User" @click="handleOpenModal" />
      </div>
      <Vue3Datatable
        :rows="rows"
        :columns="cols"
        :loading="loading"
        sortColumn="name"
        :sortable="true"
        :columnFilter="true"
        @rowClick="handleRowClick"
      >
        <template #given_name="data">
          {{ renderName(data.value) }}
        </template>
      </Vue3Datatable>
    </Card>
    <Card v-show="showCreate" class="Details col-span-1">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-bold">Add User</h3>
        <CloseBtn label="close" @click="handleCloseModal" />
      </div>
      
      <form @submit.prevent="handleSubmit" class="mt-4 space-y-4">
        <div v-if="formError" class="p-3 text-sm bg-red-100 text-red-700 rounded-md">
          {{ formError }}
        </div>
        
        <div v-if="submitSuccess" class="p-3 text-sm bg-green-100 text-green-700 rounded-md">
          User created successfully!
        </div>
        
        <Input
          id="email"
          label="Email *"
          type="email"
          v-model="newUser.email"
          placeholder="Enter email address"
          :validationStatus="validationStatus.email"
          :validationMessage="validationMessages.email"
          :tabindex="1"
          required
        />
        
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <label for="password" class="block text-sm font-medium text-gray-700">Password *</label>
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
            v-model="newUser.password"
            placeholder="Enter password"
            :validationStatus="validationStatus.password"
            :validationMessage="validationMessages.password"
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
            v-model="newUser.given_name"
            placeholder="Enter given name"
            :validationStatus="validationStatus.given_name"
            :validationMessage="validationMessages.given_name"
            :tabindex="4"
          />
          
          <Input
            id="family_name"
            label="Family Name"
            type="text"
            v-model="newUser.family_name"
            placeholder="Enter family name"
            :validationStatus="validationStatus.family_name"
            :validationMessage="validationMessages.family_name"
            :tabindex="5"
          />
        </div>
        
        <!-- <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">Role</label>
          <select 
            v-model="newUser.role"
            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            :tabindex="5"
          >
            <option value="user">User</option>
            <option value="administrator">Admin</option>
            <option value="Manager">Manager</option>
          </select>
        </div> -->
        
        <Input
          id="phone_number"
          label="Phone Number"
          type="tel"
          v-model="newUser.phone_number"
          placeholder="Enter phone number"
          :validationStatus="validationStatus.phone_number"
          :validationMessage="validationMessages.phone_number"
          :tabindex="6"
        />
        
        <Input
          id="job_title"
          label="Job Title"
          type="text"
          v-model="newUser.job_title"
          placeholder="Enter job title"
          :validationStatus="validationStatus.job_title"
          :validationMessage="validationMessages.job_title"
          :tabindex="7"
        />
        
        <div class="flex justify-end pt-4">
          <Button 
            type="submit" 
            label="Create User"
            :loading="isSubmitting"
            :disabled="isSubmitting"
            :tabindex="8"
          />
        </div>
      </form>
    </Card>

    <Card v-show="showDetails" class="Details col-span-1">
      <div class="flex items-center justify-between">
        <Button outline label="edit" />
        <CloseBtn label="close" @click="handleCloseModal" />
      </div>
      <section class="content -mx-4 flex-auto space-y-10 rounded-t-lg bg-white px-4 pb-6">
        <div class="space-y-3">
          <h6 class="font-bold leading-none">User information</h6>
          <dl class="space-y-3">
            <div v-for="prop in Object.keys(showDetails || {})">
              <dt>{{ prop }}</dt>
              <dd class="text-grey-700">
                {{ showDetails?.[prop as keyof typeof showDetails] || '-' }}
              </dd>
            </div>
          </dl>
        </div>
      </section>
    </Card>
  </MainWrapper>
</template>
