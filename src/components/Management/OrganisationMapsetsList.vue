<script setup lang="ts">
import { ref, watch, type Ref } from 'vue'

import Vue3Datatable from '@bhplugin/vue3-datatable'

import type { IMapset } from '@/services/fundermaps/interfaces/IMapset.ts'
import type { IOrg } from '@/services/fundermaps/endpoints/management/organisation.ts'

import { getOrganisationMapsets } from '@/services/fundermaps/endpoints/management/organisation.ts'
import { getErrorMessage } from '@/services/fundermaps/errors'
import CopyToClipboardIcon from '@/components/Common/Icons/CopyToClipboardIcon.vue'
import Alert from '@/components/Common/Alert.vue'

const props = defineProps<{
  record: IOrg | null
}>()

const mapsetLoading = ref(false)
const loadError = ref<string | null>(null)
const mapsetCols = [
  { field: 'id', title: 'ID', isUnique: true, width: '15rem' },
  { field: 'name', title: 'Name' },
]
const mapsetRows: Ref<IMapset[]> = ref([])

const refresh = async function () {
  if (props.record) {
    try {
      mapsetLoading.value = true
      loadError.value = null
      mapsetRows.value = await getOrganisationMapsets(props.record.id)
    } catch (e) {
      loadError.value = getErrorMessage(e) ?? 'Failed to load mapsets.'
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
  <Alert v-if="loadError" :closeable="true" @close="loadError = null">{{ loadError }}</Alert>
  <Vue3Datatable :rows="mapsetRows" :columns="mapsetCols" :loading="mapsetLoading" sortColumn="name" :sortable="true">
    <template #id="data">
      <div class="flex justify-between">
        <div>{{ data.value.id }}</div>
        <CopyToClipboardIcon :value="data.value.id" />
      </div>
    </template>
  </Vue3Datatable>
</template>
