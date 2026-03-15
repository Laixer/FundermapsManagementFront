<script setup lang="ts">
import { onBeforeMount, ref, type Ref } from 'vue'

import Vue3Datatable from '@bhplugin/vue3-datatable'

import '@bhplugin/vue3-datatable/dist/style.css'

import Card from '@/components/Common/Card.vue'
import MainWrapper from '@/components/Layout/MainWrapper.vue'

import RecordDetailsCard from '@/components/Management/RecordDetailsCard.vue'
import CopyToClipboardIcon from '@/components/Common/Icons/CopyToClipboardIcon.vue'
import Alert from '@/components/Common/Alert.vue'
import type { IJob } from '@/services/fundermaps/interfaces/IJob'
import { getAllJobs } from '@/services/fundermaps/endpoints/management/job'

const loading = ref(true)
const error = ref(false)

const record: Ref<IJob | null> = ref(null)

const cols = [
  { field: 'id', title: 'ID', isUnique: true, width: '5rem' },
  { field: 'job_type', title: 'Type' },
  { field: 'status', title: 'Status', width: '7rem' },
  { field: 'priority', title: 'Priority', width: '5rem' },
  { field: 'created_at', title: 'Created', width: '12rem' },
]
const rows: Ref<IJob[]> = ref([])

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

const handleRowClick = function (row: IJob) {
  record.value = row
}
const handleCloseModal = function () {
  record.value = null
}

const statusColor = function (status: string) {
  switch (status) {
    case 'complete':
      return 'text-green-700 bg-green-100'
    case 'running':
      return 'text-blue-700 bg-blue-100'
    case 'failed':
      return 'text-red-700 bg-red-100'
    case 'retry':
      return 'text-yellow-700 bg-yellow-100'
    default:
      return 'text-gray-700 bg-gray-100'
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
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-bold">Jobs</h3>
      </div>

      <Alert v-if="error" :closeable="true" @close="error = false">
        An error occurred while trying to retrieve the list of jobs.
      </Alert>
      <Vue3Datatable
        :rows="rows"
        :columns="cols"
        :loading="loading"
        sortColumn="id"
        sortDirection="desc"
        :sortable="true"
        :columnFilter="true"
        @rowClick="handleRowClick"
      >
        <template #status="data">
          <span
            class="inline-block rounded px-2 py-0.5 text-xs font-medium"
            :class="statusColor(data.value.status)"
          >
            {{ data.value.status }}
          </span>
        </template>
        <template #created_at="data">
          {{ formatDate(data.value.created_at) }}
        </template>
      </Vue3Datatable>
    </Card>

    <RecordDetailsCard title="Job information" :record="record" @close="handleCloseModal">
      <dl class="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        <dt class="font-medium text-gray-500">ID</dt>
        <dd>{{ record?.id }}</dd>
        <dt class="font-medium text-gray-500">Type</dt>
        <dd>{{ record?.job_type }}</dd>
        <dt class="font-medium text-gray-500">Status</dt>
        <dd>
          <span
            class="inline-block rounded px-2 py-0.5 text-xs font-medium"
            :class="statusColor(record?.status ?? '')"
          >
            {{ record?.status }}
          </span>
        </dd>
        <dt class="font-medium text-gray-500">Priority</dt>
        <dd>{{ record?.priority }}</dd>
        <dt class="font-medium text-gray-500">Retry Count</dt>
        <dd>{{ record?.retry_count }} / {{ record?.max_retries }}</dd>
        <dt class="font-medium text-gray-500">Last Error</dt>
        <dd>{{ record?.last_error || '-' }}</dd>
        <dt class="font-medium text-gray-500">Process After</dt>
        <dd>{{ formatDate(record?.process_after ?? null) }}</dd>
        <dt class="font-medium text-gray-500">Created</dt>
        <dd>{{ formatDate(record?.created_at ?? null) }}</dd>
        <dt class="font-medium text-gray-500">Updated</dt>
        <dd>{{ formatDate(record?.updated_at ?? null) }}</dd>
      </dl>
      <div v-if="record?.payload" class="mt-4 border-t pt-4">
        <h6 class="mb-1 font-bold">Payload</h6>
        <pre class="max-h-48 overflow-auto rounded bg-gray-50 p-2 text-xs">{{
          JSON.stringify(record.payload, null, 2)
        }}</pre>
      </div>
    </RecordDetailsCard>
  </MainWrapper>
</template>
