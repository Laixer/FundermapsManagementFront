<script setup lang="ts">
const model = defineModel()

const selectedClassList =
  'text-green-500 border-green-500 active group inline-flex items-center justify-center rounded-t-lg border-b-2 p-4'
const unselectedClassList =
  'text-grey-700 hover:text-grey-800 hover:border-grey-400 group inline-flex items-center justify-center rounded-t-lg border-b-2 border-transparent p-4'

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
  {
    label: 'Geolock',
    slug: 'geolock',
  },
]
</script>

<template>
  <div class="border-grey-200 border-b">
    <ul class="-mb-px flex flex-wrap text-center text-sm font-medium text-grey-700">
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
