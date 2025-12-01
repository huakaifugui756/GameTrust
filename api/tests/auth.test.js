/**
 * 认证API测试
 */

const request = require('supertest');
const app = require('../server');
const { supabase } = require('../supabaseClient');

describe('Authentication API', () => {
  let testUser = {
    phone: '13800138000',
    password: 'test123456',
    username: 'Test User',
    role: 'player'
  };
  let authToken = '';

  describe('POST /api/auth/register', () => {
    it('应该成功注册新用户', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.user.phone).toBe(testUser.phone);
      expect(response.body.data.user.username).toBe(testUser.username);
      expect(response.body.data.user.role).toBe(testUser.role);
      expect(response.body.data.token).toBeDefined();

      authToken = response.body.data.token;
    });

    it('应该拒绝重复的手机号', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('PHONE_ALREADY_EXISTS');
    });

    it('应该验证必需字段', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('应该验证手机号格式', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          ...testUser,
          phone: '123'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('应该验证密码长度', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          ...testUser,
          phone: '13900139000',
          password: '123'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('应该验证用户角色', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          ...testUser,
          phone: '13700137000',
          role: 'invalid_role'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('POST /api/auth/login', () => {
    it('应该成功登录', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          phone: testUser.phone,
          password: testUser.password
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.token).toBeDefined();
    });

    it('应该拒绝错误的密码', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          phone: testUser.phone,
          password: 'wrongpassword'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_CREDENTIALS');
    });

    it('应该拒绝不存在的用户', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          phone: '13999999999',
          password: 'password123'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_CREDENTIALS');
    });

    it('应该验证必需字段', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /api/auth/verify', () => {
    it('应该验证有效token', async () => {
      const response = await request(app)
        .get('/api/auth/verify')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toBeDefined();
    });

    it('应该拒绝无效token', async () => {
      const response = await request(app)
        .get('/api/auth/verify')
        .set('Authorization', 'Bearer invalidtoken')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_TOKEN');
    });

    it('应该拒绝缺少token的请求', async () => {
      const response = await request(app)
        .get('/api/auth/verify')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NO_TOKEN');
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('应该刷新token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.token).not.toBe(authToken);

      authToken = response.body.data.token;
    });

    it('应该拒绝无效token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .set('Authorization', 'Bearer invalidtoken')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_TOKEN');
    });
  });

  describe('POST /api/auth/logout', () => {
    it('应该成功登出', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toBe('Logged out successfully');
    });

    it('应该拒绝缺少token的请求', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NO_TOKEN');
    });
  });

  // 清理测试数据
  afterAll(async () => {
    try {
      await supabase
        .from('users')
        .delete()
        .eq('phone', testUser.phone);
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  });
});