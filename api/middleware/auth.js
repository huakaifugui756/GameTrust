const { supabase } = require('../supabaseClient');

// 格式化响应的辅助函数
const formatResponse = (success, data = null, message = '', error = null, code = 200) => {
  const response = { success };
  if (data !== null) response.data = data;
  if (message) response.message = message;
  if (error) response.error = error;
  if (code !== 200) response.code = code;
  return response;
};

// 增强的身份验证中间件
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json(formatResponse(false, null, '未提供认证令牌', null, 401));
    }

    const token = authHeader.split(' ')[1];
    
    // 验证JWT令牌
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json(formatResponse(false, null, '无效的认证令牌', null, 401));
    }

    // 检查用户是否被封禁
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, status, is_verified, role')
      .eq('id', user.id)
      .single();
    
    if (userError) {
      return res.status(500).json(formatResponse(false, null, '获取用户信息失败', null, 500));
    }
    
    if (userData.status !== 'active') {
      return res.status(403).json(formatResponse(false, null, '账户已被禁用', null, 403));
    }
    
    if (!userData.is_verified) {
      return res.status(403).json(formatResponse(false, null, '账户未通过验证', null, 403));
    }

    // 将用户信息添加到请求对象
    req.user = {
      ...user,
      role: userData.role,
      isVerified: userData.is_verified
    };
    
    // 记录API访问日志
    await logApiAccess(req, user.id, 'authenticated');
    
    next();
  } catch (error) {
    console.error('身份验证错误:', error);
    return res.status(500).json(formatResponse(false, null, '服务器内部错误', null, 500));
  }
};

// 管理员权限验证中间件
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json(formatResponse(false, null, '需要管理员权限', null, 403));
  }
  next();
};

// 可选身份验证中间件（不强制要求登录）
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      req.user = null;
      return next();
    }

    // 获取用户详细信息
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, status, is_verified, role')
      .eq('id', user.id)
      .single();
    
    if (!userError && userData.status === 'active') {
      req.user = {
        ...user,
        role: userData.role,
        isVerified: userData.is_verified
      };
    } else {
      req.user = null;
    }
    
    next();
  } catch (error) {
    console.error('可选身份验证错误:', error);
    req.user = null;
    next();
  }
};

// 用户资源权限验证中间件
const checkResourceOwnership = (resourceTable, userIdField = 'user_id') => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json(formatResponse(false, null, '需要登录', null, 401));
      }

      const resourceId = req.params.id || req.body[userIdField];
      
      // 管理员可以访问所有资源
      if (req.user.role === 'admin') {
        return next();
      }

      const { data: resource, error } = await supabase
        .from(resourceTable)
        .select(`${userIdField}`)
        .eq('id', resourceId)
        .single();
      
      if (error || !resource) {
        return res.status(404).json(formatResponse(false, null, '资源不存在', null, 404));
      }

      if (resource[userIdField] !== req.user.id) {
        return res.status(403).json(formatResponse(false, null, '没有权限访问此资源', null, 403));
      }

      next();
    } catch (error) {
      console.error('资源权限验证错误:', error);
      return res.status(500).json(formatResponse(false, null, '服务器内部错误', null, 500));
    }
  };
};

// API访问日志记录
const logApiAccess = async (req, userId, accessType) => {
  try {
    const logData = {
      user_id: userId,
      method: req.method,
      path: req.path,
      ip: req.ip || req.connection.remoteAddress,
      user_agent: req.get('User-Agent'),
      access_type: accessType,
      created_at: new Date().toISOString()
    };

    // 这里可以写入日志表或发送到日志服务
    console.log('API访问日志:', logData);
    
    // 如果需要持久化日志，可以使用以下代码
    // await supabase.from('api_access_logs').insert([logData]);
  } catch (error) {
    console.error('记录API访问日志失败:', error);
  }
};

module.exports = {
  authenticate,
  requireAdmin,
  optionalAuth,
  checkResourceOwnership,
  formatResponse,
  logApiAccess
};