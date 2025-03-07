<script setup lang="ts">
import { computed } from 'vue'
import { type ZodIssue } from 'zod'

export interface SelectOption {
  value: string | number | boolean
  label: string
}

const props = withDefaults(
  defineProps<{
    id?: string
    label?: string
    options?: SelectOption[]
    instruction?: string
    required?: boolean
    disabled?: boolean
    validationStatus?: 'none' | 'success' | 'error'
    validationMessage?: ZodIssue[] | string
    tabindex?: number
  }>(),
  {
    type: 'text',
    required: false,
    disabled: false,
    validationStatus: 'none',
  },
)

const model = defineModel()
const emit = defineEmits(['focus'])

/**
 * Specifying an identifier is recommended, but if no identifier is provided, we can generate one.
 */
const identifier = computed<string>(() => {
  return props.id ?? `input-${window?.crypto?.randomUUID()}`
})

// Make the disabled prop reactive
const isDisabled = computed<boolean>(() => !!props.disabled)
</script>

<template>
  <div class="input--select">
    <label v-if="label" :for="identifier" class="input__label"> {{ label }}</label>
    <div v-if="instruction" class="input__message">{{ instruction }}</div>
    <div class="input-field" :data-validation="validationStatus">
      <div v-if="$slots.before" class="input-field__before">
        <slot name="before" />
      </div>
      <select
        :name="identifier"
        :id="identifier"
        :required="required"
        :disabled="isDisabled"
        :tabindex="tabindex"
        v-model="model"
        @focus="emit('focus')"
      >
        <option v-for="(option, index) in options" :key="`option_${index}`" :value="option.value">
          {{ option.label }}
        </option>
      </select>

      <div v-if="$slots.after" class="input-field__after">
        <slot name="after" />
      </div>
    </div>
    <div
      v-if="validationMessage && validationStatus !== 'none'"
      class="input__message | validation__message"
      :data-variant="validationStatus"
    >
      {{ validationMessage }}
    </div>
  </div>
</template>
