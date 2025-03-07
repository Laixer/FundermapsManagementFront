<script setup lang="ts">
import { ref, toValue } from 'vue'
import { z, type ZodTypeAny } from 'zod'
import useValidation from '@/services/useValidation'

import Button from '@/components/Common/Buttons/Button.vue'
import AnimatedArrowIcon from '@/components/Common/Icons/AnimatedArrowIcon.vue'
import Alert from '@/components/Common/Alert.vue'

const emit = defineEmits(['saved', 'cancel'])

const props = withDefaults(
  defineProps<{
    formDataHandler: Function
    title?: string
    formData?: Record<string, unknown>
    validationSchema?: ZodTypeAny
    inline?: boolean
  }>(),
  {
    formData: () => {
      return {}
    },
    /**
     * Validation is optional. We can let the API decide what is valid
     */
    validationSchema: () => {
      return z.strictObject({})
    },
    inline: false,
  },
)

const originalFormData = JSON.stringify(props.formData)

const loading = ref(false)
const error = ref(false)
const completed = ref(false)

const formData = ref(props.formData)

// Activate validator
const { validate, isValid, getError, getStatus, scrolltoError, errors, reset } = useValidation(
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

const handleReset = function handleReset() {
  formData.value = JSON.parse(originalFormData)
  reset()
  completed.value = false

  emit('cancel')
}
</script>

<template>
  <div>
    <h6 v-if="title" class="font-bold leading-none">{{ title }}</h6>
    <Alert v-if="error" :closeable="true" class="general__error" @close="error = false">
      Something went wrong while trying to store the record.<br />
      Please try again.
    </Alert>
    <div v-if="completed">
      <Alert :closeable="inline" type="success" @close="handleReset">
        The record has been saved successfully.
      </Alert>
      <div v-if="!inline" class="mt-6 flex justify-end space-x-3">
        <Button type="button" label="Close" outline @click="handleReset" />
      </div>
    </div>

    <form
      v-if="!completed"
      :class="inline ? 'mt-4 flex items-start' : 'mt-4 space-y-4'"
      @submit.prevent="handleSubmit"
    >
      <div v-if="inline" class="grow">
        <slot :formData="formData" :getError="getError" :getStatus="getStatus" :loading="loading" />
      </div>
      <slot
        v-else
        :formData="formData"
        :getError="getError"
        :getStatus="getStatus"
        :loading="loading"
      />

      <div :class="inline ? 'ml-2 flex justify-end pt-7' : 'mt-6 flex justify-end space-x-3'">
        <Button v-if="!inline" type="button" label="Cancel" outline @click="handleReset" />
        <Button type="submit" label="Submit" :disabled="loading">
          <template v-slot:after>
            <AnimatedArrowIcon />
          </template>
        </Button>
      </div>
    </form>
  </div>
</template>
