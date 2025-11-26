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
    
    <!-- 浮动客服按钮 -->
    <div class="floating-support" @click="goToSupport">
      <van-icon name="service" size="24" />
      <span>客服</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
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

// 跳转到客服中心
const goToSupport = () => {
  router.push('/support')
}
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

// 浮动客服按钮样式
.floating-support {
  position: fixed;
  bottom: 80px; // 在底部导航栏上方
  right: 20px;
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #1989fa 0%, #0066cc 100%);
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(25, 137, 250, 0.4);
  transition: all 0.3s ease;
  z-index: 1000;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(25, 137, 250, 0.5);
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 8px rgba(25, 137, 250, 0.4);
  }
  
  .van-icon {
    margin-bottom: 2px;
  }
  
  span {
    font-size: 10px;
    font-weight: 500;
  }
}

// 移动端适配
@media (max-width: 768px) {
  .floating-support {
    width: 50px;
    height: 50px;
    bottom: 70px;
    right: 15px;
    
    .van-icon {
      font-size: 20px;
    }
    
    span {
      font-size: 9px;
    }
  }
}
</style>