<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import Button from '@/components/Common/Buttons/Button.vue'
import MainWrapper from '@/components/Layout/MainWrapper.vue'
import Drawer from '@/components/Layout/Drawer.vue'
import Alert from '@/components/Common/Alert.vue'
import Table from '@/components/Common/Table.vue'
import MonoBadge from '@/components/Common/MonoBadge.vue'
import Input from '@/components/Common/Inputs/Input.vue'
import CreateContractorForm from '@/components/Management/Forms/CreateContractorForm.vue'
import ContractorForm from '@/components/Management/Forms/ContractorForm.vue'

import {
  getAllContractors,
  type IContractor,
} from '@/services/fundermaps/endpoints/management/contractor.ts'
import { useListResource } from '@/composables/useListResource'
import PlusIcon from '@assets/svg/icons/plus.svg?component'

const showCreate = ref(false)
const showEdit = ref(false)

const columns = [
  { field: 'name', title: 'Name' },
  { field: 'id', title: 'ID', width: '8rem' },
]

const route = useRoute()
const router = useRouter()

const {
  rows,
  loading,
  error,
  search,
  record,
  filteredRows,
  refresh: refreshList,
  select: handleSelect,
  selectFirst: selectFirstRow,
} = useListResource<IContractor>({
  fetch: getAllContractors,
  filter: (c, q) => c.name.toLowerCase().includes(q) || String(c.id).includes(q),
  onSelect: () => {
    showCreate.value = false
    showEdit.value = false
  },
  routeId: () => (typeof route.params.id === 'string' ? route.params.id : undefined),
  syncRoute: (id) => router.replace({ name: 'contractors', params: { id }, query: route.query }),
})

const drawerMode = computed<'create' | 'edit' | 'details' | null>(() => {
  if (showCreate.value) return 'create'
  if (record.value && showEdit.value) return 'edit'
  if (record.value) return 'details'
  return null
})

const handleOpenCreate = function () {
  showEdit.value = false
  showCreate.value = true
}

const handleDismissForm = function () {
  showCreate.value = false
  showEdit.value = false
  if (!record.value) selectFirstRow()
}

const handleEdit = function () {
  showCreate.value = false
  showEdit.value = true
}
</script>

<template>
  <MainWrapper>
    <header class="mb-4 flex items-end justify-between gap-4">
      <div>
        <h2 class="text-grey-800 text-xl font-semibold">Contractors</h2>
        <p class="text-grey-700 mt-0.5 text-sm">
          Manage the "Uitvoerder" list offered when creating an inquiry.
        </p>
      </div>
      <Button lg label="Add contractor" @click="handleOpenCreate">
        <template #before>
          <PlusIcon class="aspect-square h-4 w-4" aria-hidden="true" />
        </template>
      </Button>
    </header>

    <div class="mb-3 flex items-center gap-3">
      <div class="w-72">
        <Input
          id="contractor-search"
          v-model="search"
          type="search"
          placeholder="Search by name or ID…"
        />
      </div>
      <span class="text-grey-700 text-xs">{{ filteredRows.length }} of {{ rows.length }}</span>
    </div>

    <Alert v-if="error" :closeable="true" class="mb-3" @close="error = false">
      An error occurred while trying to retrieve the list of contractors.
    </Alert>

    <Table
      :rows="filteredRows"
      :columns="columns"
      :loading="loading"
      :selectedId="record ? String(record.id) : undefined"
      emptyMessage="No contractors match your search."
      @select="handleSelect"
    >
      <template #name="{ row }">
        <span class="text-grey-800 font-medium">{{ row.name }}</span>
      </template>
      <template #id="{ row }">
        <MonoBadge :value="String(row.id)" />
      </template>
    </Table>

    <template #aside>
      <Drawer>
        <template #title>
          <template v-if="drawerMode === 'create'">New contractor</template>
          <template v-else-if="drawerMode === 'edit'">Edit {{ record?.name }}</template>
          <template v-else>Contractor information</template>
        </template>

        <template v-if="drawerMode === 'details'" #actions>
          <Button outline label="Edit" @click="handleEdit" />
        </template>

        <CreateContractorForm
          v-if="drawerMode === 'create'"
          @cancel="handleDismissForm"
          @saved="refreshList"
          @close="handleDismissForm"
        />

        <ContractorForm
          v-else-if="drawerMode === 'edit' && record"
          :record="record"
          @cancel="handleDismissForm"
          @saved="refreshList"
          @close="handleDismissForm"
        />

        <div v-else-if="drawerMode === 'details' && record" class="space-y-4">
          <dl class="grid grid-cols-[6rem_1fr] gap-x-4 gap-y-2 text-sm">
            <dt class="text-grey-700">Name</dt>
            <dd class="text-grey-800">{{ record.name }}</dd>
            <dt class="text-grey-700">ID</dt>
            <dd><MonoBadge :value="String(record.id)" /></dd>
          </dl>
        </div>

        <div
          v-else
          class="text-grey-700 flex h-full items-center justify-center text-center text-sm"
        >
          No contractors to display.
        </div>
      </Drawer>
    </template>
  </MainWrapper>
</template>
