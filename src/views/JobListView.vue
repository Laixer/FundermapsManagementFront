<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

import MainWrapper from '@/components/Layout/MainWrapper.vue'
import Drawer from '@/components/Layout/Drawer.vue'
import Table from '@/components/Common/Table.vue'
import Alert from '@/components/Common/Alert.vue'
import Badge from '@/components/Common/Badge.vue'
import MonoBadge from '@/components/Common/MonoBadge.vue'
import Input from '@/components/Common/Inputs/Input.vue'
import Select from '@/components/Common/Inputs/Select.vue'
import Button from '@/components/Common/Buttons/Button.vue'
import type { IJob } from '@/services/fundermaps/interfaces/IJob'
import {
  cancelJob,
  getAllJobs,
  getJob,
  JOBS_LIST_LIMIT,
} from '@/services/fundermaps/endpoints/management/job'
import { formatDate, formatDuration } from '@/utils/date'
import { useListResource } from '@/composables/useListResource'
import { useFlash } from '@/composables/useFlash'
import { getErrorMessage } from '@/services/fundermaps/errors'

const statusFilter = ref('')
const actionError = ref<string | null>(null)
const { message: actionSuccess, flash: flashSuccess } = useFlash()

const STATUS_OPTIONS = [
  { label: 'All statuses', value: '' },
  { label: 'Pending', value: 'pending' },
  { label: 'Processing', value: 'processing' },
  { label: 'Retry', value: 'retry' },
  { label: 'Failed', value: 'failed' },
  { label: 'Completed', value: 'completed' },
]

const columns = [
  { field: 'id', title: 'ID', width: '5rem' },
  { field: 'job_type', title: 'Type' },
  { field: 'status', title: 'Status', width: '7rem' },
  { field: 'retries', title: 'Retries', width: '6rem', align: 'right' as const },
  { field: 'duration', title: 'Duration', width: '7rem', align: 'right' as const },
  { field: 'created_at', title: 'Created', width: '12rem' },
]

const {
  rows,
  loading,
  error,
  search,
  record,
  filteredRows,
  refresh,
  refreshAndSelectFirst,
  select: handleSelect,
} = useListResource<IJob>({
    fetch: async () =>
      (await getAllJobs({ status: statusFilter.value || undefined })).sort((a, b) => b.id - a.id),
    filter: (j, q) =>
      String(j.id).includes(q) ||
      j.job_type.toLowerCase().includes(q) ||
      j.status.toLowerCase().includes(q) ||
      (j.last_error ?? '').toLowerCase().includes(q),
    resolve: async (row) => {
      try {
        return await getJob(row.id)
      } catch (e) {
        console.error('Failed to refetch job, using row data', e)
        return row
      }
    },
  })

// Re-fetch from the server when the status filter changes, landing on the
// first match so the panel reflects the new filter.
watch(statusFilter, () => refreshAndSelectFirst())

// Jobs is a live queue — poll the list so statuses stay current. Selection
// (which fetches its own detail) is left untouched.
let pollHandle: ReturnType<typeof setInterval> | null = null
onMounted(() => {
  pollHandle = setInterval(() => refresh(), 10_000)
})
onBeforeUnmount(() => {
  if (pollHandle !== null) clearInterval(pollHandle)
})

const onStatusChange = (value: unknown) => {
  statusFilter.value = String(value ?? '')
}

const statusVariant = function (
  status: string,
): 'success' | 'info' | 'danger' | 'warning' | 'default' {
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

// Lifecycle time for finished jobs (queued → finished). Running/queued jobs
// have no meaningful end yet.
const jobDuration = (job: IJob): string =>
  job.status === 'completed' || job.status === 'failed'
    ? formatDuration(job.created_at, job.updated_at)
    : '—'

const canCancel = (job: IJob | null): boolean =>
  !!job && (job.status === 'pending' || job.status === 'retry')

const handleCancel = async function () {
  if (!record.value) return
  if (!confirm(`Cancel job #${record.value.id}? It will be marked as failed.`)) return

  try {
    actionError.value = null
    record.value = await cancelJob(record.value.id)
    await refresh()
    flashSuccess('Job cancelled.')
  } catch (e) {
    actionError.value = getErrorMessage(e) ?? 'Failed to cancel job.'
  }
}
</script>

<template>
  <MainWrapper>
    <header class="mb-4">
      <h2 class="text-xl font-semibold text-grey-800">Jobs</h2>
      <p class="mt-0.5 text-sm text-grey-700">
        Background jobs, newest first. The list refreshes automatically.
      </p>
    </header>

    <div class="mb-3 flex items-center gap-3">
      <div class="w-72">
        <Input
          id="job-search"
          v-model="search"
          type="search"
          placeholder="Search by ID, type, status or error…"
        />
      </div>
      <div class="w-44">
        <Select
          id="job-status"
          :options="STATUS_OPTIONS"
          :modelValue="statusFilter"
          @update:modelValue="onStatusChange"
        />
      </div>
      <span class="text-xs text-grey-700">{{ filteredRows.length }} of {{ rows.length }}</span>
    </div>

    <Alert v-if="error" :closeable="true" class="mb-3" @close="error = false">
      An error occurred while trying to retrieve the list of jobs.
    </Alert>
    <Alert v-if="rows.length >= JOBS_LIST_LIMIT" type="warning" class="mb-3">
      Showing the first {{ JOBS_LIST_LIMIT }} jobs — narrow the list with a status filter to see
      more.
    </Alert>

    <Table
      :rows="filteredRows"
      :columns="columns"
      :loading="loading"
      :selectedId="record?.id"
      emptyMessage="No jobs match your filters."
      @select="handleSelect"
    >
      <template #id="{ row }">
        <span class="font-mono text-xs text-grey-700">#{{ row.id }}</span>
      </template>
      <template #job_type="{ row }">
        <span class="font-medium text-grey-800">{{ row.job_type }}</span>
      </template>
      <template #status="{ row }">
        <Badge :variant="statusVariant(row.status)">{{ row.status }}</Badge>
      </template>
      <template #retries="{ row }">
        <span
          class="font-mono text-xs"
          :class="row.retry_count > 0 ? 'text-grey-800' : 'text-grey-700'"
        >
          {{ row.retry_count }}/{{ row.max_retries }}
        </span>
      </template>
      <template #duration="{ row }">
        <span class="font-mono text-xs text-grey-700">{{ jobDuration(row) }}</span>
      </template>
      <template #created_at="{ row }">{{ formatDate(row.created_at) }}</template>
    </Table>

    <template #aside>
      <Drawer>
        <template #title>Job information</template>
        <template v-if="record && canCancel(record)" #actions>
          <Button danger label="Cancel job" @click="handleCancel" />
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
            <dt class="text-grey-700">ID</dt>
            <dd><MonoBadge :value="`#${record.id}`" /></dd>
            <dt class="text-grey-700">Type</dt>
            <dd class="text-grey-800">{{ record.job_type }}</dd>
            <dt class="text-grey-700">Status</dt>
            <dd>
              <Badge :variant="statusVariant(record.status ?? '')">{{ record.status }}</Badge>
            </dd>
            <dt class="text-grey-700">Priority</dt>
            <dd class="text-grey-800">{{ record.priority }}</dd>
            <dt class="text-grey-700">Retries</dt>
            <dd class="text-grey-800">{{ record.retry_count }} / {{ record.max_retries }}</dd>
            <dt class="text-grey-700">Duration</dt>
            <dd class="text-grey-800">{{ jobDuration(record) }}</dd>
            <dt class="text-grey-700">Last error</dt>
            <dd class="text-grey-800">{{ record.last_error || '—' }}</dd>
            <dt class="text-grey-700">Process after</dt>
            <dd class="text-grey-800">{{ formatDate(record.process_after ?? null) }}</dd>
            <dt class="text-grey-700">Created</dt>
            <dd class="text-grey-800">{{ formatDate(record.created_at ?? null) }}</dd>
            <dt class="text-grey-700">Updated</dt>
            <dd class="text-grey-800">{{ formatDate(record.updated_at ?? null) }}</dd>
          </dl>
          <div v-if="record.payload" class="mt-4 border-t border-grey-200 pt-4">
            <h6 class="mb-1 text-xs font-semibold uppercase tracking-wide text-grey-700">
              Payload
            </h6>
            <pre
              class="max-h-64 overflow-auto rounded border border-grey-200 bg-grey-100 p-3 font-mono text-xs"
              >{{ JSON.stringify(record.payload, null, 2) }}</pre
            >
          </div>
        </template>
        <div
          v-else
          class="flex h-full items-center justify-center text-center text-sm text-grey-700"
        >
          No jobs to show.
        </div>
      </Drawer>
    </template>
  </MainWrapper>
</template>
