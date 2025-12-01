/**
 * 订单API测试
 */

const request = require('supertest');
const app = require('../server');
const { supabase } = require('../supabaseClient');

describe('Orders API', () => {
  let initiatorUser = {
    phone: '13800138001',
    password: 'test123456',
    username: 'Initiator User',
    role: 'player'
  };
  let acceptorUser = {
    phone: '13800138002',
    password: 'test123456',
    username: 'Acceptor User',
    role: 'escort'
  };
  let initiatorToken = '';
  let acceptorToken = '';
  let testGame = null;
  let testOrder = null;

  beforeAll(async () => {
    // 创建测试用户
    const initiatorResponse = await request(app)
      .post('/api/auth/register')
      .send(initiatorUser);
    initiatorToken = initiatorResponse.body.data.token;

    const acceptorResponse = await request(app)
      .post('/api/auth/register')
      .send(acceptorUser);
    acceptorToken = acceptorResponse.body.data.token;

    // 获取测试游戏
    const gamesResponse = await request(app)
      .get('/api/games')
      .set('Authorization', `Bearer ${initiatorToken}`)
      .expect(200);

    if (gamesResponse.body.data.games.length > 0) {
      testGame = gamesResponse.body.data.games[0];
    }
  });

  describe('POST /api/orders', () => {
    it('应该成功创建订单', async () => {
      if (!testGame) {
        console.log('跳过订单创建测试，没有可用的游戏');
        return;
      }

      const orderData = {
        game_id: testGame.id,
        title: '测试订单',
        description: '这是一个测试订单',
        requirements: '完成5场游戏',
        deliverables: '截图证明',
        amount: 50,
        urgency: 3,
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        tags: ['测试', '游戏']
      };

      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${initiatorToken}`)
        .send(orderData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.order).toBeDefined();
      expect(response.body.data.order.title).toBe(orderData.title);
      expect(response.body.data.order.game_id).toBe(orderData.game_id);
      expect(response.body.data.order.initiator_id).toBeDefined();
      expect(response.body.data.order.status).toBe('pending');

      testOrder = response.body.data.order;
    });

    it('应该验证必需字段', async () => {
      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${initiatorToken}`)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('应该验证金额', async () => {
      if (!testGame) return;

      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${initiatorToken}`)
        .send({
          game_id: testGame.id,
          title: '测试订单',
          amount: -10
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('应该验证紧急程度', async () => {
      if (!testGame) return;

      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${initiatorToken}`)
        .send({
          game_id: testGame.id,
          title: '测试订单',
          amount: 50,
          urgency: 10
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('应该验证截止日期', async () => {
      if (!testGame) return;

      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${initiatorToken}`)
        .send({
          game_id: testGame.id,
          title: '测试订单',
          amount: 50,
          deadline: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /api/orders', () => {
    it('应该获取订单列表', async () => {
      const response = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${initiatorToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.orders).toBeDefined();
      expect(response.body.data.pagination).toBeDefined();
    });

    it('应该按状态过滤订单', async () => {
      const response = await request(app)
        .get('/api/orders?status=pending')
        .set('Authorization', `Bearer ${initiatorToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      if (response.body.data.orders.length > 0) {
        response.body.data.orders.forEach(order => {
          expect(order.status).toBe('pending');
        });
      }
    });

    it('应该支持分页', async () => {
      const response = await request(app)
        .get('/api/orders?page=1&limit=5')
        .set('Authorization', `Bearer ${initiatorToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.orders.length).toBeLessThanOrEqual(5);
      expect(response.body.data.pagination.page).toBe(1);
      expect(response.body.data.pagination.limit).toBe(5);
    });
  });

  describe('GET /api/orders/:id', () => {
    it('应该获取特定订单详情', async () => {
      if (!testOrder) {
        console.log('跳过订单详情测试，没有可用的订单');
        return;
      }

      const response = await request(app)
        .get(`/api/orders/${testOrder.id}`)
        .set('Authorization', `Bearer ${initiatorToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.order).toBeDefined();
      expect(response.body.data.order.id).toBe(testOrder.id);
    });

    it('应该拒绝不存在的订单', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await request(app)
        .get(`/api/orders/${fakeId}`)
        .set('Authorization', `Bearer ${initiatorToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('ORDER_NOT_FOUND');
    });
  });

  describe('POST /api/orders/:id/accept', () => {
    it('应该成功接受订单', async () => {
      if (!testOrder) {
        console.log('跳过接受订单测试，没有可用的订单');
        return;
      }

      const response = await request(app)
        .post(`/api/orders/${testOrder.id}/accept`)
        .set('Authorization', `Bearer ${acceptorToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.order.status).toBe('accepted');
      expect(response.body.data.order.acceptor_id).toBeDefined();
    });

    it('应该拒绝订单发起者接受自己的订单', async () => {
      if (!testOrder) return;

      const response = await request(app)
        .post(`/api/orders/${testOrder.id}/accept`)
        .set('Authorization', `Bearer ${initiatorToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('CANNOT_ACCEPT_OWN_ORDER');
    });

    it('应该拒绝已接受的订单', async () => {
      if (!testOrder) return;

      const response = await request(app)
        .post(`/api/orders/${testOrder.id}/accept`)
        .set('Authorization', `Bearer ${acceptorToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('ORDER_ALREADY_ACCEPTED');
    });
  });

  describe('POST /api/orders/:id/complete', () => {
    it('应该成功完成订单', async () => {
      if (!testOrder) {
        console.log('跳过完成订单测试，没有可用的订单');
        return;
      }

      const response = await request(app)
        .post(`/api/orders/${testOrder.id}/complete`)
        .set('Authorization', `Bearer ${acceptorToken}`)
        .send({
          completion_proof: [
            'https://example.com/screenshot1.jpg',
            'https://example.com/screenshot2.jpg'
          ]
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.order.status).toBe('completed');
    });

    it('应该拒绝订单发起者完成订单', async () => {
      if (!testOrder) return;

      const response = await request(app)
        .post(`/api/orders/${testOrder.id}/complete`)
        .set('Authorization', `Bearer ${initiatorToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('ONLY_ACCEPTOR_CAN_COMPLETE');
    });

    it('应该验证完成证明', async () => {
      if (!testOrder) return;

      const response = await request(app)
        .post(`/api/orders/${testOrder.id}/complete`)
        .set('Authorization', `Bearer ${acceptorToken}`)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  // 清理测试数据
  afterAll(async () => {
    try {
      // 删除测试订单
      if (testOrder) {
        await supabase
          .from('orders')
          .delete()
          .eq('id', testOrder.id);
      }

      // 删除测试用户
      await supabase
        .from('users')
        .delete()
        .in('phone', [initiatorUser.phone, acceptorUser.phone]);
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  });
});