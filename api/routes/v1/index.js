/**
 * API v1 路由索引
 * 集中管理v1版本的所有路由
 */

const express = require('express');
const authRouter = require('./auth');
const ordersRouter = require('./orders');
const gamesRouter = require('./games');
const chatRouter = require('./chat');
const usersRouter = require('./users');
const paymentsRouter = require('./payments');
const reportsRouter = require('./reports');

const router = express.Router();

// 注册各子路由
router.use('/auth', authRouter);
router.use('/orders', ordersRouter);
router.use('/games', gamesRouter);
router.use('/chat', chatRouter);
router.use('/users', usersRouter);
router.use('/payments', paymentsRouter);
router.use('/reports', reportsRouter);

// API版本信息端点
router.get('/', (req, res) => {
  res.json({
    success: true,
    data: {
      version: '1.0.0',
      name: 'GameTrust API',
      description: 'GameTrust游戏陪练平台API v1',
      endpoints: {
        auth: '/auth',
        orders: '/orders',
        games: '/games',
        chat: '/chat',
        users: '/users',
        payments: '/payments',
        reports: '/reports'
      }
    }
  });
});

module.exports = router;