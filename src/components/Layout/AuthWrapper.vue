<script setup lang="ts">
/**
 * This is the wrapper for all login pages
 */
import ColoredLogo from '@/components/Branding/ColoredLogo.vue'
</script>

<template>
  <!-- Fills the window with the card in the middle. The vertical padding is
       taller than the logo in the corner, so the card never ends up under it. -->
  <div class="page-no-session | relative grid min-h-screen place-content-center px-6 py-28">
    <ColoredLogo />

    <slot />
  </div>
</template>

<style>
.page-no-session {
  background-image: url('@assets/images/background.jpg');
}
</style>
