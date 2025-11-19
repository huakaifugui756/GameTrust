<template>
  <div class="chat page-container">
    <van-nav-bar
      :title="chatInfo.title"
      left-arrow
      @click-left="$router.go(-1)"
    >
      <template #right>
        <van-icon name="ellipsis" @click="showMoreActions" />
      </template>
    </van-nav-bar>

    <!-- 聊天内容区域 -->
    <div class="chat-content" ref="chatContent">
      <div
        v-for="message in messages"
        :key="message.id"
        class="message-item"
        :class="{ 'is-self': message.isSelf }"
      >
        <div class="message-avatar">
          <img :src="message.avatar" :alt="message.sender" />
        </div>
        <div class="message-body">
          <div class="message-info">
            <span class="sender">{{ message.sender }}</span>
            <span class="time">{{ message.time }}</span>
          </div>
          <div class="message-content">
            <div class="message-bubble">{{ message.content }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 输入区域 -->
    <div class="input-area">
      <van-field
        v-model="inputMessage"
        placeholder="输入消息..."
        :border="false"
        @keyup.enter="sendMessage"
      >
        <template #button>
          <van-button
            size="small"
            type="primary"
            :disabled="!inputMessage.trim()"
            @click="sendMessage"
          >
            发送
          </van-button>
        </template>
      </van-field>
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
import { ref, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast } from 'vant'

const route = useRoute()
const router = useRouter()

const chatId = route.params.id
const inputMessage = ref('')
const showActions = ref(false)
const chatContent = ref(null)

const chatInfo = ref({
  id: 1,
  title: '代练达人',
  avatar: 'https://picsum.photos/seed/user1/40/40.jpg'
})

const messages = ref([
  {
    id: 1,
    sender: '代练达人',
    content: '您好，我已经开始代练了',
    time: '14:30',
    isSelf: false,
    avatar: 'https://picsum.photos/seed/user1/40/40.jpg'
  },
  {
    id: 2,
    sender: '我',
    content: '好的，大概多久能完成？',
    time: '14:32',
    isSelf: true,
    avatar: 'https://picsum.photos/seed/me/40/40.jpg'
  },
  {
    id: 3,
    sender: '代练达人',
    content: '预计2-3天完成，会保证账号安全',
    time: '14:33',
    isSelf: false,
    avatar: 'https://picsum.photos/seed/user1/40/40.jpg'
  }
])

const actions = [
  { name: '查看资料', value: 'profile' },
  { name: '清空聊天记录', value: 'clear' },
  { name: '举报用户', value: 'report' },
  { name: '拉黑用户', value: 'block' }
]

onMounted(() => {
  loadChatInfo()
  scrollToBottom()
})

const loadChatInfo = () => {
  console.log('加载聊天信息，ID:', chatId)
  
  // 根据不同的聊天ID加载不同的聊天信息
  const chatData = {
    1: {
      title: '代练达人',
      avatar: 'https://picsum.photos/seed/user1/40/40.jpg'
    },
    2: {
      title: '游戏小王',
      avatar: 'https://picsum.photos/seed/user2/40/40.jpg'
    },
    3: {
      title: '系统通知',
      avatar: 'https://picsum.photos/seed/system/40/40.jpg'
    }
  }
  
  if (chatData[chatId]) {
    chatInfo.value = chatData[chatId]
  }
}

const sendMessage = () => {
  if (!inputMessage.value.trim()) return
  
  const newMessage = {
    id: messages.value.length + 1,
    sender: '我',
    content: inputMessage.value.trim(),
    time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    isSelf: true,
    avatar: 'https://picsum.photos/seed/me/40/40.jpg'
  }
  
  messages.value.push(newMessage)
  inputMessage.value = ''
  
  nextTick(() => {
    scrollToBottom()
  })
  
  showToast('发送成功')
}

const scrollToBottom = () => {
  if (chatContent.value) {
    chatContent.value.scrollTop = chatContent.value.scrollHeight
  }
}

const showMoreActions = () => {
  showActions.value = true
}

const onActionSelect = (action) => {
  showActions.value = false
  
  switch (action.value) {
    case 'profile':
      router.push(`/user/${chatId}`)
      break
    case 'clear':
      clearChatHistory()
      break
    case 'report':
      router.push(`/report/${chatId}`)
      break
    case 'block':
      blockUser()
      break
  }
}

const clearChatHistory = () => {
  showToast('聊天记录已清空')
  messages.value = []
}

const blockUser = () => {
  showToast('用户已拉黑')
  router.go(-1)
}
</script>

<style lang="scss" scoped>
.chat {
  display: flex;
  flex-direction: column;
  height: 100vh;
  padding-top: 0;

  .chat-content {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    background: #f7f8fa;

    .message-item {
      display: flex;
      margin-bottom: 16px;

      &.is-self {
        flex-direction: row-reverse;

        .message-body {
          align-items: flex-end;

          .message-info {
            flex-direction: row-reverse;
          }

          .message-bubble {
            background: #1989fa;
            color: white;
          }
        }
      }

      .message-avatar {
        margin: 0 12px;

        img {
          width: 40px;
          height: 40px;
          border-radius: 50%;
        }
      }

      .message-body {
        flex: 1;
        max-width: 70%;

        .message-info {
          display: flex;
          align-items: center;
          margin-bottom: 4px;
          font-size: 12px;
          color: #969799;

          .sender {
            font-weight: 500;
            margin-right: 8px;
          }
        }

        .message-content {
          .message-bubble {
            padding: 12px 16px;
            background: white;
            border-radius: 8px;
            word-wrap: break-word;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
          }
        }
      }
    }
  }

  .input-area {
    padding: 16px;
    background: white;
    border-top: 1px solid #ebedf0;

    .van-field {
      background: #f7f8fa;
      border-radius: 20px;
      padding: 8px 16px;
    }
  }
}
</style>