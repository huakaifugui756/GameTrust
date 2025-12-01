/**
 * API v1 认证控制器
 * 处理用户认证相关的API请求
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { supabase } = require('../../supabaseClient');
const CacheService = require('../../services/cacheService');
const Logger = require('../../services/logger');
const { validationResult } = require('express-validator');

// 缓存键前缀
const CACHE_PREFIX = 'auth';

/**
 * 生成JWT令牌
 * @param {Object} payload - 令牌载荷
 * @returns {string} JWT令牌
 */
function generateToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
}

/**
 * 验证令牌
 * @param {string} token - JWT令牌
 * @returns {Object} 解码后的令牌载荷
 */
function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

/**
 * 用户注册
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 */
async function register(req, res) {
  try {
    // 验证请求参数
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: '请求参数验证失败',
          details: errors.array()
        }
      });
    }

    const { phone, password, username, role = 'player' } = req.body;

    // 检查手机号是否已存在
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('phone', phone)
      .single();

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'PHONE_ALREADY_EXISTS',
          message: '手机号已被注册'
        }
      });
    }

    if (checkError && checkError.code !== 'PGRST116') {
      Logger.error('检查用户手机号失败', { error: checkError });
      throw checkError;
    }

    // 加密密码
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 创建用户
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert({
        phone,
        password: hashedPassword,
        username,
        role,
        is_active: true,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (createError) {
      Logger.error('创建用户失败', { error: createError });
      throw createError;
    }

    // 生成JWT令牌
    const token = generateToken({
      id: newUser.id,
      phone: newUser.phone,
      role: newUser.role
    });

    // 缓存用户信息
    CacheService.set(
      CacheService.createKey(CACHE_PREFIX, `user:${newUser.id}`),
      {
        id: newUser.id,
        phone: newUser.phone,
        username: newUser.username,
        role: newUser.role,
        is_active: newUser.is_active
      },
      600 // 10分钟
    );

    Logger.info('用户注册成功', { userId: newUser.id, phone });

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: newUser.id,
          phone: newUser.phone,
          username: newUser.username,
          role: newUser.role,
          rating: newUser.rating,
          is_active: newUser.is_active,
          created_at: newUser.created_at
        },
        token
      }
    });
  } catch (error) {
    Logger.error('用户注册失败', { error, body: req.body });
    res.status(500).json({
      success: false,
      error: {
        code: 'REGISTRATION_FAILED',
        message: '注册失败，请稍后重试'
      }
    });
  }
}

/**
 * 用户登录
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 */
async function login(req, res) {
  try {
    // 验证请求参数
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: '请求参数验证失败',
          details: errors.array()
        }
      });
    }

    const { phone, password } = req.body;

    // 查询用户
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('phone', phone)
      .single();

    if (!user || error) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: '手机号或密码错误'
        }
      });
    }

    // 检查用户是否激活
    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'ACCOUNT_DISABLED',
          message: '账号已被禁用'
        }
      });
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: '手机号或密码错误'
        }
      });
    }

    // 更新最后登录时间和登录次数
    const { error: updateError } = await supabase
      .from('users')
      .update({
        last_login_at: new Date().toISOString(),
        login_count: user.login_count + 1
      })
      .eq('id', user.id);

    if (updateError) {
      Logger.error('更新用户登录信息失败', { error, userId: user.id });
      // 不影响登录流程，只记录错误
    }

    // 生成JWT令牌
    const token = generateToken({
      id: user.id,
      phone: user.phone,
      role: user.role
    });

    // 缓存用户信息
    CacheService.set(
      CacheService.createKey(CACHE_PREFIX, `user:${user.id}`),
      {
        id: user.id,
        phone: user.phone,
        username: user.username,
        role: user.role,
        is_active: user.is_active
      },
      600 // 10分钟
    );

    Logger.info('用户登录成功', { userId: user.id, phone });

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          phone: user.phone,
          username: user.username,
          role: user.role,
          rating: user.rating,
          balance: user.balance,
          avatar_url: user.avatar_url,
          is_active: user.is_active
        },
        token
      }
    });
  } catch (error) {
    Logger.error('用户登录失败', { error, body: req.body });
    res.status(500).json({
      success: false,
      error: {
        code: 'LOGIN_FAILED',
        message: '登录失败，请稍后重试'
      }
    });
  }
}

/**
 * 验证令牌
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 */
async function verify(req, res) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'NO_TOKEN',
          message: '缺少认证令牌'
        }
      });
    }

    const token = authHeader.substring(7);
    
    try {
      const decoded = verifyToken(token);
      
      // 尝试从缓存获取用户信息
      let user = CacheService.get(CacheService.createKey(CACHE_PREFIX, `user:${decoded.id}`));
      
      if (!user) {
        // 缓存中没有，从数据库查询
        const { data: userData, error } = await supabase
          .from('users')
          .select('id, phone, username, role, is_active, rating, balance, avatar_url')
          .eq('id', decoded.id)
          .single();

        if (!userData || error || !userData.is_active) {
          return res.status(401).json({
            success: false,
            error: {
              code: 'INVALID_TOKEN',
              message: '认证令牌无效'
            }
          });
        }

        user = userData;
        
        // 更新缓存
        CacheService.set(
          CacheService.createKey(CACHE_PREFIX, `user:${decoded.id}`),
          user,
          600 // 10分钟
        );
      }
      
      res.json({
        success: true,
        data: { user }
      });
    } catch (tokenError) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: '认证令牌无效'
        }
      });
    }
  } catch (error) {
    Logger.error('令牌验证失败', { error });
    res.status(500).json({
      success: false,
      error: {
        code: 'VERIFICATION_FAILED',
        message: '验证失败，请稍后重试'
      }
    });
  }
}

/**
 * 刷新令牌
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 */
async function refresh(req, res) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'NO_TOKEN',
          message: '缺少认证令牌'
        }
      });
    }

    const token = authHeader.substring(7);
    
    try {
      const decoded = verifyToken(token);
      
      // 生成新的令牌
      const newToken = generateToken({
        id: decoded.id,
        phone: decoded.phone,
        role: decoded.role
      });
      
      // 清除用户缓存，强制下次请求从数据库获取最新信息
      CacheService.del(CacheService.createKey(CACHE_PREFIX, `user:${decoded.id}`));
      
      Logger.info('令牌刷新成功', { userId: decoded.id });
      
      res.json({
        success: true,
        data: { token: newToken }
      });
    } catch (tokenError) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: '认证令牌无效'
        }
      });
    }
  } catch (error) {
    Logger.error('令牌刷新失败', { error });
    res.status(500).json({
      success: false,
      error: {
        code: 'REFRESH_FAILED',
        message: '刷新令牌失败，请稍后重试'
      }
    });
  }
}

/**
 * 用户登出
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 */
async function logout(req, res) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      
      try {
        const decoded = verifyToken(token);
        
        // 清除用户缓存
        CacheService.del(CacheService.createKey(CACHE_PREFIX, `user:${decoded.id}`));
        
        Logger.info('用户登出成功', { userId: decoded.id });
      } catch (tokenError) {
        // 令牌无效，但不影响登出流程
        Logger.warn('登出时令牌验证失败', { error: tokenError });
      }
    }
    
    res.json({
      success: true,
      data: { message: 'Logged out successfully' }
    });
  } catch (error) {
    Logger.error('用户登出失败', { error });
    res.status(500).json({
      success: false,
      error: {
        code: 'LOGOUT_FAILED',
        message: '登出失败，请稍后重试'
      }
    });
  }
}

module.exports = {
  register,
  login,
  verify,
  refresh,
  logout,
  generateToken,
  verifyToken
};