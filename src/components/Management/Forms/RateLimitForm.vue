<script setup lang="ts">
import { computed, ref } from 'vue'
import { z } from 'zod'

import Input from '@/components/Common/Inputs/Input.vue'
import Select from '@/components/Common/Inputs/Select.vue'
import FormCard from '@/components/Management/FormCard.vue'

import {
  RATE_LIMIT_PERIODS,
  RATE_LIMIT_PRODUCTS,
  upsertRateLimit,
} from '@/services/fundermaps/endpoints/management/rate-limit'
import type {
  IRateLimit,
  IRateLimitKey,
  RateLimitPeriod,
  RateLimitSource,
} from '@/services/fundermaps/interfaces/IRateLimit'

// Handles both create (pick a key + product) and edit (key + product locked,
// only period + limit change — they're the table's primary key). Upsert is
// idempotent server-side, so a single endpoint covers both.
const props = defineProps<{
  keys: IRateLimitKey[]
  record?: IRateLimit | null
}>()
const emit = defineEmits(['saved', 'cancel'])

const isEdit = computed(() => !!props.record)

const keyOptions = computed(() =>
  props.keys.map((k) => ({
    value: `${k.source}:${k.api_key_id}`,
    label: `${k.organization_name ?? 'No organisation'} — ${k.name ?? k.api_key_id} (${k.source})`,
  })),
)

const productOptions = RATE_LIMIT_PRODUCTS.map((p) => ({ value: p, label: p }))
const periodOptions = RATE_LIMIT_PERIODS.map((p) => ({
  value: p,
  label: p === 'day' ? 'Per day' : 'Per month',
}))

const formModel = ref({
  // `source:api_key_id` so a single select round-trips both fields.
  keyRef: props.record ? `${props.record.source}:${props.record.api_key_id}` : '',
  product: props.record?.product ?? RATE_LIMIT_PRODUCTS[0],
  period: (props.record?.period ?? 'month') as RateLimitPeriod,
  limit_count: props.record?.limit_count ?? 1000,
})

const validationSchema = z
  .object({
    keyRef: z.string().min(1, 'Select an API key.'),
    product: z.string().min(1, 'Select a product.'),
    period: z.string().min(1, 'Select a period.'),
    limit_count: z.coerce
      .number({ message: 'Enter a number.' })
      .int('Whole numbers only.')
      .min(0, 'Must be 0 or more.'),
  })
  .strict()

const formHandler = async function (data: {
  keyRef: string
  product: string
  period: RateLimitPeriod
  limit_count: number | string
}) {
  const sep = data.keyRef.indexOf(':')
  const source = data.keyRef.slice(0, sep) as RateLimitSource
  const apiKeyId = data.keyRef.slice(sep + 1)

  await upsertRateLimit({
    api_key_id: apiKeyId,
    source,
    product: data.product,
    period: data.period,
    limit_count: Number(data.limit_count),
  })
  emit('saved')
}
</script>

<template>
  <FormCard
    :form-data="formModel"
    :validation-schema="validationSchema"
    :formDataHandler="formHandler"
    @cancel="emit('cancel')"
    v-slot="{ formData, getStatus, getError, loading }"
  >
    <Select
      id="rate-limit-key"
      label="API key"
      :options="keyOptions"
      v-model="formData.keyRef"
      :validationStatus="getStatus('keyRef')"
      :validationMessage="getError('keyRef')"
      :disabled="loading || isEdit"
      :instruction="
        isEdit ? 'The key cannot be changed — delete and recreate to move the limit.' : undefined
      "
      :tabindex="1"
      required
    />
    <Select
      id="rate-limit-product"
      label="Product"
      :options="productOptions"
      v-model="formData.product"
      :validationStatus="getStatus('product')"
      :validationMessage="getError('product')"
      :disabled="loading || isEdit"
      :tabindex="2"
      required
    />
    <Select
      id="rate-limit-period"
      label="Window"
      :options="periodOptions"
      v-model="formData.period"
      :validationStatus="getStatus('period')"
      :validationMessage="getError('period')"
      :disabled="loading"
      :tabindex="3"
      required
    />
    <Input
      id="rate-limit-count"
      label="Limit (billable events per window)"
      type="number"
      v-model="formData.limit_count"
      :validationStatus="getStatus('limit_count')"
      :validationMessage="getError('limit_count')"
      :disabled="loading"
      instruction="Counted per organisation, not per key. 0 blocks all calls."
      :tabindex="4"
      required
    />
  </FormCard>
</template>
