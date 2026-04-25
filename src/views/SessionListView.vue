<script setup lang="ts">
import { computed, onBeforeMount, ref, watch, type Ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import Vue3Datatable from '@bhplugin/vue3-datatable'
import '@bhplugin/vue3-datatable/dist/style.css'

import Card from '@/components/Common/Card.vue'
import MainWrapper from '@/components/Layout/MainWrapper.vue'
import RecordDetailsCard from '@/components/Management/RecordDetailsCard.vue'
import Alert from '@/components/Common/Alert.vue'
import Badge from '@/components/Common/Badge.vue'
import Toggle from '@/components/Common/Inputs/Toggle.vue'
import Button from '@/components/Common/Buttons/Button.vue'

import {
  deleteSession,
  getAllSessions,
} from '@/services/fundermaps/endpoints/management/session'
import { getAllUsers } from '@/services/fundermaps/endpoints/management/user'
import type { ISession } from '@/services/fundermaps/interfaces/ISession'
import type { IUser } from '@/services/fundermaps/interfaces/IUser'
import { renderUserName } from '@/utils/user'
import { getErrorMessage } from '@/services/fundermaps/errors'

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const error = ref(false)
const includeExpired = ref(false)
const actionError = ref<string | null>(null)
const actionSuccess = ref<string | null>(null)

const flashSuccess = function (message: string) {
  actionSuccess.value = message
  setTimeout(() => {
    if (actionSuccess.value === message) actionSuccess.value = null
  }, 3000)
}

const userIdFilter = computed<string | null>(() => {
  const v = route.query.user_id
  if (typeof v === 'string' && v.trim()) return v
  return null
})

const cols = [
  { field: 'id', title: 'ID', isUnique: true, width: '8rem' },
  { field: 'user_id', title: 'User' },
  { field: 'status', title: 'Status', width: '7rem', sort: false, search: false },
  { field: 'created_at', title: 'Created', width: '12rem' },
  { field: 'expires_at', title: 'Expires', width: '12rem' },
]

const rows: Ref<ISession[]> = ref([])
const users: Ref<IUser[]> = ref([])
const record: Ref<ISession | null> = ref(null)

const userMap = computed<Map<string, IUser>>(() => {
  const m = new Map<string, IUser>()
  for (const u of users.value) m.set(u.id, u)
  return m
})

const filteredUser = computed<IUser | null>(() => {
  if (!userIdFilter.value) return null
  return userMap.value.get(userIdFilter.value) ?? null
})

const rowClass = (row: ISession) => (record.value?.id === row.id ? 'is-selected-row' : '')

const isExpired = function (session: ISession): boolean {
  return new Date(session.expires_at) <= new Date()
}

const refreshList = async function () {
  try {
    loading.value = true
    error.value = false
    const sessions = await getAllSessions({
      userId: userIdFilter.value ?? undefined,
      includeExpired: includeExpired.value,
    })
    sessions.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
    rows.value = sessions
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
}

const loadUsers = async function () {
  try {
    users.value = await getAllUsers()
  } catch {
    // Non-fatal — table just falls back to showing the raw user_id.
  }
}

onBeforeMount(async () => {
  await Promise.all([refreshList(), loadUsers()])
})

watch(includeExpired, refreshList)
watch(userIdFilter, refreshList)

const handleRowClick = function (row: ISession) {
  actionError.value = null
  actionSuccess.value = null
  record.value = row
}

const handleCloseModal = function () {
  record.value = null
  actionError.value = null
  actionSuccess.value = null
}

const handleClearUserFilter = function () {
  router.push({ name: 'sessions' })
}

const handleForceLogout = async function () {
  if (!record.value) return
  const owner = userMap.value.get(record.value.user_id)
  const label = owner ? owner.email : record.value.user_id
  if (!confirm(`Terminate session for "${label}"? They will need to sign in again.`)) return

  try {
    actionError.value = null
    await deleteSession(record.value.id)
    record.value = null
    flashSuccess('Session terminated.')
    await refreshList()
  } catch (e) {
    actionError.value = getErrorMessage(e) ?? 'Failed to terminate session.'
  }
}

const formatDate = function (dateStr: string | null) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const renderUserCell = function (userId: string): string {
  const u = userMap.value.get(userId)
  if (!u) return userId
  const name = renderUserName(u)
  return name ? `${name} <${u.email}>` : u.email
}
</script>

<template>
  <MainWrapper>
    <Card class="List col-span-2">
      <header
        class="-mx-5 -mt-5 flex items-center justify-between gap-4 border-b border-grey-200 px-5 py-4"
      >
        <div>
          <h2 class="heading-3">Sessions</h2>
          <p class="mt-1 text-sm text-grey-700">
            <template v-if="filteredUser">
              Active sessions for
              <span class="font-medium text-grey-800">{{ filteredUser.email }}</span
              >.
            </template>
            <template v-else-if="userIdFilter">
              Active sessions for user
              <code class="text-xs">{{ userIdFilter }}</code
              >.
            </template>
            <template v-else>Active user sessions across the platform.</template>
          </p>
        </div>
        <div class="flex items-center gap-4">
          <Button v-if="userIdFilter" outline label="Clear filter" @click="handleClearUserFilter" />
          <label class="flex items-center gap-2 text-sm text-grey-800">
            <Toggle v-model="includeExpired" />
            Include expired
          </label>
        </div>
      </header>

      <Alert v-if="error" :closeable="true" @close="error = false">
        An error occurred while trying to retrieve the list of sessions.
      </Alert>

      <Vue3Datatable
        :rows="rows"
        :columns="cols"
        :loading="loading"
        sortColumn="expires_at"
        sortDirection="desc"
        :sortable="true"
        :columnFilter="true"
        :rowClass="rowClass"
        @rowClick="handleRowClick"
      >
        <template #user_id="data">
          {{ renderUserCell(data.value.user_id) }}
        </template>
        <template #status="data">
          <Badge :variant="isExpired(data.value) ? 'default' : 'success'">
            {{ isExpired(data.value) ? 'expired' : 'active' }}
          </Badge>
        </template>
        <template #created_at="data">
          {{ formatDate(data.value.created_at) }}
        </template>
        <template #expires_at="data">
          {{ formatDate(data.value.expires_at) }}
        </template>
      </Vue3Datatable>
    </Card>

    <RecordDetailsCard
      title="Session information"
      :record="record"
      :deletable="!!record && !isExpired(record)"
      deleteLabel="Terminate"
      emptyMessage="Select a session to see its details."
      @close="handleCloseModal"
      @delete="handleForceLogout"
    >
      <Alert v-if="actionError" :closeable="true" @close="actionError = null">
        {{ actionError }}
      </Alert>
      <Alert v-if="actionSuccess" type="success" :closeable="true" @close="actionSuccess = null">
        {{ actionSuccess }}
      </Alert>
      <dl v-if="record" class="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
        <dt class="font-medium text-grey-700">Session ID</dt>
        <dd class="break-all">{{ record.id }}</dd>
        <dt class="font-medium text-grey-700">User</dt>
        <dd class="break-all">{{ renderUserCell(record.user_id) }}</dd>
        <dt class="font-medium text-grey-700">Status</dt>
        <dd>
          <Badge :variant="isExpired(record) ? 'default' : 'success'">
            {{ isExpired(record) ? 'expired' : 'active' }}
          </Badge>
        </dd>
        <dt class="font-medium text-grey-700">IP Address</dt>
        <dd>{{ record.ip_address || '-' }}</dd>
        <dt class="font-medium text-grey-700">Created</dt>
        <dd>{{ formatDate(record.created_at) }}</dd>
        <dt class="font-medium text-grey-700">Updated</dt>
        <dd>{{ formatDate(record.updated_at) }}</dd>
        <dt class="font-medium text-grey-700">Expires</dt>
        <dd>{{ formatDate(record.expires_at) }}</dd>
      </dl>
      <div v-if="record?.user_agent" class="mt-4 border-t border-grey-200 pt-4">
        <h6 class="mb-1 font-bold">User Agent</h6>
        <p class="break-all text-sm text-grey-800">{{ record.user_agent }}</p>
      </div>
    </RecordDetailsCard>
  </MainWrapper>
</template>
