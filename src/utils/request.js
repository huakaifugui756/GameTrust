import { showToast } from 'vant'
import { useAuthStore } from '../stores/auth'

// 创建错误处理器
export const errorHandler = {
  // 处理API错误
  handleApiError(error) {
    console.error('API Error:', error)
    
    // 根据错误类型显示不同的提示
    if (error.response) {
      // 服务器返回的错误
      const { status, data } = error.response
      
      switch (status) {
        case 400:
          showToast({
            type: 'fail',
            message: data?.error || '请求参数错误'
          })
          break
        case 401:
          showToast({
            type: 'fail',
            message: '登录已过期，请重新登录'
          })
          // 跳转到登录页
          this.redirectToLogin()
          break
        case 403:
          showToast({
            type: 'fail',
            message: '没有权限访问'
          })
          break
        case 404:
          showToast({
            type: 'fail',
            message: '请求的资源不存在'
          })
          break
        case 429:
          showToast({
            type: 'fail',
            message: '请求过于频繁，请稍后再试'
          })
          break
        case 500:
        case 502:
        case 503:
        case 504:
          showToast({
            type: 'fail',
            message: '服务器错误，请稍后再试'
          })
          break
        default:
          showToast({
            type: 'fail',
            message: data?.error || `请求失败 (${status})`
          })
      }
    } else if (error.request) {
      // 请求发送了但没有响应
      showToast({
        type: 'fail',
        message: '网络连接失败，请检查网络'
      })
    } else {
      // 其他错误
      showToast({
        type: 'fail',
        message: error.message || '未知错误'
      })
    }
    
    // 记录错误
    this.logError(error)
  },
  
  // 处理Supabase错误
  handleSupabaseError(error) {
    console.error('Supabase Error:', error)
    
    let message = '操作失败'
    
    if (error.code) {
      switch (error.code) {
        case 'PGRST116':
          message = '请求的资源不存在'
          break
        case 'PGRST301':
          message = '没有权限访问'
          break
        case '23505':
          message = '数据已存在，请勿重复操作'
          break
        case '23503':
          message = '关联数据不存在'
          break
        case '23514':
          message = '数据不符合要求'
          break
        default:
          message = `数据库错误 (${error.code})`
      }
    } else {
      message = error.message || '未知错误'
    }
    
    showToast({
      type: 'fail',
      message
    })
    
    // 记录错误
    this.logError(error)
  },
  
  // 记录错误日志
  logError(error) {
    // 在生产环境中，这里可以发送错误到日志服务
    const errorInfo = {
      timestamp: new Date().toISOString(),
      error: error.message || error.toString(),
      stack: error.stack,
      userAgent: navigator.userAgent,
      url: window.location.href
    }
    
    console.error('Error logged:', errorInfo)
    
    // 可以发送到错误监控服务
    // this.sendToErrorService(errorInfo)
  },
  
  // 跳转到登录页
  redirectToLogin() {
    const authStore = useAuthStore()
    authStore.logout()
    
    // 如果已经在登录页，不需要再跳转
    if (!window.location.pathname.includes('/login')) {
      window.location.href = '/login'
    }
  }
}

// 创建重试函数
export const retryRequest = async (fn, maxRetries = 3, delay = 1000) => {
  let lastError = null
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      
      // 如果是最后一次尝试，直接抛出错误
      if (i === maxRetries - 1) {
        throw error
      }
      
      // 如果是客户端错误（4xx），不重试
      if (error.response && error.response.status >= 400 && error.response.status < 500) {
        throw error
      }
      
      // 等待一段时间后重试
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)))
    }
  }
  
  throw lastError
}

// 创建网络状态监听器
export const networkMonitor = {
  isOnline: navigator.onLine,
  
  init() {
    window.addEventListener('online', this.handleOnline.bind(this))
    window.addEventListener('offline', this.handleOffline.bind(this))
  },
  
  handleOnline() {
    this.isOnline = true
    showToast({
      type: 'success',
      message: '网络连接已恢复'
    })
  },
  
  handleOffline() {
    this.isOnline = false
    showToast({
      type: 'fail',
      message: '网络连接已断开'
    })
  },
  
  // 确保网络可用
  ensureOnline() {
    return new Promise((resolve, reject) => {
      if (this.isOnline) {
        return resolve(true)
      }
      
      // 监听网络恢复
      const handleOnline = () => {
        window.removeEventListener('online', handleOnline)
        resolve(true)
      }
      
      window.addEventListener('online', handleOnline)
      
      // 设置超时
      setTimeout(() => {
        window.removeEventListener('online', handleOnline)
        reject(new Error('网络连接超时'))
      }, 10000)
    })
  }
}

// 创建请求队列，用于离线时的请求缓存
export class RequestQueue {
  constructor() {
    this.queue = []
    this.isProcessing = false
  }
  
  add(request) {
    return new Promise((resolve, reject) => {
      this.queue.push({
        request,
        resolve,
        reject
      })
      
      this.processQueue()
    })
  }
  
  async processQueue() {
    if (this.isProcessing || this.queue.length === 0) {
      return
    }
    
    this.isProcessing = true
    
    while (this.queue.length > 0) {
      if (!networkMonitor.isOnline) {
        // 如果网络不可用，等待网络恢复
        await networkMonitor.ensureOnline()
      }
      
      const { request, resolve, reject } = this.queue.shift()
      
      try {
        const result = await request()
        resolve(result)
      } catch (error) {
        reject(error)
      }
    }
    
    this.isProcessing = false
  }
}

// 全局请求队列实例
const requestQueue = new RequestQueue()

// 初始化网络监听
networkMonitor.init()

// 导出默认的错误处理函数
export default {
  handleApiError: errorHandler.handleApiError.bind(errorHandler),
  handleSupabaseError: errorHandler.handleSupabaseError.bind(errorHandler),
  retryRequest,
  networkMonitor,
  requestQueue
}