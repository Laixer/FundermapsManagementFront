<script setup lang="ts">
import { ref, watch, type Ref } from 'vue'

import Vue3Datatable from '@bhplugin/vue3-datatable'

import type { IMapset } from '@/services/fundermaps/interfaces/IMapset.ts'
import type { IOrg } from '@/services/fundermaps/endpoints/management/organisation.ts'

import { getOrganisationMapsets } from '@/services/fundermaps/endpoints/management/organisation.ts'
import CopyToClipboardIcon from '@/components/Common/Icons/CopyToClipboardIcon.vue'

const props = defineProps<{
  record: IOrg | null
}>()

const mapsetLoading = ref(false)
const mapsetCols = [
  { field: 'id', title: 'ID', isUnique: true, width: '15rem' },
  { field: 'name', title: 'Name' },
]
const mapsetRows: Ref<IMapset[]> = ref([])

const refresh = async function () {
  if (props.record) {
    try {
      mapsetLoading.value = true
      mapsetRows.value = await getOrganisationMapsets(props.record.id)
    } catch (e) {
      console.error(e)
    } finally {
      mapsetLoading.value = false
    }
  }
}

watch(() => props.record, refresh, { immediate: true })

defineExpose({ refresh })
</script>

<template>
  <Vue3Datatable :rows="mapsetRows" :columns="mapsetCols" :loading="mapsetLoading" sortColumn="name" :sortable="true">
    <template #id="data">
      <div class="flex justify-between">
        <div>{{ data.value.id }}</div>
        <CopyToClipboardIcon :value="data.value.id" />
      </div>
    </template>
  </Vue3Datatable>
</template>
