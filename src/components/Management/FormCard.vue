<script setup lang="ts">
import { ref, toValue } from 'vue'
import { z, type ZodTypeAny } from 'zod'
import useValidation from '@/services/useValidation'

import Button from '@/components/Common/Buttons/Button.vue'
import CloseBtn from '@/components/Common/Buttons/CloseBtn.vue'
import Card from '@/components/Common/Card.vue'
import AnimatedArrowIcon from '@/components/Common/Icons/AnimatedArrowIcon.vue'
import Alert from '@/components/Common/Alert.vue'

const emit = defineEmits(['saved', 'cancel'])

const props = withDefaults(
  defineProps<{
    formDataHandler: Function
    title?: string
    formData?: Record<string, unknown>
    validationSchema?: ZodTypeAny
  }>(),
  {
    title: '',
    formData: () => {
      return {}
    },
    /**
     * Validation is optional. We can let the API decide what is valid
     */
    validationSchema: () => {
      return z.strictObject({})
    },
  },
)

const loading = ref(false)
const error = ref(false)
const completed = ref(false)

const formData = ref(props.formData)

// Activate validator
const { validate, isValid, getError, getStatus, scrolltoError, errors } = useValidation(
  props.validationSchema,
  formData,
)

const handleSubmit = async function () {
  try {
    console.log('Submit')
    loading.value = true
    error.value = false

    await validate()

    if (!isValid.value) {
      console.log('is not valid')
      console.log(formData.value, errors)

      scrolltoError('.validation__message', { offset: 200 })
    } else {
      console.log('is valid')
      await props.formDataHandler(toValue(formData))

      completed.value = true
      emit('saved')
    }
  } catch (e) {
    error.value = true
    console.error(e)
    scrolltoError('.general__error', { offset: 200 })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <Card class="Details col-span-1">
    <div class="flex items-center justify-between">
      <h3 class="text-lg font-bold">{{ title }}</h3>
      <CloseBtn label="close" @click="emit('cancel')" />
    </div>
    <Alert class="general__error" v-if="error">
      Something went wrong while trying to store the record.<br />
      Please try again.
    </Alert>
    <div v-if="completed">
      <Alert type="success">The record has been saved successfully.</Alert>
      <div class="mt-6 flex justify-end space-x-3">
        <Button type="button" label="Close" outline @click="emit('cancel')" />
      </div>
    </div>
    <form v-if="!completed" @submit.prevent="handleSubmit" class="mt-4 space-y-4">
      <slot :formData="formData" :getError="getError" :getStatus="getStatus" :loading="loading" />

      <div class="mt-6 flex justify-end space-x-3">
        <Button type="button" label="Cancel" outline @click="emit('cancel')" />
        <Button type="submit" label="Submit" :disabled="loading">
          <template v-slot:after>
            <AnimatedArrowIcon />
          </template>
        </Button>
      </div>
    </form>
  </Card>
</template>
