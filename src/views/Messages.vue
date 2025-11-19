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
      <van-tab title="系统消息" name="system">
        <MessageList :messages="systemMessages" @click="goToChat" />
      </van-tab>
      <van-tab title="订单消息" name="order">
        <MessageList :messages="orderMessages" @click="goToChat" />
      </van-tab>
      <van-tab title="私聊" name="private">
        <MessageList :messages="privateMessages" @click="goToChat" />
      </van-tab>
    </van-tabs>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import MessageList from '@/components/MessageList.vue'

const router = useRouter()
const searchValue = ref('')
const activeTab = ref('all')

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
    id: 3,
    type: 'private',
    title: '代练达人',
    content: '您好，我已经开始代练了',
    time: '昨天',
    unread: 0,
    avatar: 'https://picsum.photos/seed/user1/40/40.jpg'
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
  router.push(`/chat/${message.id}`)
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
</script>

<style lang="scss" scoped>
.messages {
  .search-bar {
    padding: 16px;
    background: white;
    border-bottom: 1px solid #ebedf0;
  }
}
</style>