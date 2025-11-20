import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: { title: '首页' }
  },
  {
    path: '/games',
    name: 'Games',
    component: () => import('@/views/Games.vue'),
    meta: { title: '游戏' }
  },
  {
    path: '/game/:id',
    name: 'GameDetail',
    component: () => import('@/views/GameDetail.vue'),
    meta: { title: '游戏详情' }
  },
  // 社群功能暂时隐藏
  // {
  //   path: '/community',
  //   name: 'Community',
  //   component: () => import('@/views/Community.vue'),
  //   meta: { title: '社群' }
  // },
  {
    path: '/orders',
    name: 'Orders',
    component: () => import('@/views/Orders.vue'),
    meta: { title: '订单' }
  },
  {
    path: '/orders/create',
    name: 'CreateOrder',
    component: () => import('@/views/CreateOrder.vue'),
    meta: { title: '创建订单' }
  },
  {
    path: '/demand/create',
    name: 'CreateDemand',
    component: () => import('@/views/CreateDemand.vue'),
    meta: { title: '发布需求' }
  },
  {
    path: '/demand/:id',
    name: 'DemandDetail',
    component: () => import('@/views/DemandDetail.vue'),
    meta: { title: '需求详情' }
  },
  {
    path: '/demands',
    name: 'DemandList',
    component: () => import('@/views/DemandList.vue'),
    meta: { title: '需求大厅' }
  },
  {
    path: '/order/:id',
    name: 'OrderDetail',
    component: () => import('@/views/OrderDetail.vue'),
    meta: { title: '订单详情' }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/Profile.vue'),
    meta: { title: '我的' }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/Register.vue'),
    meta: { title: '注册' }
  },
  {
    path: '/messages',
    name: 'Messages',
    component: () => import('@/views/Messages.vue'),
    meta: { title: '消息' }
  },
  {
    path: '/chat/:id',
    name: 'Chat',
    component: () => import('@/views/Chat.vue'),
    meta: { title: '聊天' }
  },
  {
    path: '/friends',
    name: 'Friends',
    component: () => import('@/views/Friends.vue'),
    meta: { title: '好友' }
  },
  {
    path: '/profile/:id?',
    name: 'UserProfile',
    component: () => import('@/views/UserProfile.vue'),
    meta: { title: '用户资料' }
  },
  {
    path: '/support',
    name: 'Support',
    component: () => import('@/views/Support.vue'),
    meta: { title: '客服中心' }
  },
  {
    path: '/search',
    name: 'Search',
    component: () => import('@/views/Search.vue'),
    meta: { title: '搜索' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  if (to.meta.title) {
    document.title = `${to.meta.title} - GameTrust`
  }
  next()
})

export default router