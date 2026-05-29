<script setup lang="ts">
import MainWrapper from '@/components/Layout/MainWrapper.vue'
import Drawer from '@/components/Layout/Drawer.vue'
import Table from '@/components/Common/Table.vue'
import Alert from '@/components/Common/Alert.vue'
import Badge from '@/components/Common/Badge.vue'
import MonoBadge from '@/components/Common/MonoBadge.vue'
import type { IJob } from '@/services/fundermaps/interfaces/IJob'
import { getAllJobs, getJob } from '@/services/fundermaps/endpoints/management/job'
import { formatDate } from '@/utils/date'
import { useListResource } from '@/composables/useListResource'

const columns = [
  { field: 'id', title: 'ID', width: '5rem' },
  { field: 'job_type', title: 'Type' },
  { field: 'status', title: 'Status', width: '7rem' },
  { field: 'priority', title: 'Priority', width: '5rem', align: 'right' as const },
  { field: 'created_at', title: 'Created', width: '13rem' },
]

const { rows, loading, error, record, select: handleSelect } = useListResource<IJob>({
  fetch: async () => (await getAllJobs()).sort((a, b) => b.id - a.id),
  resolve: async (row) => {
    try {
      return await getJob(row.id)
    } catch (e) {
      console.error('Failed to refetch job, using row data', e)
      return row
    }
  },
})

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
</script>

<template>
  <MainWrapper>
    <header class="mb-4">
      <h2 class="text-xl font-semibold text-grey-800">Jobs</h2>
      <p class="mt-0.5 text-sm text-grey-700">Background jobs, ordered by most recent.</p>
    </header>

    <Alert v-if="error" :closeable="true" class="mb-3" @close="error = false">
      An error occurred while trying to retrieve the list of jobs.
    </Alert>

    <Table
      :rows="rows"
      :columns="columns"
      :loading="loading"
      :selectedId="record?.id"
      emptyMessage="No jobs to show."
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
      <template #created_at="{ row }">{{ formatDate(row.created_at) }}</template>
    </Table>

    <template #aside>
      <Drawer>
        <template #title>Job information</template>
        <template v-if="record">
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
