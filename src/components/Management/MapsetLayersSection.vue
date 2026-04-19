<script setup lang="ts">
import { computed, ref, watch, type Ref } from 'vue'

import Button from '@/components/Common/Buttons/Button.vue'
import Alert from '@/components/Common/Alert.vue'
import Icon from '@/components/Common/Icons/Icon.vue'
import Select, { type SelectOption } from '@/components/Common/Inputs/Select.vue'

import type { IMapset } from '@/services/fundermaps/interfaces/IMapset'
import type { ILayer } from '@/services/fundermaps/interfaces/ILayer'
import { getAllLayers } from '@/services/fundermaps/endpoints/management/layer'
import {
  getMapset,
  replaceMapsetLayers,
} from '@/services/fundermaps/endpoints/management/mapset'
import { APIErrorResponse } from '@/services/fundermaps/errors'

const props = defineProps<{
  record: IMapset | null
}>()

const emit = defineEmits<{
  (e: 'saved', mapset: IMapset): void
}>()

const catalog: Ref<ILayer[]> = ref([])
const catalogLoading = ref(false)
const catalogError = ref(false)

const initial: Ref<string[]> = ref([])
const current: Ref<string[]> = ref([])
const addValue = ref('')

const recordLoading = ref(false)
const recordError = ref(false)
const saving = ref(false)
const saveError = ref<string | null>(null)
const saveUnknown = ref<string[]>([])
const saveSuccess = ref(false)

const catalogById = computed<Map<string, ILayer>>(
  () => new Map(catalog.value.map((l) => [l.id, l])),
)

const selectedLayers = computed(() =>
  current.value.map((id) => ({
    id,
    layer: catalogById.value.get(id) ?? null,
  })),
)

const availableOptions = computed<SelectOption[]>(() => {
  const selected = new Set(current.value)
  return catalog.value
    .filter((l) => !selected.has(l.id))
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((l) => ({ value: l.id, label: `${l.name} (${l.id})` }))
})

const dirty = computed(() => {
  if (initial.value.length !== current.value.length) return true
  return initial.value.some((id, i) => id !== current.value[i])
})

const loadCatalog = async function () {
  if (catalog.value.length > 0) return
  try {
    catalogLoading.value = true
    catalogError.value = false
    catalog.value = await getAllLayers()
  } catch (e) {
    console.error(e)
    catalogError.value = true
  } finally {
    catalogLoading.value = false
  }
}

const resetState = function (layers: string[]) {
  initial.value = [...layers]
  current.value = [...layers]
  addValue.value = ''
  saveError.value = null
  saveUnknown.value = []
  saveSuccess.value = false
}

const refreshRecord = async function () {
  const id = props.record?.id
  if (!id) {
    resetState([])
    return
  }
  try {
    recordLoading.value = true
    recordError.value = false
    const fresh = await getMapset(id)
    resetState(fresh.layers ?? [])
  } catch (e) {
    console.error(e)
    recordError.value = true
    resetState([])
  } finally {
    recordLoading.value = false
  }
}

watch(
  () => props.record?.id,
  async () => {
    await Promise.all([loadCatalog(), refreshRecord()])
  },
  { immediate: true },
)

const normalizeColor = function (hex: string): string {
  return `#${hex.toLowerCase()}`
}

const handleRemove = function (id: string) {
  current.value = current.value.filter((x) => x !== id)
  saveSuccess.value = false
}

const handleAdd = function () {
  const id = addValue.value
  if (!id) return
  if (current.value.includes(id)) return
  current.value = [...current.value, id]
  addValue.value = ''
  saveSuccess.value = false
}

const handleRevert = function () {
  current.value = [...initial.value]
  saveError.value = null
  saveUnknown.value = []
  saveSuccess.value = false
}

const handleSave = async function () {
  if (!props.record) return
  try {
    saving.value = true
    saveError.value = null
    saveUnknown.value = []
    saveSuccess.value = false

    await replaceMapsetLayers(props.record.id, current.value)
    const updated = await getMapset(props.record.id)
    initial.value = [...(updated.layers ?? [])]
    current.value = [...initial.value]
    saveSuccess.value = true
    emit('saved', updated)
  } catch (e) {
    if (e instanceof APIErrorResponse && e.status === 400 && e.body && typeof e.body === 'object') {
      const body = e.body as { message?: string; unknown?: string[] }
      saveError.value = body.message || 'The server rejected one or more layer IDs.'
      saveUnknown.value = Array.isArray(body.unknown) ? body.unknown : []
    } else {
      saveError.value = 'Failed to save layers. Please try again.'
    }
    console.error(e)
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="space-y-4">
    <Alert v-if="catalogError" :closeable="true" @close="catalogError = false">
      Failed to load the layer catalog.
    </Alert>

    <Alert v-if="recordError" :closeable="true" @close="recordError = false">
      Failed to load the mapset's current layers.
    </Alert>

    <Alert v-if="saveError" :closeable="true" @close="saveError = null">
      {{ saveError }}
      <ul v-if="saveUnknown.length" class="mt-1 list-disc pl-5">
        <li v-for="id in saveUnknown" :key="id">
          <code>{{ id }}</code>
        </li>
      </ul>
    </Alert>

    <Alert v-if="saveSuccess" type="success" :closeable="true" @close="saveSuccess = false">
      Layers saved.
    </Alert>

    <div>
      <div class="mb-2 flex items-baseline justify-between">
        <h6 class="font-bold">Layers ({{ current.length }})</h6>
        <span v-if="dirty" class="text-xs text-amber-600">Unsaved changes</span>
      </div>

      <div v-if="current.length === 0" class="rounded border border-dashed p-3 text-sm text-grey-700">
        No layers assigned.
      </div>

      <ul v-else class="divide-y rounded border">
        <li
          v-for="entry in selectedLayers"
          :key="entry.id"
          class="flex items-start justify-between gap-3 p-3"
        >
          <div class="min-w-0 grow">
            <div class="flex items-center gap-2">
              <span v-if="entry.layer" class="font-medium">{{ entry.layer.name }}</span>
              <span v-else class="font-medium text-red-600">Unknown layer</span>
              <code class="text-xs text-grey-700">{{ entry.id }}</code>
            </div>
            <div
              v-if="entry.layer && entry.layer.fields.length"
              class="mt-1 flex flex-wrap gap-1.5"
            >
              <span
                v-for="(field, i) in entry.layer.fields"
                :key="i"
                class="inline-flex items-center gap-1 rounded bg-grey-100 px-1.5 py-0.5 text-xs"
              >
                <span
                  class="inline-block h-2.5 w-2.5 rounded-full border border-grey-400"
                  :style="{ backgroundColor: normalizeColor(field.color) }"
                />
                {{ field.name }}
              </span>
            </div>
          </div>
          <button
            type="button"
            class="shrink-0"
            :disabled="saving"
            :aria-label="`Remove ${entry.layer?.name ?? entry.id}`"
            @click="handleRemove(entry.id)"
          >
            <Icon class="aspect-square w-3" name="trash-solid" />
          </button>
        </li>
      </ul>
    </div>

    <div class="border-t pt-4">
      <h6 class="mb-2 font-bold">Add layer</h6>
      <div v-if="availableOptions.length === 0" class="text-sm text-grey-700">
        All catalog layers are already assigned.
      </div>
      <div v-else class="flex items-end gap-2">
        <div class="grow">
          <Select
            id="add-layer"
            :options="[{ value: '', label: catalogLoading ? 'Loading…' : 'Select a layer…' }, ...availableOptions]"
            v-model="addValue"
            :disabled="saving || catalogLoading"
          />
        </div>
        <Button
          label="Add"
          :disabled="!addValue || saving || catalogLoading || recordLoading || recordError"
          @click="handleAdd"
        />
      </div>
    </div>

    <div class="flex justify-end gap-2 border-t pt-4">
      <Button label="Revert" outline :disabled="!dirty || saving" @click="handleRevert" />
      <Button
        label="Save"
        :disabled="!dirty || saving || recordLoading || recordError"
        @click="handleSave"
      />
    </div>
  </div>
</template>
