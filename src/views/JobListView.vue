<script setup lang="ts">
import { onBeforeMount, ref, type Ref } from 'vue'

import Vue3Datatable from '@bhplugin/vue3-datatable'

import '@bhplugin/vue3-datatable/dist/style.css'

import Card from '@/components/Common/Card.vue'
import MainWrapper from '@/components/Layout/MainWrapper.vue'

import RecordDetailsCard from '@/components/Management/RecordDetailsCard.vue'
import Alert from '@/components/Common/Alert.vue'
import Badge from '@/components/Common/Badge.vue'
import type { IJob } from '@/services/fundermaps/interfaces/IJob'
import { getAllJobs, getJob, JOBS_LIST_LIMIT } from '@/services/fundermaps/endpoints/management/job'

const loading = ref(true)
const error = ref(false)

const record: Ref<IJob | null> = ref(null)

const cols = [
  { field: 'id', title: 'ID', isUnique: true, width: '5rem', type: 'number' },
  { field: 'job_type', title: 'Type' },
  { field: 'status', title: 'Status', width: '7rem' },
  { field: 'priority', title: 'Priority', width: '5rem' },
  { field: 'created_at', title: 'Created', width: '12rem' },
]
const rows: Ref<IJob[]> = ref([])

const rowClass = (row: IJob) => (record.value?.id === row.id ? 'is-selected-row' : '')

const refreshList = async function () {
  try {
    loading.value = true
    error.value = false
    const jobs = await getAllJobs()
    jobs.sort((a, b) => b.id - a.id)
    rows.value = jobs
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
}

onBeforeMount(refreshList)

const handleRowClick = async function (row: IJob) {
  record.value = row
  try {
    record.value = await getJob(row.id)
  } catch (e) {
    console.error('Failed to refetch job, using row data', e)
  }
}
const handleCloseModal = function () {
  record.value = null
}

const statusVariant = function (status: string): 'success' | 'info' | 'danger' | 'warning' | 'default' {
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

const formatDate = function (date: string | null) {
  if (!date) return '-'
  return new Date(date).toLocaleString()
}
</script>

<template>
  <MainWrapper>
    <Card class="List col-span-2">
      <header
        class="-mx-5 -mt-5 flex items-center justify-between gap-4 border-b border-grey-200 px-5 py-4"
      >
        <div>
          <h2 class="heading-3">Jobs</h2>
          <p class="mt-1 text-sm text-grey-700">Background jobs, ordered by most recent.</p>
        </div>
      </header>

      <Alert v-if="error" :closeable="true" @close="error = false">
        An error occurred while trying to retrieve the list of jobs.
      </Alert>
      <Alert v-if="rows.length >= JOBS_LIST_LIMIT" type="danger">
        Showing the most recent {{ JOBS_LIST_LIMIT }} jobs — older jobs are not loaded.
      </Alert>
      <Vue3Datatable
        :rows="rows"
        :columns="cols"
        :loading="loading"
        sortColumn="id"
        sortDirection="desc"
        :sortable="true"
        :columnFilter="true"
        :rowClass="rowClass"
        @rowClick="handleRowClick"
      >
        <template #status="data">
          <Badge :variant="statusVariant(data.value.status)">{{ data.value.status }}</Badge>
        </template>
        <template #created_at="data">
          {{ formatDate(data.value.created_at) }}
        </template>
      </Vue3Datatable>
    </Card>

    <RecordDetailsCard title="Job information" :record="record"
      emptyMessage="Select a job to see its details." @close="handleCloseModal">
      <dl class="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
        <dt class="font-medium text-grey-700">ID</dt>
        <dd>{{ record?.id }}</dd>
        <dt class="font-medium text-grey-700">Type</dt>
        <dd>{{ record?.job_type }}</dd>
        <dt class="font-medium text-grey-700">Status</dt>
        <dd><Badge :variant="statusVariant(record?.status ?? '')">{{ record?.status }}</Badge></dd>
        <dt class="font-medium text-grey-700">Priority</dt>
        <dd>{{ record?.priority }}</dd>
        <dt class="font-medium text-grey-700">Retry Count</dt>
        <dd>{{ record?.retry_count }} / {{ record?.max_retries }}</dd>
        <dt class="font-medium text-grey-700">Last Error</dt>
        <dd>{{ record?.last_error || '-' }}</dd>
        <dt class="font-medium text-grey-700">Process After</dt>
        <dd>{{ formatDate(record?.process_after ?? null) }}</dd>
        <dt class="font-medium text-grey-700">Created</dt>
        <dd>{{ formatDate(record?.created_at ?? null) }}</dd>
        <dt class="font-medium text-grey-700">Updated</dt>
        <dd>{{ formatDate(record?.updated_at ?? null) }}</dd>
      </dl>
      <div v-if="record?.payload" class="mt-4 border-t border-grey-200 pt-4">
        <h6 class="mb-1 font-bold">Payload</h6>
        <pre class="max-h-48 overflow-auto rounded bg-grey-100 p-3 text-xs">{{
          JSON.stringify(record.payload, null, 2)
        }}</pre>
      </div>
    </RecordDetailsCard>
  </MainWrapper>
</template>
