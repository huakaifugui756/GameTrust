import { createRouter, createWebHistory } from "vue-router";

const routes = [
  {
    path: "/",
    name: "Home",
    component: () => import("@/views/Home.vue"),
    meta: { title: "首页" },
  },
  {
    path: "/games",
    name: "Games",
    component: () => import("@/views/Games.vue"),
    meta: { title: "游戏" },
  },
  {
    path: "/game/:id",
    name: "GameDetail",
    component: () => import("@/views/GameDetail.vue"),
    meta: { title: "游戏详情" },
  },
  // 社群功能暂时隐藏
  // {
  //   path: '/community',
  //   name: 'Community',
  //   component: () => import('@/views/Community.vue'),
  //   meta: { title: '社群' }
  // },
  {
    path: "/orders",
    name: "Orders",
    component: () => import("@/views/Orders.vue"),
    meta: { title: "订单", requiresAuth: true },
  },
  {
    path: "/orders/create",
    name: "CreateOrder",
    component: () => import("@/views/CreateOrder.vue"),
    meta: { title: "创建订单", requiresAuth: true },
  },
  // 需求相关功能暂时隐藏
  // {
  //   path: '/demand/create',
  //   name: 'CreateDemand',
  //   component: () => import('@/views/CreateDemand.vue'),
  //   meta: { title: '发布需求' }
  // },
  // {
  //   path: '/demand/:id',
  //   name: 'DemandDetail',
  //   component: () => import('@/views/DemandDetail.vue'),
  //   meta: { title: '需求详情' }
  // },
  // {
  //   path: '/demands',
  //   name: 'DemandList',
  //   component: () => import('@/views/DemandList.vue'),
  //   meta: { title: '需求大厅' }
  // },
  {
    path: "/order/:id",
    name: "OrderDetail",
    component: () => import("@/views/OrderDetail.vue"),
    meta: { title: "订单详情" },
  },
  {
    path: "/login",
    name: "Login",
    component: () => import("@/views/Login.vue"),
    meta: { title: "登录" },
  },
  {
    path: "/register",
    name: "Register",
    component: () => import("@/views/Register.vue"),
    meta: { title: "注册" },
  },
  {
    path: "/forgot-password",
    name: "ForgotPassword",
    component: () => import("@/views/ForgotPassword.vue"),
    meta: { title: "找回密码" },
  },
  {
    path: "/messages",
    name: "Messages",
    component: () => import("@/views/Messages.vue"),
    meta: { title: "消息", requiresAuth: true },
  },
  {
    path: "/chat/:id",
    name: "Chat",
    component: () => import("@/views/Chat.vue"),
    meta: { title: "聊天", requiresAuth: true },
  },
  {
    path: "/friends",
    name: "Friends",
    component: () => import("@/views/Friends.vue"),
    meta: { title: "好友", requiresAuth: true },
  },
  {
    path: "/profile",
    name: "Profile",
    component: () => import("@/views/Profile.vue"),
    meta: { title: "我的", requiresAuth: true },
  },
  {
    path: "/profile/edit",
    name: "ProfileEdit",
    component: () => import("@/views/ProfileEdit.vue"),
    meta: { title: "编辑资料", requiresAuth: true },
  },
  {
    path: "/profile/posts",
    name: "ProfilePosts",
    component: () => import("@/views/ProfilePosts.vue"),
    meta: { title: "我的帖子", requiresAuth: true },
  },
  {
    path: "/profile/favorites",
    name: "ProfileFavorites",
    component: () => import("@/views/ProfileFavorites.vue"),
    meta: { title: "我的收藏", requiresAuth: true },
  },
  {
    path: "/profile/verification",
    name: "ProfileVerification",
    component: () => import("@/views/ProfileVerification.vue"),
    meta: { title: "实名认证", requiresAuth: true },
  },
  {
    path: "/profile/security",
    name: "ProfileSecurity",
    component: () => import("@/views/ProfileSecurity.vue"),
    meta: { title: "安全设置", requiresAuth: true },
  },
  {
    path: "/user/:id",
    name: "UserProfile",
    component: () => import("@/views/UserProfile.vue"),
    meta: { title: "用户资料" },
  },
  {
    path: "/support",
    name: "Support",
    component: () => import("@/views/Support.vue"),
    meta: { title: "客服中心" },
  },
  {
    path: "/help",
    name: "Help",
    component: () => import("@/views/Help.vue"),
    meta: { title: "帮助中心" },
  },
  {
    path: "/about",
    name: "About",
    component: () => import("@/views/About.vue"),
    meta: { title: "关于我们" },
  },
  {
    path: "/search",
    name: "Search",
    component: () => import("@/views/Search.vue"),
    meta: { title: "搜索" },
  },
  {
    path: "/services",
    name: "Services",
    component: () => import("@/views/Services.vue"),
    meta: { title: "推荐服务" },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 路由守卫
router.beforeEach(async (to, from, next) => {
  // 设置页面标题
  if (to.meta.title) {
    document.title = `${to.meta.title} - GameTrust`;
  }

  // 检查是否需要登录
  const requiresAuth = to.meta.requiresAuth;

  if (requiresAuth) {
    // 动态导入auth store避免循环依赖
    const { useAuthStore } = await import("@/stores/auth");
    const authStore = useAuthStore();

    // 检查登录状态
    const isAuthenticated = await authStore.checkAuthStatus();

    if (!isAuthenticated) {
      // 未登录，跳转到登录页，并保存目标路由
      next({
        path: "/login",
        query: { redirect: to.fullPath },
      });
      return;
    }
  }

  // 如果已登录用户访问登录/注册页，重定向到首页
  if (
    (to.path === "/login" || to.path === "/register") &&
    to.query.redirect !== from.path
  ) {
    const { useAuthStore } = await import("@/stores/auth");
    const authStore = useAuthStore();

    if (authStore.isLoggedIn) {
      next("/");
      return;
    }
  }

  next();
});

export default router;
