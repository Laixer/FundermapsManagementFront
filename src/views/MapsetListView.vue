<script setup lang="ts">
import MainWrapper from '@/components/Layout/MainWrapper.vue'
import Drawer from '@/components/Layout/Drawer.vue'
import Table from '@/components/Common/Table.vue'
import MapsetLayersSection from '@/components/Management/MapsetLayersSection.vue'
import FundermapsIcon from '@/components/Common/Icons/FundermapsIcon.vue'
import type { IMapset } from '@/services/fundermaps/interfaces/IMapset.ts'
import { getAllMapsets } from '@/services/fundermaps/endpoints/management/mapset.ts'
import CopyToClipboardIcon from '@/components/Common/Icons/CopyToClipboardIcon.vue'
import Alert from '@/components/Common/Alert.vue'
import Badge from '@/components/Common/Badge.vue'
import MonoBadge from '@/components/Common/MonoBadge.vue'
import Input from '@/components/Common/Inputs/Input.vue'
import { useListResource } from '@/composables/useListResource'

const columns = [
  { field: 'icon', title: '', width: '3rem' },
  { field: 'name', title: 'Name' },
  { field: 'public', title: 'Visibility', width: '8rem' },
  { field: 'layers', title: 'Layers', width: '6rem', align: 'right' as const },
  { field: 'id', title: 'ID', width: '18rem' },
]

const { rows, loading, error, search, record, filteredRows, select: handleSelect } =
  useListResource<IMapset>({
    fetch: getAllMapsets,
    filter: (m, q) =>
      m.name.toLowerCase().includes(q) ||
      (m.slug ?? '').toLowerCase().includes(q) ||
      m.id.toLowerCase().includes(q),
  })

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
    <header class="mb-4">
      <h2 class="text-xl font-semibold text-grey-800">Mapsets</h2>
      <p class="mt-0.5 text-sm text-grey-700">Map collections and the layers they include.</p>
    </header>

    <div class="mb-3 flex items-center gap-3">
      <div class="w-72">
        <Input
          id="mapset-search"
          v-model="search"
          type="search"
          placeholder="Search by name, slug or ID…"
        />
      </div>
      <span class="text-xs text-grey-700">{{ filteredRows.length }} of {{ rows.length }}</span>
    </div>

    <Alert v-if="error" :closeable="true" class="mb-3" @close="error = false">
      An error occurred while trying to retrieve the list of mapsets.
    </Alert>

    <Table
      :rows="filteredRows"
      :columns="columns"
      :loading="loading"
      :selectedId="record?.id"
      emptyMessage="No mapsets match your search."
      @select="handleSelect"
    >
      <template #icon="{ row }">
        <FundermapsIcon v-if="row.icon" class="aspect-square h-4" :name="row.icon" />
      </template>
      <template #name="{ row }">
        <span class="font-medium text-grey-800">{{ row.name }}</span>
      </template>
      <template #public="{ row }">
        <Badge :variant="row.public ? 'success' : 'default'">
          {{ row.public ? 'Public' : 'Private' }}
        </Badge>
      </template>
      <template #layers="{ row }">
        <span class="font-mono text-xs text-grey-700">{{ row.layers?.length ?? 0 }}</span>
      </template>
      <template #id="{ row }">
        <div class="flex items-center justify-between gap-2">
          <MonoBadge :value="row.id" />
          <CopyToClipboardIcon :value="row.id" />
        </div>
      </template>
    </Table>

    <template #aside>
      <Drawer>
        <template #title>Mapset information</template>
        <template v-if="record">
          <dl class="grid grid-cols-[6rem_1fr] gap-x-4 gap-y-2 text-sm">
            <dt class="text-grey-700">Name</dt>
            <dd class="text-grey-800">{{ record.name }}</dd>
            <dt class="text-grey-700">Slug</dt>
            <dd class="text-grey-800">{{ record.slug }}</dd>
            <dt class="text-grey-700">Visibility</dt>
            <dd>
              <Badge :variant="record.public ? 'success' : 'default'">
                {{ record.public ? 'Public' : 'Private' }}
              </Badge>
            </dd>
            <dt class="text-grey-700">Note</dt>
            <dd class="text-grey-800">{{ record.note || '—' }}</dd>
            <dt class="text-grey-700">Order</dt>
            <dd class="text-grey-800">{{ record.order }}</dd>
            <dt class="text-grey-700">ID</dt>
            <dd><MonoBadge :value="record.id" /></dd>
          </dl>
          <div class="mt-6 border-t border-grey-200 pt-5">
            <MapsetLayersSection :record="record" @saved="handleLayersSaved" />
          </div>
        </template>
        <div
          v-else
          class="flex h-full items-center justify-center text-center text-sm text-grey-700"
        >
          No mapsets to display.
        </div>
      </Drawer>
    </template>
  </MainWrapper>
</template>
