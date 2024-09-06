import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import '@/assets/global.css';  // 引入公共样式文件
import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { fab } from '@fortawesome/free-brands-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

// Add icons to the library
library.add(fas, fab)

// Create and mount the Vue app
const app = createApp(App)
app.component('font-awesome-icon', FontAwesomeIcon) // Register Font Awesome
app.use(router) // Use the router
app.mount('#app')