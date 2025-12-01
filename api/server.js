/**
 * GameTrust API服务器
 * 基于Express.js的RESTful API服务
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { createProxyMiddleware } = require('http-proxy-middleware');

// 中间件
const Logger = require('./services/logger');
const CacheService = require('./services/cacheService');
const errorHandler = require('./middleware/errorHandler');

// 路由
const apiRoutes = require('./routes');

// 创建Express应用
const app = express();

// 信任代理
app.set('trust proxy', 1);

// 安全中间件
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS配置
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? ['https://yourdomain.com', 'https://yourdomain.vercel.app']
    : ['http://localhost:3000', 'http://localhost:8080'],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// 压缩响应
app.use(compression());

// 请求日志
app.use(Logger.middleware());

// 请求体解析
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 全局限流
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1分钟
  max: 60, // 每分钟最多60次请求
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: '请求过于频繁，请稍后再试'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// API路由
app.use('/api', apiRoutes);

// 静态文件服务（如果有）
app.use('/static', express.static('public'));

// 健康检查端点
app.get('/health', (req, res) => {
  const healthCheck = {
    uptime: process.uptime(),
    message: 'OK',
    timestamp: Date.now(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0',
    memory: process.memoryUsage(),
    cache: CacheService.getStats()
  };

  try {
    res.status(200).json({
      success: true,
      data: healthCheck
    });
  } catch (error) {
    healthCheck.message = error.message;
    res.status(503).json({
      success: false,
      error: {
        code: 'HEALTH_CHECK_FAILED',
        message: '健康检查失败',
        details: healthCheck
      }
    });
  }
});

// API文档端点
app.get('/docs', (req, res) => {
  res.redirect('/docs/api.md');
});

// 在开发环境中提供API文档
if (process.env.NODE_ENV !== 'production') {
  const path = require('path');
  app.get('/docs/api.md', (req, res) => {
    res.sendFile(path.join(__dirname, 'docs/api.md'));
  });
}

// 前端代理（在开发环境中）
if (process.env.NODE_ENV !== 'production') {
  app.use('/', createProxyMiddleware({
    target: 'http://localhost:3000',
    changeOrigin: true,
    ws: true,
  }));
}

// 处理未找到的路由
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `未找到请求的端点: ${req.method} ${req.originalUrl}`
    }
  });
});

// 错误处理中间件（必须在所有其他中间件之后）
app.use(errorHandler);

// 启动服务器
const PORT = process.env.PORT || 3005;
const server = app.listen(PORT, () => {
  Logger.info(`API服务器启动成功`, {
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    processId: process.pid
  });
});

// 优雅关闭
process.on('SIGTERM', () => {
  Logger.info('收到SIGTERM信号，开始优雅关闭服务器');
  server.close(() => {
    Logger.info('HTTP服务器已关闭');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  Logger.info('收到SIGINT信号，开始优雅关闭服务器');
  server.close(() => {
    Logger.info('HTTP服务器已关闭');
    process.exit(0);
  });
});

// 处理未捕获的异常
process.on('uncaughtException', (error) => {
  Logger.error('未捕获的异常', { error });
  process.exit(1);
});

// 处理未处理的Promise拒绝
process.on('unhandledRejection', (reason, promise) => {
  Logger.error('未处理的Promise拒绝', { reason, promise });
  process.exit(1);
});

module.exports = app;