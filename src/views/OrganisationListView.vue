<script setup lang="ts">
import { onBeforeMount, ref, type Ref } from 'vue'

// @ts-expect-error TODO: PR to fix TS
import Vue3Datatable from '@bhplugin/vue3-datatable'

import '@bhplugin/vue3-datatable/dist/style.css'

import Card from '@/components/Common/Card.vue'
import Button from '@/components/Common/Buttons/Button.vue'
import MainWrapper from '@/components/Layout/MainWrapper.vue'
import RecordDetailsCard from '@/components/Management/RecordDetailsCard.vue'
import Tabs from '@/components/Management/OrganisationTabs.vue'
import Alert from '@/components/Common/Alert.vue'
import CreateOrganisationForm from '@/components/Management/Forms/CreateOrganisationForm.vue'
import OrganisationForm from '@/components/Management/Forms/OrganisationForm.vue'
import CopyToClipboardIcon from '@/components/Common/Icons/CopyToClipboardIcon.vue'
import OrganisationUsersList from '@/components/Management/OrganisationUsersList.vue'
import OrganisationMapsetsList from '@/components/Management/OrganisationMapsetsList.vue'

import {
  deleteOrganisation,
  getAllOrganisations,
  type IOrg,
} from '@/services/fundermaps/endpoints/management/organisation.ts'
import OrganisationAddUser from '@/components/Management/Forms/OrganisationAddUser.vue'
import OrganisationRemoveMapset from '@/components/Management/Forms/OrganisationRemoveMapset.vue'
import OrganisationAddMapset from '@/components/Management/Forms/OrganisationAddMapset.vue'

const loading = ref(true)
const error = ref(false)
const showCreate = ref(false)
const showEdit = ref(false)

const activeTab: Ref<'users' | 'mapsets'> = ref('users')
const record: Ref<IOrg | null> = ref(null)
const orgUsersList = ref<InstanceType<typeof OrganisationUsersList> | null>(null)
const orgMapsetsList = ref<InstanceType<typeof OrganisationMapsetsList> | null>(null)

const cols = [
  { field: 'id', title: 'ID', isUnique: true, width: '20rem' },
  { field: 'name', title: 'Name' },
]
const rows: Ref<IOrg[]> = ref([])

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

const handleRowClick = async function (row: IOrg) {
  showCreate.value = false
  showEdit.value = false
  activeTab.value = 'users'
  record.value = row
}

const handleOpenModal = function () {
  record.value = null
  showCreate.value = true
}
const handleCloseModal = function () {
  showCreate.value = false
  showEdit.value = false
  record.value = null
}

const handleEdit = function () {
  showCreate.value = false
  showEdit.value = true
}

const handleDelete = async function () {
  if (!record.value) return
  if (!confirm(`Delete organisation "${record.value.name}"? This cannot be undone.`)) return

  try {
    await deleteOrganisation(record.value.id)
    record.value = null
    showEdit.value = false
    await refreshList()
  } catch {
    alert('Failed to delete organisation.')
  }
}

</script>

<template>
  <MainWrapper>
    <Card class="List col-span-2">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-bold">Organisations</h3>
        <Button label="Add organisation" @click="handleOpenModal" />
      </div>
      <Alert v-if="error" :closeable="true" @close="error = false">
        An error occurred while trying to retrieve the list of records.
      </Alert>
      <Vue3Datatable :rows="rows" :columns="cols" :loading="loading" sortColumn="name" :sortable="true"
        :columnFilter="true" @rowClick="handleRowClick">
        <template #id="data">
          <div class="flex justify-between">
            <div>{{ data.value.id }}</div>
            <CopyToClipboardIcon :value="data.value.id" />
          </div>
        </template>
      </Vue3Datatable>
    </Card>

    <CreateOrganisationForm v-if="showCreate" @cancel="handleCloseModal" @saved="refreshList"
      @close="handleCloseModal" />

    <OrganisationForm v-if="record && showEdit" :record="record" @cancel="handleCloseModal" @saved="refreshList"
      @close="handleCloseModal" />

    <RecordDetailsCard v-if="!showEdit" title="Organisation information" :record="record" :editable="true"
      @edit="handleEdit" @close="handleCloseModal">
      <Tabs v-model="activeTab" />
      <div v-if="activeTab === 'users'">
        <OrganisationUsersList ref="orgUsersList" :record="record" />
        <OrganisationAddUser :record="record" @saved="orgUsersList?.refresh()" />
      </div>
      <div v-else>
        <OrganisationMapsetsList ref="orgMapsetsList" :record="record" />
        <OrganisationAddMapset :record="record" @saved="orgMapsetsList?.refresh()" />
        <OrganisationRemoveMapset :record="record" @saved="orgMapsetsList?.refresh()" />
      </div>
      <div class="mt-4 border-t pt-4">
        <Button label="Delete Organisation" class="bg-red-600 hover:bg-red-700" @click="handleDelete" />
      </div>
    </RecordDetailsCard>
  </MainWrapper>
</template>
