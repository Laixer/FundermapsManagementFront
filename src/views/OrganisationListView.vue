<script setup lang="ts">
import { onBeforeMount, ref, type Ref } from 'vue'

// @ts-ignore TODO: PR to fix TS
import Vue3Datatable from '@bhplugin/vue3-datatable'

import '@bhplugin/vue3-datatable/dist/style.css'

import Card from '@/components/Common/Card.vue'
import Button from '@/components/Common/Buttons/Button.vue'
import MainWrapper from '@/components/Layout/MainWrapper.vue'

import {
  getAllOrganisations,
  type IOrg,
} from '@/services/fundermaps/endpoints/management/organisation.ts'
import CloseBtn from '@/components/Common/Buttons/CloseBtn.vue'

const cols = [
  { field: 'id', title: 'ID', isUnique: true, width: '20rem' },
  { field: 'name', title: 'Name' },
]
const rows: Ref<IOrg[]> = ref([])

const loading = ref(true)

const showDetails: Ref<IOrg | null> = ref(null)
const showCreate = ref(false)

onBeforeMount(async () => {
  try {
    rows.value = await getAllOrganisations()

    loading.value = false
  } catch (e) {
    // TODO: Show error
  }
})
const handleRowClick = function (row: IOrg) {
  console.log('Open details modal')
  console.log(row)
  showCreate.value = false
  showDetails.value = row
}
const handleOpenModal = function () {
  console.log('Open create modal')
  showDetails.value = null
  showCreate.value = true
}
const handleCloseModal = function () {
  console.log('Close modal')
  showCreate.value = false
  showDetails.value = null
}
</script>

<template>
  <MainWrapper>
    <Card class="List col-span-2">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-bold">Organisations</h3>
        <Button label="Add organisation" @click="handleOpenModal" />
      </div>
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
    <Card v-show="showCreate" class="Details col-span-1">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-bold">Add organisation</h3>
        <CloseBtn label="close" @click="handleCloseModal" />
      </div>
    </Card>
    <Card v-show="showDetails" class="Details col-span-1">
      <div class="flex items-center justify-between">
        <Button outline label="edit" />
        <CloseBtn label="close" @click="handleCloseModal" />
      </div>
      <section class="content -mx-4 flex-auto space-y-10 rounded-t-lg bg-white px-4 pb-6">
        <div class="space-y-3">
          <h6 class="font-bold leading-none">Organisation information</h6>
          <dl class="space-y-3">
            <div v-for="prop in Object.keys(showDetails || {})">
              <dt>{{ prop }}</dt>
              <dd class="text-grey-700">
                {{ showDetails?.[prop as keyof typeof showDetails] || '-' }}
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <br />
      <strong>Organisation users ...</strong> <br />
      <strong>Organisation mapsets ...</strong>
    </Card>
  </MainWrapper>
</template>
