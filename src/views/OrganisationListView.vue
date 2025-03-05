<script setup lang="ts">
import { onBeforeMount, ref, type Ref } from 'vue'

// @ts-ignore TODO: PR to fix TS
import Vue3Datatable from '@bhplugin/vue3-datatable'

import '@bhplugin/vue3-datatable/dist/style.css'

import Card from '@/components/Common/Card.vue'
import Button from '@/components/Common/Buttons/Button.vue'
import MainWrapper from '@/components/Layout/MainWrapper.vue'
import RecordDetailsCard from '@/components/Management/RecordDetailsCard.vue'
import Tabs from '@/components/Management/OrganisationTabs.vue'
import Alert from '@/components/Common/Alert.vue'
import CreateOrganisationForm from '@/components/Management/Forms/CreateOrganisationForm.vue'
import Icon from '@/components/Common/Icons/Icon.vue'
import IconButton from '@/components/Common/Buttons/IconButton.vue'

import {
  getAllOrganisations,
  type IOrg,
} from '@/services/fundermaps/endpoints/management/organisation.ts'
import { getAllOrganisationUsers } from '@/services/fundermaps/endpoints/management/organisation.ts'
import type { IUser } from '@/services/fundermaps/interfaces/IUser.ts'

const loading = ref(true)
const error = ref(false)
const showCreate = ref(false)

const activeTab: Ref<'users' | 'mapsets'> = ref('users')
const record: Ref<IOrg | null> = ref(null)

const cols = [
  { field: 'id', title: 'ID', isUnique: true, width: '20rem' },
  { field: 'name', title: 'Name' },
]
const rows: Ref<IOrg[]> = ref([])

const userLoading = ref(false)
const userCols = [
  { field: 'given_name', title: 'Name' },
  { field: 'email', title: 'Email' },
  { field: 'delete', width: '2rem', filter: false, sort: false, search: false },
]
const userRows: Ref<IUser[]> = ref([])

const refreshList = async function () {
  try {
    loading.value = true
    error.value = false
    rows.value = await getAllOrganisations()
  } catch (e) {
    error.value = true
  } finally {
    loading.value = false
  }
}

onBeforeMount(refreshList)

// TODO: Prep before display
const renderName = function (data: IUser) {
  if (data.given_name && data.family_name) {
    return `${data.given_name} ${data.family_name}`
  }
  if (data.given_name) {
    return data.given_name
  }
  if (data.family_name) {
    return data.family_name
  }
  return ''
}

const handleRowClick = async function (row: IOrg) {
  console.log(row)
  showCreate.value = false

  activeTab.value = 'users'
  record.value = row

  if (record) {
    // TODO: load users
    userLoading.value = true
    userRows.value = await getAllOrganisationUsers(record.value.id)
    console.log(userRows)
    userLoading.value = false
  }
}

const handleUserRowClick = function (row: IUser) {
  console.log('open', row)
}
const handleRemoveUser = function (row: IUser) {
  console.log('remove', row)
}

const handleOpenModal = function () {
  record.value = null
  showCreate.value = true
}
const handleCloseModal = function () {
  showCreate.value = false
  record.value = null
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
      <Vue3Datatable
        :rows="rows"
        :columns="cols"
        :loading="loading"
        sortColumn="name"
        :sortable="true"
        :columnFilter="true"
        @rowClick="handleRowClick"
      />
    </Card>

    <CreateOrganisationForm
      v-if="showCreate"
      @cancel="handleCloseModal"
      @saved="refreshList"
      @close="handleCloseModal"
    />

    <RecordDetailsCard title="Organisation information" :record="record" @close="handleCloseModal">
      <Tabs v-model="activeTab" />
      <div v-if="activeTab === 'users'">
        <Vue3Datatable
          :rows="userRows"
          :columns="userCols"
          :loading="userLoading"
          sortColumn="name"
          :sortable="true"
          :columnFilter="true"
        >
          <template #given_name="data">
            {{ renderName(data.value) }}
          </template>
          <template #delete="data">
            <div class="flex gap-1">
              <IconButton label="view" @click.stop="handleUserRowClick(data.value)">
                <Icon class="aspect-square w-3" name="eye-solid" />
              </IconButton>
              <IconButton label="disconnect" @click.stop="handleRemoveUser(data.value)">
                <Icon class="aspect-square w-3" name="minus" />
              </IconButton>
            </div>
          </template>
        </Vue3Datatable>
      </div>
      <div v-else>
        <div>Add Mapset by id</div>
        <div>Remove Mapset by id</div>
      </div>
    </RecordDetailsCard>
  </MainWrapper>
</template>
