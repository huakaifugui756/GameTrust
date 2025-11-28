# GameTrust 开发快速指南

## 快速开始

### 1. 环境准备

确保您的开发环境已安装以下工具：
- Node.js 16+
- npm 或 yarn
- Git

### 2. 克隆项目

```bash
git clone <repository-url>
cd changpu-demo
```

### 3. 安装依赖

```bash
# 安装前端依赖
npm install

# 安装后端依赖
cd api
npm install
cd ..
```

### 4. 环境变量配置

1. 复制环境变量模板
   ```bash
   # 前端环境变量已创建在 .env 文件
   # 后端环境变量已创建在 api/.env 文件
   ```

2. 确认Supabase配置正确
   ```bash
   # 检查前端环境变量
   cat .env
   
   # 检查后端环境变量
   cat api/.env
   ```

### 5. 启动开发服务器

```bash
# 启动后端API服务 (终端1)
cd api
npm run dev
# 或 npm start (生产模式)

# 启动前端开发服务器 (终端2)
cd ..
npm run dev
```

### 6. 访问应用

- 前端应用: http://localhost:5173
- 后端API: http://localhost:3005

## 核心功能开发指南

### 认证功能

#### 用户注册

```javascript
import { useAuthStore } from './stores/auth'

const authStore = useAuthStore()

const register = async () => {
  const { success, data, error } = await authStore.register({
    email: 'user@example.com',
    phone: '13800138000',
    password: 'password123',
    username: '用户名'
  })
  
  if (success) {
    // 注册成功，data包含token和用户信息
    console.log('注册成功:', data)
  } else {
    // 注册失败，error包含错误信息
    console.error('注册失败:', error)
  }
}
```

#### 用户登录

```javascript
import { useAuthStore } from './stores/auth'

const authStore = useAuthStore()

const login = async () => {
  const { success, data, error } = await authStore.login({
    phone: '13800138000',
    password: 'password123'
  })
  
  if (success) {
    // 登录成功，data包含token和用户信息
    console.log('登录成功:', data)
  } else {
    // 登录失败，error包含错误信息
    console.error('登录失败:', error)
  }
}
```

#### 短信验证码登录

```javascript
import { useAuthStore } from './stores/auth'

const authStore = useAuthStore()

// 发送验证码
const sendSms = async () => {
  const { success, data, error } = await authStore.sendSmsCode('13800138000')
  
  if (success) {
    console.log('验证码发送成功:', data)
  } else {
    console.error('验证码发送失败:', error)
  }
}

// 验证码登录
const smsLogin = async () => {
  const { success, data, error } = await authStore.smsLogin({
    phone: '13800138000',
    code: '123456'
  })
  
  if (success) {
    console.log('登录成功:', data)
  } else {
    console.error('登录失败:', error)
  }
}
```

### API调用

#### 直接使用Supabase客户端

```javascript
import { supabase } from './supabase'

// 获取游戏列表
const getGames = async () => {
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .eq('is_active', true)
    .order('sort_order')
  
  if (error) {
    console.error('获取游戏列表失败:', error)
    return []
  }
  
  return data
}

// 创建订单
const createOrder = async (orderData) => {
  const { data, error } = await supabase
    .from('orders')
    .insert({
      ...orderData,
      initiator_id: supabase.auth.user().id
    })
    .select()
    .single()
  
  if (error) {
    console.error('创建订单失败:', error)
    return null
  }
  
  return data
}
```

#### 使用封装的API服务

```javascript
import { supabaseApi, apiService } from './api'

// 获取游戏列表 (带缓存)
const games = await supabaseApi.games.getAll()

// 创建订单
const order = await supabaseApi.orders.create({
  title: '订单标题',
  type: '代练',
  amount: 100,
  game_id: 'uuid'
})

// 使用后端API
const orders = await apiService.orders.getAll({ status: 'pending' })
```

### 组件开发

#### 虚拟列表组件 (处理长列表)

```javascript
import VirtualList from './components/VirtualList.vue'

// 在模板中使用
<VirtualList 
  :items="messages" 
  :item-height="80"
  :container-height="400"
  :get-item-key="(item) => item.id"
>
  <template #default="{ item, index }">
    <div class="message-item">
      {{ item.content }}
    </div>
  </template>
</VirtualList>
```

#### 错误处理

```javascript
import errorHandler from './utils/request'

// 处理API错误
try {
  const result = await someApiCall()
} catch (error) {
  errorHandler.handleApiError(error)
}

// 处理Supabase错误
try {
  const result = await supabaseCall()
} catch (error) {
  errorHandler.handleSupabaseError(error)
}
```

#### 网络状态监控

```javascript
import { networkMonitor } from './utils/request'

// 检查网络状态
if (networkMonitor.isOnline) {
  // 执行网络操作
} else {
  // 显示离线提示
}

// 确保网络可用
try {
  await networkMonitor.ensureOnline()
  // 网络可用，执行操作
} catch (error) {
  // 网络不可用或超时
}
```

### 缓存使用

```javascript
import { withCache } from './utils/cache'

// 缓存API调用
const getCachedGames = withCache(
  async () => {
    // 实际API调用
    return await fetchGames()
  },
  () => 'games:list',
  300000 // 缓存5分钟
)

// 使用缓存函数
const games = await getCachedGames()
```

### 数据库操作

#### 查询数据

```javascript
// 基本查询
const { data } = await supabase
  .from('orders')
  .select('*')
  .eq('status', 'pending')

// 关联查询
const { data } = await supabase
  .from('orders')
  .select(`
    *,
    initiator:users(id, username, avatar),
    game:games(id, name)
  `)

// 分页查询
const { data } = await supabase
  .from('orders')
  .select('*')
  .range(0, 19) // 获取前20条
```

#### 插入数据

```javascript
const { data } = await supabase
  .from('posts')
  .insert([
    { content: '内容', type: '需求', author_id: userId }
  ])
  .select()
```

#### 更新数据

```javascript
const { data } = await supabase
  .from('users')
  .update({ username: '新用户名' })
  .eq('id', userId)
  .select()
```

### 实时功能

```javascript
// 监听订单状态变更
const subscription = supabase
  .channel('order-updates')
  .on('postgres_changes', 
    { 
      event: 'UPDATE', 
      schema: 'public', 
      table: 'orders',
      filter: `id=eq.${orderId}`
    },
    (payload) => {
      console.log('订单状态变更:', payload.new)
      // 更新UI
    }
  )
  .subscribe()

// 取消订阅
subscription.unsubscribe()
```

## 常见问题

### 1. Supabase连接问题

检查环境变量是否正确配置：
```bash
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_ANON_KEY
```

### 2. 数据库操作权限问题

确保RLS策略正确设置，检查用户权限：
```javascript
// 检查当前用户
const { data: user } = await supabase.auth.getUser()

// 检查用户角色
const { data: profile } = await supabase
  .from('users')
  .select('role')
  .eq('id', user.id)
  .single()
```

### 3. 前端路由问题

确保Vue Router配置正确：
```javascript
// router/index.js
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // 路由配置
  ]
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 检查登录状态
})
```

### 4. 性能问题

使用缓存和虚拟列表优化：
```javascript
// 使用缓存API
const data = await supabaseApi.games.getAll()

// 使用虚拟列表
<VirtualList :items="longList" :item-height="50">
  <!-- 列表项 -->
</VirtualList>
```

## 调试技巧

### 1. 前端调试

```javascript
// 开启Vue DevTools
// 在浏览器控制台使用以下命令调试

// 查看当前用户状态
console.log(window.__VUE_DEVTOOLS_GLOBAL_HOOK__)

// 查看Pinia状态
import { useAuthStore } from './stores/auth'
const authStore = useAuthStore()
console.log(authStore.user)
```

### 2. API调试

```javascript
// 在浏览器网络面板查看API请求
// 检查请求头是否包含正确的Authorization
```

### 3. Supabase调试

```javascript
// 启用Supabase日志
supabase.setDebug(true)

// 在Supabase控制台查看实时日志
```

## 部署指南

### 1. 前端部署

```bash
# 构建生产版本
npm run build

# 部署到静态托管
# 上传dist目录到服务器或使用CI/CD
```

### 2. 后端部署

```bash
# 安装生产依赖
cd api
npm ci --production

# 使用PM2管理进程
npm install -g pm2
pm2 start server.js --name "gametrust-api"

# 配置Nginx反向代理 (可选)
```

### 3. 环境变量配置

确保生产环境中的环境变量正确设置：
```bash
# 前端
VITE_SUPABASE_URL=your-production-url
VITE_SUPABASE_ANON_KEY=your-production-anon-key

# 后端
SUPABASE_URL=your-production-url
SUPABASE_ANON_KEY=your-production-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-production-service-key
```

## 贡献指南

1. Fork项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建Pull Request

确保提交的代码：
- 符合项目代码规范
- 包含必要的测试
- 更新相关文档

## 资源链接

- [Vue 3文档](https://vuejs.org/)
- [Supabase文档](https://supabase.com/docs)
- [Vant UI文档](https://vant-contrib.gitee.io/vant/#/zh-CN/)
- [Pinia文档](https://pinia.vuejs.org/)

## 联系方式

如有问题或建议，请联系开发团队。