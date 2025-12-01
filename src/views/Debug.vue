/**
 * 调试页面
 * 用于检查环境变量和组件加载状态
 */

<template>
  <div class="debug-page">
    <van-nav-bar title="调试信息" left-arrow @click-left="$router.back()" />
    
    <div class="debug-content">
      <van-cell-group title="环境信息">
        <van-cell title="当前环境" :value="envInfo.mode" />
        <van-cell title="是否生产环境" :value="envInfo.isProduction ? '是' : '否'" />
        <van-cell title="基础URL" :value="envInfo.baseUrl" />
      </van-cell-group>
      
      <van-cell-group title="环境变量">
        <van-cell title="Supabase URL" :value="supabaseUrl ? '已设置' : '未设置'" />
        <van-cell title="Supabase Anon Key" :value="supabaseKey ? '已设置' : '未设置'" />
        <van-cell title="Supabase 客户端" :value="supabaseClient ? '已初始化' : '未初始化'" />
      </van-cell-group>
      
      <van-cell-group title="认证状态">
        <van-cell title="用户信息" :value="user ? '已登录' : '未登录'" />
        <van-cell title="Token" :value="token ? '已设置' : '未设置'" />
      </van-cell-group>
      
      <van-cell-group title="组件状态">
        <van-cell title="Vant 组件库" :value="vantLoaded ? '已加载' : '未加载'" />
        <van-cell title="Vue Router" :value="routerReady ? '已就绪' : '未就绪'" />
        <van-cell title="Pinia Store" :value="storeReady ? '已就绪' : '未就绪'" />
      </van-cell-group>
      
      <van-cell-group title="网络连接">
        <van-cell title="在线状态" :value="isOnline ? '在线' : '离线'" />
        <van-cell title="当前URL" :value="currentUrl" />
      </van-cell-group>
      
      <van-cell-group title="测试按钮">
        <van-cell>
          <van-button type="primary" block @click="testSupabaseConnection">
            测试 Supabase 连接
          </van-button>
        </van-cell>
        <van-cell>
          <van-button type="default" block @click="testLocalStorage">
            测试 本地存储
          </van-button>
        </van-cell>
        <van-cell>
          <van-button type="warning" block @click="showError">
            模拟错误
          </van-button>
        </van-cell>
        <van-cell>
          <van-button type="danger" block @click="clearStorage">
            清除本地存储
          </van-button>
        </van-cell>
      </van-cell-group>
      
      <van-cell-group title="日志">
        <van-cell>
          <van-button type="default" block @click="exportLogs">
            导出调试日志
          </van-button>
        </van-cell>
      </van-cell-group>
      
      <div v-if="logs.length > 0" class="logs-section">
        <h3>调试日志</h3>
        <div class="log-container">
          <div v-for="(log, index) in logs" :key="index" class="log-entry" :class="log.type">
            <span class="log-time">{{ log.time }}</span>
            <span class="log-type">{{ log.type.toUpperCase() }}</span>
            <span class="log-message">{{ log.message }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '../supabase'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const authStore = useAuthStore()

// 环境信息
const envInfo = ref({
  mode: import.meta.env.MODE,
  isProduction: import.meta.env.PROD,
  baseUrl: window.location.origin
})

// 环境变量状态
const supabaseUrl = computed(() => import.meta.env.VITE_SUPABASE_URL)
const supabaseKey = computed(() => import.meta.env.VITE_SUPABASE_ANON_KEY)
const supabaseClient = computed(() => supabase)

// 认证状态
const user = computed(() => authStore.user)
const token = computed(() => authStore.token)

// 组件状态
const vantLoaded = ref(true)
const routerReady = ref(true)
const storeReady = ref(true)

// 网络状态
const isOnline = ref(navigator.onLine)
const currentUrl = ref(window.location.href)

// 日志
const logs = ref([])

// 添加日志
const addLog = (type, message) => {
  logs.value.unshift({
    type,
    message,
    time: new Date().toLocaleTimeString()
  })
  
  // 限制日志数量
  if (logs.value.length > 50) {
    logs.value = logs.value.slice(0, 50)
  }
}

// 监听网络状态
window.addEventListener('online', () => {
  isOnline.value = true
  addLog('info', '网络已连接')
})

window.addEventListener('offline', () => {
  isOnline.value = false
  addLog('warn', '网络已断开')
})

// 测试 Supabase 连接
const testSupabaseConnection = async () => {
  addLog('info', '开始测试 Supabase 连接...')
  
  try {
    const { data, error } = await supabase.from('games').select('count', { count: 'exact', head: true })
    
    if (error) {
      addLog('error', `Supabase 连接失败: ${error.message}`)
    } else {
      addLog('success', `Supabase 连接成功，找到 ${data?.[0]?.count || 0} 个游戏`)
    }
  } catch (error) {
    addLog('error', `Supabase 连接异常: ${error.message}`)
  }
}

// 测试本地存储
const testLocalStorage = () => {
  try {
    const testData = {
      timestamp: Date.now(),
      message: '测试数据'
    }
    
    localStorage.setItem('testData', JSON.stringify(testData))
    const retrieved = JSON.parse(localStorage.getItem('testData'))
    
    if (retrieved.message === testData.message) {
      addLog('success', '本地存储正常')
    } else {
      addLog('error', '本地存储数据不一致')
    }
    
    localStorage.removeItem('testData')
  } catch (error) {
    addLog('error', `本地存储测试失败: ${error.message}`)
  }
}

// 模拟错误
const showError = () => {
  try {
    throw new Error('这是一个测试错误')
  } catch (error) {
    addLog('error', `模拟错误: ${error.message}`)
  }
}

// 清除本地存储
const clearStorage = () => {
  try {
    localStorage.clear()
    addLog('info', '本地存储已清除')
  } catch (error) {
    addLog('error', `清除本地存储失败: ${error.message}`)
  }
}

// 导出日志
const exportLogs = () => {
  const logData = {
    timestamp: new Date().toISOString(),
    environment: envInfo.value,
    logs: logs.value
  }
  
  const blob = new Blob([JSON.stringify(logData, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `debug-logs-${Date.now()}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  
  addLog('info', '调试日志已导出')
}

// 初始化
onMounted(() => {
  addLog('info', '调试页面已加载')
  
  // 检查环境变量
  if (!supabaseUrl.value) {
    addLog('error', 'VITE_SUPABASE_URL 未设置')
  }
  
  if (!supabaseKey.value) {
    addLog('error', 'VITE_SUPABASE_ANON_KEY 未设置')
  }
  
  if (supabaseUrl.value && supabaseKey.value) {
    addLog('success', 'Supabase 环境变量已设置')
  }
})
</script>

<style lang="scss" scoped>
.debug-page {
  height: 100vh;
  background-color: #f7f8fa;
}

.debug-content {
  padding: 16px;
}

.logs-section {
  margin-top: 16px;
  
  h3 {
    margin: 16px 0;
    font-size: 16px;
    font-weight: 600;
    color: #323233;
  }
}

.log-container {
  max-height: 200px;
  overflow-y: auto;
  background-color: #fff;
  border-radius: 4px;
  padding: 8px;
}

.log-entry {
  display: flex;
  align-items: center;
  padding: 4px 0;
  border-bottom: 1px solid #f0f0f0;
  font-size: 12px;
  
  &:last-child {
    border-bottom: none;
  }
  
  .log-time {
    color: #969799;
    margin-right: 8px;
    min-width: 60px;
  }
  
  .log-type {
    color: #323233;
    font-weight: 600;
    margin-right: 8px;
    min-width: 40px;
  }
  
  .log-message {
    color: #646566;
    flex: 1;
    word-break: break-word;
  }
  
  &.success {
    .log-type {
      color: #07c160;
    }
  }
  
  &.error {
    .log-type {
      color: #ee0a24;
    }
  }
  
  &.warn {
    .log-type {
      color: #ff976a;
    }
  }
}
</style>