<script setup lang="ts">
import { ref, watch, type Ref } from 'vue'

import Table from '@/components/Common/Table.vue'
import MonoBadge from '@/components/Common/MonoBadge.vue'
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
const mapsetColumns = [
  { field: 'name', title: 'Name' },
  { field: 'id', title: 'ID', width: '14rem' },
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
  <div class="space-y-3">
    <Alert v-if="loadError" :closeable="true" @close="loadError = null">{{ loadError }}</Alert>
    <Table
      :rows="mapsetRows"
      :columns="mapsetColumns"
      :loading="mapsetLoading"
      :clickable="false"
      emptyMessage="No mapsets assigned."
    >
      <template #name="{ row }">
        <span class="font-medium text-grey-800">{{ row.name }}</span>
      </template>
      <template #id="{ row }">
        <div class="flex items-center justify-between gap-2">
          <MonoBadge :value="row.id" />
          <CopyToClipboardIcon :value="row.id" />
        </div>
      </template>
    </Table>
  </div>
</template>
