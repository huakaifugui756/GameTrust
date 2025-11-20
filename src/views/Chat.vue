<template>
  <div class="chat page-container">
    <!-- 顶部导航栏 - 微信风格 -->
    <div class="chat-header">
      <div class="header-left" @click="$router.go(-1)">
        <van-icon name="arrow-left" />
        <span class="back-text">返回</span>
      </div>
      <div class="header-center">
        <div class="chat-title">{{ chatInfo.title }}</div>
        <div class="chat-status" v-if="chatInfo.online">(在线)</div>
      </div>
      <div class="header-right">
        <van-icon name="more-o" @click="showMoreActions" />
      </div>
    </div>

    <!-- 聊天内容区域 -->
    <div class="chat-content" ref="chatContent">
      <!-- 时间分割线 -->
      <div v-for="(date, index) in dateGroups" :key="index" class="date-divider">
        <div class="date-text">{{ date }}</div>
      </div>
      
      <!-- 消息列表 -->
      <div
        v-for="message in messages"
        :key="message.id"
        class="message-item"
        :class="{ 'is-self': message.isSelf }"
      >
        <!-- 时间显示 -->
        <div v-if="message.showTime" class="message-time">
          {{ message.time }}
        </div>
        
        <div class="message-wrapper">
          <!-- 头像 -->
          <div class="message-avatar" v-if="!message.isSelf && !message.isSystem" @click="onAvatarClick(message)">
            <img :src="message.avatar" :alt="message.sender" />
          </div>
          
          <!-- 消息内容 -->
          <div class="message-body">
            <!-- 发送者名称（群聊显示） -->
            <div v-if="!message.isSelf && chatInfo.isGroup" class="sender-name">
              {{ message.sender }}
            </div>
            
            <!-- 消息气泡 -->
            <div class="message-bubble" :class="{ 'is-self': message.isSelf }">
              {{ message.content }}
            </div>
          </div>
          
          <!-- 自己的头像 -->
          <div class="message-avatar" v-if="message.isSelf">
            <img :src="message.avatar" :alt="message.sender" />
          </div>
        </div>
      </div>
    </div>

    <!-- 私聊担保按钮 -->
    <div v-if="!chatInfo.isGroup" class="guarantee-section">
      <van-button 
        type="warning" 
        size="small" 
        icon="shield-o"
        @click="createGuaranteeOrder"
        class="guarantee-btn"
      >
        发起担保交易
      </van-button>
    </div>

    <!-- 输入区域 - 微信风格 -->
    <div class="input-area">
      <div class="input-wrapper">
        <!-- 左侧功能按钮 -->
        <div class="input-left">
          <van-icon name="volume-o" @click="toggleVoice" />
        </div>
        
        <!-- 中间输入框 -->
        <div class="input-center">
          <van-field
            v-model="inputMessage"
            placeholder="说点什么..."
            :border="false"
            @keyup.enter="sendMessage"
            @focus="onInputFocus"
          />
        </div>
        
        <!-- 右侧功能按钮 -->
        <div class="input-right">
          <van-icon v-if="!inputMessage.trim()" name="smile-o" @click="showEmoji" />
          <van-icon v-if="!inputMessage.trim()" name="add-o" @click="showMore" />
          <van-button 
            v-else 
            size="small" 
            type="primary"
            class="send-btn"
            @click="sendMessage"
          >
            发送
          </van-button>
        </div>
      </div>
    </div>

    <!-- 更多操作弹窗 -->
    <van-action-sheet
      v-model:show="showActions"
      :actions="actions"
      @select="onActionSelect"
      cancel-text="取消"
    />

    <!-- 头像点击操作弹窗 -->
    <van-action-sheet
      v-model:show="showAvatarActions"
      :actions="avatarActions"
      @select="onAvatarActionSelect"
      cancel-text="取消"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast } from 'vant'

const route = useRoute()
const router = useRouter()

const chatId = route.params.id
const inputMessage = ref('')
const showActions = ref(false)
const showAvatarActions = ref(false)
const selectedUser = ref(null)
const chatContent = ref(null)

const chatInfo = ref({
  id: 1,
  title: '王者荣耀代练群',
  avatar: 'https://picsum.photos/seed/group1/40/40.jpg',
  isGroup: true,
  online: true,
  memberCount: 128
})

// 根据聊天类型加载不同的消息数据
const messages = ref([])

// 群聊消息数据
const groupMessages = {
  // 消息页面的群聊
  8: [
    {
      id: 1,
      sender: '代练小王',
      senderId: 'user_001',
      content: '今天有人需要代练吗？价格优惠！',
      time: '14:20',
      isSelf: false,
      avatar: 'https://picsum.photos/seed/member1/40/40.jpg',
      showTime: true
    },
    {
      id: 2,
      sender: '游戏达人',
      senderId: 'user_002',
      content: '王者荣耀星耀上王者多少钱？',
      time: '14:22',
      isSelf: false,
      avatar: 'https://picsum.photos/seed/member2/40/40.jpg'
    },
    {
      id: 3,
      sender: '代练小王',
      senderId: 'user_001',
      content: '星耀到王者大概200元，2-3天完成',
      time: '14:25',
      isSelf: false,
      avatar: 'https://picsum.photos/seed/member1/40/40.jpg'
    }
  ],
  9: [
    {
      id: 1,
      sender: '队长',
      senderId: 'user_003',
      content: '今晚8点组队吃鸡，有人来吗？',
      time: '13:45',
      isSelf: false,
      avatar: 'https://picsum.photos/seed/captain/40/40.jpg',
      showTime: true
    },
    {
      id: 2,
      sender: '狙击手小李',
      senderId: 'user_004',
      content: '我来！今晚有空',
      time: '13:50',
      isSelf: false,
      avatar: 'https://picsum.photos/seed/sniper/40/40.jpg'
    }
  ],
  10: [
    {
      id: 1,
      sender: '管理员',
      senderId: 'user_006',
      content: '欢迎新朋友加入游戏代练大厅！',
      time: '12:30',
      isSelf: false,
      avatar: 'https://picsum.photos/seed/admin/40/40.jpg',
      showTime: true
    },
    {
      id: 2,
      sender: '代练大师',
      senderId: 'user_007',
      content: '专业代练各种游戏，信誉第一，价格优惠',
      time: '12:32',
      isSelf: false,
      avatar: 'https://picsum.photos/seed/master/40/40.jpg'
    }
  ],
  // 游戏详情页的群聊
  1: [
    {
      id: 1,
      sender: '群主',
      senderId: 'user_008',
      content: '欢迎来到王者荣耀综合交流群！',
      time: '15:00',
      isSelf: false,
      avatar: 'https://picsum.photos/seed/owner/40/40.jpg',
      showTime: true
    },
    {
      id: 2,
      sender: '游戏玩家',
      senderId: 'user_009',
      content: '有人一起开黑吗？我主玩打野',
      time: '15:05',
      isSelf: false,
      avatar: 'https://picsum.photos/seed/player1/40/40.jpg'
    }
  ],
  2: [
    {
      id: 1,
      sender: '代练管理员',
      senderId: 'user_010',
      content: '欢迎来到代练交易群！请遵守群规。',
      time: '16:00',
      isSelf: false,
      avatar: 'https://picsum.photos/seed/admin/40/40.jpg',
      showTime: true
    },
    {
      id: 2,
      sender: '专业代练',
      senderId: 'user_011',
      content: '承接各种段位代练，价格优惠，信誉第一！',
      time: '16:10',
      isSelf: false,
      avatar: 'https://picsum.photos/seed/pro/40/40.jpg'
    },
    {
      id: 3,
      sender: '需求玩家',
      senderId: 'user_012',
      content: '星耀一上王者，大概多少钱？多久能完成？',
      time: '16:15',
      isSelf: false,
      avatar: 'https://picsum.photos/seed/customer/40/40.jpg'
    }
  ],
  3: [
    {
      id: 1,
      sender: '账号管理员',
      senderId: 'user_013',
      content: '欢迎来到账号交易群，交易请走平台担保！',
      time: '14:00',
      isSelf: false,
      avatar: 'https://picsum.photos/seed/account_admin/40/40.jpg',
      showTime: true
    },
    {
      id: 2,
      sender: '卖家',
      senderId: 'user_014',
      content: '出售V8荣耀王者账号，有典藏皮肤，价格私聊',
      time: '14:30',
      isSelf: false,
      avatar: 'https://picsum.photos/seed/seller/40/40.jpg'
    }
  ]
}

// 私聊消息数据
const privateMessages = {
  2: [
    {
      id: 1,
      sender: '游戏小王',
      content: '你好，我看到你在找代练？',
      time: '14:30',
      isSelf: false,
      avatar: 'https://picsum.photos/seed/user2/40/40.jpg',
      showTime: true
    },
    {
      id: 2,
      sender: '我',
      content: '是的，星耀段位想上王者',
      time: '14:32',
      isSelf: true,
      avatar: 'https://picsum.photos/seed/me/40/40.jpg'
    },
    {
      id: 3,
      sender: '游戏小王',
      content: '我可以帮你，价格优惠，大概需要2-3天',
      time: '14:33',
      isSelf: false,
      avatar: 'https://picsum.photos/seed/user2/40/40.jpg'
    }
  ],
  4: [
    {
      id: 1,
      sender: '代练达人-小明',
      content: '你好，我是专业代练，有什么可以帮助你的吗？',
      time: '10:00',
      isSelf: false,
      avatar: 'https://picsum.photos/seed/friend1/40/40.jpg',
      showTime: true
    },
    {
      id: 2,
      sender: '我',
      content: '想咨询一下代练价格',
      time: '10:05',
      isSelf: true,
      avatar: 'https://picsum.photos/seed/me/40/40.jpg'
    }
  ],
  5: [
    {
      id: 1,
      sender: '游戏玩家-小红',
      content: '嗨，一起玩游戏吗？',
      time: '昨天',
      isSelf: false,
      avatar: 'https://picsum.photos/seed/friend2/40/40.jpg',
      showTime: true
    }
  ]
}

// 根据聊天类型动态生成操作选项
const actions = computed(() => {
  if (chatInfo.value.isGroup) {
    // 群聊操作
    return [
      { name: '查看群成员', value: 'members' },
      { name: '群聊设置', value: 'settings' },
      { name: '清空聊天记录', value: 'clear' },
      { name: '举报群聊', value: 'report' }
    ]
  } else {
    // 私聊操作
    return [
      { name: '发起担保', value: 'create_order' },
      { name: '清空聊天记录', value: 'clear' },
      { name: '举报用户', value: 'report' },
      { name: '拉黑用户', value: 'block' }
    ]
  }
})

const avatarActions = [
  { name: '发消息', value: 'private_chat' },
  { name: '加好友', value: 'add_friend' },
  { name: '查看资料', value: 'view_profile' }
]

// 计算日期分组
const dateGroups = computed(() => {
  const dates = new Set()
  messages.value.forEach(msg => {
    if (msg.showTime) {
      dates.add('今天')
    }
  })
  return Array.from(dates)
})

onMounted(() => {
  console.log('=== Chat页面加载 ===')
  console.log('当前chatId:', chatId)
  console.log('当前路由:', route.fullPath)
  
  // 延迟加载，确保 sessionStorage 数据已准备就绪
  setTimeout(() => {
    loadChatInfo()
    loadMessages()
    scrollToBottom()
  }, 50)
})

// 监听路由参数变化
watch(
  () => route.params.id,
  (newId, oldId) => {
    console.log('🔵 路由参数变化:', { oldId, newId })
    if (newId && newId !== oldId) {
      console.log('🔵 重新加载聊天页面')
      // 延迟加载，确保 sessionStorage 数据已准备就绪
      setTimeout(() => {
        loadChatInfo()
        loadMessages()
        scrollToBottom()
      }, 50)
    }
  },
  { immediate: false }
)

const loadChatInfo = () => {
  console.log('加载聊天信息，chatId:', chatId)
  console.log('sessionStorage中的privateChatUser:', sessionStorage.getItem('privateChatUser'))
  
  // 检查是否是私聊ID
  const isPrivateChat = chatId.startsWith('private_')
  // 检查是否是群聊ID
  const isGroupChat = chatId.startsWith('group_')
  // 检查是否是担保交易群
  const isGuaranteeGroup = chatId.startsWith('guarantee_')
  
  console.log('聊天类型判断:', { isPrivateChat, isGroupChat, isGuaranteeGroup })
  
  // 如果是私聊，添加调试信息
  if (isPrivateChat) {
    console.log('🔵 检测到私聊模式')
    const savedUser = sessionStorage.getItem('privateChatUser')
    console.log('🔵 保存的用户信息:', savedUser)
  }
  
  // 如果是担保交易群
  if (isGuaranteeGroup) {
    const guaranteeData = sessionStorage.getItem('guaranteeGroup')
    if (guaranteeData) {
      const group = JSON.parse(guaranteeData)
      chatInfo.value = {
        title: group.title,
        avatar: 'https://picsum.photos/seed/admin/40/40.jpg',
        isGroup: true,
        isGuaranteeGroup: true,
        online: true,
        memberCount: 3
      }
    } else {
      chatInfo.value = {
        title: '担保交易群',
        avatar: 'https://picsum.photos/seed/admin/40/40.jpg',
        isGroup: true,
        isGuaranteeGroup: true,
        online: true,
        memberCount: 3
      }
    }
  }
  // 如果是私聊ID，从sessionStorage获取用户信息
  if (isPrivateChat) {
    const savedUser = sessionStorage.getItem('privateChatUser')
    console.log('🔵 私聊模式，获取保存的用户信息:', savedUser)
    
    if (savedUser) {
      const user = JSON.parse(savedUser)
      chatInfo.value = {
        title: user.name,
        avatar: user.avatar,
        isGroup: false,
        online: true
      }
      console.log('🔵 使用保存的用户信息:', user)
    } else {
      // 默认私聊信息
      chatInfo.value = {
        title: '新朋友',
        avatar: 'https://picsum.photos/seed/newfriend/40/40.jpg',
        isGroup: false,
        online: true
      }
      console.log('🔵 使用默认私聊信息')
    }
  }
  // 如果是群聊ID，从sessionStorage获取群聊信息
  else if (isGroupChat) {
    const savedGroup = sessionStorage.getItem('groupChatInfo')
    console.log('找到保存的群聊信息:', savedGroup)
    
    if (savedGroup) {
      const group = JSON.parse(savedGroup)
      chatInfo.value = {
        title: group.name,
        avatar: group.avatar,
        isGroup: true,
        isGuaranteeGroup: false,
        online: true,
        memberCount: group.memberCount
      }
      console.log('设置群聊信息:', chatInfo.value)
    } else {
      // 默认群聊信息
      chatInfo.value = {
        title: '游戏交流群',
        avatar: 'https://picsum.photos/seed/group/40/40.jpg',
        isGroup: true,
        isGuaranteeGroup: false,
        online: true,
        memberCount: 50
      }
      console.log('使用默认群聊信息')
    }
  }
  // 如果是担保交易群
  else if (isGuaranteeGroup) {
    const guaranteeData = sessionStorage.getItem('guaranteeGroup')
    if (guaranteeData) {
      const group = JSON.parse(guaranteeData)
      chatInfo.value = {
        title: group.title,
        avatar: 'https://picsum.photos/seed/admin/40/40.jpg',
        isGroup: true,
        isGuaranteeGroup: true,
        online: true,
        memberCount: 3
      }
    } else {
      chatInfo.value = {
        title: '担保交易群',
        avatar: 'https://picsum.photos/seed/admin/40/40.jpg',
        isGroup: true,
        isGuaranteeGroup: true,
        online: true,
        memberCount: 3
      }
    }
  }
  // 如果是纯数字ID，默认为群聊
  else if (/^\d+$/.test(chatId)) {
    console.log('🔵 检测到数字ID，设置为群聊模式')
    chatInfo.value = {
      title: '游戏交流群',
      avatar: 'https://picsum.photos/seed/group/40/40.jpg',
      isGroup: true,
      isGuaranteeGroup: false,
      online: true,
      memberCount: 50
    }
    console.log('🔵 使用数字ID的群聊信息')
  }
  else {
    // 默认为私聊
    chatInfo.value = {
      title: '用户',
      avatar: 'https://picsum.photos/seed/user/40/40.jpg',
      isGroup: false,
      online: true
    }
    console.log('🔵 使用默认用户信息')
  }
  
  console.log('最终聊天信息:', chatInfo.value)
}

const loadMessages = () => {
  // 根据聊天ID和类型加载消息
  if (chatInfo.value.isGuaranteeGroup) {
    // 担保交易群消息
    const guaranteeData = sessionStorage.getItem('guaranteeGroup')
    if (guaranteeData) {
      const group = JSON.parse(guaranteeData)
      messages.value = [
        {
          id: 1,
          sender: '系统消息',
          content: `${group.initiator.name} 发起了担保交易，群聊已创建`,
          time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
          isSelf: false,
          avatar: 'https://picsum.photos/seed/system/40/40.jpg',
          showTime: true,
          isSystem: true
        },
        {
          id: 2,
          sender: '系统消息',
          content: `管理员已自动加入群聊`,
          time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
          isSelf: false,
          avatar: 'https://picsum.photos/seed/system/40/40.jpg',
          isSystem: true
        }
      ]
      
      // 管理员立即发收款码
      setTimeout(() => {
        const adminMessage = {
          id: messages.value.length + 1,
          sender: '管理员',
          content: '【收款码】请扫描下方二维码完成支付\n[收款码图片]\n\n💡 支付完成后请在群内回复"已支付"，管理员会确认并协助完成交易。',
          time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
          isSelf: false,
          avatar: 'https://picsum.photos/seed/admin/40/40.jpg'
        }
        messages.value.push(adminMessage)
        
        nextTick(() => {
          scrollToBottom()
        })
      }, 1000)
    } else {
      messages.value = []
    }
  } else if (chatInfo.value.isGroup) {
    // 普通群聊消息
    let groupId = chatId
    if (chatId.startsWith('group_')) {
      groupId = chatId.replace('group_', '')
    }
    console.log('加载群聊消息，groupId:', groupId)
    console.log('可用的群聊消息:', Object.keys(groupMessages))
    
    if (groupMessages[groupId]) {
      messages.value = [...groupMessages[groupId]]
      console.log('找到群聊消息:', messages.value.length, '条')
    } else {
      // 默认群聊消息
      messages.value = [
        {
          id: 1,
          sender: '群主',
          content: `欢迎来到 ${chatInfo.value.title}！`,
          time: '10:00',
          isSelf: false,
          avatar: 'https://picsum.photos/seed/owner/40/40.jpg',
          showTime: true
        }
      ]
      console.log('使用默认群聊消息')
    }
  } else {
    // 私聊消息
    const privateId = chatId.replace('private_', '')
    if (privateMessages[privateId]) {
      messages.value = [...privateMessages[privateId]]
    } else {
      // 默认私聊消息
      messages.value = [
        {
          id: 1,
          sender: chatInfo.value.title,
          content: '你好，很高兴认识你！',
          time: '10:00',
          isSelf: false,
          avatar: chatInfo.value.avatar,
          showTime: true
        }
      ]
    }
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
  
  // 模拟对方回复
  setTimeout(() => {
    const replyMessage = {
      id: messages.value.length + 1,
      sender: chatInfo.value.isGroup ? '代练达人-小明' : chatInfo.value.title,
      content: getRandomReply(),
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      isSelf: false,
      avatar: chatInfo.value.isGroup ? 'https://picsum.photos/seed/user1/40/40.jpg' : chatInfo.value.avatar
    }
    messages.value.push(replyMessage)
    
    nextTick(() => {
      scrollToBottom()
    })
  }, 1000 + Math.random() * 2000)
}

const getRandomReply = () => {
  const replies = [
    '好的，我明白了！',
    '没问题，马上处理',
    '谢谢你的信任',
    '价格可以再商量',
    '质量保证，放心选择',
    '什么时候开始？',
    '还有什么问题吗？'
  ]
  return replies[Math.floor(Math.random() * replies.length)]
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
    case 'members':
      showToast(`群成员: ${chatInfo.value.memberCount}人`)
      break
    case 'settings':
      showToast('群聊设置')
      break
    case 'clear':
      clearChatHistory()
      break
    case 'report':
      if (chatInfo.value.isGroup) {
        showToast('举报群聊已提交')
      } else {
        showToast('举报用户已提交')
      }
      break
    case 'create_order':
      // 直接创建担保交易群聊
      const guaranteeGroup = {
        id: 'guarantee_' + Date.now(),
        title: `担保交易：${chatInfo.value.title}`,
        initiator: {
          id: selectedUser.value?.id || 'user_' + Date.now(),
          name: chatInfo.value.title,
          avatar: chatInfo.value.avatar
        },
        amount: '待确认',
        description: '担保交易',
        createdAt: new Date().toISOString()
      }
      
      // 保存担保交易群信息
      sessionStorage.setItem('guaranteeGroup', JSON.stringify(guaranteeGroup))
      
      // 直接跳转到担保交易群聊
      window.location.href = `/chat/${guaranteeGroup.id}`
      showToast('担保交易群聊已创建')
      break
    case 'block':
      showToast('用户已拉黑')
      break
  }
}

const clearChatHistory = () => {
  showToast('聊天记录已清空')
  messages.value = []
}

const toggleVoice = () => {
  showToast('语音功能')
}

const showEmoji = () => {
  showToast('表情功能')
}

const showMore = () => {
  showToast('更多功能')
}

const onInputFocus = () => {
  setTimeout(() => {
    scrollToBottom()
  }, 300)
}

// 发起担保交易
const createGuaranteeOrder = () => {
  // 获取当前私聊用户信息
  const savedUser = sessionStorage.getItem('privateChatUser')
  let userInfo = null
  
  if (savedUser) {
    userInfo = JSON.parse(savedUser)
  } else {
    // 如果没有保存的用户信息，使用当前聊天信息
    userInfo = {
      id: 'user_' + Date.now(),
      name: chatInfo.value.title,
      avatar: chatInfo.value.avatar
    }
  }
  
  // 直接创建担保交易群聊
  const guaranteeGroup = {
    id: 'guarantee_' + Date.now(),
    title: `担保交易：${userInfo.name}`,
    initiator: userInfo,
    amount: '待确认',
    description: '担保交易',
    createdAt: new Date().toISOString()
  }
  
  console.log('🔶 创建担保交易群:', guaranteeGroup)
  
  // 保存担保交易群信息
  sessionStorage.setItem('guaranteeGroup', JSON.stringify(guaranteeGroup))
  
  // 直接跳转到担保交易群聊
  window.location.href = `/chat/${guaranteeGroup.id}`
  showToast(`担保交易群聊已创建`)
}

// 头像点击事件
const onAvatarClick = (message) => {
  console.log('🔵 点击头像，消息对象:', message)
  console.log('🔵 senderId:', message.senderId)
  
  // 先用alert测试点击是否生效
  alert(`点击了 ${message.sender} 的头像`)
  
  selectedUser.value = {
    id: message.senderId || Math.random().toString(36).substr(2, 9),
    name: message.sender,
    avatar: message.avatar
  }
  
  console.log('🔵 选中的用户信息:', selectedUser.value)
  
  // 直接设置showAvatarActions
  showAvatarActions.value = true
  console.log('🔵 showAvatarActions设置为:', showAvatarActions.value)
}

// 头像操作选择
const onAvatarActionSelect = (action) => {
  console.log('🔵 头像操作选择:', action)
  console.log('🔵 当前选中的用户:', selectedUser.value)
  
  showAvatarActions.value = false
  
  if (!selectedUser.value) {
    console.log('🔴 错误：没有选中的用户')
    showToast('用户信息错误，请重试')
    return
  }
  
  switch (action.value) {
    case 'private_chat':
      console.log('🔵 选择发消息')
      // 保存用户信息到sessionStorage，用于私聊页面显示
      const privateChatId = `private_${selectedUser.value.id}`
      const userInfo = {
        id: selectedUser.value.id,
        name: selectedUser.value.name,
        avatar: selectedUser.value.avatar
      }
      console.log('🔵 准备进入私聊，保存用户信息:', userInfo)
      
      try {
        sessionStorage.setItem('privateChatUser', JSON.stringify(userInfo))
        console.log('🔵 用户信息保存成功')
        
        // 验证保存是否成功
        const saved = sessionStorage.getItem('privateChatUser')
        console.log('🔵 验证保存的数据:', saved)
        
        // 使用 window.location.href 直接跳转，确保页面重新加载
        console.log('🔵 开始跳转到私聊页面:', `/chat/${privateChatId}`)
        showToast(`正在与 ${selectedUser.value.name} 私聊`)
        
        // 使用 nextTick 确保 Toast 显示后再跳转
        nextTick(() => {
          window.location.href = `/chat/${privateChatId}`
        })
      } catch (error) {
        console.error('🔴 保存用户信息失败:', error)
        showToast('跳转失败，请重试')
      }
      break
    case 'add_friend':
      console.log('🔵 选择加好友')
      // 跳转到加好友页面
      router.push('/friends')
      showToast(`正在添加 ${selectedUser.value.name} 为好友`)
      break
    case 'view_profile':
      console.log('🔵 选择查看资料')
      // 跳转到用户资料页面
      router.push(`/profile/${selectedUser.value.id}`)
      showToast(`查看 ${selectedUser.value.name} 的资料`)
      break
  }
  
  selectedUser.value = null
}
</script>

<style lang="scss" scoped>
.chat {
  display: flex;
  flex-direction: column;
  height: 100vh;
  padding-top: 0;
  background: #ededed;
}

// 微信风格顶部导航
.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 44px;
  padding: 0 16px;
  background: #f7f7f7;
  border-bottom: 1px solid #e0e0e0;
  position: relative;
  z-index: 100;

  .header-left {
    display: flex;
    align-items: center;
    cursor: pointer;
    
    .van-icon {
      font-size: 20px;
      color: #333;
      margin-right: 8px;
    }
    
    .back-text {
      font-size: 16px;
      color: #333;
    }
  }

  .header-center {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    text-align: center;

    .chat-title {
      font-size: 17px;
      font-weight: 500;
      color: #333;
      max-width: 150px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .chat-status {
      font-size: 12px;
      color: #666;
      margin-top: 2px;
    }
  }

  .header-right {
    .van-icon {
      font-size: 20px;
      color: #333;
      cursor: pointer;
    }
  }
}

// 聊天内容区域
.chat-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px 16px;
  background: #ededed;

  // 时间分割线
  .date-divider {
    text-align: center;
    margin: 20px 0;

    .date-text {
      display: inline-block;
      padding: 4px 12px;
      background: rgba(0, 0, 0, 0.1);
      color: #666;
      font-size: 12px;
      border-radius: 10px;
    }
  }

  // 消息时间
  .message-time {
    text-align: center;
    margin: 15px 0;
    font-size: 12px;
    color: #999;
  }

  .message-item {
    margin-bottom: 25px;

    .message-wrapper {
      display: flex;
      align-items: flex-start;

      &.is-self {
        flex-direction: row-reverse;
      }
    }

    // 头像
    .message-avatar {
      width: 40px;
      height: 40px;
      margin: 0 10px;
      flex-shrink: 0;
      cursor: pointer;
      transition: opacity 0.2s;

      &:hover {
        opacity: 0.8;
      }

      img {
        width: 100%;
        height: 100%;
        border-radius: 4px;
        object-fit: cover;
      }
    }

    // 消息主体
    .message-body {
      max-width: 65%;
      min-width: 0;

      // 发送者名称（群聊）
      .sender-name {
        font-size: 12px;
        color: #999;
        margin-bottom: 4px;
        padding-left: 12px;
      }

      // 消息气泡
      .message-bubble {
        position: relative;
        padding: 10px 12px;
        background: #fff;
        border-radius: 8px;
        font-size: 16px;
        line-height: 1.5;
        color: #333;
        word-wrap: break-word;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);

        // 左侧小三角
        &::before {
          content: '';
          position: absolute;
          top: 12px;
          left: -6px;
          width: 0;
          height: 0;
          border-style: solid;
          border-width: 6px 6px 6px 0;
          border-color: transparent #fff transparent transparent;
        }

        // 自己的消息样式
        &.is-self {
          background: #95ec69;
          color: #333;

          &::before {
            left: auto;
            right: -6px;
            border-width: 6px 0 6px 6px;
            border-color: transparent transparent transparent #95ec69;
          }
        }
      }
    }

    // 自己的消息布局
    &.is-self {
      .message-wrapper {
        flex-direction: row-reverse;
      }

      .message-avatar {
        margin-left: 10px;
        margin-right: 0;
      }

      .message-body {
        display: flex;
        flex-direction: column;
        align-items: flex-end;

        .message-bubble {
          text-align: left;
        }
      }
    }

    // 系统消息
    &.is-system {
      .message-wrapper {
        justify-content: center;

        .message-bubble {
          background: rgba(0, 0, 0, 0.05);
          color: #666;
          font-size: 14px;
          padding: 6px 12px;

          &::before {
            display: none;
          }
        }
      }
    }
  }
}

// 私聊担保区域
.guarantee-section {
  background: #fff3cd;
  padding: 8px 16px;
  border-top: 1px solid #ffeaa7;
  text-align: center;
  
  .guarantee-btn {
    border-radius: 20px;
    font-weight: 500;
  }
}

// 输入区域 - 微信风格
.input-area {
  background: #f7f7f7;
  border-top: 1px solid #e0e0e0;
  padding: 8px 16px;

  .input-wrapper {
    display: flex;
    align-items: center;
    gap: 12px;

    .input-left,
    .input-right {
      display: flex;
      align-items: center;

      .van-icon {
        font-size: 24px;
        color: #333;
        cursor: pointer;
        padding: 8px;
        transition: opacity 0.2s;

        &:hover {
          opacity: 0.7;
        }
      }
    }

    .input-center {
      flex: 1;

      :deep(.van-field) {
        background: #fff;
        border-radius: 20px;
        padding: 8px 16px;
        border: 1px solid #e0e0e0;

        .van-field__control {
          font-size: 16px;
          min-height: 20px;
        }
      }
    }

    .send-btn {
      height: 32px;
      padding: 0 16px;
      font-size: 14px;
      background: #07c160;
      border-color: #07c160;
    }
  }
}

// 滚动条样式
.chat-content::-webkit-scrollbar {
  width: 4px;
}

.chat-content::-webkit-scrollbar-track {
  background: transparent;
}

.chat-content::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 2px;
}

.chat-content::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}
</style>