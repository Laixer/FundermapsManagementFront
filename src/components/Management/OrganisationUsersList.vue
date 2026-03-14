<script setup lang="ts">
import { ref, watch, type Ref } from 'vue'

// @ts-expect-error TODO: PR to fix TS
import Vue3Datatable from '@bhplugin/vue3-datatable'

import type { IUser } from '@/services/fundermaps/interfaces/IUser.ts'
import type { IOrg } from '@/services/fundermaps/endpoints/management/organisation.ts'

import {
  getAllOrganisationUsers,
  removeUserFromOrganisation,
} from '@/services/fundermaps/endpoints/management/organisation.ts'
import Icon from '@/components/Common/Icons/Icon.vue'

const props = defineProps<{
  record: IOrg | null
}>()

const userLoading = ref(false)
const userCols = [
  { field: 'given_name', title: 'Name' },
  { field: 'email', title: 'Email' },
  { field: 'actions', width: '2rem', filter: false, sort: false, search: false },
]
const userRows: Ref<IUser[]> = ref([])

const refresh = async function () {
  if (props.record) {
    try {
      userLoading.value = true
      userRows.value = await getAllOrganisationUsers(props.record.id)
    } catch (e) {
      console.error(e)
    } finally {
      userLoading.value = false
    }
  }
}

watch(() => props.record, refresh, { immediate: true })

defineExpose({ refresh })

const renderName = function (data: IUser) {
  if (data.given_name && data.family_name) {
    return `${data.given_name} ${data.family_name}`
  }
  if (data.given_name) {
    return data.given_name
  }
  if (data.family_name) {
    return data.family_name
  }
  return ''
}

const handleRemoveUser = async function (row: IUser) {
  if (!props.record) {
    return
  }

  const confirmed = confirm(
    `Confirm removing ${renderName(row) || row.email} from ${props.record.name}`,
  )

  if (confirmed) {
    await removeUserFromOrganisation(props.record.id, row.id)
    await refresh()
  }
}
</script>

<template>
  <Vue3Datatable :rows="userRows" :columns="userCols" :loading="userLoading" sortColumn="name" :sortable="true"
    :columnFilter="true">
    <template #given_name="data">
      {{ renderName(data.value) }}
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
