<script setup lang="ts">
import { computed, onBeforeMount, ref, type Ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import MainWrapper from '@/components/Layout/MainWrapper.vue'
import Drawer from '@/components/Layout/Drawer.vue'
import Table from '@/components/Common/Table.vue'
import Alert from '@/components/Common/Alert.vue'
import Button from '@/components/Common/Buttons/Button.vue'
import Badge from '@/components/Common/Badge.vue'
import MonoBadge from '@/components/Common/MonoBadge.vue'
import Input from '@/components/Common/Inputs/Input.vue'
import RateLimitForm from '@/components/Management/Forms/RateLimitForm.vue'
import PlusIcon from '@assets/svg/icons/plus.svg?component'

import {
  deleteRateLimit,
  getRateLimitKeys,
  getRateLimits,
} from '@/services/fundermaps/endpoints/management/rate-limit'
import type { IRateLimit, IRateLimitKey } from '@/services/fundermaps/interfaces/IRateLimit'
import { formatDate } from '@/utils/date'
import { useFlash } from '@/composables/useFlash'
import { useListResource } from '@/composables/useListResource'
import { getErrorMessage } from '@/services/fundermaps/errors'

// The table has a composite PK (source, api_key_id, product); synthesise a flat
// `id` from it so the shared list/Table plumbing (selection, URL sync) works.
type RateLimitRow = IRateLimit & { id: string }
const rowId = (r: IRateLimit) => `${r.source}:${r.api_key_id}:${r.product}`

const route = useRoute()
const router = useRouter()

const showCreate = ref(false)
const deleting = ref(false)
const actionError = ref<string | null>(null)
const { message: actionSuccess, flash: flashSuccess } = useFlash()

// Key metadata (org name, key name) for labelling rows. Non-fatal if it fails —
// rows fall back to the raw api_key_id.
const keys: Ref<IRateLimitKey[]> = ref([])
const keyMap = computed<Map<string, IRateLimitKey>>(() => {
  const m = new Map<string, IRateLimitKey>()
  for (const k of keys.value) m.set(`${k.source}:${k.api_key_id}`, k)
  return m
})
const keyOf = (r: { source: string; api_key_id: string }) =>
  keyMap.value.get(`${r.source}:${r.api_key_id}`) ?? null
const keyLabel = (r: { source: string; api_key_id: string }) =>
  keyOf(r)?.name ?? r.api_key_id
const orgLabel = (r: { source: string; api_key_id: string }) =>
  keyOf(r)?.organization_name ?? '—'

const columns = [
  { field: 'organization', title: 'Organisation' },
  { field: 'key', title: 'API key' },
  { field: 'product', title: 'Product', width: '8rem' },
  { field: 'period', title: 'Window', width: '7rem' },
  { field: 'limit_count', title: 'Limit', width: '7rem', align: 'right' as const },
  { field: 'updated_at', title: 'Updated', width: '11rem' },
]

const {
  rows,
  loading,
  error,
  search,
  record,
  filteredRows,
  refresh: refreshList,
  select: handleSelect,
  selectById,
  selectFirst: selectFirstRow,
} = useListResource<RateLimitRow>({
  fetch: async () => (await getRateLimits()).map((r) => ({ ...r, id: rowId(r) })),
  filter: (r, q) =>
    r.product.toLowerCase().includes(q) ||
    r.api_key_id.toLowerCase().includes(q) ||
    keyLabel(r).toLowerCase().includes(q) ||
    orgLabel(r).toLowerCase().includes(q),
  onSelect: () => {
    showCreate.value = false
    actionError.value = null
    actionSuccess.value = null
  },
  routeId: () => (typeof route.params.id === 'string' ? route.params.id : undefined),
  syncRoute: (id) => router.replace({ name: 'rate-limits', params: { id }, query: route.query }),
  immediate: false,
})

const loadKeys = async function () {
  try {
    keys.value = await getRateLimitKeys()
  } catch {
    // Non-fatal — table falls back to raw api_key_id labels.
  }
}

onBeforeMount(async () => {
  await Promise.all([refreshList(), loadKeys()])
  const id = typeof route.params.id === 'string' ? route.params.id : undefined
  if (id && rows.value.some((r) => r.id === id)) selectById(id)
  else selectFirstRow()
})

const drawerMode = computed<'create' | 'details' | null>(() => {
  if (showCreate.value) return 'create'
  if (record.value) return 'details'
  return null
})

const periodLabel = (p: string) => (p === 'day' ? 'Per day' : p === 'month' ? 'Per month' : p)

const handleOpenCreate = function () {
  record.value = null
  showCreate.value = true
}

const handleCreated = async function () {
  await Promise.all([refreshList(), loadKeys()])
  flashSuccess('Rate limit saved.')
}

const handleDismissCreate = function () {
  showCreate.value = false
  if (!record.value) selectFirstRow()
}

const handleEdited = async function () {
  if (!record.value) return
  const id = record.value.id
  await refreshList()
  if (rows.value.some((r) => r.id === id)) selectById(id)
  else selectFirstRow()
  flashSuccess('Rate limit updated.')
}

const handleDelete = async function () {
  if (!record.value) return
  const r = record.value
  if (
    !confirm(
      `Remove the ${r.product} limit for "${orgLabel(r)}" (key ${keyLabel(r)})? The key becomes unlimited for this product.`,
    )
  )
    return

  try {
    deleting.value = true
    actionError.value = null
    await deleteRateLimit(r.source, r.api_key_id, r.product)
    record.value = null
    await refreshList()
    selectFirstRow()
    flashSuccess('Rate limit removed.')
  } catch (e) {
    actionError.value = getErrorMessage(e) ?? 'Failed to remove rate limit.'
  } finally {
    deleting.value = false
  }
}
</script>

<template>
  <MainWrapper>
    <header class="mb-4 flex items-end justify-between gap-4">
      <div>
        <h2 class="text-xl font-semibold text-grey-800">Rate limits</h2>
        <p class="mt-0.5 text-sm text-grey-700">
          Per-(API key, product) caps on billable Webservice calls. Overage is counted per
          organisation.
        </p>
      </div>
      <Button lg label="Add limit" @click="handleOpenCreate">
        <template #before>
          <PlusIcon class="aspect-square h-4 w-4" aria-hidden="true" />
        </template>
      </Button>
    </header>

    <div class="mb-3 flex items-center gap-3">
      <div class="w-72">
        <Input
          id="rate-limit-search"
          v-model="search"
          type="search"
          placeholder="Search by organisation, key or product…"
        />
      </div>
      <span class="text-xs text-grey-700">{{ filteredRows.length }} of {{ rows.length }}</span>
    </div>

    <Alert v-if="error" :closeable="true" class="mb-3" @close="error = false">
      An error occurred while trying to retrieve the rate limits.
    </Alert>

    <Table
      :rows="filteredRows"
      :columns="columns"
      :loading="loading"
      :selectedId="record?.id"
      emptyMessage="No rate limits configured."
      @select="handleSelect"
    >
      <template #organization="{ row }">
        <span class="text-grey-800">{{ orgLabel(row) }}</span>
      </template>
      <template #key="{ row }">
        <span class="text-grey-700">{{ keyLabel(row) }}</span>
        <Badge v-if="row.source === 'legacy'" variant="warning" class="ml-2">legacy</Badge>
      </template>
      <template #product="{ row }">
        <MonoBadge :value="row.product" />
      </template>
      <template #period="{ row }">
        <span class="text-grey-700">{{ periodLabel(row.period) }}</span>
      </template>
      <template #limit_count="{ row }">
        <span class="font-mono text-grey-800">{{ row.limit_count.toLocaleString() }}</span>
      </template>
      <template #updated_at="{ row }">{{ formatDate(row.updated_at) }}</template>
    </Table>

    <template #aside>
      <Drawer>
        <template #title>
          <template v-if="drawerMode === 'create'">New rate limit</template>
          <template v-else-if="drawerMode === 'details'">Rate limit</template>
          <template v-else>Rate limit</template>
        </template>

        <template v-if="drawerMode === 'details'" #actions>
          <Button danger label="Remove" :loading="deleting" @click="handleDelete" />
        </template>

        <!-- Create -->
        <div v-if="drawerMode === 'create'">
          <Alert v-if="!keys.length" type="warning" class="mb-3">
            No API keys found to attach a limit to.
          </Alert>
          <RateLimitForm v-else :keys="keys" @saved="handleCreated" @cancel="handleDismissCreate" />
        </div>

        <!-- Details + edit -->
        <div v-else-if="drawerMode === 'details' && record" class="space-y-5">
          <Alert v-if="actionError" :closeable="true" @close="actionError = null">
            {{ actionError }}
          </Alert>
          <Alert v-if="actionSuccess" type="success" :closeable="true" @close="actionSuccess = null">
            {{ actionSuccess }}
          </Alert>

          <dl class="grid grid-cols-[8rem_1fr] gap-x-4 gap-y-2 text-sm">
            <dt class="text-grey-700">Organisation</dt>
            <dd class="text-grey-800">{{ orgLabel(record) }}</dd>
            <dt class="text-grey-700">API key</dt>
            <dd class="text-grey-800">
              {{ keyLabel(record) }}
              <Badge v-if="record.source === 'legacy'" variant="warning" class="ml-1">legacy</Badge>
            </dd>
            <dt class="text-grey-700">Key ID</dt>
            <dd><MonoBadge :value="record.api_key_id" /></dd>
            <dt class="text-grey-700">Product</dt>
            <dd><MonoBadge :value="record.product" /></dd>
            <dt class="text-grey-700">Created</dt>
            <dd class="text-grey-800">{{ formatDate(record.created_at) }}</dd>
            <dt class="text-grey-700">Updated</dt>
            <dd class="text-grey-800">{{ formatDate(record.updated_at) }}</dd>
          </dl>

          <section class="border-t border-grey-200 pt-5">
            <h6 class="mb-2 text-xs font-semibold uppercase tracking-wide text-grey-700">
              Update limit
            </h6>
            <RateLimitForm
              :key="record.id"
              :keys="keys"
              :record="record"
              @saved="handleEdited"
            />
          </section>
        </div>

        <div
          v-else
          class="flex h-full items-center justify-center text-center text-sm text-grey-700"
        >
          Select a rate limit, or add one.
        </div>
      </Drawer>
    </template>
  </MainWrapper>
</template>
