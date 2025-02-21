import './style.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import { plugin, defaultConfig } from '@formkit/vue'
import config from './formkit.config.ts'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)

// Formkit
app.use(plugin, defaultConfig(config))

app.mount('#app')
