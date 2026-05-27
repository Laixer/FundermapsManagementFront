<script setup lang="ts">
import { computed, onBeforeMount, ref, watch, type Ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import MainWrapper from '@/components/Layout/MainWrapper.vue'
import Drawer from '@/components/Layout/Drawer.vue'
import Table from '@/components/Common/Table.vue'
import Alert from '@/components/Common/Alert.vue'
import Badge from '@/components/Common/Badge.vue'
import Toggle from '@/components/Common/Inputs/Toggle.vue'
import Button from '@/components/Common/Buttons/Button.vue'
import MonoBadge from '@/components/Common/MonoBadge.vue'

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

const columns = [
  { field: 'user_id', title: 'User' },
  { field: 'status', title: 'Status', width: '7rem' },
  { field: 'created_at', title: 'Created', width: '13rem' },
  { field: 'expires_at', title: 'Expires', width: '13rem' },
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

const handleSelect = function (row: ISession) {
  actionError.value = null
  actionSuccess.value = null
  record.value = row
}

const handleCloseDrawer = function () {
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
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// IPv6 from the proxy arrives expanded (e.g. 2a02:a473:7505:0000:…); the
// WHATWG URL parser compresses it to RFC 5952. IPv4 and unparseable strings
// pass through unchanged.
const formatIpAddress = function (ip: string | null): string {
  if (!ip) return '—'
  if (!ip.includes(':')) return ip
  try {
    return new URL(`http://[${ip}]`).hostname.replace(/^\[|\]$/g, '')
  } catch {
    return ip
  }
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
      <div class="flex items-center gap-3">
        <Button v-if="userIdFilter" outline label="Clear filter" @click="handleClearUserFilter" />
        <label class="flex items-center gap-2 text-sm text-grey-800">
          <Toggle v-model="includeExpired" />
          Include expired
        </label>
      </div>
    </header>

    <Alert v-if="error" :closeable="true" class="mb-3" @close="error = false">
      An error occurred while trying to retrieve the list of sessions.
    </Alert>

    <Table
      :rows="rows"
      :columns="columns"
      :loading="loading"
      :selectedId="record?.id"
      emptyMessage="No sessions to show."
      @select="handleSelect"
    >
      <template #user_id="{ row }">
        <span class="text-grey-800">{{ renderUserCell(row.user_id) }}</span>
      </template>
      <template #status="{ row }">
        <Badge :variant="isExpired(row) ? 'default' : 'success'">
          {{ isExpired(row) ? 'expired' : 'active' }}
        </Badge>
      </template>
      <template #created_at="{ row }">{{ formatDate(row.created_at) }}</template>
      <template #expires_at="{ row }">{{ formatDate(row.expires_at) }}</template>
    </Table>

    <template #aside>
      <Drawer :open="!!record" @close="handleCloseDrawer">
        <template #title>Session information</template>
        <template v-if="record && !isExpired(record)" #actions>
          <Button danger label="Terminate" @click="handleForceLogout" />
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
            <dt class="text-grey-700">Status</dt>
            <dd>
              <Badge :variant="isExpired(record) ? 'default' : 'success'">
                {{ isExpired(record) ? 'expired' : 'active' }}
              </Badge>
            </dd>
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
      </Drawer>
    </template>
  </MainWrapper>
</template>
