const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { supabase } = require('./supabaseClient');

const app = express();
const PORT = 3005;

// 中间件
app.use(cors());
app.use(bodyParser.json());

// API辅助函数
const formatResponse = (success, data = null, message = '', error = null) => {
  const response = { success }
  if (data !== null) response.data = data
  if (message) response.message = message
  if (error) response.error = error
  return response
}

const handleSupabaseError = (error) => {
  console.error('Supabase error:', error)
  return formatResponse(false, null, error.message || 'Database operation failed')
}

// 认证中间件 - 验证JWT token
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json(formatResponse(false, null, 'Unauthorized: No token provided'))
    }

    const token = authHeader.split(' ')[1]
    const { data: { user }, error } = await supabase.auth.getUser(token)
    
    if (error || !user) {
      return res.status(401).json(formatResponse(false, null, 'Unauthorized: Invalid token'))
    }
    
    req.user = user
    next()
  } catch (error) {
    console.error('Authentication error:', error)
    res.status(500).json(formatResponse(false, null, 'Internal server error'))
  }
}

// ========================
// 认证相关 API
// ========================

// 用户注册
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, phone, username } = req.body;
    
    if (!email || !password || !phone) {
      return res.status(400).json(formatResponse(false, null, '请填写完整信息'));
    }
    
    // 1. 在Supabase Auth中创建用户
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      phone,
      email_confirm: true, // 自动确认邮箱，生产环境可以改为false
      phone_confirm: true, // 自动确认手机号，生产环境可以改为false
      user_metadata: {
        username,
        phone
      }
    });
    
    if (authError) {
      return res.status(400).json(formatResponse(false, null, authError.message));
    }
    
    // 2. 在public.users表中创建用户记录
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert([
        {
          id: authData.user.id,
          phone,
          username,
          role: 'user' // 默认为普通用户
        }
      ])
      .select()
      .single();
    
    if (userError) {
      return res.status(400).json(formatResponse(false, null, userError.message));
    }
    
    // 3. 获取JWT token
    const { data: sessionData, error: sessionError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email
    });
    
    if (sessionError) {
      return res.status(400).json(formatResponse(false, null, sessionError.message));
    }
    
    res.json(formatResponse(true, {
      token: sessionData.properties.access_token,
      user: userData
    }, '注册成功'));
    
  } catch (error) {
    res.status(500).json(handleSupabaseError(error));
  }
});

// 用户登录
app.post('/api/auth/login', async (req, res) => {
  try {
    const { phone, password } = req.body;
    
    if (!phone || !password) {
      return res.status(400).json(formatResponse(false, null, '手机号和密码不能为空'));
    }
    
    // 1. 通过Supabase Auth验证用户
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      phone,
      password
    });
    
    if (authError) {
      return res.status(401).json(formatResponse(false, null, '手机号或密码错误'));
    }
    
    // 2. 获取用户详细信息
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();
    
    if (userError) {
      return res.status(404).json(formatResponse(false, null, '用户信息不存在'));
    }
    
    res.json(formatResponse(true, {
      token: authData.session.access_token,
      user: userData
    }, '登录成功'));
    
  } catch (error) {
    res.status(500).json(handleSupabaseError(error));
  }
});

// 短信验证码登录
app.post('/api/auth/sms-login', async (req, res) => {
  try {
    const { phone, token } = req.body;
    
    if (!phone || !token) {
      return res.status(400).json(formatResponse(false, null, '手机号和验证码不能为空'));
    }
    
    // 1. 使用Supabase OTP验证登录
    const { data: authData, error: authError } = await supabase.auth.verifyOtp({
      phone,
      token,
      type: 'sms'
    });
    
    if (authError) {
      return res.status(401).json(formatResponse(false, null, '验证码错误或已过期'));
    }
    
    // 2. 获取或创建用户信息
    let { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();
    
    if (userError && userError.code === 'PGRST116') {
      // 用户不存在，创建新用户
      const { data: newUserData, error: createError } = await supabase
        .from('users')
        .insert([
          {
            id: authData.user.id,
            phone,
            role: 'user'
          }
        ])
        .select()
        .single();
      
      if (createError) {
        return res.status(400).json(formatResponse(false, null, createError.message));
      }
      
      userData = newUserData;
    } else if (userError) {
      return res.status(400).json(formatResponse(false, null, userError.message));
    }
    
    res.json(formatResponse(true, {
      token: authData.session.access_token,
      user: userData
    }, '登录成功'));
    
  } catch (error) {
    res.status(500).json(handleSupabaseError(error));
  }
});

// 发送短信验证码
app.post('/api/auth/send-sms', async (req, res) => {
  try {
    const { phone } = req.body;
    
    if (!phone) {
      return res.status(400).json(formatResponse(false, null, '手机号不能为空'));
    }
    
    const { error } = await supabase.auth.signInWithOtp({
      phone,
      options: {
        shouldCreateUser: false // 只为现有用户发送验证码
      }
    });
    
    if (error) {
      return res.status(400).json(formatResponse(false, null, error.message));
    }
    
    res.json(formatResponse(true, null, '验证码已发送'));
    
  } catch (error) {
    res.status(500).json(handleSupabaseError(error));
  }
});

// 获取当前用户信息 (需要认证)
app.get('/api/auth/me', authenticate, async (req, res) => {
  try {
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.user.id)
      .single();
    
    if (userError) {
      return res.status(404).json(formatResponse(false, null, '用户信息不存在'));
    }
    
    res.json(formatResponse(true, userData));
    
  } catch (error) {
    res.status(500).json(handleSupabaseError(error));
  }
});

// 更新用户信息 (需要认证)
app.put('/api/auth/me', authenticate, async (req, res) => {
  try {
    const { username, avatar } = req.body;
    const updateData = {};
    
    if (username) updateData.username = username;
    if (avatar) updateData.avatar = avatar;
    
    const { data: userData, error: userError } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', req.user.id)
      .select()
      .single();
    
    if (userError) {
      return res.status(400).json(formatResponse(false, null, userError.message));
    }
    
    res.json(formatResponse(true, userData, '更新成功'));
    
  } catch (error) {
    res.status(500).json(handleSupabaseError(error));
  }
});

// ========================
// 游戏相关 API
// ========================

// 获取游戏列表
app.get('/api/games', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });
    
    if (error) {
      return res.status(400).json(handleSupabaseError(error));
    }
    
    res.json(formatResponse(true, data));
    
  } catch (error) {
    res.status(500).json(handleSupabaseError(error));
  }
});

// 获取游戏详情
app.get('/api/games/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single();
    
    if (error) {
      return res.status(404).json(formatResponse(false, null, '游戏不存在'));
    }
    
    res.json(formatResponse(true, data));
    
  } catch (error) {
    res.status(500).json(handleSupabaseError(error));
  }
});

// ========================
// 帖子相关 API
// ========================

// 获取帖子列表
app.get('/api/posts', async (req, res) => {
  try {
    const { game_id, type, limit = 20, offset = 0 } = req.query;
    
    let query = supabase
      .from('posts')
      .select(`
        *,
        author:users(id, username, avatar, rating),
        game:games(id, name, category)
      `)
      .eq('is_active', true)
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);
    
    if (game_id) {
      query = query.eq('game_id', game_id);
    }
    
    if (type) {
      query = query.eq('type', type);
    }
    
    const { data, error } = await query;
    
    if (error) {
      return res.status(400).json(handleSupabaseError(error));
    }
    
    res.json(formatResponse(true, data));
    
  } catch (error) {
    res.status(500).json(handleSupabaseError(error));
  }
});

// 创建帖子 (需要认证)
app.post('/api/posts', authenticate, async (req, res) => {
  try {
    const { content, type, game_id } = req.body;
    
    if (!content || !type) {
      return res.status(400).json(formatResponse(false, null, '请填写必要信息'));
    }
    
    const { data, error } = await supabase
      .from('posts')
      .insert([
        {
          content,
          type,
          game_id,
          author_id: req.user.id
        }
      ])
      .select(`
        *,
        author:users(id, username, avatar, rating),
        game:games(id, name, category)
      `)
      .single();
    
    if (error) {
      return res.status(400).json(handleSupabaseError(error));
    }
    
    res.status(201).json(formatResponse(true, data, '发布成功'));
    
  } catch (error) {
    res.status(500).json(handleSupabaseError(error));
  }
});

// ========================
// 订单相关 API
// ========================

// 获取订单列表 (需要认证)
app.get('/api/orders', authenticate, async (req, res) => {
  try {
    const { status, limit = 20, offset = 0 } = req.query;
    
    let query = supabase
      .from('orders')
      .select(`
        *,
        initiator:users(id, username, avatar, rating),
        acceptor:users(id, username, avatar, rating),
        game:games(id, name, category)
      `)
      .or(`initiator_id.eq.${req.user.id},acceptor_id.eq.${req.user.id}`)
      .order('created_at', { ascending: false })
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);
    
    if (status) {
      query = query.eq('status', status);
    }
    
    const { data, error } = await query;
    
    if (error) {
      return res.status(400).json(handleSupabaseError(error));
    }
    
    res.json(formatResponse(true, data));
    
  } catch (error) {
    res.status(500).json(handleSupabaseError(error));
  }
});

// 创建订单 (需要认证)
app.post('/api/orders', authenticate, async (req, res) => {
  try {
    const { 
      title, 
      description, 
      type, 
      amount, 
      deadline, 
      urgency, 
      estimated_hours,
      game_id 
    } = req.body;
    
    if (!title || !type || !amount) {
      return res.status(400).json(formatResponse(false, null, '请填写必要信息'));
    }
    
    // 计算担保费用和加急费用
    const guaranteeFee = Math.max(Math.min(amount * 0.03, 100), 1);
    let urgencyFee = 0;
    
    if (urgency >= 5) {
      urgencyFee = amount * 0.20; // 20% 加急费
    } else if (urgency >= 4) {
      urgencyFee = amount * 0.10; // 10% 加急费
    }
    
    const totalAmount = parseFloat(amount) + parseFloat(guaranteeFee) + parseFloat(urgencyFee || 0);
    
    const { data, error } = await supabase
      .from('orders')
      .insert([
        {
          title,
          description,
          type,
          amount,
          guarantee_fee: guaranteeFee,
          urgency_fee: urgencyFee,
          total_amount: totalAmount,
          deadline,
          urgency: urgency || 3,
          estimated_hours,
          game_id,
          initiator_id: req.user.id
        }
      ])
      .select(`
        *,
        initiator:users(id, username, avatar, rating),
        game:games(id, name, category)
      `)
      .single();
    
    if (error) {
      return res.status(400).json(handleSupabaseError(error));
    }
    
    res.status(201).json(formatResponse(true, data, '订单创建成功'));
    
  } catch (error) {
    res.status(500).json(handleSupabaseError(error));
  }
});

// 更新订单状态 (需要认证)
app.put('/api/orders/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, acceptor_id } = req.body;
    
    if (!status) {
      return res.status(400).json(formatResponse(false, null, '状态不能为空'));
    }
    
    // 先检查订单是否存在以及用户是否有权限
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();
    
    if (orderError) {
      return res.status(404).json(formatResponse(false, null, '订单不存在'));
    }
    
    // 验证用户权限
    if (orderData.initiator_id !== req.user.id && 
        orderData.acceptor_id !== req.user.id && 
        !(await checkIsAdmin(req.user.id))) {
      return res.status(403).json(formatResponse(false, null, '没有权限操作此订单'));
    }
    
    const updateData = { status };
    
    // 如果是确认订单，设置接受人
    if (status === 'processing' && acceptor_id) {
      updateData.acceptor_id = acceptor_id;
    }
    
    const { data, error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        initiator:users(id, username, avatar, rating),
        acceptor:users(id, username, avatar, rating),
        game:games(id, name, category)
      `)
      .single();
    
    if (error) {
      return res.status(400).json(handleSupabaseError(error));
    }
    
    res.json(formatResponse(true, data, '订单更新成功'));
    
  } catch (error) {
    res.status(500).json(handleSupabaseError(error));
  }
});

// 辅助函数：检查用户是否为管理员
const checkIsAdmin = async (userId) => {
  const { data, error } = await supabase
    .from('users')
    .select('role')
    .eq('id', userId)
    .single();
  
  return !error && data && data.role === 'admin';
}

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 GameTrust API服务器运行在 http://localhost:${PORT}`);
  console.log(`📱 Supabase集成已启用`);
  console.log(`🗄️ 数据库URL: ${process.env.SUPABASE_URL}`);
});