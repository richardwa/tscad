import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'

import App from './App.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/raymarch/:file',
      component: import('./views/RayMarcher.vue')
    }
  ]
})

const app = createApp(App)

app.use(router)

app.mount('#app')
