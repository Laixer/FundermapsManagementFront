<script setup lang="ts">
import { ref, watch, type Ref } from 'vue'

import Vue3Datatable from '@bhplugin/vue3-datatable'

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
const userCols = [
  { field: 'given_name', title: 'Name' },
  { field: 'email', title: 'Email' },
  { field: 'organization_role', title: 'Role' },
  { field: 'actions', title: '', width: '2rem', filter: false, sort: false, search: false },
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
  <Alert v-if="loadError" :closeable="true" @close="loadError = null">{{ loadError }}</Alert>
  <Alert v-if="actionError" :closeable="true" @close="actionError = null">{{ actionError }}</Alert>
  <Vue3Datatable :rows="userRows" :columns="userCols" :loading="userLoading" sortColumn="name" :sortable="true"
    :columnFilter="true">
    <template #given_name="data">
      {{ renderUserName(data.value) }}
    </template>
    <template #actions="data">
      <div class="flex gap-1">
        <button label="disconnect" @click.stop="handleRemoveUser(data.value)">
          <Icon class="aspect-square w-3" name="trash-solid" />
        </button>
      </div>
    </template>
  </Vue3Datatable>
</template>
