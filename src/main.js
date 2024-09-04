import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import '@/assets/global.css';  // 引入公共样式文件

createApp(App).use(router).mount('#app');