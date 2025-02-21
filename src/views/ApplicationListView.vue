<script setup lang="ts">
import { onBeforeMount, ref, type Ref } from 'vue'

// @ts-ignore TODO: PR to fix TS
import Vue3Datatable from '@bhplugin/vue3-datatable'

import '@bhplugin/vue3-datatable/dist/style.css'

import Card from '@/components/Common/Card.vue'
import Button from '@/components/Common/Buttons/Button.vue'
import MainWrapper from '@/components/Layout/MainWrapper.vue'

import {
  getAllApplications,
  type IApplication,
} from '@/services/fundermaps/endpoints/management/applications.ts'
import CloseBtn from '@/components/Common/Buttons/CloseBtn.vue'

const cols = [
  { field: 'id', title: 'ID', isUnique: true, width: '15rem' },
  { field: 'name', title: 'Name' },
]
const rows: Ref<IApplication[]> = ref([])

const loading = ref(true)

const showDetails: Ref<IApplication | null> = ref(null)
const showCreate = ref(false)

onBeforeMount(async () => {
  try {
    rows.value = await getAllApplications()

    loading.value = false
  } catch (e) {
    // TODO: Show error
  }
})
const handleRowClick = function (row: IApplication) {
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
const handleCloseModal = function () {
  console.log('Close modal')
  showCreate.value = false
  showDetails.value = null
}

/**
 * Create Application
 *  TODO: Move to component
 */
import { z } from 'zod'
import useValidation from '@/services/useValidation'
// import api from '@/services/fundermaps'
import AnimatedArrowIcon from '@/components/Common/Icons/AnimatedArrowIcon.vue'
import Input from '@/components/Common/Inputs/Input.vue'

const submitFailed = ref(false)
const formData = ref({
  name: '',
})

/**
 * Keeping it simple. Let the API decide what is valid
 */
const validationSchema = z
  .object({
    name: z.string().min(1, 'Name is required.'),
  })
  .strict()

// Activate validator
const { validate, isValid, getError, getStatus, scrolltoError } = useValidation(
  validationSchema,
  formData,
)

/**
 * Handle form submit
 *  TODO: Check for refresh token & Attempt automatic login using refresh token
 */
const handleSubmit = async function () {
  try {
    submitFailed.value = false

    await validate()

    if (!isValid.value) {
      scrolltoError('.validation__message', { offset: 200 })
    } else {
      console.log('API call', formData.value.name)
      // await sessionStore.login(formData.value.email, formData.value.password)
    }
  } catch (e) {
    console.log(e)
    submitFailed.value = true
  }
}
</script>

<template>
  <MainWrapper>
    <Card class="List col-span-2">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-bold">Applications</h3>
        <Button label="Add application" @click="handleOpenModal" />
      </div>
      <Vue3Datatable
        :rows="rows"
        :columns="cols"
        :loading="loading"
        sortColumn="name"
        :sortable="true"
        :columnFilter="true"
        @rowClick="handleRowClick"
      />
    </Card>

    <Card v-show="showCreate" class="Details col-span-1">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-bold">Add application</h3>
        <CloseBtn label="close" @click="handleCloseModal" />
      </div>
      <form @submit.prevent="handleSubmit">
        <Input
          id="name"
          label="Application Name"
          type="text"
          v-model="formData.name"
          placeholder="Enter the application name"
          :validationStatus="getStatus('name')"
          :validationMessage="getError('name')"
          :tabindex="1"
        />

        <Button class="mt-4" type="submit" label="Submit">
          <template v-slot:after>
            <AnimatedArrowIcon />
          </template>
        </Button>
      </form>
    </Card>

    <Card v-show="showDetails" class="Details col-span-1">
      <div class="flex items-center justify-between">
        <Button outline label="edit" />
        <CloseBtn label="close" @click="handleCloseModal" />
      </div>

      <section class="content -mx-4 flex-auto space-y-10 rounded-t-lg bg-white px-4 pb-6">
        <div class="space-y-3">
          <h6 class="font-bold leading-none">Application information</h6>
          <dl class="space-y-3">
            <div>
              <dt>ID</dt>
              <dd class="text-grey-700">{{ showDetails?.id || '-' }}</dd>
            </div>
            <div>
              <dt>Name</dt>
              <dd class="text-grey-700">{{ showDetails?.name || '-' }}</dd>
            </div>
            <div>
              <dt>Data</dt>
              <dd class="text-grey-700">{{ showDetails?.data || '-' }}</dd>
            </div>
          </dl>
        </div>
      </section>
    </Card>
  </MainWrapper>
</template>
