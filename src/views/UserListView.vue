<script setup lang="ts">
import { computed, ref, type Ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

import Card from '@/components/Common/Card.vue'
import Button from '@/components/Common/Buttons/Button.vue'
import MainWrapper from '@/components/Layout/MainWrapper.vue'
import Drawer from '@/components/Layout/Drawer.vue'
import CreateUserForm from '@/components/Management/Forms/CreateUserForm.vue'
import CopyToClipboardIcon from '@/components/Common/Icons/CopyToClipboardIcon.vue'
import Icon from '@/components/Common/Icons/Icon.vue'
import Alert from '@/components/Common/Alert.vue'
import Badge from '@/components/Common/Badge.vue'
import MonoBadge from '@/components/Common/MonoBadge.vue'
import ListRow from '@/components/Common/ListRow.vue'
import Skeleton from '@/components/Common/Skeleton.vue'
import Input from '@/components/Common/Inputs/Input.vue'
import Select from '@/components/Common/Inputs/Select.vue'
import PlusIcon from '@assets/svg/icons/plus.svg?component'

import {
  createAPIKey,
  deleteAPIKey,
  deleteUser,
  getAPIKeys,
  getAllUsers,
  getUser,
  updateUserRole,
  USERS_LIST_LIMIT,
} from '@/services/fundermaps/endpoints/management/user.ts'
import type { IUser } from '@/services/fundermaps/interfaces/IUser.ts'
import { getInitials, renderUserName } from '@/utils/user'
import { formatDate } from '@/utils/date'
import { useFlash } from '@/composables/useFlash'
import { useListResource } from '@/composables/useListResource'
import { getErrorMessage } from '@/services/fundermaps/errors'
import UserResetPassword from '@/components/Management/Forms/UserResetPassword.vue'
import EditUserForm from '@/components/Management/Forms/EditUserForm.vue'

const showCreate = ref(false)
const showEdit = ref(false)
const actionError = ref<string | null>(null)
const { message: actionSuccess, flash: flashSuccess } = useFlash()
const newApiKey = ref<string | null>(null)
const deleting = ref(false)
const generatingKey = ref(false)
const createdUser = ref<{
  email: string
  password: string
  organisation: string
  role: string
} | null>(null)

interface IAuthKey {
  id: string
  user_id: string
  name: string | null
  last_used: string | null
}

const apiKeys: Ref<IAuthKey[]> = ref([])

const route = useRoute()
const router = useRouter()

const {
  rows,
  loading,
  error,
  search,
  record,
  filteredRows,
  refresh: refreshList,
  select: handleSelect,
  selectFirst: selectFirstRow,
} = useListResource<IUser>({
  fetch: getAllUsers,
  filter: (u, q) => {
    const name = renderUserName(u).toLowerCase()
    return (
      u.email.toLowerCase().includes(q) ||
      name.includes(q) ||
      u.id.toLowerCase().includes(q) ||
      (u.role ?? '').toLowerCase().includes(q)
    )
  },
  onSelect: () => {
    showCreate.value = false
    showEdit.value = false
    actionError.value = null
    actionSuccess.value = null
    newApiKey.value = null
    createdUser.value = null
    apiKeys.value = []
  },
  resolve: async (row) => {
    const [user, keys] = await Promise.all([getUser(row.id), getAPIKeys(row.id)])
    apiKeys.value = keys
    return user
  },
  routeId: () => (typeof route.params.id === 'string' ? route.params.id : undefined),
  syncRoute: (id) => router.replace({ name: 'users', params: { id }, query: route.query }),
})

const drawerMode = computed<'create' | 'created' | 'edit' | 'details' | null>(() => {
  if (showCreate.value) return 'create'
  if (createdUser.value) return 'created'
  if (record.value && showEdit.value) return 'edit'
  if (record.value) return 'details'
  return null
})

const handleOpenCreate = function () {
  showEdit.value = false
  createdUser.value = null
  showCreate.value = true
}

const handleEdit = function () {
  showCreate.value = false
  createdUser.value = null
  showEdit.value = true
}

const handleUserCreated = function (credentials: {
  email: string
  password: string
  organisation: string
  role: string
}) {
  createdUser.value = credentials
  showCreate.value = false
}

const handleDismissForm = function () {
  showCreate.value = false
  showEdit.value = false
  actionError.value = null
  actionSuccess.value = null
  newApiKey.value = null
  createdUser.value = null
  if (!record.value) selectFirstRow()
}

const handleCreateAPIKey = async function () {
  if (!record.value) return
  if (!confirm('Generate a new API key for this user?')) return

  try {
    generatingKey.value = true
    actionError.value = null
    const response = await createAPIKey(record.value.id)
    apiKeys.value = await getAPIKeys(record.value.id)
    newApiKey.value = response.key
  } catch (e) {
    actionError.value = getErrorMessage(e) ?? 'Failed to generate API key.'
  } finally {
    generatingKey.value = false
  }
}

const handleDeleteAPIKey = async function (id: string) {
  if (!record.value) return
  if (!confirm('Delete this API key? This cannot be undone.')) return

  try {
    actionError.value = null
    await deleteAPIKey(record.value.id, id)
    apiKeys.value = await getAPIKeys(record.value.id)
    flashSuccess('API key deleted.')
  } catch (e) {
    actionError.value = getErrorMessage(e) ?? 'Failed to delete API key.'
  }
}

const handleDelete = async function () {
  if (!record.value) return
  if (!confirm(`Delete user "${record.value.email}"? This cannot be undone.`)) return

  try {
    deleting.value = true
    actionError.value = null
    await deleteUser(record.value.id)
    record.value = null
    showEdit.value = false
    await refreshList()
    selectFirstRow()
  } catch (e) {
    actionError.value = getErrorMessage(e) ?? 'Failed to delete user.'
  } finally {
    deleting.value = false
  }
}

const handleRoleChange = async function (newRole: string) {
  if (!record.value) return
  try {
    actionError.value = null
    await updateUserRole(record.value.id, newRole)
    const [fresh] = await Promise.all([getUser(record.value.id), refreshList()])
    record.value = fresh
    flashSuccess('Role updated.')
  } catch (e) {
    actionError.value = getErrorMessage(e) ?? 'Failed to update user role.'
  }
}
</script>

<template>
  <MainWrapper>
    <header class="mb-4 flex items-end justify-between gap-4">
      <div>
        <h2 class="text-xl font-semibold text-grey-800">Users</h2>
        <p class="mt-0.5 text-sm text-grey-700">Manage accounts, roles and API keys.</p>
      </div>
      <Button lg label="Add user" @click="handleOpenCreate">
        <template #before>
          <PlusIcon class="aspect-square h-4 w-4" aria-hidden="true" />
        </template>
      </Button>
    </header>

    <div class="mb-3 flex items-center gap-3">
      <div class="w-72">
        <Input
          id="user-search"
          v-model="search"
          type="search"
          placeholder="Search by name, email, ID or role…"
        />
      </div>
      <span class="text-xs text-grey-700">{{ filteredRows.length }} of {{ rows.length }}</span>
    </div>

    <Alert v-if="error" :closeable="true" class="mb-3" @close="error = false">
      An error occurred while trying to retrieve the list of users.
    </Alert>
    <Alert v-if="rows.length >= USERS_LIST_LIMIT" type="warning" class="mb-3">
      Showing the first {{ USERS_LIST_LIMIT }} users — additional users are not loaded.
    </Alert>

    <Card class="!p-0">
      <template v-if="loading">
        <div
          v-for="n in 6"
          :key="`skeleton-${n}`"
          class="flex items-center gap-4 border-b border-grey-200 px-4 py-3 last:border-b-0"
        >
          <Skeleton width="2.25rem" height="2.25rem" rounded="rounded-md" />
          <div class="flex flex-1 flex-col gap-1.5">
            <Skeleton width="40%" />
            <Skeleton width="60%" height="0.7rem" />
          </div>
        </div>
      </template>
      <div v-else-if="!filteredRows.length" class="px-4 py-6 text-sm text-grey-700">
        No users match your search.
      </div>
      <ListRow
        v-for="user in filteredRows"
        :key="user.id"
        :selected="record?.id === user.id"
        @select="handleSelect(user)"
      >
        <template #lead>
          <span
            class="inline-flex h-9 w-9 items-center justify-center rounded-md bg-grey-100 text-xs font-bold text-grey-800"
            aria-hidden="true"
          >
            {{ getInitials(user) }}
          </span>
        </template>

        <div class="flex flex-col gap-0.5">
          <div class="flex items-center gap-2">
            <span class="truncate font-semibold text-grey-800">
              {{ renderUserName(user) || user.email }}
            </span>
            <Badge :variant="user.role === 'administrator' ? 'info' : 'default'">
              {{ user.role }}
            </Badge>
          </div>
          <div class="text-xs text-grey-700">
            <span class="truncate">{{ user.email }}</span>
          </div>
        </div>
      </ListRow>
    </Card>

    <template #aside>
      <Drawer>
        <template #title>
          <template v-if="drawerMode === 'create'">New user</template>
          <template v-else-if="drawerMode === 'created'">User created</template>
          <template v-else-if="drawerMode === 'edit'">Edit {{ record?.email }}</template>
          <template v-else>User information</template>
        </template>

        <template v-if="drawerMode === 'details'" #actions>
          <Button outline label="Edit" :disabled="deleting" @click="handleEdit" />
          <Button danger label="Delete" :loading="deleting" @click="handleDelete" />
        </template>

        <!-- Create -->
        <CreateUserForm
          v-if="drawerMode === 'create'"
          @cancel="handleDismissForm"
          @saved="refreshList"
          @created="handleUserCreated"
          @close="handleDismissForm"
        />

        <!-- Credentials reveal -->
        <Alert v-else-if="drawerMode === 'created' && createdUser" type="success">
          <div class="mb-3 font-medium">
            Copy these credentials now — the password won't be shown again.
          </div>
          <dl class="space-y-3 text-sm">
            <div class="flex items-center justify-between gap-2">
              <div class="min-w-0">
                <dt class="text-xs uppercase tracking-wide text-grey-700">Email</dt>
                <dd><code class="select-all break-all font-mono">{{ createdUser.email }}</code></dd>
              </div>
              <CopyToClipboardIcon :value="createdUser.email" />
            </div>
            <div class="flex items-center justify-between gap-2">
              <div class="min-w-0">
                <dt class="text-xs uppercase tracking-wide text-grey-700">Password</dt>
                <dd>
                  <code class="select-all break-all font-mono">{{ createdUser.password }}</code>
                </dd>
              </div>
              <CopyToClipboardIcon :value="createdUser.password" />
            </div>
          </dl>
          <p class="mt-3 text-grey-700">
            Added to <span class="font-medium">{{ createdUser.organisation }}</span> as
            <span class="font-medium">{{ createdUser.role }}</span>.
          </p>
          <div class="mt-4 flex justify-end">
            <Button outline label="Done" @click="handleDismissForm" />
          </div>
        </Alert>

        <!-- Edit -->
        <EditUserForm
          v-else-if="drawerMode === 'edit' && record"
          :record="record"
          @cancel="handleDismissForm"
          @saved="refreshList"
          @close="handleDismissForm"
        />

        <!-- Details -->
        <div v-else-if="drawerMode === 'details' && record" class="space-y-5">
          <Alert v-if="actionError" :closeable="true" @close="actionError = null">
            {{ actionError }}
          </Alert>
          <Alert v-if="actionSuccess" type="success" :closeable="true" @close="actionSuccess = null">
            {{ actionSuccess }}
          </Alert>

          <dl class="grid grid-cols-[8rem_1fr] gap-x-4 gap-y-2 text-sm">
            <dt class="text-grey-700">ID</dt>
            <dd><MonoBadge :value="record.id" /></dd>
            <dt class="text-grey-700">Email</dt>
            <dd class="text-grey-800">{{ record.email }}</dd>
            <dt class="text-grey-700">Name</dt>
            <dd class="text-grey-800">{{ renderUserName(record) || '—' }}</dd>
            <dt class="text-grey-700">Phone</dt>
            <dd class="text-grey-800">{{ record.phone_number || '—' }}</dd>
            <dt class="text-grey-700">Job title</dt>
            <dd class="text-grey-800">{{ record.job_title || '—' }}</dd>
            <dt class="text-grey-700">Created</dt>
            <dd class="text-grey-800">{{ formatDate(record.created_at ?? null) }}</dd>
            <dt class="text-grey-700">Updated</dt>
            <dd class="text-grey-800">{{ formatDate(record.updated_at ?? null) }}</dd>
          </dl>

          <section class="border-t border-grey-200 pt-5">
            <h6 class="mb-2 text-xs font-semibold uppercase tracking-wide text-grey-700">
              Organisations
            </h6>
            <div v-if="!record.organizations?.length" class="text-xs text-grey-700">
              Not a member of any organisation.
            </div>
            <div v-else class="overflow-hidden rounded-md border border-grey-200">
              <div
                v-for="org in record.organizations"
                :key="org.id"
                class="flex items-center justify-between gap-3 border-b border-grey-200 px-3 py-2 text-sm last:border-b-0 hover:bg-grey-100"
              >
                <span class="min-w-0 flex-1 truncate font-medium text-grey-800">{{ org.name }}</span>
                <Badge v-if="org.role" :variant="org.role === 'superuser' ? 'info' : 'default'">
                  {{ org.role }}
                </Badge>
                <MonoBadge :value="org.id" />
              </div>
            </div>
          </section>

          <section class="border-t border-grey-200 pt-5">
            <h6 class="mb-2 text-xs font-semibold uppercase tracking-wide text-grey-700">
              Sessions
            </h6>
            <RouterLink
              :to="{ name: 'sessions', query: { user_id: record.id } }"
              class="text-sm font-medium text-green-700 hover:text-green-800"
            >
              View active sessions →
            </RouterLink>
          </section>

          <section class="border-t border-grey-200 pt-5">
            <h6 class="mb-2 text-xs font-semibold uppercase tracking-wide text-grey-700">Role</h6>
            <Select
              id="role"
              :options="[
                { label: 'User', value: 'user' },
                { label: 'Administrator', value: 'administrator' },
              ]"
              :modelValue="record.role"
              @update:modelValue="handleRoleChange"
            />
          </section>

          <section class="border-t border-grey-200 pt-5">
            <h6 class="mb-2 text-xs font-semibold uppercase tracking-wide text-grey-700">
              Password
            </h6>
            <UserResetPassword :record="record" />
          </section>

          <section class="border-t border-grey-200 pt-5">
            <div class="mb-2 flex items-center justify-between">
              <h6 class="text-xs font-semibold uppercase tracking-wide text-grey-700">
                API keys
              </h6>
              <Button outline label="Generate" :loading="generatingKey" @click="handleCreateAPIKey" />
            </div>
            <Alert
              v-if="newApiKey"
              type="success"
              :closeable="true"
              class="mb-3"
              @close="newApiKey = null"
            >
              <div class="mb-2 font-medium">
                New API key generated — copy it now, it won't be shown again.
              </div>
              <div class="flex items-center gap-2">
                <code class="select-all break-all font-mono">{{ newApiKey }}</code>
                <CopyToClipboardIcon :value="newApiKey" />
              </div>
            </Alert>
            <div v-if="!apiKeys.length" class="text-xs text-grey-700">No API keys yet.</div>
            <div v-else class="overflow-hidden rounded-md border border-grey-200">
              <div
                v-for="key in apiKeys"
                :key="key.id"
                class="flex items-center justify-between gap-3 border-b border-grey-200 px-3 py-2 text-sm last:border-b-0 hover:bg-grey-100"
              >
                <div class="min-w-0 flex-1">
                  <div class="truncate font-medium text-grey-800">{{ key.name || key.id }}</div>
                  <div class="text-xs text-grey-700">Last used: {{ key.last_used ?? '—' }}</div>
                </div>
                <button
                  type="button"
                  class="inline-flex h-7 w-7 items-center justify-center rounded text-grey-700 transition-colors hover:bg-red-50 hover:text-red-500"
                  :aria-label="`Delete API key ${key.name || key.id}`"
                  title="Delete API key"
                  @click.stop="handleDeleteAPIKey(key.id)"
                >
                  <Icon class="aspect-square w-3" name="trash-solid" />
                </button>
              </div>
            </div>
          </section>
        </div>

        <div
          v-else
          class="flex h-full items-center justify-center text-center text-sm text-grey-700"
        >
          No users to display.
        </div>
      </Drawer>
    </template>
  </MainWrapper>
</template>
