<script setup lang="ts">
import { onBeforeMount, ref, type Ref } from 'vue'

import Vue3Datatable from '@bhplugin/vue3-datatable'

import '@bhplugin/vue3-datatable/dist/style.css'

import Card from '@/components/Common/Card.vue'
import MainWrapper from '@/components/Layout/MainWrapper.vue'

import RecordDetailsCard from '@/components/Management/RecordDetailsCard.vue'
import MapsetTabs from '@/components/Management/MapsetTabs.vue'
import MapsetLayersSection from '@/components/Management/MapsetLayersSection.vue'
import FundermapsIcon from '@/components/Common/Icons/FundermapsIcon.vue'
import type { IMapset } from '@/services/fundermaps/interfaces/IMapset.ts'
import { getAllMapsets } from '@/services/fundermaps/endpoints/management/mapset.ts'
import CopyToClipboardIcon from '@/components/Common/Icons/CopyToClipboardIcon.vue'
import Alert from '@/components/Common/Alert.vue'
import Badge from '@/components/Common/Badge.vue'

const loading = ref(true)
const error = ref(false)

const record: Ref<IMapset | null> = ref(null)
const activeTab: Ref<'info' | 'layers'> = ref('info')

const cols = [
  { field: 'icon', title: '', width: '2rem', filter: false, sort: false, search: false },
  { field: 'id', title: 'ID', isUnique: true, width: '20rem' },
  { field: 'name', title: 'Name' },
  { field: 'public', title: 'Public', type: 'bool' },
]
const rows: Ref<IMapset[]> = ref([])

const rowClass = (row: IMapset) => (record.value?.id === row.id ? 'is-selected-row' : '')

const refreshList = async function () {
  try {
    loading.value = true
    error.value = false
    rows.value = await getAllMapsets()
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
}

onBeforeMount(refreshList)

const handleRowClick = function (row: IMapset) {
  if (record.value?.id !== row.id) {
    activeTab.value = 'info'
  }
  record.value = row
}
const handleCloseModal = function () {
  record.value = null
}

const handleLayersSaved = async function (updated: IMapset) {
  record.value = updated
  const idx = rows.value.findIndex((r) => r.id === updated.id)
  if (idx !== -1) {
    rows.value = [...rows.value.slice(0, idx), updated, ...rows.value.slice(idx + 1)]
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
          <h2 class="heading-3">Mapsets</h2>
          <p class="mt-1 text-sm text-grey-700">
            Map collections and the layers they include.
          </p>
        </div>
      </header>

      <Alert v-if="error" :closeable="true" @close="error = false">
        An error occurred while trying to retrieve the list of records.
      </Alert>
      <Vue3Datatable :rows="rows" :columns="cols" :loading="loading" sortColumn="name" :sortable="true"
        :columnFilter="true" :rowClass="rowClass" @rowClick="handleRowClick">
        <template #id="data">
          <div class="flex justify-between">
            <div>{{ data.value.id }}</div>
            <CopyToClipboardIcon :value="data.value.id" />
          </div>
        </template>
        <template #public="data">
          <Badge :variant="data.value.public ? 'success' : 'default'">
            {{ data.value.public ? 'Public' : 'Private' }}
          </Badge>
        </template>
        <template #icon="data">
          <FundermapsIcon v-if="data.value.icon" class="aspect-square h-3.5" :name="data.value.icon" />
        </template>
      </Vue3Datatable>
    </Card>

    <RecordDetailsCard title="Mapset information" :record="record"
      emptyMessage="Select a mapset to see its layers." @close="handleCloseModal">
      <MapsetTabs v-model="activeTab" />
      <div v-if="activeTab === 'info'" class="pt-4">
        <dl class="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
          <dt class="font-medium text-grey-700">Name</dt>
          <dd>{{ record?.name }}</dd>
          <dt class="font-medium text-grey-700">Slug</dt>
          <dd>{{ record?.slug }}</dd>
          <dt class="font-medium text-grey-700">Public</dt>
          <dd>
            <Badge :variant="record?.public ? 'success' : 'default'">
              {{ record?.public ? 'Public' : 'Private' }}
            </Badge>
          </dd>
          <dt class="font-medium text-grey-700">Note</dt>
          <dd>{{ record?.note || '-' }}</dd>
          <dt class="font-medium text-grey-700">Order</dt>
          <dd>{{ record?.order }}</dd>
        </dl>
        <div class="mt-4 border-t border-grey-200 pt-4">
          <h6 class="mb-1 font-bold">ID</h6>
          <div class="flex items-center gap-2 text-sm">
            <code>{{ record?.id }}</code>
            <CopyToClipboardIcon :value="record?.id ?? ''" />
          </div>
        </div>
      </div>
      <div v-else-if="activeTab === 'layers'" class="pt-4">
        <MapsetLayersSection :record="record" @saved="handleLayersSaved" />
      </div>
    </RecordDetailsCard>
  </MainWrapper>
</template>
