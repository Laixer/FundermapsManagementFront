import { fileURLToPath, URL } from 'node:url'
import { execSync } from 'child_process'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import svgLoader from 'vite-svg-loader'

// https://vite.dev/config/
export default defineConfig(() => {
  // Pass latest commit has to process environment
  process.env.VITE_GIT_COMMIT_HASH = '0' // execSync('git rev-parse --short HEAD').toString().trimEnd()

  return {
    plugins: [vue(), vueDevTools(), svgLoader()],
    resolve: {
      alias: {
        '@assets': fileURLToPath(new URL('./src/assets', import.meta.url)),
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  }
})
