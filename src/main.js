import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'

// 引入 Vant 组件库
import Vant from 'vant'
import 'vant/lib/index.css'

// 引入全局样式
import './styles/index.scss'

// 在桌面端模拟移动端触摸
import '@vant/touch-emulator'

// 引入认证store
import { useAuthStore } from './stores/auth'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(Vant)

// 检查认证状态
const authStore = useAuthStore()
authStore.checkAuthStatus()

app.mount('#app')