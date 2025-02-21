<script setup lang="ts">
import { useSessionStore } from '@/stores/session.ts'
import { onBeforeUnmount } from 'vue'

import AuthWrapper from '@/components/Layout/AuthWrapper.vue'
import Card from '@/components/Common/Card.vue'

const { logoutAndRedirect, logout } = useSessionStore()

let timeOut: ReturnType<typeof setTimeout> | null = setTimeout(() => {
  timeOut = null

  logoutAndRedirect()
}, 10 * 1000)

onBeforeUnmount(() => {
  if (timeOut !== null) {
    clearTimeout(timeOut)
    timeOut = null

    logout()
  }
})
</script>

<template>
  <AuthWrapper title="Inlogpagina voor de Fundermaps Applicatie">
    <Card title="No access" shadow rounded wide>
      You do not have the required permissions. You will be automatically logged out and redirected
      in 10 seconds.
    </Card>
  </AuthWrapper>
</template>
