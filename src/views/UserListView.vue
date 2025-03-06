<script setup lang="ts">
import { onBeforeMount, ref, type Ref } from 'vue'

// @ts-ignore TODO: PR to fix TS
import Vue3Datatable from '@bhplugin/vue3-datatable'
import '@bhplugin/vue3-datatable/dist/style.css'

import Card from '@/components/Common/Card.vue'
import Button from '@/components/Common/Buttons/Button.vue'
import MainWrapper from '@/components/Layout/MainWrapper.vue'
import RecordDetailsCard from '@/components/Management/RecordDetailsCard.vue'
import CreateUserForm from '@/components/Management/Forms/CreateUserForm.vue'
import CopyToClipboardIcon from '@/components/Common/Icons/CopyToClipboardIcon.vue'

import { getAllUsers, getUser } from '@/services/fundermaps/endpoints/management/user.ts'
import type { IUser } from '@/services/fundermaps/interfaces/IUser.ts'
import UserResetPassword from '@/components/Management/Forms/UserResetPassword.vue'

const loading = ref(true)
const error = ref(false)
const showCreate = ref(false)

const cols = [
  { field: 'id', title: 'ID', isUnique: true, width: '20rem' },
  { field: 'given_name', title: 'Name' },
  { field: 'email', title: 'Email' },
  { field: 'role', title: 'Rol' },
]
const rows: Ref<IUser[]> = ref([])

const record: Ref<IUser | null> = ref(null)

const refreshList = async function () {
  try {
    loading.value = true
    error.value = false
    rows.value = await getAllUsers()
  } catch (e) {
    error.value = true
  } finally {
    loading.value = false
  }
}

onBeforeMount(refreshList)

const handleRowClick = async function (row: IUser) {
  console.log(row)
  showCreate.value = false

  record.value = await getUser(row.id)

  console.log(record.value)
}
const handleOpenModal = function () {
  record.value = null
  showCreate.value = true
}

// Make sure to reset the form when closing the modal
const handleCloseModal = function () {
  showCreate.value = false
  record.value = null
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
        <template #id="data">
          <div class="flex justify-between">
            <div>{{ data.value.id }}</div>
            <CopyToClipboardIcon :value="data.value.id" />
          </div>
        </template>
        <template #given_name="data">
          {{ renderName(data.value) }}
        </template>
      </Vue3Datatable>
    </Card>
    <CreateUserForm
      v-if="showCreate"
      @cancel="handleCloseModal"
      @saved="refreshList"
      @close="handleCloseModal"
    />

    <RecordDetailsCard title="User information" :record="record" @close="handleCloseModal">
      <UserResetPassword :record="record" />
    </RecordDetailsCard>
  </MainWrapper>
</template>
