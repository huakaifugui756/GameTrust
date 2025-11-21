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
        <van-button type="warning" size="small" @click="createOrder">发起担保</van-button>
      </div>
    </div>

    <!-- 功能入口 -->
    <van-grid :column-num="2" :border="false" class="feature-grid">
      <van-grid-item icon="friends-o" text="联系人" @click="showContacts" />
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

    <!-- 最新帖子暂时隐藏 -->
    <!-- <div class="latest-posts section">
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
    </div> -->


  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast } from 'vant'

const route = useRoute()
const router = useRouter()

const game = ref({})

const chatRooms = ref([
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



onMounted(() => {
  const gameId = route.params.id
  // 根据游戏ID加载游戏详情
  loadGameDetail(gameId)
})

const loadGameDetail = (gameId) => {
  // 根据游戏ID加载游戏详情
  console.log('加载游戏详情:', gameId)
  
  const gameData = {
    1: {
      id: 1,
      name: '王者荣耀',
      description: '5v5公平竞技手游，热门代练游戏',
      image: 'https://picsum.photos/seed/wzry/100/100.jpg',
      onlineCount: 12580,
      orderCount: 3421
    },
    2: {
      id: 2,
      name: '三角洲',
      description: '经典战术射击游戏，段位代练热门',
      image: 'https://picsum.photos/seed/sjz/100/100.jpg',
      onlineCount: 8976,
      orderCount: 2341
    }
  }
  
  if (gameData[gameId]) {
    game.value = gameData[gameId]
  } else {
    // 默认显示王者荣耀
    game.value = gameData[1]
  }
}

const createOrder = () => {
  router.push('/orders/create')
}

const enterChatRoom = (roomId) => {
  const actualRoomId = roomId || 1
  const room = chatRooms.value.find(r => r.id === actualRoomId)
  
  if (room) {
    // 生成群聊ID
    const groupChatId = `group_${actualRoomId}`
    
    // 保存群聊信息到sessionStorage
    const groupInfo = {
      id: actualRoomId,
      name: room.name,
      avatar: `https://picsum.photos/seed/room${actualRoomId}/40/40.jpg`,
      memberCount: room.onlineCount || 0
    }
    
    sessionStorage.setItem('groupChatInfo', JSON.stringify(groupInfo))
    
    // 跳转到群聊页面
    router.push(`/chat/${groupChatId}`)
    
    console.log('进入游戏详情页群聊:', room.name, 'ID:', groupChatId)
  } else {
    // 默认跳转到第一个群聊
    const defaultRoom = chatRooms.value[0]
    const groupChatId = `group_${defaultRoom.id}`
    
    const groupInfo = {
      id: defaultRoom.id,
      name: defaultRoom.name,
      avatar: `https://picsum.photos/seed/room${defaultRoom.id}/40/40.jpg`,
      memberCount: defaultRoom.onlineCount || 0
    }
    
    sessionStorage.setItem('groupChatInfo', JSON.stringify(groupInfo))
    router.push(`/chat/${groupChatId}`)
  }
}

const showContacts = () => {
  showToast('联系人功能')
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