<script setup lang="ts">
import { computed, onBeforeMount, ref } from 'vue'
import { RouterLink } from 'vue-router'

import MainWrapper from '@/components/Layout/MainWrapper.vue'
import Card from '@/components/Common/Card.vue'
import Alert from '@/components/Common/Alert.vue'
import Badge from '@/components/Common/Badge.vue'

import { getAllUsers, USERS_LIST_LIMIT } from '@/services/fundermaps/endpoints/management/user'
import { getAllOrganisations } from '@/services/fundermaps/endpoints/management/organisation'
import { getAllMapsets } from '@/services/fundermaps/endpoints/management/mapset'
import { getAllSessions } from '@/services/fundermaps/endpoints/management/session'
import {
  getAllJobs,
  JOBS_LIST_LIMIT,
} from '@/services/fundermaps/endpoints/management/job'
import type { IJob, JobStatus } from '@/services/fundermaps/interfaces/IJob'
import { formatDate } from '@/utils/date'

const loading = ref(true)
const error = ref(false)

const userCount = ref(0)
const orgCount = ref(0)
const mapsetCount = ref(0)
const sessionCount = ref(0)
const jobs = ref<IJob[]>([])

const atUserCap = ref(false)
const atJobCap = ref(false)

const refresh = async function () {
  try {
    loading.value = true
    error.value = false
    const [users, orgs, mapsets, sessions, jobList] = await Promise.all([
      getAllUsers(),
      getAllOrganisations(),
      getAllMapsets(),
      getAllSessions(),
      getAllJobs(),
    ])
    userCount.value = users.length
    atUserCap.value = users.length >= USERS_LIST_LIMIT
    orgCount.value = orgs.length
    mapsetCount.value = mapsets.length
    sessionCount.value = sessions.length
    jobs.value = jobList.sort((a, b) => b.id - a.id)
    atJobCap.value = jobList.length >= JOBS_LIST_LIMIT
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

const STATUS_ORDER: JobStatus[] = ['pending', 'processing', 'retry', 'failed', 'completed']

const jobCounts = computed<Record<JobStatus, number>>(() => {
  const counts = { pending: 0, processing: 0, retry: 0, failed: 0, completed: 0 }
  for (const j of jobs.value) counts[j.status]++
  return counts
})

const unhealthyJobs = computed(() => jobCounts.value.failed + jobCounts.value.retry)

const recentJobs = computed(() => jobs.value.slice(0, 6))

const statusVariant = (status: JobStatus): 'success' | 'info' | 'danger' | 'warning' | 'default' => {
  switch (status) {
    case 'completed':
      return 'success'
    case 'processing':
      return 'info'
    case 'failed':
      return 'danger'
    case 'retry':
      return 'warning'
    default:
      return 'default'
  }
}
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
          <div class="mt-1 text-3xl font-semibold text-grey-800">{{ s.value }}</div>
        </Card>
      </RouterLink>
    </div>

    <div class="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Card title="Job queue">
        <Alert v-if="!loading && unhealthyJobs > 0" type="warning" class="mb-3">
          {{ jobCounts.failed }} failed and {{ jobCounts.retry }} retrying in the last
          {{ jobs.length }} jobs.
        </Alert>
        <div class="flex flex-wrap gap-x-6 gap-y-2">
          <div v-for="status in STATUS_ORDER" :key="status" class="flex items-center gap-2 text-sm">
            <Badge :variant="statusVariant(status)">{{ status }}</Badge>
            <span class="font-mono text-grey-800">{{ loading ? '…' : jobCounts[status] }}</span>
          </div>
        </div>
        <p v-if="atJobCap" class="mt-3 text-xs text-grey-700">
          Counts cover the most recent {{ JOBS_LIST_LIMIT }} jobs.
        </p>
        <template #footer>
          <RouterLink
            :to="{ name: 'jobs' }"
            class="text-sm font-medium text-green-700 hover:text-green-800"
          >
            View all jobs →
          </RouterLink>
        </template>
      </Card>

      <Card title="Recent jobs">
        <div v-if="loading" class="text-sm text-grey-700">Loading…</div>
        <div v-else-if="!recentJobs.length" class="text-sm text-grey-700">No jobs yet.</div>
        <div v-else class="overflow-hidden rounded-md border border-grey-200">
          <div
            v-for="job in recentJobs"
            :key="job.id"
            class="flex items-center justify-between gap-3 border-b border-grey-200 px-3 py-2 text-sm last:border-b-0"
          >
            <div class="flex min-w-0 flex-1 items-center gap-2">
              <span class="font-mono text-xs text-grey-700">#{{ job.id }}</span>
              <span class="truncate font-medium text-grey-800">{{ job.job_type }}</span>
            </div>
            <Badge :variant="statusVariant(job.status)">{{ job.status }}</Badge>
            <span class="shrink-0 text-xs text-grey-700">{{ formatDate(job.created_at) }}</span>
          </div>
        </div>
      </Card>
    </div>
  </MainWrapper>
</template>
