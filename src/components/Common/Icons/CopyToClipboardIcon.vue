<script setup lang="ts">
import Icon from '@/components/Common/Icons/Icon.vue'
import { useClipboard } from '@vueuse/core'

const { copy, isSupported, copied, text } = useClipboard()

defineProps<{
  value: string
}>()
</script>

<template>
  <button v-if="isSupported" @click.stop="copy(value)">
    <Transition mode="out-in">
      <Icon class="aspect-square w-3" v-if="copied && text === value" name="check" />
      <Icon class="aspect-square w-3" v-else name="clipboard-regular" />
    </Transition>
  </button>
</template>
