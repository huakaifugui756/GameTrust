/**
 * 全局错误边界组件
 * 捕获并显示Vue组件中的错误
 */

<template>
  <div class="error-boundary">
    <div v-if="hasError" class="error-container">
      <div class="error-icon">
        <van-icon name="warning-o" size="48" color="#ff6034" />
      </div>
      <h2 class="error-title">应用遇到了问题</h2>
      <p class="error-message">
        {{ errorMessage || '页面加载失败，请稍后再试' }}
      </p>
      <div class="error-actions">
        <van-button type="primary" @click="reloadPage">
          刷新页面
        </van-button>
        <van-button plain @click="goHome">
          返回首页
        </van-button>
      </div>
      <div v-if="showDetails" class="error-details">
        <van-collapse v-model="activeNames">
          <van-collapse-item title="错误详情" name="details">
            <pre>{{ errorDetails }}</pre>
          </van-collapse-item>
        </van-collapse>
      </div>
    </div>
    
    <slot v-else />
  </div>
</template>

<script setup>
import { ref, onErrorCaptured, getCurrentInstance } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const hasError = ref(false)
const errorMessage = ref('')
const errorDetails = ref('')
const showDetails = ref(false)
const activeNames = ref([])

// 捕获子组件中的错误
onErrorCaptured((error, instance, info) => {
  console.error('ErrorBoundary caught an error:', error)
  console.error('Component instance:', instance)
  console.error('Error info:', info)
  
  hasError.value = true
  errorMessage.value = error.message || '未知错误'
  errorDetails.value = `错误: ${error.message}\n堆栈: ${error.stack}\n信息: ${info}`
  
  // 在开发环境中显示详细错误信息
  if (import.meta.env.DEV) {
    showDetails.value = true
    activeNames.value = ['details']
  }
  
  // 阻止错误继续向上传播
  return false
})

// 刷新页面
const reloadPage = () => {
  window.location.reload()
}

// 返回首页
const goHome = () => {
  hasError.value = false
  router.push('/')
}

// 全局错误处理
const app = getCurrentInstance()?.appContext?.app
if (app) {
  app.config.errorHandler = (error, instance, info) => {
    console.error('Global error handler:', error)
    hasError.value = true
    errorMessage.value = error.message || '应用运行错误'
    errorDetails.value = `错误: ${error.message}\n堆栈: ${error.stack}\n信息: ${info}`
  }
}

// 全局未捕获的Promise错误处理
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason)
  hasError.value = true
  errorMessage.value = '异步操作失败'
  errorDetails.value = `错误: ${event.reason}`
})
</script>

<style lang="scss" scoped>
.error-boundary {
  width: 100%;
  height: 100%;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f7f8fa;
}

.error-container {
  max-width: 400px;
  padding: 40px 20px;
  text-align: center;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  margin: 20px;
}

.error-icon {
  margin-bottom: 16px;
}

.error-title {
  font-size: 24px;
  font-weight: 600;
  color: #323233;
  margin-bottom: 12px;
}

.error-message {
  font-size: 16px;
  color: #969799;
  line-height: 1.5;
  margin-bottom: 24px;
}

.error-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-bottom: 24px;
}

.error-details {
  margin-top: 24px;
  text-align: left;
  
  pre {
    white-space: pre-wrap;
    word-break: break-word;
    font-size: 12px;
    color: #646566;
    background-color: #f7f8fa;
    padding: 12px;
    border-radius: 4px;
    max-height: 200px;
    overflow-y: auto;
  }
}
</style>