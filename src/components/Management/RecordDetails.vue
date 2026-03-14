<script setup lang="ts">
defineProps({
  title: { type: String, default: 'Record information' },
  record: { type: [Object, null] },
})

function formatLabel(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}
</script>

<template>
  <div v-if="record" class="space-y-3">
    <h6 class="font-bold leading-none">{{ title }}</h6>
    <dl class="space-y-3">
      <div v-for="prop in Object.keys(record || {})" :key="prop">
        <dt>{{ formatLabel(prop) }}</dt>
        <dd class="text-grey-700">
          {{ record?.[prop as keyof typeof record] || '-' }}
        </dd>
      </div>
    </dl>
  </div>
</template>
