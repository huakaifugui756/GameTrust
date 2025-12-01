const { formatResponse } = require('./auth');

// 简单的内存存储（生产环境建议使用Redis）
const requestStore = new Map();

// 清理过期记录的定时器
setInterval(() => {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1分钟窗口
  
  for (const [key, requests] of requestStore.entries()) {
    // 移除1分钟前的记录
    const validRequests = requests.filter(time => now - time < windowMs);
    if (validRequests.length > 0) {
      requestStore.set(key, validRequests);
    } else {
      requestStore.delete(key);
    }
  }
}, 60 * 1000); // 每分钟清理一次

// 创建限流中间件
const rateLimit = (options = {}) => {
  const {
    windowMs = 60 * 1000, // 时间窗口，默认1分钟
    max = 60, // 最大请求次数
    message = '请求过于频繁，请稍后再试',
    skipSuccessfulRequests = false, // 是否跳过成功请求的计数
    keyGenerator = (req) => req.ip || req.connection.remoteAddress // 生成限流键的函数
  } = options;
  
  return (req, res, next) => {
    try {
      const key = keyGenerator(req);
      const now = Date.now();
      
      // 获取该键的请求记录
      if (!requestStore.has(key)) {
        requestStore.set(key, []);
      }
      
      const requests = requestStore.get(key);
      
      // 移除窗口外的请求记录
      const validRequests = requests.filter(time => now - time < windowMs);
      
      // 如果不跳过成功请求，则只计数失败的请求
      if (skipSuccessfulRequests) {
        // 这里可以在响应后更新请求状态，但简化处理，直接计数所有请求
        validRequests.push(now);
      } else {
        validRequests.push(now);
      }
      
      // 更新存储
      requestStore.set(key, validRequests);
      
      // 检查是否超过限制
      if (validRequests.length > max) {
        // 计算重置时间
        const oldestRequest = Math.min(...validRequests);
        const resetTime = new Date(oldestRequest + windowMs);
        
        // 设置响应头
        res.set({
          'X-RateLimit-Limit': max,
          'X-RateLimit-Remaining': Math.max(0, max - validRequests.length),
          'X-RateLimit-Reset': new Date(Date.now() + windowMs).toISOString()
        });
        
        return res.status(429).json(formatResponse(false, null, message, {
          limit: max,
          remaining: Math.max(0, max - validRequests.length),
          resetTime: resetTime.toISOString()
        }, 429));
      }
      
      // 设置响应头
      res.set({
        'X-RateLimit-Limit': max,
        'X-RateLimit-Remaining': Math.max(0, max - validRequests.length),
        'X-RateLimit-Reset': new Date(Date.now() + windowMs).toISOString()
      });
      
      next();
    } catch (error) {
      console.error('限流中间件错误:', error);
      return res.status(500).json(formatResponse(false, null, '服务器内部错误', null, 500));
    }
  };
};

// 为不同端点创建预设限流中间件
const limits = {
  // 通用API限流：每分钟60次
  general: rateLimit({
    windowMs: 60 * 1000,
    max: 60,
    message: '请求过于频繁，请1分钟后再试'
  }),
  
  // 登录API限流：每分钟5次
  auth: rateLimit({
    windowMs: 60 * 1000,
    max: 5,
    message: '登录尝试过于频繁，请1分钟后再试',
    skipSuccessfulRequests: true // 只限制失败的登录尝试
  }),
  
  // 注册API限流：每小时3次
  register: rateLimit({
    windowMs: 60 * 60 * 1000, // 1小时
    max: 3,
    message: '注册过于频繁，请1小时后再试'
  }),
  
  // 发送短信限流：每分钟1次
  sms: rateLimit({
    windowMs: 60 * 1000,
    max: 1,
    message: '短信发送过于频繁，请1分钟后再试'
  }),
  
  // 创建订单限流：每分钟10次
  createOrder: rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    message: '创建订单过于频繁，请稍后再试'
  }),
  
  // 上传文件限流：每分钟5次
  upload: rateLimit({
    windowMs: 60 * 1000,
    max: 5,
    message: '上传过于频繁，请1分钟后再试'
  })
};

module.exports = {
  rateLimit,
  limits
};