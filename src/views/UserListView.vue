<script setup lang="ts">
import { onBeforeMount, ref, type Ref } from 'vue'

// @ts-expect-error TODO: PR to fix TS
import Vue3Datatable from '@bhplugin/vue3-datatable'
import '@bhplugin/vue3-datatable/dist/style.css'

import Card from '@/components/Common/Card.vue'
import Button from '@/components/Common/Buttons/Button.vue'
import MainWrapper from '@/components/Layout/MainWrapper.vue'
import RecordDetailsCard from '@/components/Management/RecordDetailsCard.vue'
import CreateUserForm from '@/components/Management/Forms/CreateUserForm.vue'
import CopyToClipboardIcon from '@/components/Common/Icons/CopyToClipboardIcon.vue'
import Alert from '@/components/Common/Alert.vue'

import Select from '@/components/Common/Inputs/Select.vue'

import {
  createAPIKey,
  deleteUser,
  getAPIKeys,
  getAllUsers,
  getUser,
  updateUserRole,
} from '@/services/fundermaps/endpoints/management/user.ts'
import type { IUser } from '@/services/fundermaps/interfaces/IUser.ts'
import UserResetPassword from '@/components/Management/Forms/UserResetPassword.vue'
import EditUserForm from '@/components/Management/Forms/EditUserForm.vue'

const loading = ref(true)
const error = ref(false)
const showCreate = ref(false)
const showEdit = ref(false)

const cols = [
  { field: 'id', title: 'ID', isUnique: true, width: '20rem' },
  { field: 'given_name', title: 'Name' },
  { field: 'email', title: 'Email' },
  { field: 'role', title: 'Role' },
]
const rows: Ref<IUser[]> = ref([])

interface IAuthKey {
  key: string
  user_id: string
  name: string | null
  last_used: string | null
}

const apiKeyCols = [
  { field: 'key', title: 'Key', isUnique: true },
  { field: 'last_used', title: 'Last Used' },
]

const record: Ref<IUser | null> = ref(null)
const apiKeys: Ref<IAuthKey[]> = ref([])

const refreshList = async function () {
  try {
    loading.value = true
    error.value = false
    rows.value = await getAllUsers()
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
}

onBeforeMount(refreshList)

const handleRowClick = async function (row: IUser) {
  showCreate.value = false
  showEdit.value = false

  record.value = await getUser(row.id)
  apiKeys.value = await getAPIKeys(row.id)
}
const handleOpenModal = function () {
  showEdit.value = false
  record.value = null
  showCreate.value = true
}
const handleEdit = function () {
  showCreate.value = false
  showEdit.value = true
}

// Make sure to reset the form when closing the modal
const handleCloseModal = function () {
  showCreate.value = false
  showEdit.value = false
  record.value = null
}

const handleCreateAPIKey = async function () {
  if (record.value) {
    if (!confirm('Generate a new API key for this user?')) return

    const response = await createAPIKey(record.value.id)
    await navigator.clipboard.writeText(response.key)
    apiKeys.value = await getAPIKeys(record.value.id)
    alert('API key copied to clipboard: ' + response.key)
  }
}

const handleDelete = async function () {
  if (!record.value) return
  if (!confirm(`Delete user "${record.value.email}"? This cannot be undone.`)) return

  try {
    await deleteUser(record.value.id)
    record.value = null
    showEdit.value = false
    await refreshList()
  } catch {
    alert('Failed to delete user.')
  }
}

const handleRoleChange = async function (newRole: string) {
  if (!record.value) return
  try {
    await updateUserRole(record.value.id, newRole)
    record.value = await getUser(record.value.id)
    await refreshList()
  } catch {
    alert('Failed to update user role.')
  }
}

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
      <Alert v-if="error" :closeable="true" @close="error = false">
        An error occurred while trying to retrieve the list of records.
      </Alert>
      <Vue3Datatable :rows="rows" :columns="cols" :loading="loading" sortColumn="name" :sortable="true"
        :columnFilter="true" @rowClick="handleRowClick">
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
    <CreateUserForm v-if="showCreate" @cancel="handleCloseModal" @saved="refreshList" @close="handleCloseModal" />

    <EditUserForm v-if="record && showEdit" :record="record" @cancel="handleCloseModal" @saved="refreshList"
      @close="handleCloseModal" />

    <RecordDetailsCard v-if="!showEdit" title="User information" :record="record" :editable="true"
      @close="handleCloseModal" @edit="handleEdit">
      <div class="space-y-6">
        <!-- Role -->
        <div>
          <label class="mb-1 block text-sm font-medium text-gray-700">Role</label>
          <Select
            id="role"
            :options="[
              { label: 'User', value: 'user' },
              { label: 'Administrator', value: 'administrator' },
            ]"
            :modelValue="record?.role"
            @update:modelValue="handleRoleChange"
          />
        </div>

        <!-- Password Reset -->
        <div class="border-t pt-4">
          <UserResetPassword :record="record" />
        </div>

        <!-- API Keys -->
        <div class="border-t pt-4">
          <div class="mb-2 flex items-center justify-between">
            <h6 class="font-bold">API Keys</h6>
            <Button label="Generate" @click="handleCreateAPIKey" />
          </div>
          <Vue3Datatable :rows="apiKeys" :columns="apiKeyCols" :sortable="true">
            <template #key="data">
              <div class="flex items-center justify-between">
                <code class="truncate">{{ data.value.key }}</code>
                <CopyToClipboardIcon :value="data.value.key" />
              </div>
            </template>
          </Vue3Datatable>
        </div>

        <!-- Danger Zone -->
        <div class="border-t border-red-200 pt-4">
          <h6 class="mb-2 font-bold text-red-600">Danger Zone</h6>
          <Button label="Delete User" class="bg-red-600 hover:bg-red-700" @click="handleDelete" />
        </div>
      </div>
    </RecordDetailsCard>
  </MainWrapper>
</template>
