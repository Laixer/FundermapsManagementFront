<script setup lang="ts">
import { ref, watch, type Ref } from 'vue'

import Table from '@/components/Common/Table.vue'
import type { IUser } from '@/services/fundermaps/interfaces/IUser.ts'
import { renderUserName } from '@/utils/user'
import type { IOrg } from '@/services/fundermaps/endpoints/management/organisation.ts'

import {
  getAllOrganisationUsers,
  removeUserFromOrganisation,
} from '@/services/fundermaps/endpoints/management/organisation.ts'
import { getErrorMessage } from '@/services/fundermaps/errors'
import Icon from '@/components/Common/Icons/Icon.vue'
import Alert from '@/components/Common/Alert.vue'

const props = defineProps<{
  record: IOrg | null
}>()

const userLoading = ref(false)
const loadError = ref<string | null>(null)
const actionError = ref<string | null>(null)
const userColumns = [
  { field: 'name', title: 'Name' },
  { field: 'email', title: 'Email' },
  { field: 'organization_role', title: 'Role', width: '7rem' },
  { field: 'actions', title: '', width: '2.5rem' },
]
const userRows: Ref<IUser[]> = ref([])

const refresh = async function () {
  if (props.record) {
    try {
      userLoading.value = true
      loadError.value = null
      userRows.value = await getAllOrganisationUsers(props.record.id)
    } catch (e) {
      loadError.value = getErrorMessage(e) ?? 'Failed to load users.'
      console.error(e)
    } finally {
      userLoading.value = false
    }
  }
}

watch(() => props.record, refresh, { immediate: true })

defineExpose({ refresh })

const handleRemoveUser = async function (row: IUser) {
  if (!props.record) {
    return
  }

  const confirmed = confirm(
    `Confirm removing ${renderUserName(row) || row.email} from ${props.record.name}`,
  )

  if (confirmed) {
    try {
      actionError.value = null
      await removeUserFromOrganisation(props.record.id, row.id)
      await refresh()
    } catch (e) {
      actionError.value = getErrorMessage(e) ?? 'Failed to remove user.'
    }
  }
}
</script>

<template>
  <div class="space-y-3">
    <Alert v-if="loadError" :closeable="true" @close="loadError = null">{{ loadError }}</Alert>
    <Alert v-if="actionError" :closeable="true" @close="actionError = null">{{ actionError }}</Alert>
    <Table
      :rows="userRows"
      :columns="userColumns"
      :loading="userLoading"
      :clickable="false"
      emptyMessage="No members yet."
    >
      <template #name="{ row }">
        <span class="font-medium text-grey-800">{{ renderUserName(row) || '—' }}</span>
      </template>
      <template #actions="{ row }">
        <button
          type="button"
          class="inline-flex h-7 w-7 items-center justify-center rounded text-grey-700 transition-colors hover:bg-red-50 hover:text-red-500"
          :aria-label="`Remove ${row.email}`"
          title="Remove from organisation"
          @click.stop="handleRemoveUser(row)"
        >
          <Icon class="aspect-square w-3" name="trash-solid" />
        </button>
      </template>
    </Table>
  </div>
</template>
