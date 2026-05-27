<script setup lang="ts">
import { ref, watch, type Ref } from 'vue'

import Table from '@/components/Common/Table.vue'
import MonoBadge from '@/components/Common/MonoBadge.vue'
import Button from '@/components/Common/Buttons/Button.vue'
import Input from '@/components/Common/Inputs/Input.vue'
import Alert from '@/components/Common/Alert.vue'
import Icon from '@/components/Common/Icons/Icon.vue'

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

const props = defineProps<{
  record: IOrg | null
}>()

const districts: Ref<IGeolock[]> = ref([])
const municipalities: Ref<IGeolock[]> = ref([])
const neighborhoods: Ref<IGeolock[]> = ref([])
const loading = ref(false)
const loadError = ref<string | null>(null)
const actionError = ref<string | null>(null)
const actionSuccess = ref<string | null>(null)

const newDistrict = ref('')
const newMunicipality = ref('')
const newNeighborhood = ref('')

const flashSuccess = function (message: string) {
  actionSuccess.value = message
  setTimeout(() => {
    if (actionSuccess.value === message) actionSuccess.value = null
  }, 3000)
}

const columns = [
  { field: 'name', title: 'Name' },
  { field: 'id', title: 'ID', width: '12rem' },
  { field: 'actions', title: '', width: '2.5rem' },
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

async function handleAdd(
  inputRef: Ref<string>,
  fn: (orgId: string, id: string) => Promise<unknown>,
  label: string,
) {
  if (!props.record) return
  const id = inputRef.value.trim()
  if (!id) return
  try {
    actionError.value = null
    await fn(props.record.id, id)
    inputRef.value = ''
    await refresh()
    flashSuccess(`${label} added.`)
  } catch (e) {
    actionError.value = getErrorMessage(e) ?? `Failed to add ${label.toLowerCase()}.`
    console.error(e)
  }
}

async function handleRemove(
  id: string,
  fn: (orgId: string, id: string) => Promise<unknown>,
  label: string,
) {
  if (!props.record) return
  try {
    actionError.value = null
    await fn(props.record.id, id)
    await refresh()
    flashSuccess(`${label} removed.`)
  } catch (e) {
    actionError.value = getErrorMessage(e) ?? `Failed to remove ${label.toLowerCase()}.`
    console.error(e)
  }
}

const handleAddDistrict = () => handleAdd(newDistrict, addGeolockDistrict, 'District')
const handleAddMunicipality = () =>
  handleAdd(newMunicipality, addGeolockMunicipality, 'Municipality')
const handleAddNeighborhood = () =>
  handleAdd(newNeighborhood, addGeolockNeighborhood, 'Neighborhood')

const handleRemoveDistrict = (id: string) =>
  handleRemove(id, removeGeolockDistrict, 'District')
const handleRemoveMunicipality = (id: string) =>
  handleRemove(id, removeGeolockMunicipality, 'Municipality')
const handleRemoveNeighborhood = (id: string) =>
  handleRemove(id, removeGeolockNeighborhood, 'Neighborhood')
</script>

<template>
  <div class="space-y-6">
    <Alert v-if="loadError" :closeable="true" @close="loadError = null">{{ loadError }}</Alert>
    <Alert v-if="actionError" :closeable="true" @close="actionError = null">{{ actionError }}</Alert>
    <Alert v-if="actionSuccess" type="success" :closeable="true" @close="actionSuccess = null">
      {{ actionSuccess }}
    </Alert>

    <section class="space-y-2">
      <div class="flex items-center justify-between gap-2">
        <h6 class="text-xs font-semibold uppercase tracking-wide text-grey-700">
          Districts ({{ districts.length }})
        </h6>
        <Button
          outline
          label="Add"
          :disabled="!newDistrict.trim() || loading"
          @click="handleAddDistrict"
        />
      </div>
      <Input
        id="add-district"
        placeholder="District ID"
        type="text"
        v-model="newDistrict"
        :disabled="loading"
      />
      <Table
        :rows="districts"
        :columns="columns"
        :loading="loading"
        :clickable="false"
        emptyMessage="No districts."
      >
        <template #id="{ row }">
          <MonoBadge :value="row.id" />
        </template>
        <template #actions="{ row }">
          <button
            type="button"
            class="inline-flex h-7 w-7 items-center justify-center rounded text-grey-700 transition-colors hover:bg-red-50 hover:text-red-500"
            :aria-label="`Remove district ${row.id}`"
            title="Remove district"
            @click.stop="handleRemoveDistrict(row.id)"
          >
            <Icon class="aspect-square w-3" name="trash-solid" />
          </button>
        </template>
      </Table>
    </section>

    <section class="space-y-2">
      <div class="flex items-center justify-between gap-2">
        <h6 class="text-xs font-semibold uppercase tracking-wide text-grey-700">
          Municipalities ({{ municipalities.length }})
        </h6>
        <Button
          outline
          label="Add"
          :disabled="!newMunicipality.trim() || loading"
          @click="handleAddMunicipality"
        />
      </div>
      <Input
        id="add-municipality"
        placeholder="Municipality ID"
        type="text"
        v-model="newMunicipality"
        :disabled="loading"
      />
      <Table
        :rows="municipalities"
        :columns="columns"
        :loading="loading"
        :clickable="false"
        emptyMessage="No municipalities."
      >
        <template #id="{ row }">
          <MonoBadge :value="row.id" />
        </template>
        <template #actions="{ row }">
          <button
            type="button"
            class="inline-flex h-7 w-7 items-center justify-center rounded text-grey-700 transition-colors hover:bg-red-50 hover:text-red-500"
            :aria-label="`Remove municipality ${row.id}`"
            title="Remove municipality"
            @click.stop="handleRemoveMunicipality(row.id)"
          >
            <Icon class="aspect-square w-3" name="trash-solid" />
          </button>
        </template>
      </Table>
    </section>

    <section class="space-y-2">
      <div class="flex items-center justify-between gap-2">
        <h6 class="text-xs font-semibold uppercase tracking-wide text-grey-700">
          Neighborhoods ({{ neighborhoods.length }})
        </h6>
        <Button
          outline
          label="Add"
          :disabled="!newNeighborhood.trim() || loading"
          @click="handleAddNeighborhood"
        />
      </div>
      <Input
        id="add-neighborhood"
        placeholder="Neighborhood ID"
        type="text"
        v-model="newNeighborhood"
        :disabled="loading"
      />
      <Table
        :rows="neighborhoods"
        :columns="columns"
        :loading="loading"
        :clickable="false"
        emptyMessage="No neighborhoods."
      >
        <template #id="{ row }">
          <MonoBadge :value="row.id" />
        </template>
        <template #actions="{ row }">
          <button
            type="button"
            class="inline-flex h-7 w-7 items-center justify-center rounded text-grey-700 transition-colors hover:bg-red-50 hover:text-red-500"
            :aria-label="`Remove neighborhood ${row.id}`"
            title="Remove neighborhood"
            @click.stop="handleRemoveNeighborhood(row.id)"
          >
            <Icon class="aspect-square w-3" name="trash-solid" />
          </button>
        </template>
      </Table>
    </section>
  </div>
</template>
