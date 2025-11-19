<template>
  <div id="app">
    <router-view />

    <!-- 底部导航栏 -->
    <van-tabbar v-model="active" route>
      <van-tabbar-item to="/" icon="home-o">首页</van-tabbar-item>
      <van-tabbar-item to="/games" icon="apps-o">游戏</van-tabbar-item>
      <van-tabbar-item to="/community" icon="chat-o">社群</van-tabbar-item>
      <van-tabbar-item to="/messages" icon="chat-o" :badge="unreadCount"
        >消息</van-tabbar-item
      >
      <van-tabbar-item to="/orders" icon="orders-o">订单</van-tabbar-item>
      <van-tabbar-item to="/profile" icon="user-o">我的</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

const active = ref(0);

// 模拟未读消息数量
const unreadCount = ref(6);
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
