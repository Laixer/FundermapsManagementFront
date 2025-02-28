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
      <label for="name" class="block text-sm font-medium text-gray-700">Organisation Name *</label>
      <input
        id="name"
        v-model="name"
        type="text"
        class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
        :class="{ 'border-red-500': error }"
      />
      <p v-if="error" class="mt-1 text-sm text-red-600">{{ error }}</p>
    </div>

    <div class="mt-6 flex justify-end space-x-3">
      <Button type="button" label="Cancel" outline @click="emit('cancel')" />
      <Button type="submit" label="Save" :loading="loading" />
    </div>
  </form>
</template>
