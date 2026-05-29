<script setup lang="ts">
import { computed, onBeforeMount, onBeforeUnmount, ref, watch, type Ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import MainWrapper from '@/components/Layout/MainWrapper.vue'
import Drawer from '@/components/Layout/Drawer.vue'
import Table from '@/components/Common/Table.vue'
import Alert from '@/components/Common/Alert.vue'
import Button from '@/components/Common/Buttons/Button.vue'
import MonoBadge from '@/components/Common/MonoBadge.vue'
import Input from '@/components/Common/Inputs/Input.vue'

import {
  deleteSession,
  getAllSessions,
} from '@/services/fundermaps/endpoints/management/session'
import { getAllUsers } from '@/services/fundermaps/endpoints/management/user'
import type { ISession } from '@/services/fundermaps/interfaces/ISession'
import type { IUser } from '@/services/fundermaps/interfaces/IUser'
import { renderUserName } from '@/utils/user'
import { formatDate, formatIpAddress, formatValidFor } from '@/utils/date'
import { describeClient } from '@/utils/userAgent'
import { useFlash } from '@/composables/useFlash'
import { useListResource } from '@/composables/useListResource'
import { getErrorMessage } from '@/services/fundermaps/errors'

const route = useRoute()
const router = useRouter()

const actionError = ref<string | null>(null)
const { message: actionSuccess, flash: flashSuccess } = useFlash()
const includeExpired = ref(false)
const terminating = ref(false)

// "now" tick — keep the relative duration ("valid for 14m") fresh without
// refetching the list. Single shared computed clock for every row.
const now = ref(Date.now())
let clockHandle: ReturnType<typeof setInterval> | null = null

const userIdFilter = computed<string | null>(() => {
  const v = route.query.user_id
  if (typeof v === 'string' && v.trim()) return v
  return null
})

const columns = [
  { field: 'user_id', title: 'User' },
  { field: 'client', title: 'Client', width: '7rem' },
  { field: 'ip_address', title: 'IP address', width: '12rem' },
  { field: 'valid_for', title: 'Valid for', width: '8rem' },
  { field: 'created_at', title: 'Created', width: '12rem' },
]

const users: Ref<IUser[]> = ref([])

const userMap = computed<Map<string, IUser>>(() => {
  const m = new Map<string, IUser>()
  for (const u of users.value) m.set(u.id, u)
  return m
})

const filteredUser = computed<IUser | null>(() => {
  if (!userIdFilter.value) return null
  return userMap.value.get(userIdFilter.value) ?? null
})

const renderUserCell = function (userId: string): string {
  const u = userMap.value.get(userId)
  if (!u) return userId
  const name = renderUserName(u)
  return name ? `${name} <${u.email}>` : u.email
}

const {
  rows,
  loading,
  error,
  search,
  record,
  filteredRows,
  refresh: refreshList,
  refreshAndSelectFirst,
  select: handleSelect,
  selectById,
  selectFirst: selectFirstRow,
} = useListResource<ISession>({
  fetch: async () => {
    const sessions = await getAllSessions({
      userId: userIdFilter.value ?? undefined,
      includeExpired: includeExpired.value,
    })
    return sessions.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
  },
  filter: (s, q) =>
    renderUserCell(s.user_id).toLowerCase().includes(q) ||
    (s.ip_address ?? '').toLowerCase().includes(q) ||
    (s.user_agent ?? '').toLowerCase().includes(q) ||
    describeClient(s.user_agent).toLowerCase().includes(q),
  onSelect: () => {
    actionError.value = null
    actionSuccess.value = null
  },
  routeId: () => (typeof route.params.id === 'string' ? route.params.id : undefined),
  syncRoute: (id) => router.replace({ name: 'sessions', params: { id }, query: route.query }),
  immediate: false,
})

const loadUsers = async function () {
  try {
    users.value = await getAllUsers()
  } catch {
    // Non-fatal — table just falls back to showing the raw user_id.
  }
}

onBeforeMount(async () => {
  await Promise.all([refreshList(), loadUsers()])
  const id = typeof route.params.id === 'string' ? route.params.id : undefined
  if (id && rows.value.some((s) => s.id === id)) selectById(id)
  else selectFirstRow()
  // Tick once a minute — sessions are minute-grained; second-resolution
  // would re-render the whole table for no real benefit.
  clockHandle = setInterval(() => {
    now.value = Date.now()
  }, 60_000)
})

watch([userIdFilter, includeExpired], () => refreshAndSelectFirst())

onBeforeUnmount(() => {
  if (clockHandle !== null) clearInterval(clockHandle)
})

const handleClearUserFilter = function () {
  router.push({ name: 'sessions' })
}

const handleForceLogout = async function () {
  if (!record.value) return
  const owner = userMap.value.get(record.value.user_id)
  const label = owner ? owner.email : record.value.user_id
  if (!confirm(`Terminate session for "${label}"? They will need to sign in again.`)) return

  try {
    terminating.value = true
    actionError.value = null
    await deleteSession(record.value.id)
    record.value = null
    await refreshList()
    selectFirstRow()
    flashSuccess('Session terminated.')
  } catch (e) {
    actionError.value = getErrorMessage(e) ?? 'Failed to terminate session.'
  } finally {
    terminating.value = false
  }
}
</script>

<template>
  <MainWrapper>
    <header class="mb-4 flex items-end justify-between gap-4">
      <div>
        <h2 class="text-xl font-semibold text-grey-800">Sessions</h2>
        <p class="mt-0.5 text-sm text-grey-700">
          <template v-if="filteredUser">
            Active sessions for
            <span class="font-medium text-grey-800">{{ filteredUser.email }}</span
            >.
          </template>
          <template v-else-if="userIdFilter">
            Active sessions for user
            <MonoBadge :value="userIdFilter" />.
          </template>
          <template v-else>Active user sessions across the platform.</template>
        </p>
      </div>
      <Button v-if="userIdFilter" outline label="Clear filter" @click="handleClearUserFilter" />
    </header>

    <div class="mb-3 flex items-center gap-4">
      <div class="w-72">
        <Input
          id="session-search"
          v-model="search"
          type="search"
          placeholder="Search by user, IP, client…"
        />
      </div>
      <label class="flex cursor-pointer items-center gap-2 text-sm text-grey-700">
        <input v-model="includeExpired" type="checkbox" class="h-4 w-4 accent-green-500" />
        Include expired
      </label>
      <span class="text-xs text-grey-700">{{ filteredRows.length }} of {{ rows.length }}</span>
    </div>

    <Alert v-if="error" :closeable="true" class="mb-3" @close="error = false">
      An error occurred while trying to retrieve the list of sessions.
    </Alert>

    <Table
      :rows="filteredRows"
      :columns="columns"
      :loading="loading"
      :selectedId="record?.id"
      emptyMessage="No sessions match your filters."
      @select="handleSelect"
    >
      <template #user_id="{ row }">
        <span class="text-grey-800">{{ renderUserCell(row.user_id) }}</span>
      </template>
      <template #client="{ row }">
        <span class="text-grey-700">{{ describeClient(row.user_agent) }}</span>
      </template>
      <template #ip_address="{ row }">
        <span class="font-mono text-xs text-grey-700">{{ formatIpAddress(row.ip_address) }}</span>
      </template>
      <template #valid_for="{ row }">
        <span class="font-mono text-xs text-grey-700">{{ formatValidFor(row.expires_at, now) }}</span>
      </template>
      <template #created_at="{ row }">{{ formatDate(row.created_at) }}</template>
    </Table>

    <template #aside>
      <Drawer>
        <template #title>Session information</template>
        <template v-if="record" #actions>
          <Button danger label="Terminate" :loading="terminating" @click="handleForceLogout" />
        </template>

        <template v-if="record">
          <Alert v-if="actionError" :closeable="true" class="mb-3" @close="actionError = null">
            {{ actionError }}
          </Alert>
          <Alert
            v-if="actionSuccess"
            type="success"
            :closeable="true"
            class="mb-3"
            @close="actionSuccess = null"
          >
            {{ actionSuccess }}
          </Alert>
          <dl class="grid grid-cols-[8rem_1fr] gap-x-4 gap-y-2 text-sm">
            <dt class="text-grey-700">Session ID</dt>
            <dd><MonoBadge :value="record.id" /></dd>
            <dt class="text-grey-700">User</dt>
            <dd class="text-grey-800 break-all">{{ renderUserCell(record.user_id) }}</dd>
            <dt class="text-grey-700">Valid for</dt>
            <dd class="font-mono text-xs text-grey-800">{{ formatValidFor(record.expires_at, now) }}</dd>
            <dt class="text-grey-700">IP address</dt>
            <dd class="text-grey-800">{{ formatIpAddress(record.ip_address) }}</dd>
            <dt class="text-grey-700">Created</dt>
            <dd class="text-grey-800">{{ formatDate(record.created_at) }}</dd>
            <dt class="text-grey-700">Updated</dt>
            <dd class="text-grey-800">{{ formatDate(record.updated_at) }}</dd>
            <dt class="text-grey-700">Expires</dt>
            <dd class="text-grey-800">{{ formatDate(record.expires_at) }}</dd>
          </dl>
          <div v-if="record.user_agent" class="mt-4 border-t border-grey-200 pt-4">
            <h6 class="mb-1 text-xs font-semibold uppercase tracking-wide text-grey-700">
              User agent
            </h6>
            <p class="break-all text-sm text-grey-800">{{ record.user_agent }}</p>
          </div>
        </template>
        <div
          v-else
          class="flex h-full items-center justify-center text-center text-sm text-grey-700"
        >
          No active sessions.
        </div>
      </Drawer>
    </template>
  </MainWrapper>
</template>
