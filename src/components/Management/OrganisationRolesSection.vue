<script setup lang="ts">
import { computed, ref, watch, type Ref } from 'vue'
import { z } from 'zod'

import Table from '@/components/Common/Table.vue'
import Alert from '@/components/Common/Alert.vue'
import Button from '@/components/Common/Buttons/Button.vue'
import Icon from '@/components/Common/Icons/Icon.vue'
import Input from '@/components/Common/Inputs/Input.vue'
import Form from '@/components/Management/Form.vue'

import {
  createOrganisationRole,
  deleteOrganisationRole,
  getOrganisationRoles,
  getPermissionMetadata,
  updateOrganisationRole,
  type ICustomRole,
  type IOrg,
  type IPermissionMap,
  type IPermissionMetadata,
} from '@/services/fundermaps/endpoints/management/organisation.ts'
import { getErrorMessage } from '@/services/fundermaps/errors'

const props = defineProps<{
  record: IOrg | null
}>()

const loading = ref(false)
const loadError = ref<string | null>(null)
const actionError = ref<string | null>(null)

const metadata: Ref<IPermissionMetadata | null> = ref(null)
const customRoles: Ref<ICustomRole[]> = ref([])

// null = closed, 'create' = new role, ICustomRole = editing that role
const editor = ref<'create' | ICustomRole | null>(null)

const columns = [
  { field: 'name', title: 'Role' },
  { field: 'permission', title: 'Permissions' },
  { field: 'actions', title: '', width: '4.5rem' },
]

// Fixed roles (read-only) + the org's custom roles in one list.
const roleRows = computed(() => {
  const fixed = Object.entries(metadata.value?.fixed_roles ?? {}).map(([name, permission]) => ({
    id: name,
    name,
    permission,
    custom: null as ICustomRole | null,
  }))
  const custom = customRoles.value.map((role) => ({
    id: role.id,
    name: role.role,
    permission: role.permission,
    custom: role,
  }))
  return [...fixed, ...custom]
})

const refresh = async function () {
  if (!props.record) return
  try {
    loading.value = true
    loadError.value = null
    const [meta, roles] = await Promise.all([
      metadata.value ? Promise.resolve(metadata.value) : getPermissionMetadata(),
      getOrganisationRoles(props.record.id),
    ])
    metadata.value = meta
    customRoles.value = roles
  } catch (e) {
    loadError.value = getErrorMessage(e) ?? 'Failed to load roles.'
    console.error(e)
  } finally {
    loading.value = false
  }
}

watch(
  () => props.record,
  () => {
    editor.value = null
    refresh()
  },
  { immediate: true },
)

defineExpose({ refresh })

const resourceLabel = function (resource: string) {
  return resource === 'app' ? 'App access' : resource.charAt(0).toUpperCase() + resource.slice(1)
}

// Only render the matrix resources in the summary — fixed superuser also
// carries org-management statements the matrix doesn't cover.
const permissionSummary = function (permission: IPermissionMap) {
  const entries = Object.keys(metadata.value?.resources ?? {})
    .filter((resource) => (permission[resource] ?? []).length > 0)
    .map((resource) => `${resourceLabel(resource)}: ${permission[resource]!.join(', ')}`)
  return entries.length > 0 ? entries : ['—']
}

// ── Create / edit form ────────────────────────────────────────────────────
// The checkbox matrix lives outside Form.vue's formData (whose slot type is
// Record<string, unknown>) and is merged in at submit.

const matrix = ref<Record<string, string[]>>({})

const editorFormData = computed(() => ({
  name: editor.value !== 'create' ? (editor.value?.role ?? '') : '',
}))

watch(editor, () => {
  const permission: Record<string, string[]> = {}
  for (const resource of Object.keys(metadata.value?.resources ?? {})) {
    const current = editor.value !== 'create' ? editor.value?.permission[resource] : undefined
    permission[resource] = [...(current ?? [])]
  }
  matrix.value = permission
})

const validationSchema = z.object({
  name: z.string().trim().min(1, 'Role name is required.').max(64, 'Keep it under 64 characters.'),
})

const formHandler = async function (formData: { name: string }) {
  if (!props.record) return
  const permission: IPermissionMap = { ...matrix.value }
  if (editor.value === 'create') {
    await createOrganisationRole(props.record.id, formData.name.trim(), permission)
  } else if (editor.value) {
    await updateOrganisationRole(props.record.id, editor.value.id, {
      name: formData.name.trim(),
      permission,
    })
  }
  await refresh()
}

const closeEditor = function () {
  editor.value = null
}

const handleDelete = async function (role: ICustomRole) {
  if (!props.record) return
  if (!confirm(`Delete role "${role.role}" from ${props.record.name}?`)) return

  try {
    actionError.value = null
    await deleteOrganisationRole(props.record.id, role.id)
    if (editor.value !== 'create' && editor.value?.id === role.id) editor.value = null
    await refresh()
  } catch (e) {
    actionError.value = getErrorMessage(e) ?? 'Failed to delete role.'
  }
}
</script>

<template>
  <div class="space-y-3">
    <Alert v-if="loadError" :closeable="true" @close="loadError = null">{{ loadError }}</Alert>
    <Alert v-if="actionError" :closeable="true" @close="actionError = null">
      {{ actionError }}
    </Alert>

    <Table
      :rows="roleRows"
      :columns="columns"
      :loading="loading"
      :clickable="false"
      emptyMessage="No roles to display."
    >
      <template #name="{ row }">
        <span class="font-medium text-grey-800">{{ row.name }}</span>
        <span v-if="!row.custom" class="ml-1 text-xs text-grey-700">(fixed)</span>
      </template>
      <template #permission="{ row }">
        <div class="space-y-0.5 text-xs text-grey-700">
          <div v-for="line in permissionSummary(row.permission)" :key="line">{{ line }}</div>
        </div>
      </template>
      <template #actions="{ row }">
        <div v-if="row.custom" class="flex items-center gap-1">
          <button
            type="button"
            class="rounded px-1 text-sm font-medium text-green-700 transition-colors hover:text-green-800"
            :aria-label="`Edit ${row.name}`"
            title="Edit role"
            @click.stop="editor = row.custom"
          >
            Edit
          </button>
          <button
            type="button"
            class="inline-flex h-7 w-7 items-center justify-center rounded text-grey-700 transition-colors hover:bg-red-50 hover:text-red-500"
            :aria-label="`Delete ${row.name}`"
            title="Delete role"
            @click.stop="handleDelete(row.custom)"
          >
            <Icon class="aspect-square w-3" name="trash-solid" />
          </button>
        </div>
      </template>
    </Table>

    <Button
      v-if="!editor"
      outline
      label="Add custom role"
      :disabled="loading || !metadata"
      @click="editor = 'create'"
    />

    <Form
      v-if="editor && metadata"
      :key="editor === 'create' ? 'create' : editor.id"
      :title="editor === 'create' ? 'New custom role' : `Edit ${editor.role}`"
      :form-data="editorFormData"
      :validation-schema="validationSchema"
      :formDataHandler="formHandler"
      @cancel="closeEditor"
      v-slot="{ formData, getStatus, getError, loading: saving }"
    >
      <Input
        id="role-name"
        label="Role name"
        placeholder="e.g. auditor"
        type="text"
        v-model="formData.name"
        :validationStatus="getStatus('name')"
        :validationMessage="getError('name')"
        :disabled="saving"
        :tabindex="1"
      />
      <fieldset class="space-y-2">
        <legend class="input__label">Permissions</legend>
        <div
          v-for="(actions, resource) in metadata.resources"
          :key="resource"
          class="flex flex-wrap items-center gap-x-3 gap-y-1"
        >
          <span class="w-24 shrink-0 text-sm font-medium text-grey-800">
            {{ resourceLabel(resource) }}
          </span>
          <label
            v-for="action in actions"
            :key="action"
            class="inline-flex items-center gap-1.5 text-sm text-grey-700"
          >
            <input
              type="checkbox"
              class="h-4 w-4 rounded border-grey-400 text-green-600"
              :value="action"
              v-model="matrix[resource]"
              :disabled="saving"
            />
            {{ action }}
          </label>
        </div>
      </fieldset>
    </Form>
  </div>
</template>
