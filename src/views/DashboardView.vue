<script setup lang="ts">
import { computed, onBeforeMount, ref } from 'vue'
import { RouterLink } from 'vue-router'

import MainWrapper from '@/components/Layout/MainWrapper.vue'
import Card from '@/components/Common/Card.vue'
import Alert from '@/components/Common/Alert.vue'
import Skeleton from '@/components/Common/Skeleton.vue'

import { getAllUsers, USERS_LIST_LIMIT } from '@/services/fundermaps/endpoints/management/user'
import { getAllOrganisations } from '@/services/fundermaps/endpoints/management/organisation'
import { getAllMapsets } from '@/services/fundermaps/endpoints/management/mapset'
import { getAllSessions } from '@/services/fundermaps/endpoints/management/session'
import type { IUser } from '@/services/fundermaps/interfaces/IUser'
import { formatDate } from '@/utils/date'
import { renderUserName } from '@/utils/user'

const loading = ref(true)
const error = ref(false)

const userCount = ref(0)
const usersList = ref<IUser[]>([])
const orgCount = ref(0)
const mapsetCount = ref(0)
const sessionCount = ref(0)

const atUserCap = ref(false)

const refresh = async function () {
  try {
    loading.value = true
    error.value = false
    const [users, orgs, mapsets, sessions] = await Promise.all([
      getAllUsers(),
      getAllOrganisations(),
      getAllMapsets(),
      getAllSessions(),
    ])
    userCount.value = users.length
    usersList.value = users
    atUserCap.value = users.length >= USERS_LIST_LIMIT
    orgCount.value = orgs.length
    mapsetCount.value = mapsets.length
    sessionCount.value = sessions.length
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
}

onBeforeMount(refresh)

const fmt = (value: number, capped: boolean) => (loading.value ? '…' : `${value}${capped ? '+' : ''}`)

const stats = computed(() => [
  { label: 'Users', value: fmt(userCount.value, atUserCap.value), to: { name: 'users' } },
  { label: 'Organisations', value: fmt(orgCount.value, false), to: { name: 'organisations' } },
  { label: 'Mapsets', value: fmt(mapsetCount.value, false), to: { name: 'mapsets' } },
  { label: 'Active sessions', value: fmt(sessionCount.value, false), to: { name: 'sessions' } },
])

const recentUsers = computed(() =>
  [...usersList.value]
    .filter((u) => u.created_at)
    .sort((a, b) => new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime())
    .slice(0, 6),
)
</script>

<template>
  <MainWrapper>
    <header class="mb-4">
      <h2 class="text-xl font-semibold text-grey-800">Dashboard</h2>
      <p class="mt-0.5 text-sm text-grey-700">An overview of the platform at a glance.</p>
    </header>

    <Alert v-if="error" :closeable="true" class="mb-3" @close="error = false">
      An error occurred while loading the dashboard.
    </Alert>

    <div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <RouterLink v-for="s in stats" :key="s.label" :to="s.to" class="block">
        <Card class="transition-colors hover:border-grey-400">
          <div class="text-xs font-semibold uppercase tracking-wide text-grey-700">
            {{ s.label }}
          </div>
          <Skeleton v-if="loading" class="mt-2" width="3rem" height="1.75rem" />
          <div v-else class="mt-1 text-3xl font-semibold text-grey-800">{{ s.value }}</div>
        </Card>
      </RouterLink>
    </div>

    <Card title="Recent signups" class="mt-6">
      <div v-if="loading" class="space-y-2.5 py-1">
        <Skeleton v-for="n in 5" :key="`sku-${n}`" />
      </div>
      <div v-else-if="!recentUsers.length" class="text-sm text-grey-700">
        No recent signups.
      </div>
      <div v-else class="overflow-hidden rounded-md border border-grey-200">
        <div
          v-for="user in recentUsers"
          :key="user.id"
          class="flex items-center justify-between gap-3 border-b border-grey-200 px-3 py-2 text-sm last:border-b-0"
        >
          <span class="min-w-0 flex-1 truncate font-medium text-grey-800">
            {{ renderUserName(user) || user.email }}
          </span>
          <span class="shrink-0 text-xs text-grey-700">{{ formatDate(user.created_at ?? null) }}</span>
        </div>
      </div>
    </Card>
  </MainWrapper>
</template>
