<script setup lang="ts">
import { onBeforeMount, ref, type Ref } from 'vue'

import Vue3Datatable from '@bhplugin/vue3-datatable'
import '@bhplugin/vue3-datatable/dist/style.css'

import Card from '@/components/Common/Card.vue'
import Button from '@/components/Common/Buttons/Button.vue'
import MainWrapper from '@/components/Layout/MainWrapper.vue'
import RecordDetailsCard from '@/components/Management/RecordDetailsCard.vue'
import CreateUserForm from '@/components/Management/Forms/CreateUserForm.vue'
import CopyToClipboardIcon from '@/components/Common/Icons/CopyToClipboardIcon.vue'
import Icon from '@/components/Common/Icons/Icon.vue'
import Alert from '@/components/Common/Alert.vue'
import Badge from '@/components/Common/Badge.vue'

import Select from '@/components/Common/Inputs/Select.vue'

import {
  createAPIKey,
  deleteAPIKey,
  deleteUser,
  getAPIKeys,
  getAllUsers,
  getUser,
  updateUserRole,
  USERS_LIST_LIMIT,
} from '@/services/fundermaps/endpoints/management/user.ts'
import type { IUser } from '@/services/fundermaps/interfaces/IUser.ts'
import { renderUserName } from '@/utils/user'
import { getErrorMessage } from '@/services/fundermaps/errors'
import UserResetPassword from '@/components/Management/Forms/UserResetPassword.vue'
import EditUserForm from '@/components/Management/Forms/EditUserForm.vue'

const loading = ref(true)
const error = ref(false)
const showCreate = ref(false)
const showEdit = ref(false)
const actionError = ref<string | null>(null)
const actionSuccess = ref<string | null>(null)
const newApiKey = ref<string | null>(null)

const flashSuccess = function (message: string) {
  actionSuccess.value = message
  setTimeout(() => {
    if (actionSuccess.value === message) actionSuccess.value = null
  }, 3000)
}

const cols = [
  { field: 'id', title: 'ID', isUnique: true, width: '20rem' },
  { field: 'given_name', title: 'Name' },
  { field: 'email', title: 'Email' },
  { field: 'role', title: 'Role' },
]
const rows: Ref<IUser[]> = ref([])

interface IAuthKey {
  id: string
  user_id: string
  name: string | null
  last_used: string | null
}

const apiKeyCols = [
  { field: 'name', title: 'Name', isUnique: true },
  { field: 'last_used', title: 'Last Used' },
  { field: 'actions', title: '', width: '2rem', filter: false, sort: false, search: false },
]

const record: Ref<IUser | null> = ref(null)
const apiKeys: Ref<IAuthKey[]> = ref([])

const rowClass = (row: IUser) => (record.value?.id === row.id ? 'is-selected-row' : '')

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
  actionError.value = null
  actionSuccess.value = null
  newApiKey.value = null
  apiKeys.value = []

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
  actionError.value = null
  actionSuccess.value = null
  newApiKey.value = null
}

const handleCreateAPIKey = async function () {
  if (!record.value) return
  if (!confirm('Generate a new API key for this user?')) return

  try {
    actionError.value = null
    const response = await createAPIKey(record.value.id)
    apiKeys.value = await getAPIKeys(record.value.id)
    newApiKey.value = response.key
  } catch (e) {
    actionError.value = getErrorMessage(e) ?? 'Failed to generate API key.'
  }
}

const handleDeleteAPIKey = async function (id: string) {
  if (!record.value) return
  if (!confirm('Delete this API key? This cannot be undone.')) return

  try {
    actionError.value = null
    await deleteAPIKey(record.value.id, id)
    apiKeys.value = await getAPIKeys(record.value.id)
    flashSuccess('API key deleted.')
  } catch (e) {
    actionError.value = getErrorMessage(e) ?? 'Failed to delete API key.'
  }
}

const handleDelete = async function () {
  if (!record.value) return
  if (!confirm(`Delete user "${record.value.email}"? This cannot be undone.`)) return

  try {
    actionError.value = null
    await deleteUser(record.value.id)
    record.value = null
    showEdit.value = false
    await refreshList()
  } catch (e) {
    actionError.value = getErrorMessage(e) ?? 'Failed to delete user.'
  }
}

const handleRoleChange = async function (newRole: string) {
  if (!record.value) return
  try {
    actionError.value = null
    await updateUserRole(record.value.id, newRole)
    record.value = await getUser(record.value.id)
    await refreshList()
    flashSuccess('Role updated.')
  } catch (e) {
    actionError.value = getErrorMessage(e) ?? 'Failed to update user role.'
  }
}

</script>

<template>
  <MainWrapper>
    <Card class="List col-span-2">
      <header
        class="-mx-5 -mt-5 flex items-center justify-between gap-4 border-b border-grey-200 px-5 py-4"
      >
        <div>
          <h2 class="heading-3">Users</h2>
          <p class="mt-1 text-sm text-grey-700">Manage accounts, roles and API keys.</p>
        </div>
        <Button label="Add User" @click="handleOpenModal" />
      </header>
      <Alert v-if="error" :closeable="true" @close="error = false">
        An error occurred while trying to retrieve the list of records.
      </Alert>
      <Alert v-if="rows.length >= USERS_LIST_LIMIT" type="danger">
        Showing the first {{ USERS_LIST_LIMIT }} users — additional users are not loaded.
      </Alert>
      <Vue3Datatable :rows="rows" :columns="cols" :loading="loading" sortColumn="name" :sortable="true"
        :columnFilter="true" :rowClass="rowClass" @rowClick="handleRowClick">
        <template #id="data">
          <div class="flex justify-between">
            <div>{{ data.value.id }}</div>
            <CopyToClipboardIcon :value="data.value.id" />
          </div>
        </template>
        <template #given_name="data">
          {{ renderUserName(data.value) }}
        </template>
        <template #role="data">
          <Badge :variant="data.value.role === 'administrator' ? 'info' : 'default'">
            {{ data.value.role }}
          </Badge>
        </template>
      </Vue3Datatable>
    </Card>
    <CreateUserForm v-if="showCreate" @cancel="handleCloseModal" @saved="refreshList" @close="handleCloseModal" />

    <EditUserForm v-if="record && showEdit" :record="record" @cancel="handleCloseModal" @saved="refreshList"
      @close="handleCloseModal" />

    <RecordDetailsCard v-if="!showEdit" title="User information" :record="record" :editable="true"
      :deletable="true" emptyMessage="Select a user to see details." @close="handleCloseModal" @edit="handleEdit"
      @delete="handleDelete">
      <Alert v-if="actionError" :closeable="true" @close="actionError = null">
        {{ actionError }}
      </Alert>
      <Alert v-if="actionSuccess" type="success" :closeable="true" @close="actionSuccess = null">
        {{ actionSuccess }}
      </Alert>
      <div class="space-y-6">
        <!-- User Info -->
        <dl class="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <dt class="font-medium text-grey-700">Email</dt>
          <dd>{{ record?.email }}</dd>
          <dt class="font-medium text-grey-700">Name</dt>
          <dd>{{ renderUserName(record!) || '-' }}</dd>
          <dt class="font-medium text-grey-700">Phone</dt>
          <dd>{{ record?.phone_number || '-' }}</dd>
          <dt class="font-medium text-grey-700">Job Title</dt>
          <dd>{{ record?.job_title || '-' }}</dd>
        </dl>

        <!-- Organisations -->
        <div v-if="record?.organizations?.length" class="border-t pt-4">
          <h6 class="mb-1 font-bold">Organisations</h6>
          <ul class="text-sm text-grey-800">
            <li v-for="org in record.organizations" :key="org.id">{{ org.name }}</li>
          </ul>
        </div>

        <!-- Role -->
        <div class="border-t pt-4">
          <label class="mb-1 block text-sm font-medium text-grey-800">Role</label>
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
          <Alert v-if="newApiKey" type="success" :closeable="true" @close="newApiKey = null">
            <div class="mb-2 font-medium">
              New API key generated — copy it now, it won't be shown again.
            </div>
            <div class="flex items-center gap-2">
              <code class="select-all break-all">{{ newApiKey }}</code>
              <CopyToClipboardIcon :value="newApiKey" />
            </div>
          </Alert>
          <Vue3Datatable :rows="apiKeys" :columns="apiKeyCols" :sortable="true">
            <template #name="data">
              <span class="truncate">{{ data.value.name || data.value.id }}</span>
            </template>
            <template #actions="data">
              <button @click.stop="handleDeleteAPIKey(data.value.id)">
                <Icon class="aspect-square w-3" name="trash-solid" />
              </button>
            </template>
          </Vue3Datatable>
        </div>

      </div>
    </RecordDetailsCard>
  </MainWrapper>
</template>
