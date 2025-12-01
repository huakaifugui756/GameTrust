const { formatResponse } = require('./auth');

// 错误类型定义
const ErrorTypes = {
  VALIDATION_ERROR: 'validation_error',
  AUTHENTICATION_ERROR: 'authentication_error',
  AUTHORIZATION_ERROR: 'authorization_error',
  NOT_FOUND_ERROR: 'not_found_error',
  DATABASE_ERROR: 'database_error',
  EXTERNAL_SERVICE_ERROR: 'external_service_error',
  RATE_LIMIT_ERROR: 'rate_limit_error',
  INTERNAL_ERROR: 'internal_error'
};

// 自定义错误类
class AppError extends Error {
  constructor(message, type = ErrorTypes.INTERNAL_ERROR, code = 500, details = null) {
    super(message);
    this.type = type;
    this.code = code;
    this.details = details;
    this.isOperational = true;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

// 创建特定类型的错误
const createError = {
  validation: (message, details = null) => {
    return new AppError(message, ErrorTypes.VALIDATION_ERROR, 400, details);
  },
  
  authentication: (message = '认证失败') => {
    return new AppError(message, ErrorTypes.AUTHENTICATION_ERROR, 401);
  },
  
  authorization: (message = '无权限访问') => {
    return new AppError(message, ErrorTypes.AUTHORIZATION_ERROR, 403);
  },
  
  notFound: (message = '资源不存在') => {
    return new AppError(message, ErrorTypes.NOT_FOUND_ERROR, 404);
  },
  
  database: (message = '数据库操作失败') => {
    return new AppError(message, ErrorTypes.DATABASE_ERROR, 500);
  },
  
  externalService: (message = '外部服务调用失败') => {
    return new AppError(message, ErrorTypes.EXTERNAL_SERVICE_ERROR, 502);
  },
  
  rateLimit: (message = '请求过于频繁') => {
    return new AppError(message, ErrorTypes.RATE_LIMIT_ERROR, 429);
  },
  
  internal: (message = '服务器内部错误') => {
    return new AppError(message, ErrorTypes.INTERNAL_ERROR, 500);
  }
};

// 错误处理中间件
const errorHandler = (err, req, res, next) => {
  // 如果响应已经发送，交给默认错误处理器
  if (res.headersSent) {
    return next(err);
  }
  
  let error = {
    message: '服务器内部错误',
    code: 500,
    type: ErrorTypes.INTERNAL_ERROR,
    details: null
  };
  
  // 处理自定义错误
  if (err instanceof AppError) {
    error.message = err.message;
    error.code = err.code;
    error.type = err.type;
    error.details = err.details;
  }
  // 处理Supabase错误
  else if (err.code) {
    switch (err.code) {
      case 'PGRST116':
        error = createError.notFound('请求的资源不存在');
        break;
      case 'PGRST301':
        error = createError.authorization('没有权限访问该资源');
        break;
      case '23505':
        error = createError.validation('数据已存在，请勿重复操作');
        break;
      case '23503':
        error = createError.validation('关联数据不存在');
        break;
      case '23514':
        error = createError.validation('数据不符合要求');
        break;
      case '42501':
        error = createError.authorization('权限不足');
        break;
      default:
        error = createError.database('数据库操作失败');
    }
  }
  // 处理JWT错误
  else if (err.message && err.message.includes('JWT')) {
    error = createError.authentication('认证令牌无效或已过期');
  }
  // 处理验证错误
  else if (err.name === 'ValidationError') {
    error = createError.validation('请求参数验证失败');
  }
  // 处理网络错误
  else if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
    error = createError.externalService('外部服务不可用');
  }
  
  // 记录错误日志
  logError(err, req);
  
  // 根据环境决定错误响应详细程度
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  const response = formatResponse(false, null, error.message, isDevelopment ? error.details : null, error.code);
  
  // 在开发环境中包含更多错误信息
  if (isDevelopment) {
    response.type = error.type;
    response.stack = err.stack;
  }
  
  res.status(error.code).json(response);
};

// 错误日志记录
const logError = (err, req) => {
  const errorLog = {
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.path,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    userId: req.user ? req.user.id : null,
    error: {
      message: err.message,
      stack: err.stack,
      type: err.type || ErrorTypes.INTERNAL_ERROR
    }
  };
  
  // 在生产环境中，这里可以将错误发送到日志服务
  if (process.env.NODE_ENV === 'production') {
    // 发送到日志服务，如 Sentry、LogRocket 等
    console.error('生产环境错误:', JSON.stringify(errorLog, null, 2));
  } else {
    // 开发环境直接输出到控制台
    console.error('开发环境错误:', errorLog);
  }
};

// 404处理中间件
const notFoundHandler = (req, res) => {
  const error = createError.notFound(`路径 ${req.path} 不存在`);
  logError(error, req);
  
  const response = formatResponse(false, null, error.message, null, error.code);
  res.status(error.code).json(response);
};

// 异步错误捕获包装器
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// 处理未捕获的Promise拒绝
process.on('unhandledRejection', (reason, promise) => {
  console.error('未捕获的Promise拒绝:', reason);
  // 在生产环境中，可能需要发送到错误监控服务
});

// 处理未捕获的异常
process.on('uncaughtException', (error) => {
  console.error('未捕获的异常:', error);
  // 优雅关闭
  process.exit(1);
});

module.exports = {
  ErrorTypes,
  AppError,
  createError,
  errorHandler,
  notFoundHandler,
  asyncHandler,
  logError
};