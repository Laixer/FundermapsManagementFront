<script setup lang="ts">
import { computed, ref, watch, type Ref } from 'vue'

import Button from '@/components/Common/Buttons/Button.vue'
import Alert from '@/components/Common/Alert.vue'
import Badge from '@/components/Common/Badge.vue'
import MonoBadge from '@/components/Common/MonoBadge.vue'
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

const canAdd = computed(
  () => !!addValue.value && !saving.value && !catalogLoading.value && !recordLoading.value,
)

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

// `#rrggbb` for inline style; the DB stores the bare hex without the `#`.
// Display labels are the actual map colours — never recolour them client-side.
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
  <div class="space-y-5">
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
          <code class="font-mono">{{ id }}</code>
        </li>
      </ul>
    </Alert>
    <Alert v-if="saveSuccess" type="success" :closeable="true" @close="saveSuccess = false">
      Layers saved.
    </Alert>

    <section class="space-y-2">
      <div class="flex items-center justify-between gap-2">
        <h6 class="text-xs font-semibold uppercase tracking-wide text-grey-700">
          Layers ({{ current.length }})
          <Badge v-if="dirty" variant="warning" class="ml-2">Unsaved</Badge>
        </h6>
        <Button
          outline
          label="Add"
          :disabled="!canAdd"
          @click="handleAdd"
        />
      </div>

      <Select
        v-if="availableOptions.length"
        id="add-layer"
        :options="[
          { value: '', label: catalogLoading ? 'Loading…' : 'Select a layer to add…' },
          ...availableOptions,
        ]"
        v-model="addValue"
        :disabled="saving || catalogLoading"
      />
      <p v-else class="text-xs text-grey-700">All catalog layers are already assigned.</p>

      <div
        v-if="current.length === 0"
        class="rounded-md border border-grey-200 px-3 py-6 text-center text-sm text-grey-700"
      >
        No layers assigned.
      </div>
      <ul v-else class="overflow-hidden rounded-md border border-grey-200">
        <li
          v-for="entry in selectedLayers"
          :key="entry.id"
          class="flex items-start gap-3 border-b border-grey-200 px-3 py-3 last:border-b-0"
        >
          <div class="min-w-0 flex-1 space-y-1.5">
            <div class="flex items-center gap-2">
              <span v-if="entry.layer" class="font-medium text-grey-800">{{
                entry.layer.name
              }}</span>
              <span v-else class="font-medium text-red-700">Unknown layer</span>
              <MonoBadge :value="entry.id" />
            </div>
            <div
              v-if="entry.layer && entry.layer.fields.length"
              class="flex flex-wrap gap-1.5"
            >
              <span
                v-for="(field, i) in entry.layer.fields"
                :key="i"
                class="inline-flex items-center gap-1.5 rounded border border-grey-200 bg-grey-100 px-1.5 py-0.5 text-xs text-grey-800"
              >
                <span
                  class="inline-block h-3 w-3 shrink-0 rounded-sm border border-grey-400"
                  :style="{ backgroundColor: normalizeColor(field.color) }"
                />
                {{ field.name }}
              </span>
            </div>
          </div>
          <button
            type="button"
            class="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded text-grey-700 transition-colors hover:bg-red-50 hover:text-red-500 disabled:cursor-default disabled:opacity-50"
            :disabled="saving"
            :aria-label="`Remove ${entry.layer?.name ?? entry.id}`"
            :title="`Remove ${entry.layer?.name ?? entry.id}`"
            @click="handleRemove(entry.id)"
          >
            <Icon class="aspect-square w-3" name="trash-solid" />
          </button>
        </li>
      </ul>
    </section>

    <div class="flex justify-end gap-2 border-t border-grey-200 pt-4">
      <Button
        label="Revert"
        outline
        :disabled="!dirty || saving"
        @click="handleRevert"
      />
      <Button
        label="Save"
        :disabled="!dirty || saving || recordLoading || recordError"
        @click="handleSave"
      />
    </div>
  </div>
</template>
