import { ref } from 'vue'

/**
 * A transient success/status message that clears itself after `timeout` ms.
 * Re-flashing resets the timer; an intervening message won't be cleared by an
 * earlier message's timeout.
 */
export function useFlash(timeout = 3000) {
  const message = ref<string | null>(null)

  const flash = (text: string) => {
    message.value = text
    setTimeout(() => {
      if (message.value === text) message.value = null
    }, timeout)
  }

  const clear = () => {
    message.value = null
  }

  return { message, flash, clear }
}
