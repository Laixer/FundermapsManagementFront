<script setup lang="ts">
import { type Ref, ref } from 'vue'
import { z } from 'zod'

import AuthWrapper from '@/components/Layout/AuthWrapper.vue'
import Card from '@/components/Common/Card.vue'
import Button from '@/components/Common/Buttons/Button.vue'
import AnimatedArrowIcon from '@/components/Common/Icons/AnimatedArrowIcon.vue'

import Input from '@/components/Common/Inputs/Input.vue'
import LockedIcon from '@assets/svg/icons/locked.svg'
import UnlockedIcon from '@assets/svg/icons/unlocked.svg'

import useValidation from '@/services/useValidation'

import { useRouter } from 'vue-router'
import { useSessionStore } from '@/stores/session'

const router = useRouter()
const sessionStore = useSessionStore()

/**
 * Form information
 */
const loginFailed: Ref<boolean> = ref(false)
const showPassword: Ref<boolean> = ref(false)
const formData = ref({
  email: '',
  password: '',
})

/**
 * Keeping it simple. Let the API decide what is valid
 */
const validationSchema = z
  .object({
    email: z.string().min(1, 'Email is required.'),
    password: z.string().min(1, 'Password is required.'),
  })
  .strict()

// Activate validator
const { validate, isValid, getError, getStatus, scrolltoError } = useValidation(
  validationSchema,
  formData,
)

/**
 * If we arrived here from Better Auth's OIDC `/api/auth/oauth2/authorize`
 * redirect (Grafana SSO), the original OAuth params live in the URL. After
 * a successful login the browser must be sent back to authorize so BA can
 * read its now-valid session cookie and emit the auth code.
 */
function getOidcReturnUrl(): string | null {
  const params = new URLSearchParams(window.location.search)
  if (!params.has('client_id') || !params.has('redirect_uri')) return null
  const base = (import.meta.env.VITE_FUNDERMAPS_URL || '').replace(/\/+$/, '')
  return `${base}/api/auth/oauth2/authorize?${params.toString()}`
}

/**
 * Handle form submit
 *  TODO: Check for refresh token & Attempt automatic login using refresh token
 */
const handleSubmit = async function () {
  try {
    loginFailed.value = false

    await validate()

    if (!isValid.value) {
      scrolltoError('.validation__message', { offset: 60 })
    } else {
      await sessionStore.login(formData.value.email, formData.value.password)

      const oidcReturn = getOidcReturnUrl()
      if (oidcReturn) {
        window.location.href = oidcReturn
        return
      }

      // TODO: Get previous route before 'Login' & redirect back to that route
      router.push({ name: 'home' })
    }
  } catch (e) {
    console.log(e)
    loginFailed.value = true
  }
}
</script>

<template>
  <AuthWrapper title="Login page for the Fundermaps Application">
    <Card title="Login" shadow rounded wide>
      <div v-if="loginFailed" class="flex justify-between">
        <p class="text-red-500">The email and password combination is incorrect.</p>
      </div>

      <form class="space-y-6" @submit.prevent="handleSubmit">
        <Input
          id="email"
          label="Email"
          type="email"
          v-model="formData.email"
          placeholder="Enter your email"
          autocomplete="username"
          :validationStatus="getStatus('email')"
          :validationMessage="getError('email')"
          :tabindex="1"
          required
        />

        <Input
          id="password"
          label="Password"
          :type="showPassword ? 'text' : 'password'"
          v-model="formData.password"
          placeholder="Enter your password"
          autocomplete="current-password"
          :validationStatus="getStatus('password')"
          :validationMessage="getError('password')"
          :tabindex="2"
          required
        >
          <template #before>
            <button type="button">
              <LockedIcon
                v-show="!showPassword"
                class="aspect-square w-4 text-grey-700"
                aria-hidden="true"
                @click="() => (showPassword = true)"
              />
              <UnlockedIcon
                v-show="showPassword"
                class="aspect-square w-4 text-grey-700"
                aria-hidden="true"
                @click="() => (showPassword = false)"
              />
              <span class="sr-only"> Toggle password visibility </span>
            </button>
          </template>
        </Input>

        <Button type="submit" label="Log in">
          <template v-slot:after>
            <AnimatedArrowIcon />
          </template>
        </Button>
      </form>
    </Card>
  </AuthWrapper>
</template>
