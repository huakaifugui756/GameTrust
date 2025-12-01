const { formatResponse } = require('./auth');

// 通用验证器
const validators = {
  // 邮箱验证
  email: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },
  
  // 手机号验证（中国大陆）
  phone: (phone) => {
    const phoneRegex = /^1[3-9]\d{9}$/;
    return phoneRegex.test(phone);
  },
  
  // 密码强度验证
  password: (password) => {
    // 至少8位，包含大小写字母、数字和特殊字符
    const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return strongRegex.test(password);
  },
  
  // 用户名验证
  username: (username) => {
    // 3-20个字符，只允许字母、数字和下划线
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    return usernameRegex.test(username);
  },
  
  // UUID验证
  uuid: (uuid) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  },
  
  // 数字验证
  number: (value, min = 0, max = Number.MAX_SAFE_INTEGER) => {
    const num = Number(value);
    return !isNaN(num) && num >= min && num <= max;
  },
  
  // 金额验证
  amount: (amount) => {
    const num = Number(amount);
    const amountRegex = /^\d+(\.\d{1,2})?$/;
    return amountRegex.test(amount) && num > 0 && num <= 999999.99;
  },
  
  // 时间戳验证
  timestamp: (timestamp) => {
    const date = new Date(timestamp);
    return !isNaN(date.getTime());
  },
  
  // 文本长度验证
  textLength: (text, minLength = 0, maxLength = 1000) => {
    return typeof text === 'string' && text.length >= minLength && text.length <= maxLength;
  },
  
  // 必填字段验证
  required: (value) => {
    return value !== null && value !== undefined && value !== '';
  },
  
  // 数组验证
  array: (value, minLength = 0, maxLength = 100) => {
    return Array.isArray(value) && value.length >= minLength && value.length <= maxLength;
  }
};

// 创建验证中间件
const validate = (schema) => {
  return (req, res, next) => {
    try {
      const errors = [];
      
      // 验证请求体
      if (schema.body) {
        for (const [field, rules] of Object.entries(schema.body)) {
          const value = req.body[field];
          
          // 检查必填字段
          if (rules.required && !validators.required(value)) {
            errors.push(`${field} 是必填字段`);
            continue;
          }
          
          // 如果值为空且不是必填，跳过其他验证
          if (!value && !rules.required) {
            continue;
          }
          
          // 类型验证
          if (rules.type && typeof value !== rules.type) {
            errors.push(`${field} 必须是 ${rules.type} 类型`);
            continue;
          }
          
          // 自定义验证
          if (rules.validator && !rules.validator(value)) {
            errors.push(rules.message || `${field} 格式不正确`);
            continue;
          }
          
          // 长度验证
          if (rules.minLength && value.length < rules.minLength) {
            errors.push(`${field} 长度不能少于 ${rules.minLength} 个字符`);
            continue;
          }
          
          if (rules.maxLength && value.length > rules.maxLength) {
            errors.push(`${field} 长度不能超过 ${rules.maxLength} 个字符`);
            continue;
          }
        }
      }
      
      // 验证查询参数
      if (schema.query) {
        for (const [field, rules] of Object.entries(schema.query)) {
          const value = req.query[field];
          
          // 检查必填字段
          if (rules.required && !validators.required(value)) {
            errors.push(`查询参数 ${field} 是必填字段`);
            continue;
          }
          
          // 自定义验证
          if (rules.validator && !rules.validator(value)) {
            errors.push(rules.message || `查询参数 ${field} 格式不正确`);
            continue;
          }
        }
      }
      
      // 验证路径参数
      if (schema.params) {
        for (const [field, rules] of Object.entries(schema.params)) {
          const value = req.params[field];
          
          // 检查必填字段
          if (rules.required && !validators.required(value)) {
            errors.push(`路径参数 ${field} 是必填字段`);
            continue;
          }
          
          // 自定义验证
          if (rules.validator && !rules.validator(value)) {
            errors.push(rules.message || `路径参数 ${field} 格式不正确`);
            continue;
          }
        }
      }
      
      if (errors.length > 0) {
        return res.status(400).json(formatResponse(false, null, '请求参数验证失败', errors, 400));
      }
      
      next();
    } catch (error) {
      console.error('验证中间件错误:', error);
      return res.status(500).json(formatResponse(false, null, '服务器内部错误', null, 500));
    }
  };
};

// 预定义的验证模式
const schemas = {
  // 用户注册验证
  userRegister: {
    body: {
      email: {
        required: true,
        validator: validators.email
      },
      password: {
        required: true,
        validator: validators.password,
        message: '密码必须至少8位，包含大小写字母、数字和特殊字符'
      },
      phone: {
        required: true,
        validator: validators.phone,
        message: '请输入有效的11位手机号'
      },
      username: {
        required: true,
        validator: validators.username,
        message: '用户名只能包含字母、数字和下划线，长度3-20位'
      }
    }
  },
  
  // 用户登录验证
  userLogin: {
    body: {
      phone: {
        required: true,
        validator: validators.phone,
        message: '请输入有效的11位手机号'
      },
      password: {
        required: true,
        type: 'string',
        minLength: 6,
        message: '密码不能为空且至少6位'
      }
    }
  },
  
  // 创建订单验证
  createOrder: {
    body: {
      title: {
        required: true,
        validator: (value) => validators.textLength(value, 5, 100),
        message: '标题长度必须在5-100个字符之间'
      },
      description: {
        required: false,
        validator: (value) => !value || validators.textLength(value, 0, 2000),
        message: '描述不能超过2000个字符'
      },
      type: {
        required: true,
        validator: (value) => ['game', 'account', 'item', 'service'].includes(value),
        message: '订单类型必须是 game、account、item 或 service 之一'
      },
      amount: {
        required: true,
        validator: validators.amount,
        message: '金额必须是有效的正数，最多2位小数'
      },
      urgency: {
        required: true,
        validator: (value) => validators.number(value, 1, 5),
        message: '紧急程度必须在1-5之间'
      },
      estimated_hours: {
        required: false,
        validator: (value) => !value || validators.number(value, 1, 168),
        message: '预估时间必须在1-168小时之间'
      },
      deadline: {
        required: false,
        validator: validators.timestamp,
        message: '截止日期必须是有效的时间戳'
      }
    }
  },
  
  // 创建帖子验证
  createPost: {
    body: {
      content: {
        required: true,
        validator: (value) => validators.textLength(value, 10, 5000),
        message: '内容长度必须在10-5000个字符之间'
      },
      type: {
        required: true,
        validator: (value) => ['text', 'image', 'link'].includes(value),
        message: '帖子类型必须是 text、image 或 link 之一'
      },
      game_id: {
        required: false,
        validator: validators.uuid,
        message: '游戏ID必须是有效的UUID'
      }
    }
  },
  
  // 分页参数验证
  pagination: {
    query: {
      limit: {
        required: false,
        validator: (value) => !value || validators.number(value, 1, 50),
        message: '每页数量必须在1-50之间'
      },
      offset: {
        required: false,
        validator: (value) => !value || validators.number(value, 0),
        message: '偏移量必须是非负整数'
      }
    }
  }
};

module.exports = {
  validators,
  validate,
  schemas
};