<script setup lang="ts">
import { ref } from 'vue'
import Button from '@/components/Common/Buttons/Button.vue'
import { createOrganisation } from '@/services/fundermaps/endpoints/management/organisation.ts'

const emit = defineEmits(['saved', 'cancel'])

const name = ref('')
const loading = ref(false)
const error = ref('')

const handleSubmit = async () => {
  if (!name.value.trim()) {
    error.value = 'Organisation name is required'
    return
  }

  try {
    loading.value = true
    await createOrganisation(name.value)
    emit('saved')
  } catch (e) {
    error.value = 'Failed to create organisation'
    console.error('Error creating organisation:', e)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="space-y-4">
    <div class="form-group">
      <label for="name" class="text-gray-700 block text-sm font-medium">Organisation Name *</label>
      <input
        id="name"
        v-model="name"
        type="text"
        class="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none sm:text-sm"
        :class="{ 'border-red-500': error }"
      />
      <p v-if="error" class="text-red-600 mt-1 text-sm">{{ error }}</p>
    </div>

    <div class="mt-6 flex justify-end space-x-3">
      <Button type="button" label="Cancel" outline @click="emit('cancel')" />
      <Button type="submit" label="Save" :loading="loading" />
    </div>
  </form>
</template>
