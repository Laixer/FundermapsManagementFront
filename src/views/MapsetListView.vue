<script setup lang="ts">
import { onBeforeMount, ref, type Ref } from 'vue'

// @ts-ignore TODO: PR to fix TS
import Vue3Datatable from '@bhplugin/vue3-datatable'

import '@bhplugin/vue3-datatable/dist/style.css'

import Card from '@/components/Common/Card.vue'
import MainWrapper from '@/components/Layout/MainWrapper.vue'

import RecordDetailsCard from '@/components/Management/RecordDetailsCard.vue'
import FundermapsIcon from '@/components/Common/Icons/FundermapsIcon.vue'
import Alert from '@/components/Common/Alert.vue'

import type { IMapset } from '@/services/fundermaps/interfaces/IMapset.ts'
import { getAllMapsets } from '@/services/fundermaps/endpoints/management/mapset.ts'
import CopyToClipboardIcon from '@/components/Common/Icons/CopyToClipboardIcon.vue'

const loading = ref(true)
const error = ref(false)

const record: Ref<IMapset | null> = ref(null)

const cols = [
  { field: 'icon', title: '', width: '2rem', filter: false, sort: false, search: false },
  { field: 'id', title: 'ID', isUnique: true, width: '20rem' },
  { field: 'name', title: 'Name' },
  { field: 'public', title: 'Public', type: 'bool' },
]
const rows: Ref<IMapset[]> = ref([])

const refreshList = async function () {
  try {
    loading.value = true
    error.value = false
    rows.value = await getAllMapsets()
  } catch (e) {
    error.value = true
  } finally {
    loading.value = false
  }
}

onBeforeMount(refreshList)

const handleRowClick = function (row: IMapset) {
  record.value = row
}
const handleCloseModal = function () {
  record.value = null
}
</script>

<template>
  <MainWrapper>
    <Card class="List col-span-2">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-bold">Mapsets</h3>
      </div>

      <Vue3Datatable :rows="rows" :columns="cols" :loading="loading" sortColumn="name" :sortable="true"
        :columnFilter="true" @rowClick="handleRowClick">
        <template #id="data">
          <div class="flex justify-between">
            <div>{{ data.value.id }}</div>
            <CopyToClipboardIcon :value="data.value.id" />
          </div>
        </template>
        <template #public="data">
          {{ data.value.public ? 'Ja' : 'Nee' }}
        </template>
        <template #icon="data">
          <FundermapsIcon v-if="data.value.icon" class="aspect-square h-3.5" :name="data.value.icon" />
        </template>
      </Vue3Datatable>
    </Card>

    <RecordDetailsCard title="Mapset information" :record="record" @close="handleCloseModal" />
  </MainWrapper>
</template>
