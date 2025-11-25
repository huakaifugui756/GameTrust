<template>
  <div class="profile-posts page-container">
    <van-nav-bar title="我的帖子" left-arrow @click-left="$router.go(-1)" />
    
    <div class="posts-list">
      <van-empty v-if="posts.length === 0" description="暂无帖子" />
      
      <div v-else class="post-item" v-for="post in posts" :key="post.id">
        <div class="post-header">
          <span class="post-title">{{ post.title }}</span>
          <span class="post-time">{{ post.time }}</span>
        </div>
        <div class="post-content">{{ post.content }}</div>
        <div class="post-stats">
          <span class="stat-item">👍 {{ post.likes }}</span>
          <span class="stat-item">💬 {{ post.comments }}</span>
          <span class="stat-item">👁️ {{ post.views }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const posts = ref([
  {
    id: 1,
    title: '新手求带，王者荣耀上分',
    content: '刚入坑不久，想找个靠谱的代练帮忙上分，预算充足...',
    time: '2024-01-15',
    likes: 23,
    comments: 8,
    views: 156
  },
  {
    id: 2,
    title: '推荐一个超棒的代练',
    content: '昨天找的代练真的很专业，态度好，效率高，推荐给大家...',
    time: '2024-01-14',
    likes: 45,
    comments: 12,
    views: 289
  }
])
</script>

<style lang="scss" scoped>
.profile-posts {
  padding-top: 0;
  background: #f7f8fa;
  min-height: 100vh;
  padding-bottom: 60px;
}

.posts-list {
  padding: 12px;
}

.post-item {
  background: white;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  
  .post-title {
    font-size: 16px;
    font-weight: 600;
    color: #323233;
  }
  
  .post-time {
    font-size: 12px;
    color: #969799;
  }
}

.post-content {
  font-size: 14px;
  color: #646566;
  line-height: 1.5;
  margin-bottom: 12px;
}

.post-stats {
  display: flex;
  gap: 16px;
  
  .stat-item {
    font-size: 12px;
    color: #969799;
  }
}
</style>