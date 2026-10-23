<script setup lang="ts">
import { computed, onBeforeMount, ref } from 'vue'

import MainWrapper from '@/components/Layout/MainWrapper.vue'
import Card from '@/components/Common/Card.vue'
import Alert from '@/components/Common/Alert.vue'
import Badge from '@/components/Common/Badge.vue'
import Skeleton from '@/components/Common/Skeleton.vue'
import Table from '@/components/Common/Table.vue'

import { getUsage, type IUsage, type IUsageKind } from '@/services/fundermaps/endpoints/management/usage'
import { formatDate } from '@/utils/date'

// Usage across all customers (2026-10-23): Grafana's "Usage - webservice & API"
// and "Usage - maps & studio" moved into the portal. The product tracker is the
// billing record; this page only reads it (GET /api/management/usage).
//
// Two things the page says out loud rather than hides: this month runs through
// yesterday (the usage rollup is made per day), and there is no sign-in history
// (only live sessions are kept — the Sessions page lists them).
const data = ref<IUsage | null>(null)
const loading = ref(true)
const error = ref(false)

async function load() {
  loading.value = true
  error.value = false
  try {
    data.value = await getUsage()
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
}
onBeforeMount(load)

const nl = (n: number) => new Intl.NumberFormat('nl-NL').format(n)
const sum = (a: number[]) => a.reduce((x, y) => x + y, 0)
const monthName = (m: string) =>
  new Date(`${m}-15T12:00:00Z`).toLocaleDateString('en-GB', { month: 'short', year: 'numeric', timeZone: 'Europe/Amsterdam' })
/** A plain day ("2026-10-22" → "22 Oct 2026"): formatDate would read it as midnight UTC and print 02:00. */
const dayName = (d: string | null) =>
  d ? new Date(`${d}T12:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }) : '—'
/** "12 min ago", "3 h ago", or the date. */
const ago = (iso: string | null) => {
  if (!iso) return '—'
  const min = Math.round((Date.now() - Date.parse(iso)) / 60000)
  if (min < 1) return 'just now'
  if (min < 60) return `${min} min ago`
  if (min < 48 * 60) return `${Math.round(min / 60)} h ago`
  return formatDate(iso)
}
/** The last 30 days against the 30 before: a signed percentage, and whether it fell (after rounding — ±0% is no drop). */
const change = (now: number, before: number) => {
  if (!before) return { label: now ? 'new' : '—', fell: false }
  const p = Math.round(((now - before) / before) * 100)
  return { label: `${p > 0 ? '+' : p < 0 ? '−' : '±'}${Math.abs(p)}%`, fell: p < 0 }
}
/** A product's share of an organisation's calls; under 1% says so instead of a 0%. */
const share = (part: number, whole: number) => {
  if (!whole) return '0%'
  const p = (part / whole) * 100
  return p < 1 ? '<1%' : `${Math.round(p)}%`
}

const thisMonth = computed(() => data.value?.months[data.value.months.length - 1] ?? null)
const monthToDate = (k: IUsageKind) => sum(k.organizations.map((o) => o.month_to_date))

const stats = computed(() => {
  const d = data.value
  if (!d) return []
  return [
    { label: 'Webservice calls today', value: nl(d.webservice.calls_today), note: `last call ${ago(d.webservice.last_call_at)}` },
    { label: 'Webservice this month', value: nl(monthToDate(d.webservice)), note: `through ${dayName(d.through)}` },
    { label: 'Map & Studio lookups this month', value: nl(monthToDate(d.maps)), note: `${nl(d.maps.calls_today)} today` },
    { label: 'Active API keys', value: nl(d.keys.active), note: `${nl(d.keys.stale_30_days)} unused for 30+ days` },
  ]
})

/** Months as rows, newest first; one column per product, a bar for the total. */
function monthRows(k: IUsageKind | undefined) {
  const d = data.value
  if (!d || !k) return []
  const totals = d.months.map((_, i) => sum(k.products.map((p) => p.calls[i] ?? 0)))
  const max = Math.max(1, ...totals)
  return d.months
    .map((m, i) => ({
      id: m,
      month: monthName(m),
      partial: m === thisMonth.value,
      total: totals[i] ?? 0,
      share: (totals[i] ?? 0) / max,
      ...Object.fromEntries(k.products.map((p) => [p.product, p.calls[i] ?? 0])),
    }))
    .reverse()
}
function monthColumns(k: IUsageKind | undefined) {
  return [
    { field: 'month', title: 'Month', width: '8rem' },
    ...(k?.products ?? []).map((p) => ({ field: p.product, title: p.product, width: '8rem', align: 'right' as const })),
    { field: 'total', title: 'Total', align: 'left' as const },
  ]
}

function orgRows(k: IUsageKind | undefined) {
  return (k?.organizations ?? []).map((o) => ({
    ...o,
    change: change(o.last_30_days, o.previous_30_days).label,
    fell: change(o.last_30_days, o.previous_30_days).fell,
    top: o.products
      .slice(0, 2)
      .map((p) => `${p.product} ${share(p.last_30_days, o.last_30_days)}`)
      .join(' · '),
  }))
}
const ORG_COLUMNS = [
  { field: 'name', title: 'Organisation' },
  { field: 'month_to_date', title: 'This month', width: '8rem', align: 'right' as const },
  { field: 'last_month', title: 'Last month', width: '8rem', align: 'right' as const },
  { field: 'last_30_days', title: 'Last 30 days', width: '8rem', align: 'right' as const },
  { field: 'change', title: 'vs 30 before', width: '7rem', align: 'right' as const },
  { field: 'top', title: 'Products, last 30 days', width: '16rem' },
]

const KEY_COLUMNS = [
  { field: 'name', title: 'Key' },
  { field: 'kind', title: 'Kind', width: '6rem' },
  { field: 'owner', title: 'Owner', width: '16rem' },
  { field: 'last_used', title: 'Last used', width: '9rem' },
  { field: 'request_count', title: 'Requests', width: '7rem', align: 'right' as const },
]
const staleBefore = computed(() => Date.now() - 30 * 86_400_000)
const keyRows = computed(() =>
  (data.value?.keys.list ?? []).map((k, i) => ({
    id: i,
    ...k,
    stale: !k.last_used || Date.parse(k.last_used) < staleBefore.value,
  })),
)

const sections = computed(() => [
  { key: 'webservice', title: 'Webservice', kind: data.value?.webservice, hint: 'The billable API (/v4/product): products ending in their API version.' },
  { key: 'maps', title: 'Map & Studio lookups', kind: data.value?.maps, hint: 'Lookups by the map application and the Studio: products without a version.' },
])
</script>

<template>
  <MainWrapper>
    <header class="mb-4">
      <h2 class="text-xl font-semibold text-grey-800">Usage</h2>
      <p class="mt-0.5 text-sm text-grey-700">
        What the webservice served and what the maps looked up, across all customers. The product tracker is the
        billing record; this page only reads it.
      </p>
    </header>

    <Alert v-if="error" :closeable="true" class="mb-3" @close="error = false">
      The usage could not be loaded.
    </Alert>

    <div class="grid grid-cols-2 gap-4 sm:grid-cols-4" role="list" aria-label="Usage at a glance">
      <Card v-for="s in stats.length ? stats : 4" :key="typeof s === 'number' ? s : s.label" role="listitem">
        <template v-if="typeof s !== 'number'">
          <div class="text-xs font-semibold uppercase tracking-wide text-grey-700">{{ s.label }}</div>
          <div class="mt-1 text-3xl font-semibold text-grey-800">{{ s.value }}</div>
          <div class="mt-0.5 text-xs text-grey-700">{{ s.note }}</div>
        </template>
        <Skeleton v-else width="6rem" height="1.75rem" />
      </Card>
    </div>

    <template v-for="sec in sections" :key="sec.key">
      <Card :title="`${sec.title} — calls per month`" class="mt-6">
        <p class="mb-3 text-sm text-grey-700">
          {{ sec.hint }} This month runs through {{ data ? dayName(data.through) : '…' }}: the usage is counted per
          day.
        </p>
        <Table
          :rows="monthRows(sec.kind)"
          :columns="monthColumns(sec.kind)"
          :loading="loading"
          :clickable="false"
          :aria-label="`${sec.title}: calls per month`"
          empty-message="No calls in these months."
        >
          <template #month="{ row }">
            <span class="font-medium text-grey-800">{{ row.month }}</span>
            <span v-if="row.partial" class="ml-1 text-xs text-grey-700">so far</span>
          </template>
          <template v-for="p in sec.kind?.products ?? []" :key="p.product" #[p.product]="{ value }">
            <span class="tabular-nums text-grey-800">{{ nl(Number(value)) }}</span>
          </template>
          <template #total="{ row }">
            <span class="flex items-center gap-2">
              <span class="h-1.5 rounded-full bg-green-500" :style="{ width: `${Math.max(2, row.share * 160)}px` }" aria-hidden="true" />
              <span class="tabular-nums font-semibold text-grey-800">{{ nl(row.total) }}</span>
            </span>
          </template>
        </Table>
      </Card>

      <Card :title="`${sec.title} — per organisation`" class="mt-4">
        <Table
          :rows="orgRows(sec.kind)"
          :columns="ORG_COLUMNS"
          :loading="loading"
          :clickable="false"
          :aria-label="`${sec.title}: per organisation`"
          empty-message="No calls in the last two months."
        >
          <template #month_to_date="{ value }"><span class="tabular-nums text-grey-800">{{ nl(Number(value)) }}</span></template>
          <template #last_month="{ value }"><span class="tabular-nums text-grey-700">{{ nl(Number(value)) }}</span></template>
          <template #last_30_days="{ value }"><span class="tabular-nums font-semibold text-grey-800">{{ nl(Number(value)) }}</span></template>
          <template #change="{ row }">
            <span class="tabular-nums" :class="row.fell ? 'text-red-500' : 'text-grey-800'">{{ row.change }}</span>
          </template>
          <template #top="{ value }"><span class="truncate text-xs text-grey-700">{{ value }}</span></template>
        </Table>
      </Card>
    </template>

    <Card title="API keys" class="mt-6">
      <p class="mb-3 text-sm text-grey-700">
        Enabled keys and the legacy keys still in use until customers have moved, most recently used first.
        Sign-ins are not here: only live sessions are kept, so there is no history to show — the Sessions page lists them.
      </p>
      <Table
        :rows="keyRows"
        :columns="KEY_COLUMNS"
        :loading="loading"
        :clickable="false"
        aria-label="API keys"
        empty-message="No API keys."
      >
        <template #name="{ value }"><span class="font-medium text-grey-800">{{ value ?? '(unnamed)' }}</span></template>
        <template #kind="{ value }"><Badge :variant="value === 'legacy' ? 'warning' : 'default'">{{ value }}</Badge></template>
        <template #owner="{ value }"><span class="truncate text-grey-700">{{ value ?? '—' }}</span></template>
        <template #last_used="{ row }">
          <span :class="row.stale ? 'text-red-500' : 'text-grey-800'">{{ row.last_used ? ago(row.last_used) : 'never' }}</span>
        </template>
        <template #request_count="{ value }">
          <span class="tabular-nums text-grey-700">{{ value == null ? '—' : nl(Number(value)) }}</span>
        </template>
      </Table>
    </Card>
  </MainWrapper>
</template>
