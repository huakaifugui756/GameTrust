<template>
  <div id="app">
    <router-view />
    
    <!-- 底部导航栏 -->
    <van-tabbar v-model="active" route>
      <van-tabbar-item to="/" icon="home-o">首页</van-tabbar-item>
      <van-tabbar-item to="/games" icon="apps-o">游戏</van-tabbar-item>
      <van-tabbar-item to="/community" icon="chat-o">社群</van-tabbar-item>
      <van-tabbar-item to="/friends" icon="friends-o" :badge="friendRequests > 0 ? friendRequests : ''">好友</van-tabbar-item>
      <van-tabbar-item to="/messages" icon="chat-o" :badge="unreadCount > 0 ? unreadCount : ''">消息</van-tabbar-item>
      <van-tabbar-item to="/orders" icon="orders-o">订单</van-tabbar-item>
      <van-tabbar-item to="/profile/me" icon="user-o">我的</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const active = ref(0)

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
</style>