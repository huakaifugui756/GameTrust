import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '../supabase'

export const useAuthStore = defineStore('auth', () => {
  // 状态
  const user = ref(null)
  const token = ref(localStorage.getItem('token') || '')
  const isLoggedIn = computed(() => !!token.value && !!user.value)
  const isLoading = ref(false)

  // 监听认证状态变化
  const initAuth = () => {
    // 监听Supabase认证状态变化
    supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session)
      
      if (event === 'SIGNED_IN') {
        token.value = session.access_token
        localStorage.setItem('token', session.access_token)
        
        // 获取用户详细信息
        const { data: userData, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()
        
        if (userData) {
          user.value = userData
          localStorage.setItem('user', JSON.stringify(userData))
        }
      } else if (event === 'SIGNED_OUT') {
        logout()
      }
    })

    // 初始化时检查现有会话
    checkAuthStatus()
  }

  // 登录
  const login = async (credentials) => {
    isLoading.value = true
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        phone: credentials.phone,
        password: credentials.password
      })

      if (error) throw error

      // 获取用户详细信息
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single()

      if (userError) throw userError

      user.value = userData
      token.value = data.session.access_token

      return { success: true, data: { token: data.session.access_token, user: userData } }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: error.message }
    } finally {
      isLoading.value = false
    }
  }

  // 短信验证码登录
  const smsLogin = async (credentials) => {
    isLoading.value = true
    
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone: credentials.phone,
        token: credentials.code,
        type: 'sms'
      })

      if (error) throw error

      // 获取或创建用户信息
      let { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single()

      if (userError && userError.code === 'PGRST116') {
        // 用户不存在，创建新用户
        const { data: newUserData, error: createError } = await supabase
          .from('users')
          .insert([
            {
              id: data.user.id,
              phone: credentials.phone,
              role: 'user'
            }
          ])
          .select()
          .single()
        
        if (createError) throw createError
        
        userData = newUserData
      } else if (userError) {
        throw userError
      }

      user.value = userData
      token.value = data.session.access_token

      return { success: true, data: { token: data.session.access_token, user: userData } }
    } catch (error) {
      console.error('SMS login error:', error)
      return { success: false, error: error.message }
    } finally {
      isLoading.value = false
    }
  }

  // 注册
  const register = async (userData) => {
    isLoading.value = true
    
    try {
      // 1. 注册到Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        phone: userData.phone,
        password: userData.password,
        options: {
          data: {
            username: userData.username
          }
        }
      })

      if (error) throw error

      // 2. 在public.users表中创建用户记录
      const { data: userRecord, error: userError } = await supabase
        .from('users')
        .insert([
          {
            id: data.user.id,
            phone: userData.phone,
            username: userData.username,
            role: 'user' // 默认为普通用户
          }
        ])
        .select()
        .single()

      if (userError) throw userError

      // 如果不需要邮箱验证，直接登录
      if (!data.user.email_confirmed_at && data.user.email) {
        return { 
          success: true, 
          data: { 
            message: '注册成功，请查收邮箱验证链接',
            userId: data.user.id
          } 
        }
      }

      user.value = userRecord
      token.value = data.session?.access_token || ''

      return { success: true, data: { token: data.session?.access_token || '', user: userRecord } }
    } catch (error) {
      console.error('Registration error:', error)
      return { success: false, error: error.message }
    } finally {
      isLoading.value = false
    }
  }

  // 发送短信验证码
  const sendSmsCode = async (phone) => {
    isLoading.value = true
    
    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone,
        options: {
          shouldCreateUser: false // 只为现有用户发送验证码
        }
      })

      if (error) throw error

      return { success: true, data: { message: '验证码已发送' } }
    } catch (error) {
      console.error('Send SMS error:', error)
      return { success: false, error: error.message }
    } finally {
      isLoading.value = false
    }
  }

  // 登出
  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) console.error('Logout error:', error)
    } catch (error) {
      console.error('Logout error:', error)
    }

    user.value = null
    token.value = ''
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  // 初始化用户信息（从本地存储恢复）
  const initUser = async () => {
    const savedUser = localStorage.getItem('user')
    const savedToken = localStorage.getItem('token')
    
    if (savedUser && savedToken) {
      try {
        user.value = JSON.parse(savedUser)
        token.value = savedToken
      } catch (error) {
        console.error('Failed to parse user data:', error)
        logout()
      }
    }
  }

  // 更新用户信息
  const updateUser = async (newUserData) => {
    isLoading.value = true
    
    try {
      const { data, error } = await supabase
        .from('users')
        .update(newUserData)
        .eq('id', user.value.id)
        .select()
        .single()
      
      if (error) throw error
      
      user.value = { ...user.value, ...data }
      localStorage.setItem('user', JSON.stringify(user.value))
      
      return { success: true, data: user.value }
    } catch (error) {
      console.error('Update user error:', error)
      return { success: false, error: error.message }
    } finally {
      isLoading.value = false
    }
  }

  // 检查登录状态
  const checkAuthStatus = async () => {
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('Check auth status error:', error)
      logout()
      return false
    }

    if (session) {
      token.value = session.access_token
      
      // 获取用户详细信息
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single()
      
      if (userData) {
        user.value = userData
        localStorage.setItem('user', JSON.stringify(userData))
        return true
      } else {
        logout()
        return false
      }
    } else {
      logout()
      return false
    }
  }

  // 初始化
  initAuth()

  return {
    // 状态
    user,
    token,
    isLoggedIn,
    isLoading,
    
    // 方法
    login,
    smsLogin,
    register,
    logout,
    initUser,
    updateUser,
    checkAuthStatus,
    sendSmsCode
  }
})

