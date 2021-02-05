import { createApp } from 'vue'
import { sync } from '../../src'
import { router } from './router'
import { store } from './store'
import App from './App.vue'

sync(store, router)

createApp(App)
  .use(router)
  .use(store)
  .mount('#app')
