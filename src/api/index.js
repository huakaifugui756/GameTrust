import { supabase } from '../supabase'
import axios from 'axios'
import { withCache, debounce } from '../utils/cache'
import cache from '../utils/cache'
import { 
  errorHandler, 
  retryRequest, 
  networkMonitor, 
  requestQueue 
} from '../utils/request'

// 创建axios实例
const apiClient = axios.create({
  baseURL: 'http://localhost:3005/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器 - 添加认证token
apiClient.interceptors.request.use(
  config => {
    // 添加请求时间戳，防止缓存
    config.params = {
      ...config.params,
      _t: Date.now()
    }
    
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器 - 统一处理错误
apiClient.interceptors.response.use(
  response => {
    return response.data
  },
  error => {
    // 统一处理API错误
    errorHandler.handleApiError(error)
    return Promise.reject(error)
  }
)

// 直接使用Supabase进行数据库操作的API
export const supabaseApi = {
  // 游戏相关API
  games: {
    // 缓存游戏列表数据5分钟
    getAll: withCache(
      async () => {
        const { data, error } = await retryRequest(async () => {
          return await supabase
            .from('games')
            .select('*')
            .eq('is_active', true)
            .order('sort_order', { ascending: true })
        })
        
        if (error) throw error
        return data
      },
      () => 'games:list',
      300000 // 5分钟缓存
    ),
    
    getById: withCache(
      async (id) => {
        const { data, error } = await retryRequest(async () => {
          return await supabase
            .from('games')
            .select('*')
            .eq('id', id)
            .eq('is_active', true)
            .single()
        })
        
        if (error) throw error
        return data
      },
      (id) => `game:${id}`,
      600000 // 10分钟缓存
    )
  },
  
  // 用户相关API
  users: {
    updateProfile: async (userData) => {
      const { data, error } = await supabase
        .from('users')
        .update(userData)
        .eq('id', supabase.auth.user()?.id)
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    
    getById: async (id) => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) throw error
      return data
    }
  },
  
  // 帖子相关API
  posts: {
    getAll: async (filters = {}) => {
      try {
        // 使用请求队列，确保请求按顺序处理
        return await requestQueue.add(async () => {
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
          
          if (filters.game_id) {
            query = query.eq('game_id', filters.game_id)
          }
          
          if (filters.type) {
            query = query.eq('type', filters.type)
          }
          
          if (filters.limit) {
            query = query.limit(filters.limit)
          }
          
          if (filters.offset) {
            query = query.range(filters.offset, filters.offset + (filters.limit || 20) - 1)
          }
          
          const { data, error } = await retryRequest(() => query)
          
          if (error) throw error
          return data
        })
      } catch (error) {
        errorHandler.handleSupabaseError(error)
        throw error
      }
    },
    
    create: async (postData) => {
      try {
        const user = supabase.auth.user()
        const { data, error } = await supabase
          .from('posts')
          .insert({
            ...postData,
            author_id: user.id
          })
          .select(`
            *,
            author:users(id, username, avatar, rating),
            game:games(id, name, category)
          `)
          .single()
        
        if (error) throw error
        
        // 创建成功后，清除相关缓存
        cache.delete('posts:list')
        if (postData.game_id) {
          cache.delete(`posts:game:${postData.game_id}`)
        }
        
        return data
      } catch (error) {
        errorHandler.handleSupabaseError(error)
        throw error
      }
    }
  },
  
  // 订单相关API
  orders: {
    getAll: async (filters = {}) => {
      try {
        const user = supabase.auth.user()
        // 不缓存订单数据，因为需要实时性
        let query = supabase
          .from('orders')
          .select(`
            *,
            initiator:users(id, username, avatar, rating),
            acceptor:users(id, username, avatar, rating),
            game:games(id, name, category)
          `)
          .or(`initiator_id.eq.${user.id},acceptor_id.eq.${user.id}`)
          .order('created_at', { ascending: false })
        
        if (filters.status) {
          query = query.eq('status', filters.status)
        }
        
        if (filters.limit) {
          query = query.limit(filters.limit)
        }
        
        if (filters.offset) {
          query = query.range(filters.offset, filters.offset + (filters.limit || 20) - 1)
        }
        
        const { data, error } = await retryRequest(() => query)
        
        if (error) throw error
        return data
      } catch (error) {
        errorHandler.handleSupabaseError(error)
        throw error
      }
    },
    
    create: async (orderData) => {
      try {
        const user = supabase.auth.user()
        
        // 计算担保费用和加急费用
        const guaranteeFee = Math.max(Math.min(orderData.amount * 0.03, 100), 1)
        let urgencyFee = 0
        
        if (orderData.urgency >= 5) {
          urgencyFee = orderData.amount * 0.20 // 20% 加急费
        } else if (orderData.urgency >= 4) {
          urgencyFee = orderData.amount * 0.10 // 10% 加急费
        }
        
        const totalAmount = parseFloat(orderData.amount) + parseFloat(guaranteeFee) + parseFloat(urgencyFee || 0)
        
        const { data, error } = await supabase
          .from('orders')
          .insert({
            ...orderData,
            guarantee_fee: guaranteeFee,
            urgency_fee: urgencyFee,
            total_amount: totalAmount,
            initiator_id: user.id
          })
          .select(`
            *,
            initiator:users(id, username, avatar, rating),
            game:games(id, name, category)
          `)
          .single()
        
        if (error) throw error
        return data
      } catch (error) {
        errorHandler.handleSupabaseError(error)
        throw error
      }
    },
    
    updateStatus: async (orderId, status, acceptorId) => {
      try {
        const user = supabase.auth.user()
        
        // 使用事务确保数据一致性
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .select('*')
          .eq('id', orderId)
          .single()
        
        if (orderError) throw orderError
        
        // 验证用户权限
        if (orderData.initiator_id !== user.id && 
            orderData.acceptor_id !== user.id) {
          throw new Error('没有权限操作此订单')
        }
        
        const updateData = { status }
        
        // 如果是确认订单，设置接受人
        if (status === 'processing' && acceptorId) {
          updateData.acceptor_id = acceptorId
        }
        
        const { data, error } = await supabase
          .from('orders')
          .update(updateData)
          .eq('id', orderId)
          .select(`
            *,
            initiator:users(id, username, avatar, rating),
            acceptor:users(id, username, avatar, rating),
            game:games(id, name, category)
          `)
          .single()
        
        if (error) throw error
        return data
      } catch (error) {
        errorHandler.handleSupabaseError(error)
        throw error
      }
    }
  },
  
  // 聊天相关API
  chat: {
    getRooms: async () => {
      const user = supabase.auth.user()
      const { data, error } = await supabase
        .from('chat_rooms')
        .select(`
          *,
          members:chat_members(
            user_id,
            role,
            joined_at,
            user:users(id, username, avatar)
          )
        `)
        .in('id', (
          supabase
            .from('chat_members')
            .select('room_id')
            .eq('user_id', user.id)
        ))
        .order('last_message_time', { ascending: false, nullsFirst: false })
      
      if (error) throw error
      return data
    },
    
    getMessages: async (roomId, limit = 50, offset = 0) => {
      const { data, error } = await supabase
        .from('chat_messages')
        .select(`
          *,
          sender:users(id, username, avatar)
        `)
        .eq('room_id', roomId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)
      
      if (error) throw error
      return data.reverse() // 按时间正序返回
    },
    
    sendMessage: async (roomId, content, type = 'text') => {
      const user = supabase.auth.user()
      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          room_id: roomId,
          sender_id: user.id,
          content,
          type
        })
        .select(`
          *,
          sender:users(id, username, avatar)
        `)
        .single()
      
      if (error) throw error
      return data
    },
    
    joinRoom: async (roomId, role = 'member') => {
      const user = supabase.auth.user()
      const { data, error } = await supabase
        .from('chat_members')
        .insert({
          room_id: roomId,
          user_id: user.id,
          role
        })
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    
    createGuaranteeRoom: async (orderId) => {
      const user = supabase.auth.user()
      
      // 1. 创建聊天室
      const { data: roomData, error: roomError } = await supabase
        .from('chat_rooms')
        .insert({
          name: `担保交易-${orderId}`,
          type: 'guarantee',
          order_id: orderId
        })
        .select()
        .single()
      
      if (roomError) throw roomError
      
      // 2. 将订单发起者加入聊天室
      await supabase
        .from('chat_members')
        .insert({
          room_id: roomData.id,
          user_id: user.id,
          role: 'member'
        })
      
      // 3. 添加系统消息
      await supabase
        .from('chat_messages')
        .insert({
          room_id: roomData.id,
          sender_id: user.id, // 使用发起者ID，但标记为系统消息
          content: '担保交易群聊已创建，等待管理员加入',
          type: 'system'
        })
      
      return roomData
    }
  }
}

// 使用后端API的函数
export const apiService = {
  // 认证相关API
  auth: {
    login: (credentials) => apiClient.post('/auth/login', credentials),
    register: (userData) => apiClient.post('/auth/register', userData),
    smsLogin: (credentials) => apiClient.post('/auth/sms-login', credentials),
    sendSms: (phone) => apiClient.post('/auth/send-sms', { phone }),
    getCurrentUser: () => apiClient.get('/auth/me'),
    updateProfile: (userData) => apiClient.put('/auth/me', userData)
  },
  
  // 游戏相关API
  games: {
    getAll: () => apiClient.get('/games'),
    getById: (id) => apiClient.get(`/games/${id}`)
  },
  
  // 帖子相关API
  posts: {
    getAll: (params) => apiClient.get('/posts', { params }),
    create: (postData) => apiClient.post('/posts', postData)
  },
  
  // 订单相关API
  orders: {
    getAll: (params) => apiClient.get('/orders', { params }),
    create: (orderData) => apiClient.post('/orders', orderData),
    update: (id, data) => apiClient.put(`/orders/${id}`, data)
  }
}

export default apiService