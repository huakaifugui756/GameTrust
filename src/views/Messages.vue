<template>
  <div class="messages page-container">
    <van-nav-bar title="消息" />
    
    <!-- 搜索栏 -->
    <div class="search-bar">
      <van-search
        v-model="searchValue"
        placeholder="搜索联系人或消息"
        @search="onSearch"
      />
    </div>

    <!-- 消息分类标签 -->
    <van-tabs v-model:active="activeTab" sticky>
      <van-tab title="全部" name="all">
        <MessageList :messages="filteredMessages" @click="goToChat" />
      </van-tab>
      <van-tab title="群聊" name="group">
        <MessageList :messages="groupMessages" @click="goToChat" />
      </van-tab>
      <van-tab title="私聊" name="private">
        <MessageList :messages="privateMessages" @click="goToChat" />
      </van-tab>
      <van-tab title="好友" name="friend">
        <MessageList :messages="friendMessages" @click="goToChat" />
      </van-tab>
      <van-tab title="系统消息" name="system">
        <MessageList :messages="systemMessages" @click="goToChat" />
      </van-tab>
      <van-tab title="订单消息" name="order">
        <MessageList :messages="orderMessages" @click="goToChat" />
      </van-tab>
    </van-tabs>

    <!-- 系统消息详情弹窗 -->
    <van-popup v-model:show="showSystemDetail" position="center" round :style="{ width: '85%', maxHeight: '70vh' }">
      <div class="system-detail">
        <div class="detail-header">
          <div class="detail-title">{{ currentSystemMessage?.title }}</div>
          <van-icon name="cross" @click="showSystemDetail = false" />
        </div>
        <div class="detail-content">
          <div class="detail-time">{{ currentSystemMessage?.time }}</div>
          <div class="detail-text">{{ currentSystemMessage?.content }}</div>
          <div class="detail-full" v-if="currentSystemMessage">
            <p>这是系统消息的详细内容。</p>
            <p v-if="currentSystemMessage.id === 1">
              您的订单 #12345 已确认，代练将在24小时内开始服务。
              请确保账号信息正确，如有问题请联系客服。
            </p>
            <p v-else-if="currentSystemMessage.id === 7">
              为了保障您的交易安全，请勿在平台外进行任何形式的交易。
              所有交易都应通过平台进行，平台将为您提供保障服务。
            </p>
            <p v-else>
              感谢您使用我们的服务，如有疑问请联系客服。
            </p>
          </div>
        </div>
        <div class="detail-footer">
          <van-button type="primary" block @click="showSystemDetail = false">我知道了</van-button>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import MessageList from '@/components/MessageList.vue'

const router = useRouter()
const searchValue = ref('')
const activeTab = ref('all')
const showSystemDetail = ref(false)
const currentSystemMessage = ref(null)

const messages = ref([
  {
    id: 1,
    type: 'system',
    title: '系统通知',
    content: '您的订单已确认，请及时处理',
    time: '10:30',
    unread: 2,
    avatar: 'https://picsum.photos/seed/system/40/40.jpg'
  },
  {
    id: 2,
    type: 'order',
    title: '订单提醒',
    content: '代练服务已完成，请确认验收',
    time: '09:15',
    unread: 1,
    avatar: 'https://picsum.photos/seed/order/40/40.jpg'
  },
  {
    id: 8,
    type: 'group',
    title: '王者荣耀交流群',
    content: '代练小王: 今天有人需要代练吗？',
    time: '14:20',
    unread: 5,
    avatar: 'https://picsum.photos/seed/group1/40/40.jpg',
    memberCount: 128
  },
  {
    id: 9,
    type: 'group',
    title: '和平精英战队',
    content: '队长: 今晚8点组队吃鸡',
    time: '13:45',
    unread: 2,
    avatar: 'https://picsum.photos/seed/group2/40/40.jpg',
    memberCount: 56
  },
  {
    id: 10,
    type: 'group',
    title: '游戏代练大厅',
    content: '管理员: 新人进群请先看群公告',
    time: '12:30',
    unread: 1,
    avatar: 'https://picsum.photos/seed/group3/40/40.jpg',
    memberCount: 234
  },
  {
    id: 3,
    type: 'private',
    title: '代练达人-小明',
    content: '您好，我已经开始代练了',
    time: '昨天',
    unread: 0,
    avatar: 'https://picsum.photos/seed/friend1/40/40.jpg'
  },
  {
    id: 4,
    type: 'private',
    title: '游戏小王',
    content: '账号安全吗？',
    time: '昨天',
    unread: 3,
    avatar: 'https://picsum.photos/seed/user2/40/40.jpg'
  },
  {
    id: 5,
    type: 'private',
    title: '游戏玩家-小红',
    content: '嗨，一起玩游戏吗？',
    time: '昨天',
    unread: 1,
    avatar: 'https://picsum.photos/seed/friend2/40/40.jpg'
  },
  {
    id: 6,
    type: 'friend',
    title: '好友申请',
    content: '新手玩家-小李 申请添加您为好友',
    time: '2小时前',
    unread: 2,
    avatar: 'https://picsum.photos/seed/request1/40/40.jpg'
  },
  {
    id: 7,
    type: 'system',
    title: '安全提醒',
    content: '请勿在平台外进行交易',
    time: '2天前',
    unread: 0,
    avatar: 'https://picsum.photos/seed/security/40/40.jpg'
  }
])

onMounted(() => {
  loadMessages()
})

const loadMessages = () => {
  console.log('加载消息列表')
}

const onSearch = (value) => {
  console.log('搜索消息:', value)
}

const goToChat = (message) => {
  console.log('点击消息:', message)
  console.log('消息类型:', message.type)
  
  switch (message.type) {
    case 'group':
      // 群聊消息跳转到群聊页面
      const groupChatId = `group_${message.id}`
      console.log('点击群聊，message:', message)
      console.log('生成的群聊ID:', groupChatId)
      
      // 保存群聊信息到sessionStorage
      const groupInfo = {
        id: message.id,
        name: message.title,
        avatar: message.avatar,
        memberCount: message.memberCount || 0
      }
      console.log('保存群聊信息:', groupInfo)
      sessionStorage.setItem('groupChatInfo', JSON.stringify(groupInfo))
      
      // 验证保存是否成功
      const saved = sessionStorage.getItem('groupChatInfo')
      console.log('验证保存的群聊信息:', saved)
      
      router.push(`/chat/${groupChatId}`)
      break
    case 'friend':
      // 好友申请跳转到好友页面
      router.push('/friends')
      break
    case 'private':
      // 私聊消息跳转到私聊页面
      const privateChatId = `private_${message.id}`
      // 保存用户信息到sessionStorage
      const userInfo = {
        id: message.id,
        name: message.title,
        avatar: message.avatar
      }
      sessionStorage.setItem('privateChatUser', JSON.stringify(userInfo))
      router.push(`/chat/${privateChatId}`)
      break
    case 'system':
      // 系统消息显示详情弹窗
      showSystemMessageDetail(message)
      break
    case 'order':
      // 订单消息跳转到订单详情
      router.push(`/orders`)
      break
    default:
      // 其他消息跳转到聊天页面
      router.push(`/chat/${message.id}`)
  }
}

// 计算属性
const filteredMessages = computed(() => {
  if (!searchValue.value) return messages.value
  return messages.value.filter(msg => 
    msg.title.includes(searchValue.value) || 
    msg.content.includes(searchValue.value)
  )
})

const systemMessages = computed(() => 
  filteredMessages.value.filter(msg => msg.type === 'system')
)

const orderMessages = computed(() => 
  filteredMessages.value.filter(msg => msg.type === 'order')
)

const privateMessages = computed(() => 
  filteredMessages.value.filter(msg => msg.type === 'private')
)

const friendMessages = computed(() => 
  filteredMessages.value.filter(msg => msg.type === 'friend')
)

const groupMessages = computed(() => {
  const groups = filteredMessages.value.filter(msg => msg.type === 'group')
  console.log('群聊消息数据:', groups)
  return groups
})

// 显示系统消息详情
const showSystemMessageDetail = (message) => {
  currentSystemMessage.value = message
  showSystemDetail.value = true
}
</script>

<style lang="scss" scoped>
.messages {
  .search-bar {
    padding: 16px;
    background: white;
    border-bottom: 1px solid #ebedf0;
  }
}

// 系统消息详情弹窗样式
.system-detail {
  .detail-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid #ebedf0;

    .detail-title {
      font-size: 18px;
      font-weight: 600;
      color: #323233;
    }

    .van-icon {
      font-size: 18px;
      color: #969799;
      cursor: pointer;
    }
  }

  .detail-content {
    padding: 20px;
    max-height: 50vh;
    overflow-y: auto;

    .detail-time {
      font-size: 12px;
      color: #969799;
      margin-bottom: 12px;
    }

    .detail-text {
      font-size: 16px;
      color: #323233;
      line-height: 1.5;
      margin-bottom: 16px;
    }

    .detail-full {
      font-size: 14px;
      color: #646566;
      line-height: 1.6;
      background: #f7f8fa;
      padding: 16px;
      border-radius: 8px;

      p {
        margin: 0 0 8px 0;

        &:last-child {
          margin-bottom: 0;
        }
      }
    }
  }

  .detail-footer {
    padding: 16px 20px;
    border-top: 1px solid #ebedf0;
  }
}
</style>