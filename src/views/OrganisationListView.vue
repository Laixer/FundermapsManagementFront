<script setup lang="ts">
import { computed, onBeforeMount, ref, type Ref } from 'vue'

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

const loading = ref(true)
const error = ref(false)
const showCreate = ref(false)
const showEdit = ref(false)
const search = ref('')
const actionError = ref<string | null>(null)

const activeTab: Ref<'users' | 'mapsets' | 'geolock'> = ref('users')
const record: Ref<IOrg | null> = ref(null)
const orgUsersList = ref<InstanceType<typeof OrganisationUsersList> | null>(null)
const orgMapsetsList = ref<InstanceType<typeof OrganisationMapsetsList> | null>(null)

const columns = [
  { field: 'name', title: 'Name' },
  { field: 'id', title: 'ID', width: '20rem' },
]
const rows: Ref<IOrg[]> = ref([])

const filteredRows = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return rows.value
  return rows.value.filter(
    (o) => o.name.toLowerCase().includes(q) || o.id.toLowerCase().includes(q),
  )
})

const drawerMode = computed<'create' | 'edit' | 'details' | null>(() => {
  if (showCreate.value) return 'create'
  if (record.value && showEdit.value) return 'edit'
  if (record.value) return 'details'
  return null
})

const refreshList = async function () {
  try {
    loading.value = true
    error.value = false
    rows.value = await getAllOrganisations()
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
}

onBeforeMount(refreshList)

const handleSelect = function (row: IOrg) {
  showCreate.value = false
  showEdit.value = false
  actionError.value = null
  if (record.value?.id !== row.id) {
    activeTab.value = 'users'
  }
  record.value = row
}

const handleOpenCreate = function () {
  showEdit.value = false
  record.value = null
  showCreate.value = true
}

const handleCloseDrawer = function () {
  showCreate.value = false
  showEdit.value = false
  record.value = null
  actionError.value = null
}

const handleEdit = function () {
  showCreate.value = false
  showEdit.value = true
}

const handleDelete = async function () {
  if (!record.value) return
  if (!confirm(`Delete organisation "${record.value.name}"? This cannot be undone.`)) return

  try {
    actionError.value = null
    await deleteOrganisation(record.value.id)
    record.value = null
    showEdit.value = false
    await refreshList()
  } catch (e) {
    actionError.value = getErrorMessage(e) ?? 'Failed to delete organisation.'
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
      <Button lg label="Add organisation" @click="handleOpenCreate" />
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
      <Drawer :open="drawerMode !== null" @close="handleCloseDrawer">
        <template #title>
          <template v-if="drawerMode === 'create'">New organisation</template>
          <template v-else-if="drawerMode === 'edit'">Edit {{ record?.name }}</template>
          <template v-else>Organisation information</template>
        </template>

        <template v-if="drawerMode === 'details'" #actions>
          <Button outline label="Edit" @click="handleEdit" />
          <Button danger label="Delete" @click="handleDelete" />
        </template>

        <CreateOrganisationForm
          v-if="drawerMode === 'create'"
          @cancel="handleCloseDrawer"
          @saved="refreshList"
          @close="handleCloseDrawer"
        />

        <OrganisationForm
          v-else-if="drawerMode === 'edit' && record"
          :record="record"
          @cancel="handleCloseDrawer"
          @saved="refreshList"
          @close="handleCloseDrawer"
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
      </Drawer>
    </template>
  </MainWrapper>
</template>
