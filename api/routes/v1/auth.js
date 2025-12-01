/**
 * API v1 认证路由
 * 定义认证相关的API端点
 */

const express = require('express');
const { body } = require('express-validator');
const authController = require('../../controllers/v1/authController');
const { versionRange } = require('../../middleware/versionControl');

const router = express.Router();

/**
 * 用户注册
 * POST /api/v1/auth/register
 */
router.post('/register',
  versionRange('1.0.0'), // 最低支持版本 1.0.0
  [
    body('phone')
      .isMobilePhone('zh-CN')
      .withMessage('请输入有效的中国大陆手机号'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('密码长度至少6位'),
    body('username')
      .isLength({ min: 2, max: 20 })
      .withMessage('用户名长度应在2-20字符之间'),
    body('role')
      .optional()
      .isIn(['player', 'escort'])
      .withMessage('用户角色必须是player或escort')
  ],
  authController.register
);

/**
 * 用户登录
 * POST /api/v1/auth/login
 */
router.post('/login',
  versionRange('1.0.0'), // 最低支持版本 1.0.0
  [
    body('phone')
      .isMobilePhone('zh-CN')
      .withMessage('请输入有效的中国大陆手机号'),
    body('password')
      .notEmpty()
      .withMessage('密码不能为空')
  ],
  authController.login
);

/**
 * 验证令牌
 * GET /api/v1/auth/verify
 */
router.get('/verify',
  versionRange('1.0.0'), // 最低支持版本 1.0.0
  authController.verify
);

/**
 * 刷新令牌
 * POST /api/v1/auth/refresh
 */
router.post('/refresh',
  versionRange('1.1.0'), // 最低支持版本 1.1.0
  authController.refresh
);

/**
 * 用户登出
 * POST /api/v1/auth/logout
 */
router.post('/logout',
  versionRange('1.1.0'), // 最低支持版本 1.1.0
  authController.logout
);

module.exports = router;