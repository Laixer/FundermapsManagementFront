<script setup lang="ts">
import { ref, watch, type Ref } from 'vue'

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
import Icon from '@/components/Common/Icons/Icon.vue'
import Button from '@/components/Common/Buttons/Button.vue'
import Input from '@/components/Common/Inputs/Input.vue'

const props = defineProps<{
  record: IOrg | null
}>()

const districts: Ref<IGeolock[]> = ref([])
const municipalities: Ref<IGeolock[]> = ref([])
const neighborhoods: Ref<IGeolock[]> = ref([])
const loading = ref(false)

const newDistrict = ref('')
const newMunicipality = ref('')
const newNeighborhood = ref('')

async function refresh() {
  if (!props.record) return
  try {
    loading.value = true
    const [d, m, n] = await Promise.all([
      getGeolockDistricts(props.record.id),
      getGeolockMunicipalities(props.record.id),
      getGeolockNeighborhoods(props.record.id),
    ])
    districts.value = d
    municipalities.value = m
    neighborhoods.value = n
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

watch(() => props.record, refresh, { immediate: true })

defineExpose({ refresh })

async function handleAddDistrict() {
  if (!props.record || !newDistrict.value.trim()) return
  await addGeolockDistrict(props.record.id, newDistrict.value.trim())
  newDistrict.value = ''
  await refresh()
}

async function handleRemoveDistrict(id: string) {
  if (!props.record) return
  await removeGeolockDistrict(props.record.id, id)
  await refresh()
}

async function handleAddMunicipality() {
  if (!props.record || !newMunicipality.value.trim()) return
  await addGeolockMunicipality(props.record.id, newMunicipality.value.trim())
  newMunicipality.value = ''
  await refresh()
}

async function handleRemoveMunicipality(id: string) {
  if (!props.record) return
  await removeGeolockMunicipality(props.record.id, id)
  await refresh()
}

async function handleAddNeighborhood() {
  if (!props.record || !newNeighborhood.value.trim()) return
  await addGeolockNeighborhood(props.record.id, newNeighborhood.value.trim())
  newNeighborhood.value = ''
  await refresh()
}

async function handleRemoveNeighborhood(id: string) {
  if (!props.record) return
  await removeGeolockNeighborhood(props.record.id, id)
  await refresh()
}
</script>

<template>
  <div v-if="loading" class="py-4 text-sm text-gray-500">Loading...</div>
  <div v-else class="space-y-6">
    <div>
      <h6 class="mb-2 font-bold">Districts</h6>
      <div v-if="districts.length === 0" class="text-sm text-gray-500">No districts</div>
      <div v-for="item in districts" :key="item.district_id" class="flex items-center justify-between border-b py-1 text-sm">
        <span>{{ item.district_id }}</span>
        <button @click="handleRemoveDistrict(item.district_id!)">
          <Icon class="aspect-square w-3" name="trash-solid" />
        </button>
      </div>
      <form class="mt-2 flex items-end gap-2" @submit.prevent="handleAddDistrict">
        <div class="grow">
          <Input id="new-district" placeholder="Enter district ID" type="text" v-model="newDistrict" />
        </div>
        <Button type="submit" label="Add" />
      </form>
    </div>

    <div>
      <h6 class="mb-2 font-bold">Municipalities</h6>
      <div v-if="municipalities.length === 0" class="text-sm text-gray-500">No municipalities</div>
      <div v-for="item in municipalities" :key="item.municipality_id" class="flex items-center justify-between border-b py-1 text-sm">
        <span>{{ item.municipality_id }}</span>
        <button @click="handleRemoveMunicipality(item.municipality_id!)">
          <Icon class="aspect-square w-3" name="trash-solid" />
        </button>
      </div>
      <form class="mt-2 flex items-end gap-2" @submit.prevent="handleAddMunicipality">
        <div class="grow">
          <Input id="new-municipality" placeholder="Enter municipality ID" type="text" v-model="newMunicipality" />
        </div>
        <Button type="submit" label="Add" />
      </form>
    </div>

    <div>
      <h6 class="mb-2 font-bold">Neighborhoods</h6>
      <div v-if="neighborhoods.length === 0" class="text-sm text-gray-500">No neighborhoods</div>
      <div v-for="item in neighborhoods" :key="item.neighborhood_id" class="flex items-center justify-between border-b py-1 text-sm">
        <span>{{ item.neighborhood_id }}</span>
        <button @click="handleRemoveNeighborhood(item.neighborhood_id!)">
          <Icon class="aspect-square w-3" name="trash-solid" />
        </button>
      </div>
      <form class="mt-2 flex items-end gap-2" @submit.prevent="handleAddNeighborhood">
        <div class="grow">
          <Input id="new-neighborhood" placeholder="Enter neighborhood ID" type="text" v-model="newNeighborhood" />
        </div>
        <Button type="submit" label="Add" />
      </form>
    </div>
  </div>
</template>
