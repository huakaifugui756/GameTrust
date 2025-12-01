/**
 * 缓存服务
 * 提供内存缓存和分布式缓存支持
 */

const NodeCache = require('node-cache');
const logger = require('./logger');

// 内存缓存实例
const memoryCache = new NodeCache({
  stdTTL: 600, // 默认10分钟过期
  checkperiod: 120, // 每2分钟检查过期键
  useClones: false // 禁用克隆以提高性能
});

// 缓存统计
const cacheStats = {
  hits: 0,
  misses: 0,
  sets: 0,
  deletes: 0
};

/**
 * 缓存服务类
 */
class CacheService {
  /**
   * 获取缓存值
   * @param {string} key - 缓存键
   * @returns {any} 缓存值或null
   */
  static get(key) {
    const value = memoryCache.get(key);
    if (value !== undefined) {
      cacheStats.hits++;
      logger.debug(`Cache hit for key: ${key}`);
      return value;
    } else {
      cacheStats.misses++;
      logger.debug(`Cache miss for key: ${key}`);
      return null;
    }
  }

  /**
   * 设置缓存值
   * @param {string} key - 缓存键
   * @param {any} value - 缓存值
   * @param {number} ttl - 过期时间（秒）
   */
  static set(key, value, ttl = 600) {
    memoryCache.set(key, value, ttl);
    cacheStats.sets++;
    logger.debug(`Cache set for key: ${key}, TTL: ${ttl}s`);
  }

  /**
   * 删除缓存
   * @param {string} key - 缓存键
   */
  static del(key) {
    const deleted = memoryCache.del(key);
    if (deleted > 0) {
      cacheStats.deletes++;
      logger.debug(`Cache deleted for key: ${key}`);
    }
    return deleted > 0;
  }

  /**
   * 检查缓存是否存在
   * @param {string} key - 缓存键
   * @returns {boolean} 是否存在
   */
  static has(key) {
    return memoryCache.has(key);
  }

  /**
   * 获取或设置缓存（如果不存在则执行回调函数）
   * @param {string} key - 缓存键
   * @param {Function} callback - 回调函数
   * @param {number} ttl - 过期时间（秒）
   * @returns {any} 缓存值
   */
  static async getOrSet(key, callback, ttl = 600) {
    let value = this.get(key);
    
    if (value === null) {
      value = await callback();
      this.set(key, value, ttl);
    }
    
    return value;
  }

  /**
   * 批量获取
   * @param {string[]} keys - 缓存键数组
   * @returns {Object} 键值对对象
   */
  static mget(keys) {
    const result = {};
    keys.forEach(key => {
      const value = this.get(key);
      if (value !== null) {
        result[key] = value;
      }
    });
    return result;
  }

  /**
   * 批量设置
   * @param {Object} keyValuePairs - 键值对对象
   * @param {number} ttl - 过期时间（秒）
   */
  static mset(keyValuePairs, ttl = 600) {
    Object.keys(keyValuePairs).forEach(key => {
      this.set(key, keyValuePairs[key], ttl);
    });
  }

  /**
   * 批量删除
   * @param {string[]} keys - 缓存键数组
   * @returns {number} 删除的键数量
   */
  static mdel(keys) {
    let deletedCount = 0;
    keys.forEach(key => {
      if (this.del(key)) {
        deletedCount++;
      }
    });
    return deletedCount;
  }

  /**
   * 根据模式删除缓存
   * @param {string} pattern - 模式（支持通配符*）
   * @returns {number} 删除的键数量
   */
  static delByPattern(pattern) {
    const keys = memoryCache.keys();
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    const matchedKeys = keys.filter(key => regex.test(key));
    return this.mdel(matchedKeys);
  }

  /**
   * 清空所有缓存
   */
  static flush() {
    memoryCache.flushAll();
    logger.info('Cache flushed');
  }

  /**
   * 获取缓存统计信息
   * @returns {Object} 统计信息
   */
  static getStats() {
    const memStats = memoryCache.getStats();
    const hitRate = cacheStats.hits + cacheStats.misses > 0 
      ? (cacheStats.hits / (cacheStats.hits + cacheStats.misses) * 100).toFixed(2)
      : 0;
    
    return {
      ...memStats,
      customStats: cacheStats,
      hitRate: `${hitRate}%`
    };
  }

  /**
   * 重置统计信息
   */
  static resetStats() {
    Object.keys(cacheStats).forEach(key => {
      cacheStats[key] = 0;
    });
  }

  /**
   * 获取缓存键列表
   * @returns {string[]} 键列表
   */
  static keys() {
    return memoryCache.keys();
  }

  /**
   * 获取缓存大小
   * @returns {number} 缓存键数量
   */
  static size() {
    return memoryCache.keys().length;
  }

  /**
   * 创建带前缀的缓存键
   * @param {string} prefix - 前缀
   * @param {string} key - 键
   * @returns {string} 带前缀的键
   */
  static createKey(prefix, key) {
    return `${prefix}:${key}`;
  }

  /**
   * 创建缓存中间件
   * @param {string} keyPrefix - 键前缀
   * @param {number} ttl - 过期时间（秒）
   * @param {Function} keyGenerator - 自定义键生成函数
   * @returns {Function} Express中间件
   */
  static middleware(keyPrefix, ttl = 600, keyGenerator = null) {
    return (req, res, next) => {
      // 只缓存GET请求
      if (req.method !== 'GET') {
        return next();
      }

      // 生成缓存键
      const key = keyGenerator 
        ? keyGenerator(req)
        : this.createKey(keyPrefix, req.originalUrl || req.url);

      // 尝试从缓存获取
      const cachedResponse = this.get(key);
      if (cachedResponse) {
        res.set(cachedResponse.headers);
        return res.status(cachedResponse.status).json(cachedResponse.data);
      }

      // 拦截响应
      const originalJson = res.json;
      const originalStatus = res.status;
      
      res.json = function(data) {
        // 缓存响应（仅当状态码为2xx时）
        if (res.statusCode >= 200 && res.statusCode < 300) {
          CacheService.set(key, {
            status: res.statusCode,
            headers: res.getHeaders(),
            data
          }, ttl);
        }
        
        return originalJson.call(this, data);
      };

      next();
    };
  }
}

module.exports = CacheService;