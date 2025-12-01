/**
 * 日志服务
 * 提供统一的日志记录功能
 */

const fs = require('fs');
const path = require('path');

// 日志级别
const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

// 当前日志级别（从环境变量获取，默认INFO）
const currentLogLevel = LOG_LEVELS[process.env.LOG_LEVEL?.toUpperCase()] || LOG_LEVELS.INFO;

// 日志目录
const logDir = path.join(__dirname, '../../logs');

// 确保日志目录存在
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

/**
 * 日志服务类
 */
class Logger {
  /**
   * 格式化日志消息
   * @param {string} level - 日志级别
   * @param {string} message - 日志消息
   * @param {Object} meta - 元数据
   * @returns {string} 格式化后的日志
   */
  static formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const metaString = Object.keys(meta).length > 0 ? JSON.stringify(meta) : '';
    return `[${timestamp}] ${level}: ${message} ${metaString}`;
  }

  /**
   * 写入日志文件
   * @param {string} level - 日志级别
   * @param {string} message - 日志消息
   * @param {Object} meta - 元数据
   */
  static writeLog(level, message, meta = {}) {
    const formattedMessage = this.formatMessage(level, message, meta);
    
    // 控制台输出
    console.log(formattedMessage);
    
    // 写入文件
    const today = new Date().toISOString().split('T')[0];
    const logFile = path.join(logDir, `${today}.log`);
    
    fs.appendFileSync(logFile, formattedMessage + '\n');
  }

  /**
   * 错误日志
   * @param {string} message - 日志消息
   * @param {Object} meta - 元数据
   */
  static error(message, meta = {}) {
    if (LOG_LEVELS.ERROR <= currentLogLevel) {
      this.writeLog('ERROR', message, meta);
    }
  }

  /**
   * 警告日志
   * @param {string} message - 日志消息
   * @param {Object} meta - 元数据
   */
  static warn(message, meta = {}) {
    if (LOG_LEVELS.WARN <= currentLogLevel) {
      this.writeLog('WARN', message, meta);
    }
  }

  /**
   * 信息日志
   * @param {string} message - 日志消息
   * @param {Object} meta - 元数据
   */
  static info(message, meta = {}) {
    if (LOG_LEVELS.INFO <= currentLogLevel) {
      this.writeLog('INFO', message, meta);
    }
  }

  /**
   * 调试日志
   * @param {string} message - 日志消息
   * @param {Object} meta - 元数据
   */
  static debug(message, meta = {}) {
    if (LOG_LEVELS.DEBUG <= currentLogLevel) {
      this.writeLog('DEBUG', message, meta);
    }
  }

  /**
   * 请求日志
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   * @param {number} duration - 请求处理时间（毫秒）
   */
  static request(req, res, duration) {
    const meta = {
      method: req.method,
      url: req.originalUrl || req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection.remoteAddress
    };
    
    const message = `${req.method} ${req.originalUrl || req.url} ${res.statusCode} - ${duration}ms`;
    
    if (res.statusCode >= 500) {
      this.error(message, meta);
    } else if (res.statusCode >= 400) {
      this.warn(message, meta);
    } else {
      this.info(message, meta);
    }
  }

  /**
   * 数据库查询日志
   * @param {string} query - SQL查询
   * @param {Object} params - 查询参数
   * @param {number} duration - 查询时间（毫秒）
   * @param {Object} result - 查询结果
   */
  static query(query, params = [], duration, result = null) {
    const meta = {
      query: query.replace(/\s+/g, ' ').trim(),
      params,
      duration: `${duration}ms`,
      resultCount: Array.isArray(result) ? result.length : (result ? 1 : 0)
    };
    
    this.debug(`Database query executed in ${duration}ms`, meta);
  }

  /**
   * 缓存操作日志
   * @param {string} operation - 操作类型
   * @param {string} key - 缓存键
   * @param {Object} meta - 元数据
   */
  static cache(operation, key, meta = {}) {
    const message = `Cache ${operation}: ${key}`;
    this.debug(message, meta);
  }

  /**
   * 错误对象日志
   * @param {Error} error - 错误对象
   * @param {string} context - 错误上下文
   */
  static logError(error, context = '') {
    const meta = {
      message: error.message,
      stack: error.stack,
      context
    };
    
    this.error(`Error in ${context}: ${error.message}`, meta);
  }

  /**
   * 创建Express日志中间件
   * @returns {Function} Express中间件
   */
  static middleware() {
    return (req, res, next) => {
      const startTime = Date.now();
      
      // 记录原始的end函数
      const originalEnd = res.end;
      
      // 重写end函数以记录请求日志
      res.end = function(...args) {
        const duration = Date.now() - startTime;
        Logger.request(req, res, duration);
        return originalEnd.apply(this, args);
      };
      
      next();
    };
  }
}

module.exports = Logger;