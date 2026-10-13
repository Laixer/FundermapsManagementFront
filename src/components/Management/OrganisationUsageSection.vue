<script setup lang="ts">
import { computed, ref, watch, type Ref } from 'vue'

import Table from '@/components/Common/Table.vue'
import Alert from '@/components/Common/Alert.vue'

import type { IOrg } from '@/services/fundermaps/endpoints/management/organisation.ts'
import {
  getOrganisationUsage,
  type IUsageProduct,
} from '@/services/fundermaps/endpoints/management/organisation.ts'
import { getErrorMessage } from '@/services/fundermaps/errors'

const props = defineProps<{
  record: IOrg | null
}>()

const products: Ref<IUsageProduct[]> = ref([])
const total = ref({ month_to_date: 0, last_30_days: 0 })
const loading = ref(false)
const loadError = ref<string | null>(null)

const columns = [
  { field: 'product', title: 'Product' },
  { field: 'month_to_date', title: 'This month', width: '7rem' },
  { field: 'last_30_days', title: 'Last 30d', width: '7rem' },
]

// en-GB grouping (12,480), like the rate limits and the dates of this portal.
const formatCount = (n: number): string => new Intl.NumberFormat('en-GB').format(n)

const monthLabel = computed(() =>
  new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }),
)

async function refresh() {
  if (!props.record) return
  try {
    loading.value = true
    loadError.value = null
    const usage = await getOrganisationUsage(props.record.id)
    products.value = usage.products
    total.value = usage.total
  } catch (e) {
    loadError.value = getErrorMessage(e) ?? 'Failed to load usage.'
    console.error(e)
  } finally {
    loading.value = false
  }
}

watch(() => props.record, refresh, { immediate: true })

defineExpose({ refresh })
</script>

<template>
  <div class="space-y-3">
    <Alert v-if="loadError" :closeable="true" @close="loadError = null">
      {{ loadError }}
    </Alert>

    <p class="text-grey-700 text-xs">
      Billable product calls, deduplicated per building per 24h. Month-to-date covers
      {{ monthLabel }}. Trends and history live in Grafana.
    </p>

    <Table
      :rows="products"
      :columns="columns"
      :loading="loading"
      emptyMessage="No billable usage in the last 30 days."
    >
      <template #product="{ row }">
        <span class="text-grey-800 font-medium">{{ row.product }}</span>
      </template>
      <template #month_to_date="{ row }">
        <span class="text-grey-800 font-mono text-xs">{{ formatCount(row.month_to_date) }}</span>
      </template>
      <template #last_30_days="{ row }">
        <span class="text-grey-700 font-mono text-xs">{{ formatCount(row.last_30_days) }}</span>
      </template>
      <!-- A row of the table itself, so the totals stand under their columns. -->
      <template #footer>
        <tr class="border-grey-200 border-t">
          <td class="text-grey-700 px-3 py-2 font-medium">Total</td>
          <td class="text-grey-800 px-3 py-2 font-mono text-xs">
            {{ formatCount(total.month_to_date) }}
          </td>
          <td class="text-grey-800 px-3 py-2 font-mono text-xs">
            {{ formatCount(total.last_30_days) }}
          </td>
        </tr>
      </template>
    </Table>
  </div>
</template>
