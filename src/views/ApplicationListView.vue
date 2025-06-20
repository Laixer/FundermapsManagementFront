<script setup lang="ts">
import { onBeforeMount, ref, type Ref } from 'vue'

// @ts-ignore TODO: PR to fix TS
import Vue3Datatable from '@bhplugin/vue3-datatable'

import '@bhplugin/vue3-datatable/dist/style.css'

import Card from '@/components/Common/Card.vue'
import Button from '@/components/Common/Buttons/Button.vue'
import MainWrapper from '@/components/Layout/MainWrapper.vue'
import RecordDetailsCard from '@/components/Management/RecordDetailsCard.vue'
import CreateApplicationForm from '@/components/Management/Forms/CreateApplicationForm.vue'
import Alert from '@/components/Common/Alert.vue'
import CopyToClipboardIcon from '@/components/Common/Icons/CopyToClipboardIcon.vue'

import {
  getAllApplications,
  type IApplication,
} from '@/services/fundermaps/endpoints/management/applications.ts'

const loading = ref(true)
const error = ref(false)
const showCreate = ref(false)

const record: Ref<IApplication | null> = ref(null)

const cols = [
  { field: 'id', title: 'ID', isUnique: true, width: '15rem' },
  { field: 'name', title: 'Name' },
]
const rows: Ref<IApplication[]> = ref([])

const refreshList = async function () {
  try {
    loading.value = true
    error.value = false
    rows.value = await getAllApplications()
  } catch (e) {
    error.value = true
  } finally {
    loading.value = false
  }
}

onBeforeMount(refreshList)

const handleRowClick = function (row: IApplication) {
  console.log(row)
  showCreate.value = false
  record.value = row
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
        <h3 class="text-lg font-bold">Applications</h3>
        <!-- <Button label="Add application" @click="handleOpenModal" /> -->
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
      >
        <template #id="data">
          <div class="flex justify-between">
            <div>{{ data.value.id }}</div>
            <CopyToClipboardIcon :value="data.value.id" />
          </div>
        </template>
      </Vue3Datatable>
    </Card>

    <!-- <CreateApplicationForm
      v-if="showCreate"
      @cancel="handleCloseModal"
      @saved="refreshList"
      @close="handleCloseModal"
    /> -->

    <RecordDetailsCard
      title="Application information"
      :record="record"
      :editable="false"
      @close="handleCloseModal"
    />
  </MainWrapper>
</template>
