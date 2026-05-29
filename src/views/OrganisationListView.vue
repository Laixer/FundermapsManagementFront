<script setup lang="ts">
import { computed, ref, type Ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import Button from '@/components/Common/Buttons/Button.vue'
import MainWrapper from '@/components/Layout/MainWrapper.vue'
import Drawer from '@/components/Layout/Drawer.vue'
import Tabs from '@/components/Management/OrganisationTabs.vue'
import Alert from '@/components/Common/Alert.vue'
import Table from '@/components/Common/Table.vue'
import MonoBadge from '@/components/Common/MonoBadge.vue'
import Input from '@/components/Common/Inputs/Input.vue'
import CreateOrganisationForm from '@/components/Management/Forms/CreateOrganisationForm.vue'
import OrganisationForm from '@/components/Management/Forms/OrganisationForm.vue'
import CopyToClipboardIcon from '@/components/Common/Icons/CopyToClipboardIcon.vue'
import OrganisationUsersList from '@/components/Management/OrganisationUsersList.vue'
import OrganisationMapsetsList from '@/components/Management/OrganisationMapsetsList.vue'
import OrganisationGeolockSection from '@/components/Management/OrganisationGeolockSection.vue'

import {
  deleteOrganisation,
  getAllOrganisations,
  type IOrg,
} from '@/services/fundermaps/endpoints/management/organisation.ts'
import { getErrorMessage } from '@/services/fundermaps/errors'
import OrganisationAddUser from '@/components/Management/Forms/OrganisationAddUser.vue'
import OrganisationRemoveMapset from '@/components/Management/Forms/OrganisationRemoveMapset.vue'
import OrganisationAddMapset from '@/components/Management/Forms/OrganisationAddMapset.vue'
import { useListResource } from '@/composables/useListResource'
import PlusIcon from '@assets/svg/icons/plus.svg?component'

const showCreate = ref(false)
const showEdit = ref(false)
const deleting = ref(false)
const actionError = ref<string | null>(null)

const activeTab: Ref<'users' | 'mapsets' | 'geolock'> = ref('users')
const orgUsersList = ref<InstanceType<typeof OrganisationUsersList> | null>(null)
const orgMapsetsList = ref<InstanceType<typeof OrganisationMapsetsList> | null>(null)

const columns = [
  { field: 'name', title: 'Name' },
  { field: 'id', title: 'ID', width: '20rem' },
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
} = useListResource<IOrg>({
  fetch: getAllOrganisations,
  filter: (o, q) => o.name.toLowerCase().includes(q) || o.id.toLowerCase().includes(q),
  onSelect: (row, previous) => {
    showCreate.value = false
    showEdit.value = false
    actionError.value = null
    if (previous?.id !== row.id) activeTab.value = 'users'
  },
  routeId: () => (typeof route.params.id === 'string' ? route.params.id : undefined),
  syncRoute: (id) => router.replace({ name: 'organisations', params: { id }, query: route.query }),
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
  actionError.value = null
  if (!record.value) selectFirstRow()
}

const handleEdit = function () {
  showCreate.value = false
  showEdit.value = true
}

const handleDelete = async function () {
  if (!record.value) return
  if (!confirm(`Delete organisation "${record.value.name}"? This cannot be undone.`)) return

  try {
    deleting.value = true
    actionError.value = null
    await deleteOrganisation(record.value.id)
    record.value = null
    showEdit.value = false
    await refreshList()
    selectFirstRow()
  } catch (e) {
    actionError.value = getErrorMessage(e) ?? 'Failed to delete organisation.'
  } finally {
    deleting.value = false
  }
}
</script>

<template>
  <MainWrapper>
    <header class="mb-4 flex items-end justify-between gap-4">
      <div>
        <h2 class="text-xl font-semibold text-grey-800">Organisations</h2>
        <p class="mt-0.5 text-sm text-grey-700">
          Manage customer organisations, members and their assigned mapsets.
        </p>
      </div>
      <Button lg label="Add organisation" @click="handleOpenCreate">
        <template #before>
          <PlusIcon class="aspect-square h-4 w-4" aria-hidden="true" />
        </template>
      </Button>
    </header>

    <div class="mb-3 flex items-center gap-3">
      <div class="w-72">
        <Input
          id="org-search"
          v-model="search"
          type="search"
          placeholder="Search by name or ID…"
        />
      </div>
      <span class="text-xs text-grey-700">{{ filteredRows.length }} of {{ rows.length }}</span>
    </div>

    <Alert v-if="error" :closeable="true" class="mb-3" @close="error = false">
      An error occurred while trying to retrieve the list of organisations.
    </Alert>

    <Table
      :rows="filteredRows"
      :columns="columns"
      :loading="loading"
      :selectedId="record?.id"
      emptyMessage="No organisations match your search."
      @select="handleSelect"
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

    <template #aside>
      <Drawer>
        <template #title>
          <template v-if="drawerMode === 'create'">New organisation</template>
          <template v-else-if="drawerMode === 'edit'">Edit {{ record?.name }}</template>
          <template v-else>Organisation information</template>
        </template>

        <template v-if="drawerMode === 'details'" #actions>
          <Button outline label="Edit" :disabled="deleting" @click="handleEdit" />
          <Button danger label="Delete" :loading="deleting" @click="handleDelete" />
        </template>

        <CreateOrganisationForm
          v-if="drawerMode === 'create'"
          @cancel="handleDismissForm"
          @saved="refreshList"
          @close="handleDismissForm"
        />

        <OrganisationForm
          v-else-if="drawerMode === 'edit' && record"
          :record="record"
          @cancel="handleDismissForm"
          @saved="refreshList"
          @close="handleDismissForm"
        />

        <div v-else-if="drawerMode === 'details' && record" class="space-y-4">
          <Alert v-if="actionError" :closeable="true" @close="actionError = null">
            {{ actionError }}
          </Alert>

          <dl class="grid grid-cols-[6rem_1fr] gap-x-4 gap-y-2 text-sm">
            <dt class="text-grey-700">Name</dt>
            <dd class="text-grey-800">{{ record.name }}</dd>
            <dt class="text-grey-700">ID</dt>
            <dd><MonoBadge :value="record.id" /></dd>
          </dl>

          <Tabs v-model="activeTab" />
          <div v-if="activeTab === 'users'" class="space-y-3">
            <OrganisationUsersList ref="orgUsersList" :record="record" />
            <OrganisationAddUser :record="record" @saved="orgUsersList?.refresh()" />
          </div>
          <div v-else-if="activeTab === 'mapsets'" class="space-y-3">
            <OrganisationMapsetsList ref="orgMapsetsList" :record="record" />
            <OrganisationAddMapset :record="record" @saved="orgMapsetsList?.refresh()" />
            <OrganisationRemoveMapset :record="record" @saved="orgMapsetsList?.refresh()" />
          </div>
          <div v-else-if="activeTab === 'geolock'">
            <OrganisationGeolockSection :record="record" />
          </div>
        </div>

        <div
          v-else
          class="flex h-full items-center justify-center text-center text-sm text-grey-700"
        >
          No organisations to display.
        </div>
      </Drawer>
    </template>
  </MainWrapper>
</template>
