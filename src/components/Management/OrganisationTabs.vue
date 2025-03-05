<script setup lang="ts">
const model = defineModel()

// TODO: Compare classlists & add missing colors from flowbite
const selectedClassList =
  'text-green-600 border-green-600 active group inline-flex items-center justify-center rounded-t-lg border-b-2 p-4 dark:border-green-500 dark:text-green-500'
const unselectedClassList =
  'hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300 group inline-flex items-center justify-center rounded-t-lg border-b-2 border-transparent p-4'

const handleSelectTab = function (tab: string) {
  model.value = tab
}

const tabs = [
  {
    label: 'Users',
    slug: 'users',
  },
  {
    label: 'Mapsets',
    slug: 'mapsets',
  },
]
</script>

<template>
  <div class="border-gray-200 dark:border-gray-700 border-b">
    <ul
      class="text-gray-500 dark:text-gray-400 -mb-px flex flex-wrap text-center text-sm font-medium"
    >
      <li v-for="tab in tabs" class="me-2" :key="tab.slug">
        <a
          href="#"
          :class="model === tab.slug ? selectedClassList : unselectedClassList"
          @click.prevent="handleSelectTab(tab.slug)"
        >
          {{ tab.label }}
        </a>
      </li>
    </ul>
  </div>
</template>
