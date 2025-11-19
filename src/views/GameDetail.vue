<template>
  <div class="game-detail page-container">
    <van-nav-bar
      :title="game.name"
      left-arrow
      @click-left="$router.go(-1)"
    />

    <!-- 游戏信息 -->
    <div class="game-header card">
      <div class="game-basic-info">
        <img :src="game.image" :alt="game.name" class="game-image" />
        <div class="game-info">
          <h2>{{ game.name }}</h2>
          <p>{{ game.description }}</p>
          <div class="game-stats">
            <div class="stat-item">
              <van-icon name="friends-o" />
              <span>{{ game.onlineCount }}人在线</span>
            </div>
            <div class="stat-item">
              <van-icon name="orders-o" />
              <span>{{ game.orderCount }}笔交易</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="action-buttons">
        <van-button type="primary" size="small" @click="showPostDialog('需求')">发布需求</van-button>
        <van-button type="success" size="small" @click="showPostDialog('服务')">发布服务</van-button>
        <van-button type="warning" size="small" @click="createOrder">发起担保</van-button>
      </div>
    </div>

    <!-- 功能入口 -->
    <van-grid :column-num="4" :border="false" class="feature-grid">
      <van-grid-item icon="chat-o" text="聊天室" @click="enterChatRoom" />
      <van-grid-item icon="friends-o" text="联系人" @click="showContacts" />
      <van-grid-item icon="bookmark-o" text="帖子专区" @click="showPosts" />
      <van-grid-item icon="user-o" text="个人中心" @click="$router.push('/profile')" />
    </van-grid>

    <!-- 聊天室列表 -->
    <div class="chat-rooms section">
      <h3>热门聊天室</h3>
      <div class="room-list">
        <div v-for="room in chatRooms" :key="room.id" class="room-item card" @click="enterChatRoom(room.id)">
          <div class="room-info">
            <h4>{{ room.name }}</h4>
            <p>{{ room.description }}</p>
          </div>
          <div class="room-stats">
            <span class="online-count">{{ room.onlineCount }}人在线</span>
            <van-icon name="arrow" />
          </div>
        </div>
      </div>
    </div>

    <!-- 最新帖子 -->
    <div class="latest-posts section">
      <h3>最新帖子</h3>
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

    <!-- 发布帖子弹窗 -->
    <van-dialog v-model:show="postDialogVisible" :title="`发布${postType}`" show-cancel-button>
      <div class="post-form">
        <van-field
          v-model="postContent"
          type="textarea"
          :placeholder="`请输入${postType}内容...`"
          rows="4"
          autosize
        />
        <van-field
          v-model="postPrice"
          placeholder="价格（可选）"
          v-if="postType === '服务'"
        />
      </div>
      <template #footer>
        <van-button size="small" @click="postDialogVisible = false">取消</van-button>
        <van-button type="primary" size="small" @click="submitPost">发布</van-button>
      </template>
    </van-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast } from 'vant'

const route = useRoute()
const router = useRouter()

const game = ref({
  id: 1,
  name: '王者荣耀',
  description: '5v5公平竞技手游，热门代练游戏',
  image: 'https://picsum.photos/seed/wzry/100/100.jpg',
  onlineCount: 12580,
  orderCount: 3421
})

const chatRooms = ref([
  {
    id: 1,
    name: '综合交流群',
    description: '游戏交流、组队开黑',
    onlineCount: 2341
  },
  {
    id: 2,
    name: '代练交易群',
    description: '代练需求发布、接单',
    onlineCount: 1876
  },
  {
    id: 3,
    name: '账号交易群',
    description: '账号买卖、评估',
    onlineCount: 987
  }
])

const latestPosts = ref([
  {
    id: 1,
    type: '需求',
    content: '星耀段位，需要代练上王者，价格私聊，要求效率高，信誉好的代练。',
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
    content: '专业代练，多年经验，效率高，价格优惠，长期接单。',
    user: {
      name: '代练达人',
      avatar: 'https://picsum.photos/seed/user2/40/40.jpg'
    },
    createTime: '2024-01-15 09:15:00',
    views: 89,
    likes: 6,
    comments: 3
  }
])

const postDialogVisible = ref(false)
const postType = ref('')
const postContent = ref('')
const postPrice = ref('')

onMounted(() => {
  const gameId = route.params.id
  // 根据游戏ID加载游戏详情
  loadGameDetail(gameId)
})

const loadGameDetail = (gameId) => {
  // 模拟加载游戏详情
  console.log('加载游戏详情:', gameId)
}

const showPostDialog = (type) => {
  postType.value = type
  postContent.value = ''
  postPrice.value = ''
  postDialogVisible.value = true
}

const submitPost = () => {
  if (!postContent.value.trim()) {
    showToast('请输入内容')
    return
  }
  
  showToast('发布成功')
  postDialogVisible.value = false
}

const createOrder = () => {
  router.push('/orders/create')
}

const enterChatRoom = (roomId) => {
  router.push(`/chat/${roomId || 1}`)
}

const showContacts = () => {
  showToast('联系人功能')
}

const showPosts = () => {
  router.push('/community')
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
.game-detail {
  padding-top: 0;
}

.game-header {
  margin: 16px;
  
  .game-basic-info {
    display: flex;
    align-items: center;
    margin-bottom: 16px;
    
    .game-image {
      width: 80px;
      height: 80px;
      border-radius: 16px;
      margin-right: 16px;
      object-fit: cover;
    }
    
    .game-info {
      flex: 1;
      
      h2 {
        margin: 0 0 8px 0;
        font-size: 20px;
        font-weight: 600;
      }
      
      p {
        margin: 0 0 12px 0;
        font-size: 14px;
        color: #969799;
        line-height: 1.4;
      }
      
      .game-stats {
        display: flex;
        gap: 16px;
        
        .stat-item {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: #969799;
        }
      }
    }
  }
  
  .action-buttons {
    display: flex;
    gap: 8px;
  }
}

.feature-grid {
  margin: 16px;
}

.section {
  margin: 20px 16px;
  
  h3 {
    margin: 0 0 12px 0;
    font-size: 16px;
    font-weight: 600;
  }
}

.room-list {
  .room-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
    margin-bottom: 8px;
    cursor: pointer;
    
    .room-info {
      flex: 1;
      
      h4 {
        margin: 0 0 4px 0;
        font-size: 14px;
        font-weight: 600;
      }
      
      p {
        margin: 0;
        font-size: 12px;
        color: #969799;
      }
    }
    
    .room-stats {
      display: flex;
      align-items: center;
      gap: 8px;
      
      .online-count {
        font-size: 12px;
        color: #07c160;
      }
    }
  }
}

.post-form {
  padding: 16px;
  
  .van-field {
    margin-bottom: 12px;
  }
}
</style>