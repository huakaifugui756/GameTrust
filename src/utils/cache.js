// 简单的内存缓存实现，用于前端数据缓存
class Cache {
  constructor() {
    this.cache = new Map()
    this.timers = new Map()
  }

  // 设置缓存
  set(key, value, ttl = 300000) { // 默认5分钟过期
    // 如果已存在该键，清除之前的定时器
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key))
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      ttl
    })

    // 设置过期定时器
    const timer = setTimeout(() => {
      this.delete(key)
    }, ttl)
    
    this.timers.set(key, timer)
  }

  // 获取缓存
  get(key) {
    const item = this.cache.get(key)
    
    if (!item) {
      return null
    }

    // 检查是否过期
    const now = Date.now()
    if (now - item.timestamp > item.ttl) {
      this.delete(key)
      return null
    }

    return item.value
  }

  // 删除缓存
  delete(key) {
    this.cache.delete(key)
    
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key))
      this.timers.delete(key)
    }
  }

  // 清空缓存
  clear() {
    this.cache.clear()
    
    // 清除所有定时器
    this.timers.forEach(timer => {
      clearTimeout(timer)
    })
    this.timers.clear()
  }

  // 检查缓存是否存在且未过期
  has(key) {
    return this.get(key) !== null
  }
}

// 创建全局缓存实例
const cache = new Cache()

// API缓存装饰器函数
export const withCache = (apiFn, keyGenerator, ttl = 300000) => {
  return async (...args) => {
    const cacheKey = keyGenerator(...args)
    
    // 尝试从缓存获取
    const cachedResult = cache.get(cacheKey)
    if (cachedResult) {
      return cachedResult
    }
    
    // 缓存不存在，执行API调用
    try {
      const result = await apiFn(...args)
      
      // 缓存结果
      cache.set(cacheKey, result, ttl)
      
      return result
    } catch (error) {
      // 如果API调用失败，尝试返回过期的缓存数据（如果存在）
      const staleData = cache.get(cacheKey)
      if (staleData) {
        console.warn('API调用失败，返回缓存数据:', error)
        return staleData
      }
      
      // 没有缓存数据，重新抛出错误
      throw error
    }
  }
}

// 防抖函数
export const debounce = (fn, delay = 300) => {
  let timer = null
  
  return function(...args) {
    if (timer) clearTimeout(timer)
    
    timer = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}

// 节流函数
export const throttle = (fn, delay = 300) => {
  let lastTime = 0
  
  return function(...args) {
    const now = Date.now()
    
    if (now - lastTime >= delay) {
      lastTime = now
      fn.apply(this, args)
    }
  }
}

// 批量请求处理器
export class BatchProcessor {
  constructor(processFn, delay = 100, maxBatchSize = 10) {
    this.processFn = processFn
    this.delay = delay
    this.maxBatchSize = maxBatchSize
    this.queue = []
    this.timer = null
  }

  add(item) {
    return new Promise((resolve, reject) => {
      this.queue.push({ item, resolve, reject })
      
      // 如果队列达到最大批量大小，立即处理
      if (this.queue.length >= this.maxBatchSize) {
        this.flush()
      } else if (!this.timer) {
        // 设置定时器，延迟处理
        this.timer = setTimeout(() => {
          this.flush()
        }, this.delay)
      }
    })
  }

  flush() {
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
    }
    
    if (this.queue.length === 0) return
    
    const batch = this.queue.splice(0, this.maxBatchSize)
    const items = batch.map(entry => entry.item)
    
    this.processFn(items)
      .then(results => {
        batch.forEach((entry, index) => {
          entry.resolve(results[index])
        })
      })
      .catch(error => {
        batch.forEach(entry => {
          entry.reject(error)
        })
      })
  }
}

export default cache