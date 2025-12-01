/**
 * API路由索引
 * 集中管理所有API版本的路由
 */

const express = require('express');
const { versionControl, getVersionInfo } = require('../middleware/versionControl');

const router = express.Router();

// 应用版本控制中间件
router.use(versionControl());

// API信息端点
router.get('/', (req, res) => {
  res.json({
    success: true,
    data: {
      name: 'GameTrust API',
      description: 'GameTrust游戏陪练平台API',
      current_version: getVersionInfo().current,
      supported_versions: getVersionInfo().supported,
      latest_version: getVersionInfo().latest,
      deprecated_versions: getVersionInfo().deprecated,
      version_schema: getVersionInfo().schema,
      documentation: '/docs/api.md',
      endpoints: {
        v1: '/v1'
      }
    }
  });
});

// 版本特定路由
router.use('/v1', require('./v1'));

// 兼容性路由 - 默认使用v1
router.use('/', (req, res, next) => {
  if (req.path === '/' || req.path.startsWith('/v')) {
    return next();
  }
  
  // 重定向到v1版本
  req.url = `/v1${req.path}`;
  next();
}, require('./v1'));

// 处理未找到的路由
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `未找到请求的端点: ${req.method} ${req.originalUrl}`,
      details: {
        available_versions: getVersionInfo().supported,
        documentation: '/docs/api.md'
      }
    }
  });
});

module.exports = router;