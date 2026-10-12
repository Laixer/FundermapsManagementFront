<script setup lang="ts">
import { storeToRefs } from 'pinia'

import { useSessionStore } from '@/stores/session.ts'

import AuthWrapper from '@/components/Layout/AuthWrapper.vue'
import Card from '@/components/Common/Card.vue'
import Button from '@/components/Common/Buttons/Button.vue'

// No timer: the session is one cookie shared by every FunderMaps app, so
// signing out here also ends the user's map and Studio tabs. Only on request.
const sessionStore = useSessionStore()
const { currentUser } = storeToRefs(sessionStore)
</script>

<template>
  <AuthWrapper>
    <Card title="No access" title-tag="h1" class="max-w-md">
      <!-- A long e-mail address may break anywhere, so the card still fits a phone. -->
      <p class="wrap-anywhere">
        <template v-if="currentUser">You are signed in as {{ currentUser.email }}.</template>
        This account has no administrator rights, so the admin portal is not available.
      </p>

      <template #footer>
        <div class="flex flex-wrap items-center justify-between gap-3">
          <a
            href="https://maps.fundermaps.com"
            class="text-sm font-semibold text-green-800 hover:underline"
          >
            Go to the map
          </a>
          <Button outline label="Sign out" @click="sessionStore.logoutAndRedirect()" />
        </div>
      </template>
    </Card>
  </AuthWrapper>
</template>
