<script setup lang="ts">
import { ref, watch, type Ref } from 'vue'
import { z } from 'zod'

import Vue3Datatable from '@bhplugin/vue3-datatable'

import type { IOrg } from '@/services/fundermaps/endpoints/management/organisation.ts'
import {
  getGeolockDistricts,
  addGeolockDistrict,
  removeGeolockDistrict,
  getGeolockMunicipalities,
  addGeolockMunicipality,
  removeGeolockMunicipality,
  getGeolockNeighborhoods,
  addGeolockNeighborhood,
  removeGeolockNeighborhood,
  type IGeolock,
} from '@/services/fundermaps/endpoints/management/organisation.ts'
import { getErrorMessage } from '@/services/fundermaps/errors'
import Icon from '@/components/Common/Icons/Icon.vue'
import Form from '@/components/Management/Form.vue'
import Input from '@/components/Common/Inputs/Input.vue'
import Alert from '@/components/Common/Alert.vue'

const props = defineProps<{
  record: IOrg | null
}>()

const validationSchema = z.object({
  id: z.string().min(1, 'ID is required'),
})

const districts: Ref<IGeolock[]> = ref([])
const municipalities: Ref<IGeolock[]> = ref([])
const neighborhoods: Ref<IGeolock[]> = ref([])
const loading = ref(false)
const loadError = ref<string | null>(null)
const actionError = ref<string | null>(null)
const actionSuccess = ref<string | null>(null)

const flashSuccess = function (message: string) {
  actionSuccess.value = message
  setTimeout(() => {
    if (actionSuccess.value === message) actionSuccess.value = null
  }, 3000)
}

const districtCols = [
  { field: 'name', title: 'Name' },
  { field: 'id', title: 'District ID', isUnique: true },
  { field: 'actions', title: '', width: '2rem', filter: false, sort: false, search: false },
]
const municipalityCols = [
  { field: 'name', title: 'Name' },
  { field: 'id', title: 'Municipality ID', isUnique: true },
  { field: 'actions', title: '', width: '2rem', filter: false, sort: false, search: false },
]
const neighborhoodCols = [
  { field: 'name', title: 'Name' },
  { field: 'id', title: 'Neighborhood ID', isUnique: true },
  { field: 'actions', title: '', width: '2rem', filter: false, sort: false, search: false },
]

async function refresh() {
  if (!props.record) return
  try {
    loading.value = true
    loadError.value = null
    const [d, m, n] = await Promise.all([
      getGeolockDistricts(props.record.id),
      getGeolockMunicipalities(props.record.id),
      getGeolockNeighborhoods(props.record.id),
    ])
    districts.value = d
    municipalities.value = m
    neighborhoods.value = n
  } catch (e) {
    loadError.value = getErrorMessage(e) ?? 'Failed to load geolock records.'
    console.error(e)
  } finally {
    loading.value = false
  }
}

watch(() => props.record, refresh, { immediate: true })

defineExpose({ refresh })

async function handleAddDistrict(formData: { id: string }) {
  if (!props.record || !formData.id.trim()) return
  await addGeolockDistrict(props.record.id, formData.id.trim())
  await refresh()
}

async function handleRemove(fn: () => Promise<unknown>, label: string) {
  try {
    actionError.value = null
    await fn()
    await refresh()
    flashSuccess(`${label} removed.`)
  } catch (e) {
    actionError.value = getErrorMessage(e) ?? `Failed to remove ${label.toLowerCase()}.`
    console.error(e)
  }
}

async function handleRemoveDistrict(id: string) {
  if (!props.record) return
  const orgId = props.record.id
  await handleRemove(() => removeGeolockDistrict(orgId, id), 'District')
}

async function handleAddMunicipality(formData: { id: string }) {
  if (!props.record || !formData.id.trim()) return
  await addGeolockMunicipality(props.record.id, formData.id.trim())
  await refresh()
}

async function handleRemoveMunicipality(id: string) {
  if (!props.record) return
  const orgId = props.record.id
  await handleRemove(() => removeGeolockMunicipality(orgId, id), 'Municipality')
}

async function handleAddNeighborhood(formData: { id: string }) {
  if (!props.record || !formData.id.trim()) return
  await addGeolockNeighborhood(props.record.id, formData.id.trim())
  await refresh()
}

async function handleRemoveNeighborhood(id: string) {
  if (!props.record) return
  const orgId = props.record.id
  await handleRemove(() => removeGeolockNeighborhood(orgId, id), 'Neighborhood')
}
</script>

<template>
  <div class="space-y-6">
    <Alert v-if="loadError" :closeable="true" @close="loadError = null">{{ loadError }}</Alert>
    <Alert v-if="actionError" :closeable="true" @close="actionError = null">{{ actionError }}</Alert>
    <Alert v-if="actionSuccess" type="success" :closeable="true" @close="actionSuccess = null">
      {{ actionSuccess }}
    </Alert>
    <div>
      <h6 class="mb-2 font-bold">Districts</h6>
      <Vue3Datatable :rows="districts" :columns="districtCols" :loading="loading" :sortable="true">
        <template #actions="data">
          <button @click.stop="handleRemoveDistrict(data.value.id)">
            <Icon class="aspect-square w-3" name="trash-solid" />
          </button>
        </template>
      </Vue3Datatable>
      <Form
        :form-data="{ id: '' }"
        :formDataHandler="handleAddDistrict"
        :validation-schema="validationSchema"
        :inline="true"
        v-slot="{ formData, getError, getStatus, loading: formLoading }"
      >
        <Input
          id="add-district"
          placeholder="Enter district ID"
          type="text"
          v-model="formData.id"
          :disabled="formLoading"
          :validation-status="getStatus('id')"
          :validation-message="getError('id')"
        />
      </Form>
    </div>

    <div>
      <h6 class="mb-2 font-bold">Municipalities</h6>
      <Vue3Datatable :rows="municipalities" :columns="municipalityCols" :loading="loading" :sortable="true">
        <template #actions="data">
          <button @click.stop="handleRemoveMunicipality(data.value.id)">
            <Icon class="aspect-square w-3" name="trash-solid" />
          </button>
        </template>
      </Vue3Datatable>
      <Form
        :form-data="{ id: '' }"
        :formDataHandler="handleAddMunicipality"
        :validation-schema="validationSchema"
        :inline="true"
        v-slot="{ formData, getError, getStatus, loading: formLoading }"
      >
        <Input
          id="add-municipality"
          placeholder="Enter municipality ID"
          type="text"
          v-model="formData.id"
          :disabled="formLoading"
          :validation-status="getStatus('id')"
          :validation-message="getError('id')"
        />
      </Form>
    </div>

    <div>
      <h6 class="mb-2 font-bold">Neighborhoods</h6>
      <Vue3Datatable :rows="neighborhoods" :columns="neighborhoodCols" :loading="loading" :sortable="true">
        <template #actions="data">
          <button @click.stop="handleRemoveNeighborhood(data.value.id)">
            <Icon class="aspect-square w-3" name="trash-solid" />
          </button>
        </template>
      </Vue3Datatable>
      <Form
        :form-data="{ id: '' }"
        :formDataHandler="handleAddNeighborhood"
        :validation-schema="validationSchema"
        :inline="true"
        v-slot="{ formData, getError, getStatus, loading: formLoading }"
      >
        <Input
          id="add-neighborhood"
          placeholder="Enter neighborhood ID"
          type="text"
          v-model="formData.id"
          :disabled="formLoading"
          :validation-status="getStatus('id')"
          :validation-message="getError('id')"
        />
      </Form>
    </div>
  </div>
</template>
