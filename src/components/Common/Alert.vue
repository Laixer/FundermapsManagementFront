<script setup lang="ts">
const emit = defineEmits(['close'])
const props = withDefaults(
  defineProps<{
    type?: string
    closeable?: boolean
  }>(),
  {
    type: 'danger',
    closeable: false,
  },
)

// Danger
// border classes: border border-green-300 dark:border-green-800
const classList =
  props.type === 'danger'
    ? ['text-red-800', 'bg-red-50', 'dark:text-red-400']
    : ['text-green-800', 'bg-green-50', 'dark:text-green-400']

const btnClassList =
  props.type === 'danger'
    ? ['bg-red-50', 'focus:ring-red-400', 'hover:bg-red-200', 'dark:text-red-400', 'text-red-500']
    : [
        'bg-green-50',
        'focus:ring-green-400',
        'hover:bg-green-200',
        'dark:text-green-400',
        'text-green-500',
      ]
</script>

<template>
  <div
    class="dark:bg-gray-800 mb-4 flex items-center rounded-lg p-4 text-sm"
    role="alert"
    :class="classList"
  >
    <svg
      class="me-3 inline h-4 w-4 shrink-0"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      viewBox="0 0 20 20"
    >
      <path
        d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z"
      />
    </svg>
    <span class="sr-only">Info</span>
    <div>
      <slot />
    </div>
    <button
      v-if="closeable"
      type="button"
      class="dark:bg-gray-800 dark:hover:bg-gray-700 -mx-1.5 -my-1.5 ms-auto inline-flex h-8 w-8 items-center justify-center rounded-lg p-1.5 focus:ring-2"
      :class="btnClassList"
      data-dismiss-target="#alert-1"
      aria-label="Close"
      @click="emit('close')"
    >
      <span class="sr-only">Close</span>
      <svg
        class="h-3 w-3"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 14 14"
      >
        <path
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
        />
      </svg>
    </button>
  </div>
</template>
