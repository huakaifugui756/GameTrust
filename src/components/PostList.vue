<template>
  <div class="post-list">
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="onLoad"
      >
        <div v-for="post in posts" :key="post.id" class="post-item card" @click="$emit('viewPost', post.id)">
          <div class="post-header">
            <img :src="post.user.avatar" :alt="post.user.name" class="avatar" />
            <div class="user-info">
              <div class="username">
                {{ post.user.name }}
                <van-rate v-model="post.user.reputation" size="12" color="#ffd21e" void-icon="star" void-color="#c8c9cc" readonly />
              </div>
              <div class="time">{{ formatTime(post.createTime) }}</div>
            </div>
            <van-tag :type="getPostTypeColor(post.type)">{{ post.type }}</van-tag>
          </div>
          
          <div class="post-content">
            <h4 v-if="post.title">{{ post.title }}</h4>
            <p>{{ post.content }}</p>
            
            <!-- 图片展示 -->
            <div v-if="post.images && post.images.length > 0" class="post-images">
              <img
                v-for="(image, index) in post.images"
                :key="index"
                :src="image"
                :alt="`图片${index + 1}`"
                class="post-image"
                @click.stop="previewImage(post.images, index)"
              />
            </div>
          </div>
          
          <div class="post-footer">
            <div class="game-tag" v-if="post.game">
              <van-icon name="label-o" />
              {{ post.game }}
            </div>
            
            <div class="post-actions">
              <div class="action-item" @click.stop="$emit('likePost', post.id)">
                <van-icon name="good-job-o" />
                <span>{{ post.likes }}</span>
              </div>
              <div class="action-item">
                <van-icon name="chat-o" />
                <span>{{ post.comments }}</span>
              </div>
              <div class="action-item">
                <van-icon name="eye-o" />
                <span>{{ post.views }}</span>
              </div>
            </div>
          </div>
        </div>
      </van-list>
    </van-pull-refresh>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { showImagePreview } from 'vant'

defineProps({
  posts: {
    type: Array,
    default: () => []
  }
})

defineEmits(['viewPost', 'likePost'])

const refreshing = ref(false)
const loading = ref(false)
const finished = ref(false)

const onRefresh = () => {
  // 模拟刷新
  setTimeout(() => {
    refreshing.value = false
  }, 1000)
}

const onLoad = () => {
  // 模拟加载更多
  setTimeout(() => {
    loading.value = false
    finished.value = true
  }, 1000)
}

const getPostTypeColor = (type) => {
  const colorMap = {
    '需求': 'danger',
    '服务': 'success',
    '交流': 'primary'
  }
  return colorMap[type] || 'default'
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

const previewImage = (images, index) => {
  showImagePreview({
    images,
    startPosition: index
  })
}
</script>

<style lang="scss" scoped>
.post-list {
  padding: 16px;
}

.post-item {
  margin-bottom: 12px;
  cursor: pointer;
  transition: transform 0.2s;
  
  &:active {
    transform: scale(0.98);
  }
  
  .post-header {
    display: flex;
    align-items: center;
    margin-bottom: 12px;
    
    .avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      margin-right: 12px;
    }
    
    .user-info {
      flex: 1;
      
      .username {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        font-weight: 600;
        margin-bottom: 2px;
      }
      
      .time {
        font-size: 12px;
        color: #969799;
      }
    }
  }
  
  .post-content {
    margin-bottom: 12px;
    
    h4 {
      margin: 0 0 8px 0;
      font-size: 16px;
      font-weight: 600;
      line-height: 1.4;
    }
    
    p {
      margin: 0 0 12px 0;
      font-size: 14px;
      line-height: 1.6;
      color: #323233;
    }
    
    .post-images {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
      
      .post-image {
        width: 100%;
        height: 80px;
        object-fit: cover;
        border-radius: 4px;
        cursor: pointer;
      }
    }
  }
  
  .post-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 12px;
    border-top: 1px solid #ebedf0;
    
    .game-tag {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      color: #1989fa;
    }
    
    .post-actions {
      display: flex;
      gap: 20px;
      
      .action-item {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 12px;
        color: #969799;
        cursor: pointer;
        
        &:active {
          color: #1989fa;
        }
      }
    }
  }
}
</style>