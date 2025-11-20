<template>
  <div class="user-profile page-container">
    <!-- 顶部导航 -->
    <van-nav-bar
      :title="isOwnProfile ? '个人资料' : '用户资料'"
      left-arrow
      @click-left="$router.go(-1)"
    >
      <template #right v-if="!isOwnProfile">
        <van-icon name="ellipsis" @click="showMoreActions" />
      </template>
    </van-nav-bar>

    <!-- 用户基本信息 -->
    <div class="profile-header">
      <div class="avatar-section">
        <img :src="userInfo.avatar" :alt="userInfo.name" class="user-avatar" />
        <div class="online-badge" v-if="userInfo.online && !isOwnProfile">
          <van-icon name="success" />
        </div>
      </div>
      <div class="user-info">
        <h2 class="user-name">{{ userInfo.name }}</h2>
        <div class="user-id">ID: {{ userInfo.id }}</div>
        <div class="user-status">{{ userInfo.status || '这个人很懒，什么都没写' }}</div>
      </div>
    </div>

    <!-- 统计信息 -->
    <div class="stats-section">
      <div class="stat-item">
        <div class="stat-number">{{ userInfo.ordersCount || 0 }}</div>
        <div class="stat-label">订单</div>
      </div>
      <div class="stat-item">
        <div class="stat-number">{{ userInfo.friendsCount || 0 }}</div>
        <div class="stat-label">好友</div>
      </div>
      <div class="stat-item">
        <div class="stat-number">{{ userInfo.reputation || 0 }}</div>
        <div class="stat-label">信誉分</div>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="action-section" v-if="!isOwnProfile">
      <van-button 
        v-if="!isFriend"
        type="primary" 
        size="large" 
        block
        @click="addFriend"
      >
        添加好友
      </van-button>
      <van-button 
        v-else
        type="primary" 
        size="large" 
        block
        @click="startChat"
      >
        发消息
      </van-button>
    </div>

    <!-- 详细信息 -->
    <div class="detail-section">
      <van-cell-group title="基本信息">
        <van-cell title="游戏专长" :value="userInfo.games || '未填写'" />
        <van-cell title="代练经验" :value="userInfo.experience || '未填写'" />
        <van-cell title="服务时间" :value="userInfo.serviceTime || '未填写'" />
        <van-cell title="注册时间" :value="formatDate(userInfo.registerTime)" />
      </van-cell-group>

      <van-cell-group title="服务评价">
        <div class="rating-section">
          <div class="rating-stars">
            <van-rate 
              v-model="userInfo.rating" 
              readonly 
              size="20"
              color="#ffd21e"
            />
            <span class="rating-text">{{ userInfo.rating || 0 }} 分</span>
          </div>
          <div class="rating-detail">
            <div class="rating-item">
              <span>服务态度</span>
              <van-rate v-model="userInfo.attitude" readonly size="16" />
            </div>
            <div class="rating-item">
              <span>服务质量</span>
              <van-rate v-model="userInfo.quality" readonly size="16" />
            </div>
            <div class="rating-item">
              <span>响应速度</span>
              <van-rate v-model="userInfo.speed" readonly size="16" />
            </div>
          </div>
        </div>
      </van-cell-group>

      <van-cell-group title="最近动态" v-if="recentActivities.length > 0">
        <div 
          v-for="activity in recentActivities" 
          :key="activity.id"
          class="activity-item"
        >
          <div class="activity-time">{{ formatTime(activity.time) }}</div>
          <div class="activity-content">{{ activity.content }}</div>
        </div>
      </van-cell-group>
    </div>

    <!-- 更多操作弹窗 -->
    <van-action-sheet
      v-model:show="showActions"
      :actions="actions"
      @select="onActionSelect"
      cancel-text="取消"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast, showConfirmDialog } from 'vant'

const route = useRoute()
const router = useRouter()

const userId = route.params.id || 'me'
const showActions = ref(false)

// 模拟用户数据
const userInfo = ref({
  id: userId,
  name: '代练达人-小明',
  avatar: 'https://picsum.photos/seed/user1/100/100.jpg',
  online: true,
  status: '专业代练，王者荣耀上分专家，信誉第一',
  ordersCount: 156,
  friendsCount: 89,
  reputation: 4.9,
  games: '王者荣耀、英雄联盟、和平精英',
  experience: '3年代练经验',
  serviceTime: '每天14:00-23:00',
  registerTime: '2023-01-15',
  rating: 4.8,
  attitude: 4.9,
  quality: 4.7,
  speed: 4.8
})

// 最近动态
const recentActivities = ref([
  {
    id: 1,
    content: '完成了王者荣耀星耀到王者的代练订单',
    time: '2024-01-15 10:30:00'
  },
  {
    id: 2,
    content: '发布了新的代练服务',
    time: '2024-01-14 15:20:00'
  },
  {
    id: 3,
    content: '获得了用户好评',
    time: '2024-01-13 09:15:00'
  }
])

// 操作选项
const actions = [
  { name: '发消息', value: 'chat' },
  { name: '举报用户', value: 'report' },
  { name: '拉黑用户', value: 'block' }
]

// 计算属性
const isOwnProfile = computed(() => userId === 'me')
const isFriend = computed(() => {
  // 这里应该从状态管理中获取好友列表
  return false // 示例：不是好友
})

onMounted(() => {
  loadUserInfo()
})

const loadUserInfo = () => {
  console.log('加载用户信息，ID:', userId)
  
  // 根据用户ID加载不同的用户信息
  const userDatabase = {
    'me': {
      id: 'me',
      name: '我',
      avatar: 'https://picsum.photos/seed/me/100/100.jpg',
      online: true,
      status: '这个人很懒，什么都没写',
      ordersCount: 12,
      friendsCount: 5,
      reputation: 4.5,
      games: '王者荣耀',
      experience: '新手玩家',
      serviceTime: '周末在线',
      registerTime: '2024-01-01',
      rating: 4.5,
      attitude: 4.6,
      quality: 4.4,
      speed: 4.5
    },
    '1': userInfo.value,
    '2': {
      id: '2',
      name: '游戏玩家-小红',
      avatar: 'https://picsum.photos/seed/user2/100/100.jpg',
      online: false,
      status: '休闲玩家，喜欢组队开黑',
      ordersCount: 8,
      friendsCount: 23,
      reputation: 4.3,
      games: '和平精英、王者荣耀',
      experience: '1年游戏经验',
      serviceTime: '晚上19:00-22:00',
      registerTime: '2023-06-15',
      rating: 4.3,
      attitude: 4.5,
      quality: 4.2,
      speed: 4.4
    }
  }
  
  if (userDatabase[userId]) {
    userInfo.value = userDatabase[userId]
  }
}

const showMoreActions = () => {
  showActions.value = true
}

const onActionSelect = (action) => {
  showActions.value = false
  
  switch (action.value) {
    case 'chat':
      startChat()
      break
    case 'report':
      reportUser()
      break
    case 'block':
      blockUser()
      break
  }
}

const addFriend = async () => {
  try {
    await showConfirmDialog({
      title: '添加好友',
      message: `确定要添加 ${userInfo.value.name} 为好友吗？`
    })
    
    showToast('好友申请已发送')
  } catch {
    // 用户取消
  }
}

const startChat = () => {
  router.push(`/chat/${userId}`)
}

const reportUser = async () => {
  try {
    await showConfirmDialog({
      title: '举报用户',
      message: '确定要举报该用户吗？'
    })
    
    showToast('举报已提交')
  } catch {
    // 用户取消
  }
}

const blockUser = async () => {
  try {
    await showConfirmDialog({
      title: '拉黑用户',
      message: '确定要拉黑该用户吗？拉黑后将无法接收对方消息。'
    })
    
    showToast('用户已拉黑')
    router.go(-1)
  } catch {
    // 用户取消
  }
}

const formatDate = (dateString) => {
  if (!dateString) return '未填写'
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN')
}

const formatTime = (timeString) => {
  const date = new Date(timeString)
  const now = new Date()
  const diff = now - date
  
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  return `${Math.floor(diff / 86400000)}天前`
}
</script>

<style lang="scss" scoped>
.user-profile {
  background: #f7f8fa;
}

.profile-header {
  background: white;
  padding: 24px 16px;
  text-align: center;
  position: relative;

  .avatar-section {
    position: relative;
    display: inline-block;
    margin-bottom: 16px;

    .user-avatar {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      object-fit: cover;
      border: 3px solid #f0f0f0;
    }

    .online-badge {
      position: absolute;
      bottom: 5px;
      right: 5px;
      width: 20px;
      height: 20px;
      background: #52c41a;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid white;

      .van-icon {
        color: white;
        font-size: 12px;
      }
    }
  }

  .user-info {
    .user-name {
      margin: 0 0 8px 0;
      font-size: 20px;
      font-weight: 600;
      color: #333;
    }

    .user-id {
      font-size: 14px;
      color: #999;
      margin-bottom: 8px;
    }

    .user-status {
      font-size: 14px;
      color: #666;
      line-height: 1.4;
    }
  }
}

.stats-section {
  display: flex;
  background: white;
  padding: 20px 0;
  margin-bottom: 12px;

  .stat-item {
    flex: 1;
    text-align: center;

    .stat-number {
      font-size: 20px;
      font-weight: 600;
      color: #333;
      margin-bottom: 4px;
    }

    .stat-label {
      font-size: 12px;
      color: #999;
    }
  }
}

.action-section {
  padding: 16px;
  margin-bottom: 12px;

  .van-button {
    height: 44px;
    font-size: 16px;
  }
}

.detail-section {
  .van-cell-group {
    margin-bottom: 12px;
  }

  .rating-section {
    padding: 16px;

    .rating-stars {
      display: flex;
      align-items: center;
      margin-bottom: 16px;

      .rating-text {
        margin-left: 12px;
        font-size: 16px;
        font-weight: 500;
        color: #333;
      }
    }

    .rating-detail {
      .rating-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 12px;

        span {
          font-size: 14px;
          color: #666;
        }
      }
    }
  }

  .activity-item {
    padding: 12px 16px;
    border-bottom: 1px solid #f0f0f0;

    &:last-child {
      border-bottom: none;
    }

    .activity-time {
      font-size: 12px;
      color: #999;
      margin-bottom: 4px;
    }

    .activity-content {
      font-size: 14px;
      color: #333;
      line-height: 1.4;
    }
  }
}
</style>