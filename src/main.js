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

// 创建Vue应用实例
const app = createApp(App)
const pinia = createPinia()

// 全局错误处理
app.config.errorHandler = (error, instance, info) => {
  console.error('全局错误捕获:', error)
  console.error('错误组件实例:', instance)
  console.error('错误信息:', info)
  
  // 在开发环境中显示详细错误信息
  if (import.meta.env.DEV) {
    alert(`应用错误: ${error.message}`)
  } else {
    // 在生产环境中记录错误到控制台
    console.error('应用运行错误:', error.message)
  }
}

// 添加全局错误监听
window.addEventListener('error', (event) => {
  console.error('页面错误:', event.error)
})

// 添加未处理的Promise错误监听
window.addEventListener('unhandledrejection', (event) => {
  console.error('未处理的Promise错误:', event.reason)
})

// 添加插件
app.use(pinia)
app.use(router)
app.use(Vant)

// 检查认证状态
const authStore = useAuthStore()

// 打印环境变量信息（注意：在生产环境中不要打印敏感信息）
console.log('当前环境:', import.meta.env.MODE)
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL ? '已设置' : '未设置')

// 在挂载前检查环境变量
if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.error('环境变量未正确设置，请检查 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY')
  
  // 在开发环境中显示错误信息
  if (import.meta.env.DEV) {
    const errorDiv = document.createElement('div')
    errorDiv.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      font-family: Arial, sans-serif;
      text-align: center;
      padding: 20px;
      box-sizing: border-box;
    `
    errorDiv.innerHTML = `
      <div>
        <h2>环境变量未设置</h2>
        <p>请确保已设置以下环境变量：</p>
        <p>VITE_SUPABASE_URL</p>
        <p>VITE_SUPABASE_ANON_KEY</p>
        <p>请检查 .env 文件或 Vercel 项目设置</p>
      </div>
    `
    document.body.appendChild(errorDiv)
  }
} else {
  // 挂载应用
  authStore.checkAuthStatus().then(() => {
    app.mount('#app')
  }).catch(error => {
    console.error('应用挂载失败:', error)
  })
}