<template>
  <div class="home page-container">
    <!-- 顶部搜索栏 -->
    <van-search
      v-model="searchValue"
      placeholder="搜索游戏、服务、用户"
      shape="round"
      background="#1989fa"
      @search="onSearch"
    />

    <!-- 轮播图 -->
    <van-swipe class="banner-swipe" :autoplay="3000" indicator-color="white">
      <van-swipe-item v-for="(banner, index) in banners" :key="index">
        <img :src="banner.image" :alt="banner.title" class="banner-image" />
      </van-swipe-item>
    </van-swipe>

    <!-- 快捷入口 -->
    <div class="quick-entry card">
      <van-grid :column-num="4" :border="false">
        <van-grid-item v-for="item in quickEntries" :key="item.name" :icon="item.icon" :text="item.name" @click="item.onClick" />
      </van-grid>
    </div>

    <!-- 热门游戏 -->
    <div class="section">
      <div class="section-header flex-between">
        <h3>热门游戏</h3>
        <van-button type="primary" size="small" plain @click="$router.push('/games')">查看更多</van-button>
      </div>
      <div class="game-grid">
        <div v-for="game in hotGames" :key="game.id" class="game-card" @click="$router.push(`/game/${game.id}`)">
          <img :src="game.image" :alt="game.name" class="game-image" />
          <div class="game-info">
            <div class="game-title">{{ game.name }}</div>
            <div class="game-desc">{{ game.description }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 最新需求 -->
    <div class="section">
      <div class="section-header flex-between">
        <h3>最新需求</h3>
        <van-button type="primary" size="small" plain @click="$router.push('/community')">查看更多</van-button>
      </div>
      <div class="post-list">
        <div v-for="post in latestPosts" :key="post.id" class="post-item card" @click="viewPost(post.id)">
          <div class="post-header">
            <img :src="post.user.avatar" :alt="post.user.name" class="avatar" />
            <div class="user-info">
              <div class="username">{{ post.user.name }}</div>
              <div class="time">{{ formatTime(post.createTime) }}</div>
            </div>
            <van-tag :type="post.type === '需求' ? 'danger' : 'success'">{{ post.type }}</van-tag>
          </div>
          <div class="post-content">{{ post.content }}</div>
          <div class="post-actions">
            <div class="action-item">
              <van-icon name="eye-o" />
              <span>{{ post.views }}</span>
            </div>
            <div class="action-item">
              <van-icon name="good-job-o" />
              <span>{{ post.likes }}</span>
            </div>
            <div class="action-item">
              <van-icon name="chat-o" />
              <span>{{ post.comments }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const searchValue = ref('')

// 轮播图数据
const banners = ref([
  {
    image: 'https://picsum.photos/seed/banner1/375/150.jpg',
    title: '新人专享优惠'
  },
  {
    image: 'https://picsum.photos/seed/banner2/375/150.jpg',
    title: '担保交易安全'
  },
  {
    image: 'https://picsum.photos/seed/banner3/375/150.jpg',
    title: '专业代练团队'
  }
])

// 快捷入口
const quickEntries = ref([
  {
    name: '发布需求',
    icon: 'add-o',
    onClick: () => router.push('/community?type=demand')
  },
  {
    name: '发布服务',
    icon: 'service-o',
    onClick: () => router.push('/community?type=service')
  },
  {
    name: '发起担保',
    icon: 'shield-o',
    onClick: () => router.push('/orders/create')
  },
  {
    name: '客服中心',
    icon: 'service',
    onClick: () => router.push('/support')
  }
])

// 热门游戏
const hotGames = ref([
  {
    id: 1,
    name: '王者荣耀',
    description: '热门MOBA手游代练',
    image: 'https://picsum.photos/seed/game1/200/120.jpg'
  },
  {
    id: 2,
    name: '三角洲',
    description: '经典战术射击游戏',
    image: 'https://picsum.photos/seed/game2/200/120.jpg'
  },
  {
    id: 3,
    name: '和平精英',
    description: '战术竞技射击游戏',
    image: 'https://picsum.photos/seed/game3/200/120.jpg'
  },
  {
    id: 4,
    name: '英雄联盟',
    description: '经典MOBA端游代练',
    image: 'https://picsum.photos/seed/game4/200/120.jpg'
  }
])

// 最新需求
const latestPosts = ref([
  {
    id: 1,
    type: '需求',
    content: '王者荣耀星耀段位，需要代练上王者，价格私聊，要求效率高，信誉好的代练。',
    user: {
      name: '游戏小王',
      avatar: 'https://picsum.photos/seed/user1/40/40.jpg'
    },
    createTime: '2024-01-15 10:30:00',
    views: 156,
    likes: 12,
    comments: 8
  },
  {
    id: 2,
    type: '服务',
    content: '专业三角洲代练，段位提升，武器解锁，长期接单，价格优惠，信誉第一。',
    user: {
      name: '三角洲达人',
      avatar: 'https://picsum.photos/seed/user2/40/40.jpg'
    },
    createTime: '2024-01-15 09:15:00',
    views: 89,
    likes: 6,
    comments: 3
  }
])

const onSearch = (value) => {
  console.log('搜索:', value)
}

const viewPost = (postId) => {
  router.push(`/community/post/${postId}`)
}

const formatTime = (time) => {
  const date = new Date(time)
  const now = new Date()
  const diff = now - date
  
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  return `${Math.floor(diff / 86400000)}天前`
}
</script>

<style lang="scss" scoped>
.home {
  padding-top: 0;
}

.banner-swipe {
  height: 150px;
  
  .banner-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.quick-entry {
  margin: 16px 0;
}

.section {
  margin-bottom: 20px;
  
  .section-header {
    padding: 0 16px;
    margin-bottom: 12px;
    
    h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
    }
  }
}

.game-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  padding: 0 16px;
  
  .game-card {
    background: #fff;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    cursor: pointer;
    transition: transform 0.2s;
    
    &:active {
      transform: scale(0.98);
    }
  }
}

.post-list {
  padding: 0 16px;
}
</style>