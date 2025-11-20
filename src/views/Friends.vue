<template>
  <div class="friends page-container">
    <!-- 顶部导航 -->
    <van-nav-bar title="好友">
      <template #right>
        <van-icon name="plus" @click="showAddFriendOptions" />
      </template>
    </van-nav-bar>

    <!-- 搜索栏 -->
    <div class="search-bar">
      <van-search
        v-model="searchValue"
        placeholder="搜索好友"
        @search="onSearch"
      />
    </div>

    <!-- 好友列表标签 -->
    <van-tabs v-model:active="activeTab" sticky>
      <van-tab title="好友" name="friends">
        <div class="friends-list">
          <div 
            v-for="friend in filteredFriends" 
            :key="friend.id" 
            class="friend-item"
            @click="goToProfile(friend)"
          >
            <div class="friend-avatar">
              <img :src="friend.avatar" :alt="friend.name" />
              <div class="online-status" :class="{ 'online': friend.online }"></div>
            </div>
            <div class="friend-info">
              <div class="friend-name">{{ friend.name }}</div>
              <div class="friend-status">{{ friend.status || '这个人很懒，什么都没写' }}</div>
            </div>
            <div class="friend-actions">
              <van-icon name="chat-o" @click.stop="startChat(friend)" />
            </div>
          </div>
          
          <!-- 空状态 -->
          <van-empty v-if="filteredFriends.length === 0" description="暂无好友" />
        </div>
      </van-tab>
      
      <van-tab title="好友申请" name="requests">
        <div class="requests-list">
          <div 
            v-for="request in friendRequests" 
            :key="request.id" 
            class="request-item"
          >
            <div class="request-avatar">
              <img :src="request.avatar" :alt="request.name" />
            </div>
            <div class="request-info">
              <div class="request-name">{{ request.name }}</div>
              <div class="request-message">{{ request.message }}</div>
              <div class="request-time">{{ formatTime(request.createTime) }}</div>
            </div>
            <div class="request-actions">
              <van-button 
                size="small" 
                type="primary" 
                @click="acceptRequest(request)"
              >
                同意
              </van-button>
              <van-button 
                size="small" 
                @click="rejectRequest(request)"
              >
                拒绝
              </van-button>
            </div>
          </div>
          
          <!-- 空状态 -->
          <van-empty v-if="friendRequests.length === 0" description="暂无好友申请" />
        </div>
      </van-tab>
    </van-tabs>

    <!-- 添加好友弹窗 -->
    <van-action-sheet
      v-model:show="showAddFriendSheet"
      :actions="addFriendActions"
      @select="onAddFriendSelect"
      cancel-text="取消"
    />

    <!-- 搜索用户弹窗 -->
    <van-dialog
      v-model:show="showSearchDialog"
      title="搜索用户"
      show-cancel-button
      @confirm="addFriend"
    >
      <div class="search-dialog">
        <van-field
          v-model="searchUserId"
          placeholder="输入用户ID或手机号"
          clearable
          @input="onSearchInput"
        />
        <div v-if="searchResult" class="search-result">
          <div class="result-item">
            <img :src="searchResult.avatar" :alt="searchResult.name" />
            <div class="result-info">
              <div class="result-name">{{ searchResult.name }}</div>
              <div class="result-id">ID: {{ searchResult.id }}</div>
            </div>
          </div>
        </div>
      </div>
    </van-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showConfirmDialog } from 'vant'

const router = useRouter()
const searchValue = ref('')
const activeTab = ref('friends')
const showAddFriendSheet = ref(false)
const showSearchDialog = ref(false)
const searchUserId = ref('')
const searchResult = ref(null)

// 好友列表
const friends = ref([
  {
    id: 1,
    name: '代练达人-小明',
    avatar: 'https://picsum.photos/seed/friend1/40/40.jpg',
    online: true,
    status: '专业代练，王者荣耀上分专家',
    reputation: 4.9
  },
  {
    id: 2,
    name: '游戏玩家-小红',
    avatar: 'https://picsum.photos/seed/friend2/40/40.jpg',
    online: false,
    status: '休闲玩家，喜欢组队开黑',
    reputation: 4.5
  },
  {
    id: 3,
    name: 'LOL高手',
    avatar: 'https://picsum.photos/seed/friend3/40/40.jpg',
    online: true,
    status: '英雄联盟钻石段位，长期接单',
    reputation: 4.8
  }
])

// 好友申请列表
const friendRequests = ref([
  {
    id: 101,
    name: '新手玩家-小李',
    avatar: 'https://picsum.photos/seed/request1/40/40.jpg',
    message: '你好，我想加你为好友，一起玩游戏',
    createTime: '2024-01-15 14:30:00'
  },
  {
    id: 102,
    name: '代练团队-小王',
    avatar: 'https://picsum.photos/seed/request2/40/40.jpg',
    message: '我们是专业代练团队，希望合作',
    createTime: '2024-01-15 13:20:00'
  }
])

// 添加好友操作选项
const addFriendActions = [
  { name: '搜索用户', value: 'search' },
  { name: '扫一扫', value: 'qr' },
  { name: '手机联系人', value: 'contacts' }
]

onMounted(() => {
  loadFriends()
})

const loadFriends = () => {
  console.log('加载好友列表')
}

const onSearch = (value) => {
  console.log('搜索好友:', value)
}

const showAddFriendOptions = () => {
  showAddFriendSheet.value = true
}

const onAddFriendSelect = (action) => {
  showAddFriendSheet.value = false
  
  switch (action.value) {
    case 'search':
      showSearchDialog.value = true
      break
    case 'qr':
      showToast('扫码功能')
      break
    case 'contacts':
      showToast('联系人功能')
      break
  }
}

const searchUser = () => {
  // 模拟搜索用户
  if (searchUserId.value) {
    searchResult.value = {
      id: searchUserId.value,
      name: `用户${searchUserId.value}`,
      avatar: `https://picsum.photos/seed/user${searchUserId.value}/40/40.jpg`
    }
  } else {
    searchResult.value = null
  }
}

const addFriend = () => {
  if (!searchResult.value) {
    showToast('请先搜索用户')
    return
  }
  
  // 检查是否已经是好友
  if (friends.value.some(f => f.id === searchResult.value.id)) {
    showToast('已经是好友了')
    return
  }
  
  showToast('好友申请已发送')
  showSearchDialog.value = false
  searchUserId.value = ''
  searchResult.value = null
}

const acceptRequest = async (request) => {
  try {
    await showConfirmDialog({
      title: '确认添加好友',
      message: `确定要添加 ${request.name} 为好友吗？`
    })
    
    // 添加到好友列表
    friends.value.push({
      id: request.id,
      name: request.name,
      avatar: request.avatar,
      online: Math.random() > 0.5,
      status: '',
      reputation: 4.0 + Math.random()
    })
    
    // 从申请列表移除
    const index = friendRequests.value.findIndex(r => r.id === request.id)
    if (index > -1) {
      friendRequests.value.splice(index, 1)
    }
    
    showToast('已添加好友')
  } catch {
    // 用户取消
  }
}

const rejectRequest = (request) => {
  const index = friendRequests.value.findIndex(r => r.id === request.id)
  if (index > -1) {
    friendRequests.value.splice(index, 1)
  }
  showToast('已拒绝申请')
}

const goToProfile = (friend) => {
  router.push(`/profile/${friend.id}`)
}

const startChat = (friend) => {
  router.push(`/chat/${friend.id}`)
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

// 计算属性
const filteredFriends = computed(() => {
  if (!searchValue.value) return friends.value
  return friends.value.filter(friend => 
    friend.name.includes(searchValue.value)
  )
})

// 监听搜索输入
const onSearchInput = () => {
  if (searchUserId.value) {
    searchUser()
  } else {
    searchResult.value = null
  }
}
</script>

<style lang="scss" scoped>
.friends {
  .search-bar {
    padding: 16px;
    background: white;
    border-bottom: 1px solid #ebedf0;
  }

  .friends-list {
    padding: 16px;

    .friend-item {
      display: flex;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid #f0f0f0;
      cursor: pointer;

      &:last-child {
        border-bottom: none;
      }

      &:active {
        background: #f8f9fa;
      }

      .friend-avatar {
        position: relative;
        margin-right: 12px;

        img {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          object-fit: cover;
        }

        .online-status {
          position: absolute;
          bottom: 2px;
          right: 2px;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #ccc;
          border: 2px solid white;

          &.online {
            background: #52c41a;
          }
        }
      }

      .friend-info {
        flex: 1;
        min-width: 0;

        .friend-name {
          font-size: 16px;
          font-weight: 500;
          color: #333;
          margin-bottom: 4px;
        }

        .friend-status {
          font-size: 13px;
          color: #999;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }

      .friend-actions {
        .van-icon {
          font-size: 20px;
          color: #666;
          padding: 8px;
        }
      }
    }
  }

  .requests-list {
    padding: 16px;

    .request-item {
      display: flex;
      align-items: center;
      padding: 16px;
      background: white;
      border-radius: 8px;
      margin-bottom: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

      .request-avatar {
        margin-right: 12px;

        img {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          object-fit: cover;
        }
      }

      .request-info {
        flex: 1;
        min-width: 0;

        .request-name {
          font-size: 16px;
          font-weight: 500;
          color: #333;
          margin-bottom: 4px;
        }

        .request-message {
          font-size: 14px;
          color: #666;
          margin-bottom: 4px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .request-time {
          font-size: 12px;
          color: #999;
        }
      }

      .request-actions {
        display: flex;
        gap: 8px;

        .van-button {
          min-width: 60px;
        }
      }
    }
  }

  .search-dialog {
    padding: 16px;

    .van-field {
      margin-bottom: 16px;
    }

    .search-result {
      .result-item {
        display: flex;
        align-items: center;
        padding: 12px;
        background: #f8f9fa;
        border-radius: 8px;

        img {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          margin-right: 12px;
        }

        .result-info {
          .result-name {
            font-size: 16px;
            font-weight: 500;
            color: #333;
            margin-bottom: 4px;
          }

          .result-id {
            font-size: 12px;
            color: #999;
          }
        }
      }
    }
  }
}
</style>