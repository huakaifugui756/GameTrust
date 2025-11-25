<template>
  <div id="app">
    <router-view />
    
    <!-- 底部导航栏 -->
    <van-tabbar v-model="active" route>
      <van-tabbar-item to="/" icon="home-o">首页</van-tabbar-item>
      <van-tabbar-item to="/games" icon="apps-o">游戏</van-tabbar-item>
      <van-tabbar-item to="/friends" icon="friends-o" :badge="friendRequests > 0 ? friendRequests : ''">好友</van-tabbar-item>
      <van-tabbar-item to="/messages" icon="chat-o" :badge="unreadCount > 0 ? unreadCount : ''">消息</van-tabbar-item>
      <van-tabbar-item 
        to="/profile" 
        :icon="isAdmin ? 'manager-o' : 'user-o'"
        :class="{ 'admin-tab': isAdmin }"
      >
        {{ isAdmin ? '管理' : '我的' }}
      </van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

const active = ref(0)
const authStore = useAuthStore()

// 模拟未读消息数量
const unreadCount = computed(() => {
  // 这里可以从状态管理中获取真实的未读消息数量
  return 6 // 示例：6条未读消息
})

// 模拟好友申请数量
const friendRequests = computed(() => {
  // 这里可以从状态管理中获取真实的好友申请数量
  return 2 // 示例：2条好友申请
})

// 检查是否为管理员
const isAdmin = computed(() => {
  return authStore.user?.isAdmin || false
})
</script>

<style lang="scss">
#app {
  min-height: 100vh;
  background-color: #f7f8fa;
}

// 适配移动端
@media (max-width: 768px) {
  #app {
    padding-bottom: 50px; // 为底部导航栏留出空间
  }
}

// 管理员标签样式
:deep(.admin-tab) {
  .van-tabbar-item__text {
    color: #1989fa;
    font-weight: 600;
  }
  
  .van-tabbar-item__icon {
    color: #1989fa;
  }
}
</style>