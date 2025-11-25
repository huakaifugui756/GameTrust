import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  // 状态
  const user = ref(null)
  const token = ref(localStorage.getItem('token') || '')
  const isLoggedIn = computed(() => !!token.value && !!user.value)

  // 登录
  const login = async (credentials) => {
    try {
      // 模拟API调用
      const response = await mockLoginApi(credentials)
      
      // 保存token和用户信息
      token.value = response.token
      user.value = response.user
      
      // 持久化存储
      localStorage.setItem('token', response.token)
      localStorage.setItem('user', JSON.stringify(response.user))
      
      return { success: true, data: response }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // 注册
  const register = async (userData) => {
    try {
      // 模拟API调用
      const response = await mockRegisterApi(userData)
      
      // 如果注册成功，自动登录
      if (response.userId) {
        const loginData = await mockLoginApi({
          phone: userData.phone,
          password: userData.password
        })
        
        // 保存token和用户信息
        token.value = loginData.token
        user.value = {
          ...loginData.user,
          role: response.role,
          isAdmin: response.isAdmin
        }
        
        // 保存到本地存储
        localStorage.setItem('token', token.value)
        localStorage.setItem('user', JSON.stringify(user.value))
      }
      
      return { success: true, data: response }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // 登出
  const logout = () => {
    user.value = null
    token.value = ''
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  // 初始化用户信息（从本地存储恢复）
  const initUser = () => {
    const savedUser = localStorage.getItem('user')
    if (savedUser && token.value) {
      try {
        user.value = JSON.parse(savedUser)
      } catch (error) {
        console.error('Failed to parse user data:', error)
        logout()
      }
    }
  }

  // 在store创建时自动初始化
  initUser()

  // 更新用户信息
  const updateUser = (newUserData) => {
    user.value = { ...user.value, ...newUserData }
    localStorage.setItem('user', JSON.stringify(user.value))
  }

  // 检查登录状态
  const checkAuthStatus = async () => {
    if (!token.value) return false
    
    try {
      // 模拟验证token的API调用
      const response = await mockValidateTokenApi(token.value)
      if (response.valid) {
        user.value = response.user
        return true
      } else {
        logout()
        return false
      }
    } catch (error) {
      logout()
      return false
    }
  }

  return {
    // 状态
    user,
    token,
    isLoggedIn,
    
    // 方法
    login,
    register,
    logout,
    initUser,
    updateUser,
    checkAuthStatus
  }
})

// 模拟API函数
const mockLoginApi = async (credentials) => {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // 简单的模拟验证逻辑
  if (credentials.phone === '13800138000' && credentials.password === '123456') {
    return {
      token: 'mock_token_' + Date.now(),
      user: {
        id: 1,
        phone: credentials.phone,
        name: '测试用户',
        avatar: 'https://picsum.photos/seed/user1/100/100.jpg',
        rating: 4.5,
        balance: 1000,
        role: 'user',
        isAdmin: false,
        createTime: new Date().toISOString()
      }
    }
  }
  
  // 模拟其他用户登录
  if (credentials.phone && credentials.password.length >= 6) {
    // 检查是否为管理员账号（手机号前缀为188）
    const isAdmin = credentials.phone.startsWith('188')
    
    return {
      token: 'mock_token_' + Date.now(),
      user: {
        id: Math.floor(Math.random() * 1000) + 1,
        phone: credentials.phone,
        name: isAdmin ? `管理员${credentials.phone.slice(-4)}` : `用户${credentials.phone.slice(-4)}`,
        avatar: isAdmin ? 'https://picsum.photos/seed/admin/100/100.jpg' : `https://picsum.photos/seed/user${Date.now()}/100/100.jpg`,
        rating: isAdmin ? 5.0 : (4.0 + Math.random()),
        balance: isAdmin ? 999999 : Math.floor(Math.random() * 2000),
        role: isAdmin ? 'admin' : 'user',
        isAdmin: isAdmin,
        createTime: new Date().toISOString()
      }
    }
  }
  
  throw new Error('手机号或密码错误')
}

const mockRegisterApi = async (userData) => {
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // 验证手机号格式
  const phoneRegex = /^1[3-9]\d{9}$/
  if (!phoneRegex.test(userData.phone)) {
    throw new Error('手机号格式不正确')
  }
  
  // 验证密码长度
  if (!userData.password || userData.password.length < 6 || userData.password.length > 20) {
    throw new Error('密码长度为6-20位')
  }
  
  // 检查是否为管理员账号（手机号前缀为188的自动设为管理员）
  const isAdmin = userData.phone.startsWith('188')
  const userId = Math.floor(Math.random() * 1000) + 1
  
  // 模拟注册成功，包含角色信息
  return {
    message: isAdmin ? '管理员账号注册成功' : '注册成功',
    userId: userId,
    role: isAdmin ? 'admin' : 'user',
    isAdmin: isAdmin
  }
}

const mockValidateTokenApi = async (token) => {
  await new Promise(resolve => setTimeout(resolve, 500))
  
  // 简单的token验证
  if (token && token.startsWith('mock_token_')) {
    return {
      valid: true,
      user: JSON.parse(localStorage.getItem('user') || '{}')
    }
  }
  
  return { valid: false }
}