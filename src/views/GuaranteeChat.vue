<template>
  <div class="guarantee-chat page-container">
    <!-- 顶部导航栏 -->
    <div class="chat-header">
      <div class="header-left" @click="$router.go(-1)">
        <van-icon name="arrow-left" />
        <span class="back-text">返回</span>
      </div>
      <div class="header-center">
        <div class="chat-title">{{ guaranteeGroup.title }}</div>
        <div class="chat-status">
          <van-tag type="success" size="small">担保交易群</van-tag>
        </div>
      </div>
      <div class="header-right">
        <van-icon name="more-o" @click="showMoreActions" />
      </div>
    </div>

    <!-- 担保交易状态卡片 -->
    <div class="guarantee-status-card" v-show="showStatusCard">
      <div class="status-header">
        <van-icon name="shield-o" class="guarantee-icon" />
        <span class="status-title">担保交易状态</span>
        <van-tag 
          :type="getStatusType()" 
          size="small"
          class="status-tag"
        >
          {{ getStatusText() }}
        </van-tag>
      </div>
      
      <div class="status-content">
        <div class="party-section">
          <div class="party-item" @click="showContactDetails(guaranteeGroup.initiator, 'initiator')">
            <div class="party-avatar">
              <img :src="guaranteeGroup.initiator?.avatar || defaultAvatar" />
            </div>
            <div class="party-info">
              <div class="party-name">{{ guaranteeGroup.initiator?.name || '发起方' }}</div>
              <div class="party-role">甲方（发起方）</div>
              <van-tag v-if="guaranteeGroup.initiatorConfirmed" type="success" size="mini">已确认</van-tag>
              <van-tag v-else type="warning" size="mini">待确认</van-tag>
            </div>
            <van-icon name="arrow" class="party-arrow" />
          </div>
          
          <div class="vs-divider">VS</div>
          
          <div class="party-item" @click="showContactDetails(guaranteeGroup.receiver, 'receiver')">
            <div class="party-avatar">
              <img :src="guaranteeGroup.receiver?.avatar || defaultAvatar" />
            </div>
            <div class="party-info">
              <div class="party-name">{{ guaranteeGroup.receiver?.name || '接收方' }}</div>
              <div class="party-role">乙方（接收方）</div>
              <van-tag v-if="guaranteeGroup.receiverConfirmed" type="success" size="mini">已确认</van-tag>
              <van-tag v-else type="warning" size="mini">待确认</van-tag>
            </div>
            <van-icon name="arrow" class="party-arrow" />
          </div>
        </div>
        
        <div class="transaction-details">
          <van-cell title="交易金额" :value="`¥${guaranteeGroup.amount || '0'}`" />
          <van-cell title="担保费用" :value="`¥${guaranteeGroup.guaranteeFee || '0'}`" />
          <van-cell title="创建时间" :value="formatTime(guaranteeGroup.createdAt)" />
        </div>
      </div>
      
      <div class="status-actions">
        <!-- 普通用户确认按钮 -->
        <van-button 
          v-if="canCurrentUserConfirm && !authStore.user?.isAdmin" 
          type="primary" 
          size="small"
          @click="confirmTransaction"
          :loading="confirming"
        >
          确认交易
        </van-button>
        
        <!-- 管理员确认按钮 -->
        <van-button 
          v-if="authStore.user?.isAdmin" 
          type="success" 
          size="small"
          @click="adminConfirm"
          :loading="confirming"
        >
          管理员确认
        </van-button>
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
            <div v-if="!message.isSelf" class="sender-name">
              {{ message.sender }}
              <van-tag v-if="message.isAdmin" type="success" size="mini">管理员</van-tag>
            </div>
            
            <!-- 消息气泡 -->
            <div class="message-bubble" :class="{ 'is-self': message.isSelf, 'is-admin': message.isAdmin, 'is-system': message.isSystem }">
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

    <!-- 输入区域 -->
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
            placeholder="请输入消息..."
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

    <!-- 联系人详情弹窗 -->
    <van-popup 
      v-model:show="showContactDetailsPopup" 
      position="bottom" 
      :style="{ height: '60%' }"
      round
    >
      <div class="contact-details">
        <div class="contact-header">
          <div class="contact-avatar">
            <img :src="selectedContact?.avatar || defaultAvatar" />
          </div>
          <div class="contact-info">
            <div class="contact-name">{{ selectedContact?.name || '未知用户' }}</div>
            <div class="contact-role">{{ selectedContactRole === 'initiator' ? '甲方（发起方）' : '乙方（接收方）' }}</div>
            <van-tag 
              :type="selectedContactRole === 'initiator' ? 
                (guaranteeGroup.initiatorConfirmed ? 'success' : 'warning') : 
                (guaranteeGroup.receiverConfirmed ? 'success' : 'warning')" 
              size="small"
            >
              {{ selectedContactRole === 'initiator' ? 
                (guaranteeGroup.initiatorConfirmed ? '已确认' : '待确认') : 
                (guaranteeGroup.receiverConfirmed ? '已确认' : '待确认') }}
            </van-tag>
          </div>
        </div>
        
        <div class="contact-actions">
          <van-cell-group>
            <van-cell 
              title="发送私聊" 
              is-link 
              @click="sendPrivateMessage"
              icon="chat-o"
            />
            <van-cell 
              title="查看资料" 
              is-link 
              @click="viewUserProfile"
              icon="contact"
            />
            <van-cell 
              title="拨打电话" 
              is-link 
              @click="makePhoneCall"
              icon="phone-o"
              :value="selectedContact?.phone || '未知'"
            />
            <van-cell 
              title="举报用户" 
              is-link 
              @click="reportUser"
              icon="warning-o"
            />
          </van-cell-group>
        </div>
        
        <div class="contact-close">
          <van-button block @click="showContactDetailsPopup = false">
            关闭
          </van-button>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast } from 'vant'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const chatId = route.params.id
const inputMessage = ref('')
const showActions = ref(false)
const showAvatarActions = ref(false)
const selectedUser = ref(null)
const chatContent = ref(null)
const confirming = ref(false)
const showStatusCard = ref(true)
const showContactDetailsPopup = ref(false)
const selectedContact = ref(null)
const selectedContactRole = ref('')
const defaultAvatar = 'https://picsum.photos/seed/default/40/40.jpg'

// 担保交易群信息
const guaranteeGroup = ref({
  id: '',
  title: '担保交易群',
  initiator: null,
  receiver: null,
  amount: '0',
  guaranteeFee: '0',
  status: 'pending',
  initiatorConfirmed: false,
  receiverConfirmed: false,
  createdAt: new Date().toISOString()
})

// 消息列表
const messages = ref([])

// 操作选项
const actions = computed(() => {
  const isAdmin = authStore.user?.isAdmin
  let actionList = [
    { name: '查看交易详情', value: 'details' },
    { name: '清空聊天记录', value: 'clear' }
  ]
  
  if (isAdmin) {
    const statusActions = []
    
    // 根据交易状态提供不同的管理选项
    if (guaranteeGroup.value.status === 'confirmed' || guaranteeGroup.value.status === 'service') {
      statusActions.push({ name: '标记服务完成', value: 'mark_service_complete' })
    }
    
    if (guaranteeGroup.value.status === 'delivery') {
      statusActions.push({ name: '强制完成交易', value: 'force_complete' })
    }
    
    if (guaranteeGroup.value.status !== 'completed') {
      statusActions.push({ name: '取消交易', value: 'cancel_transaction' })
      statusActions.push({ name: '冻结资金', value: 'freeze_funds' })
    }
    
    actionList.unshift(
      { name: '修改群名', value: 'rename' },
      { name: '订单管理', value: 'order_manage' },
      ...statusActions,
      { name: '发送系统通知', value: 'send_notice' },
      { name: '查看操作日志', value: 'view_logs' }
    )
  }
  
  return actionList
})

const avatarActions = [
  { name: '发消息', value: 'private_chat' },
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

// 判断当前用户是否可以确认
const canCurrentUserConfirm = computed(() => {
  const currentUser = authStore.user
  console.log('=== canCurrentUserConfirm 计算 ===')
  console.log('当前用户:', currentUser)
  console.log('担保群:', guaranteeGroup.value)
  
  if (!currentUser || !guaranteeGroup.value) {
    console.log('返回false: 用户或担保群信息不存在')
    return false
  }
  
  console.log('发起方电话:', guaranteeGroup.value.initiator?.phone)
  console.log('接收方电话:', guaranteeGroup.value.receiver?.phone)
  console.log('当前用户电话:', currentUser.phone)
  console.log('发起方已确认:', guaranteeGroup.value.initiatorConfirmed)
  console.log('接收方已确认:', guaranteeGroup.value.receiverConfirmed)
  
  // 如果是发起方且未确认
  if (guaranteeGroup.value.initiator?.phone === currentUser.phone && !guaranteeGroup.value.initiatorConfirmed) {
    console.log('返回true: 发起方可以确认')
    return true
  }
  
  // 如果是接收方且未确认
  if (guaranteeGroup.value.receiver?.phone === currentUser.phone && !guaranteeGroup.value.receiverConfirmed) {
    console.log('返回true: 接收方可以确认')
    return true
  }
  
  console.log('返回false: 不满足确认条件')
  return false
})

onMounted(() => {
  console.log('=== GuaranteeChat页面加载 ===')
  console.log('当前chatId:', chatId)
  
  loadGuaranteeGroup()
  loadMessages()
  scrollToBottom()
})

// 加载担保交易群信息
const loadGuaranteeGroup = () => {
  console.log('=== 开始加载担保群信息 ===')
  console.log('当前chatId:', chatId)
  
  // 先从sessionStorage获取
  const savedGroup = sessionStorage.getItem('guaranteeGroup')
  if (savedGroup) {
    guaranteeGroup.value = JSON.parse(savedGroup)
    console.log('从sessionStorage加载:', guaranteeGroup.value)
  }
  
  // 然后从localStorage获取更详细的信息
  const chatList = JSON.parse(localStorage.getItem('chatList') || '[]')
  console.log('chatList:', chatList)
  const chatInfo = chatList.find(chat => chat.id === chatId)
  console.log('找到的chatInfo:', chatInfo)
  
  if (chatInfo) {
    guaranteeGroup.value = {
      ...guaranteeGroup.value,
      ...chatInfo
    }
    
    // 从订单信息获取更多数据
    const orders = JSON.parse(localStorage.getItem('orders') || '[]')
    console.log('orders:', orders)
    const orderInfo = orders.find(order => order.id === chatId)
    console.log('找到的orderInfo:', orderInfo)
    
    if (orderInfo) {
      guaranteeGroup.value = {
        ...guaranteeGroup.value,
        ...orderInfo
      }
    }
  }
  
  console.log('最终加载的担保群信息:', guaranteeGroup.value)
  
  // 如果没有发起方和接收方信息，创建测试数据
  if (!guaranteeGroup.value.initiator || !guaranteeGroup.value.receiver) {
    console.log('创建测试数据')
    guaranteeGroup.value.initiator = {
      phone: '18812345678',
      name: '测试甲方',
      avatar: 'https://picsum.photos/seed/initiator/40/40.jpg'
    }
    guaranteeGroup.value.receiver = {
      phone: '13987654321', 
      name: '测试乙方',
      avatar: 'https://picsum.photos/seed/receiver/40/40.jpg'
    }
    guaranteeGroup.value.initiatorConfirmed = false
    guaranteeGroup.value.receiverConfirmed = false
    console.log('创建测试数据后的担保群:', guaranteeGroup.value)
  }
}

// 加载消息
const loadMessages = () => {
  const savedMessages = localStorage.getItem(`chat_messages_${chatId}`)
  if (savedMessages) {
    messages.value = JSON.parse(savedMessages)
  } else {
    // 创建初始消息
    messages.value = [
      {
        id: 1,
        sender: '系统消息',
        content: `${guaranteeGroup.value.title} 已创建`,
        time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
        isSelf: false,
        avatar: 'https://picsum.photos/seed/system/40/40.jpg',
        showTime: true,
        isSystem: true
      },
      {
        id: 2,
        sender: '系统消息',
        content: '管理员已自动加入群聊',
        time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
        isSelf: false,
        avatar: 'https://picsum.photos/seed/system/40/40.jpg',
        isSystem: true
      },
      {
        id: 3,
        sender: '管理员',
        content: '大家好，我是管理员。担保交易已创建，请按照流程操作。',
        time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
        isSelf: false,
        avatar: 'https://picsum.photos/seed/admin/40/40.jpg',
        isAdmin: true
      }
    ]
    
    // 保存初始消息
    saveMessages()
  }
  
  console.log('加载的消息:', messages.value.length, '条')
}

// 保存消息
const saveMessages = () => {
  localStorage.setItem(`chat_messages_${chatId}`, JSON.stringify(messages.value))
}

// 发送消息
const sendMessage = () => {
  if (!inputMessage.value.trim()) return
  
  const messageContent = inputMessage.value.trim()
  const currentUser = authStore.user
  
  const newMessage = {
    id: Date.now(),
    sender: currentUser?.nickname || '用户',
    content: messageContent,
    time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    isSelf: true,
    avatar: currentUser?.avatar || defaultAvatar
  }
  
  messages.value.push(newMessage)
  inputMessage.value = ''
  
  saveMessages()
  scrollToBottom()
  
  // 检测支付相关消息
  if (messageContent.includes('已支付') || messageContent.includes('支付完成')) {
    handlePaymentConfirmation()
  }
  
  // 增强自动回复
  setTimeout(() => {
    enhancedAutoReply(messageContent)
  }, 1500)
}

// 处理支付确认
const handlePaymentConfirmation = () => {
  setTimeout(() => {
    const adminMessage = {
      id: Date.now(),
      sender: '管理员',
      content: '✅ 正在确认收款...\\n\\n📋 验证步骤：\\n• 检查支付金额是否正确\\n• 确认资金是否到账\\n• 验证交易安全性\\n\\n⏳ 请稍等，我正在核实收款情况...',
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      isSelf: false,
      avatar: 'https://picsum.photos/seed/admin/40/40.jpg',
      isAdmin: true
    }
    messages.value.push(adminMessage)
    saveMessages()
    scrollToBottom()
    
    // 3秒后确认到账
    setTimeout(() => {
      const confirmMessage = {
        id: Date.now() + 1,
        sender: '管理员',
        content: '✅ 收款确认成功！\\n\\n📋 资金到账信息：\\n• 支付状态：已到账 ✓\\n• 资金金额：已核实 ✓\\n• 担保状态：生效中 ✓\\n\\n🎯 资金已安全到账，现在可以开始交易。请双方按照约定完成服务，我会全程监督并确保交易安全。',
        time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
        isSelf: false,
        avatar: 'https://picsum.photos/seed/admin/40/40.jpg',
        isAdmin: true
      }
      messages.value.push(confirmMessage)
      saveMessages()
      scrollToBottom()
    }, 3000)
  }, 2000)
}

// 自动回复
const autoReply = (userMessage) => {
  let replyContent = ''
  
  if (userMessage.includes('你好') || userMessage.includes('hi')) {
    replyContent = '你好！我是管理员，有什么可以帮助您的吗？'
  } else if (userMessage.includes('担保') || userMessage.includes('交易')) {
    replyContent = '担保交易正在进行中，我会全程监督，确保交易安全。'
  } else if (userMessage.includes('支付') || userMessage.includes('付款')) {
    replyContent = '请按照担保流程进行支付，支付完成后请告知我进行确认。'
  } else {
    replyContent = '收到您的消息，我会尽快处理。如有紧急问题，请直接联系管理员。'
  }
  
  const replyMessage = {
    id: Date.now(),
    sender: '管理员',
    content: replyContent,
    time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    isSelf: false,
    avatar: 'https://picsum.photos/seed/admin/40/40.jpg',
    isAdmin: true
  }
  
  messages.value.push(replyMessage)
  saveMessages()
  scrollToBottom()
}

// 显示交易详情
const showTransactionDetails = () => {
  const details = `
📋 交易详细信息

🆔 订单编号：${guaranteeGroup.value.id}
📅 创建时间：${formatTime(guaranteeGroup.value.createdAt)}
💰 交易金额：¥${guaranteeGroup.value.amount || '0'}
🔒 担保费用：¥${guaranteeGroup.value.guaranteeFee || '0'}
📊 当前状态：${getStatusText()}

👥 参与方信息：
• 甲方：${guaranteeGroup.value.initiator?.name || '未知'}
• 乙方：${guaranteeGroup.value.receiver?.name || '未知'}

✅ 确认状态：
• 甲方确认：${guaranteeGroup.value.initiatorConfirmed ? '已确认' : '未确认'}
• 乙方确认：${guaranteeGroup.value.receiverConfirmed ? '已确认' : '未确认'}
• 管理员确认：${guaranteeGroup.value.adminConfirmedAt ? '已确认' : '未确认'}
  `.trim()
  
  showToast('交易详情已查看')
  console.log('交易详情:', details)
}

// 标记服务完成
const markServiceComplete = () => {
  guaranteeGroup.value.status = 'delivery'
  updateGuaranteeStatus()
  
  const adminMessage = {
    id: Date.now(),
    sender: '管理员',
    content: '🔧 管理员已标记服务完成\\n\\n📋 状态更新：\\n• 服务状态：已完成 ✓\\n• 交易状态：待确认收货\\n• 下一步：等待接收方确认\\n\\n💬 请接收方确认服务完成情况，确认后我将释放资金。',
    time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    isSelf: false,
    avatar: 'https://picsum.photos/seed/admin/40/40.jpg',
    isAdmin: true
  }
  
  messages.value.push(adminMessage)
  saveMessages()
  scrollToBottom()
  showToast('已标记服务完成')
}

// 强制完成交易
const forceCompleteTransaction = () => {
  guaranteeGroup.value.status = 'completed'
  guaranteeGroup.value.completedAt = new Date().toISOString()
  guaranteeGroup.value.forceCompleted = true
  
  updateGuaranteeStatus()
  
  const adminMessage = {
    id: Date.now(),
    sender: '管理员',
    content: '⚡ 管理员已强制完成交易\\n\\n📋 处理结果：\\n• 交易状态：已完成 ✓\\n• 资金释放：已处理 ✓\\n• 完成方式：管理员强制完成\\n\\n💰 资金已释放给服务提供方，交易正式结束。\\n\\n📝 如有异议，请在24小时内联系客服申诉。',
    time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    isSelf: false,
    avatar: 'https://picsum.photos/seed/admin/40/40.jpg',
    isAdmin: true
  }
  
  messages.value.push(adminMessage)
  saveMessages()
  scrollToBottom()
  showToast('已强制完成交易')
}

// 取消交易
const cancelTransaction = () => {
  guaranteeGroup.value.status = 'cancelled'
  guaranteeGroup.value.cancelledAt = new Date().toISOString()
  
  updateGuaranteeStatus()
  
  const adminMessage = {
    id: Date.now(),
    sender: '管理员',
    content: '❌ 管理员已取消交易\\n\\n📋 处理结果：\\n• 交易状态：已取消\\n• 资金处理：将按规则退款\\n• 取消时间：' + formatTime(new Date().toISOString()) + '\\n\\n💰 退款说明：\\n• 如未付款：无需处理\\n• 已付款未服务：全额退款\\n• 服务进行中：按实际情况处理\\n\\n📞 如有疑问，请联系客服了解具体退款流程。',
    time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    isSelf: false,
    avatar: 'https://picsum.photos/seed/admin/40/40.jpg',
    isAdmin: true
  }
  
  messages.value.push(adminMessage)
  saveMessages()
  scrollToBottom()
  showToast('交易已取消')
}

// 冻结资金
const freezeFunds = () => {
  guaranteeGroup.value.fundsFrozen = true
  guaranteeGroup.value.frozenAt = new Date().toISOString()
  
  updateGuaranteeStatus()
  
  const adminMessage = {
    id: Date.now(),
    sender: '管理员',
    content: '🔒 管理员已冻结交易资金\\n\\n📋 冻结信息：\\n• 资金状态：已冻结\\n• 冻结原因：安全检查\\n• 冻结时间：' + formatTime(new Date().toISOString()) + '\\n\\n⚠️ 资金冻结期间：\\n• 暂停所有资金操作\\n• 等待进一步调查\\n• 可能需要提供额外证明\\n\\n📞 请相关用户配合调查，确保交易安全。',
    time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    isSelf: false,
    avatar: 'https://picsum.photos/seed/admin/40/40.jpg',
    isAdmin: true
  }
  
  messages.value.push(adminMessage)
  saveMessages()
  scrollToBottom()
  showToast('资金已冻结')
}

// 发送系统通知
const sendSystemNotice = () => {
  const noticeContent = `📢 系统通知\\n\\n🏢 平台公告：\\n• 请各位用户遵守交易规则\\n• 如有问题及时联系管理员\\n• 保护好个人信息安全\\n• 不要在平台外交易\\n\\n🛡️ 安全提醒：\\n• 平台担保交易最安全\\n• 警惕诈骗和虚假信息\\n• 发现问题请立即举报\\n\\n📞 客服热线：400-123-4567`
  
  const noticeMessage = {
    id: Date.now(),
    sender: '系统消息',
    content: noticeContent,
    time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    isSelf: false,
    isSystem: true,
    avatar: 'https://picsum.photos/seed/system/40/40.jpg'
  }
  
  messages.value.push(noticeMessage)
  saveMessages()
  scrollToBottom()
  showToast('系统通知已发送')
}

// 查看操作日志
const viewOperationLogs = () => {
  const logs = `
📋 操作日志记录

🕐 时间轴：
${guaranteeGroup.value.createdAt ? `• 创建时间：${formatTime(guaranteeGroup.value.createdAt)}` : ''}
${guaranteeGroup.value.adminConfirmedAt ? `• 管理员确认：${formatTime(guaranteeGroup.value.adminConfirmedAt)}` : ''}
${guaranteeGroup.value.completedAt ? `• 完成时间：${formatTime(guaranteeGroup.value.completedAt)}` : ''}
${guaranteeGroup.value.cancelledAt ? `• 取消时间：${formatTime(guaranteeGroup.value.cancelledAt)}` : ''}
${guaranteeGroup.value.frozenAt ? `• 冻结时间：${formatTime(guaranteeGroup.value.frozenAt)}` : ''}

🔄 状态变更：
• 初始状态：待确认
${guaranteeGroup.value.initiatorConfirmed ? '• 甲方确认：是' : '• 甲方确认：否'}
${guaranteeGroup.value.receiverConfirmed ? '• 乙方确认：是' : '• 乙方确认：否'}
• 当前状态：${getStatusText()}
${guaranteeGroup.value.forceCompleted ? '• 完成方式：强制完成' : ''}
${guaranteeGroup.value.fundsFrozen ? '• 资金状态：已冻结' : ''}
  `.trim()
  
  showToast('操作日志已查看')
  console.log('操作日志:', logs)
}

// 清空聊天记录
const clearChatHistory = () => {
  // 保留系统消息和管理员消息，只清空用户消息
  messages.value = messages.value.filter(msg => msg.isSystem || msg.isAdmin)
  
  const clearMessage = {
    id: Date.now(),
    sender: '系统消息',
    content: '🧹 聊天记录已清理\\n\\n为了保持聊天记录的整洁性，管理员已清理了部分聊天记录。\\n重要的系统消息和管理员通知将保留。',
    time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    isSelf: false,
    isSystem: true,
    avatar: 'https://picsum.photos/seed/system/40/40.jpg'
  }
  
  messages.value.push(clearMessage)
  saveMessages()
  scrollToBottom()
  showToast('聊天记录已清理')
}

// 确认交易
const confirmTransaction = async () => {
  confirming.value = true
  try {
    const currentUser = authStore.user
    
    // 调试信息
    console.log('当前用户:', currentUser)
    console.log('担保群信息:', guaranteeGroup.value)
    console.log('发起方电话:', guaranteeGroup.value.initiator?.phone)
    console.log('接收方电话:', guaranteeGroup.value.receiver?.phone)
    console.log('当前用户电话:', currentUser?.phone)
    
    let isInitiator = false
    let isReceiver = false
    
    // 判断当前用户是发起方还是接收方
    if (guaranteeGroup.value.initiator?.phone === currentUser?.phone) {
      guaranteeGroup.value.initiatorConfirmed = true
      isInitiator = true
      console.log('用户是发起方，设置甲方确认')
    } else if (guaranteeGroup.value.receiver?.phone === currentUser?.phone) {
      guaranteeGroup.value.receiverConfirmed = true
      isReceiver = true
      console.log('用户是接收方，设置乙方确认')
    } else {
      console.log('用户身份无法识别')
      showToast('用户身份验证失败')
      return
    }
    
    console.log('确认状态更新:', {
      initiatorConfirmed: guaranteeGroup.value.initiatorConfirmed,
      receiverConfirmed: guaranteeGroup.value.receiverConfirmed
    })
    
    // 更新状态
    updateGuaranteeStatus()
    
    // 添加确认消息
    const confirmMessage = {
      id: Date.now(),
      sender: currentUser?.nickname || '用户',
      content: `${isInitiator ? '甲方' : '乙方'}已确认担保交易`,
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      isSelf: true,
      avatar: currentUser?.avatar || defaultAvatar
    }
    
    messages.value.push(confirmMessage)
    saveMessages()
    scrollToBottom()
    
    showToast('确认成功')
    
    // 如果双方都已确认
    if (guaranteeGroup.value.initiatorConfirmed && guaranteeGroup.value.receiverConfirmed) {
      guaranteeGroup.value.status = 'confirmed'
      updateGuaranteeStatus()
      
      setTimeout(() => {
        const systemMessage = {
          id: Date.now() + 1,
          sender: '系统消息',
          content: '🎉 双方已确认，担保交易正式生效！平台将保障交易安全进行。',
          time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
          isSelf: false,
          isSystem: true,
          avatar: 'https://picsum.photos/seed/system/40/40.jpg'
        }
        messages.value.push(systemMessage)
        saveMessages()
        scrollToBottom()
      }, 1000)
    }
  } catch (error) {
    console.error('确认失败:', error)
    showToast('确认失败，请重试')
  } finally {
    confirming.value = false
  }
}

// 管理员确认
const adminConfirm = async () => {
  confirming.value = true
  try {
    guaranteeGroup.value.initiatorConfirmed = true
    guaranteeGroup.value.receiverConfirmed = true
    guaranteeGroup.value.status = 'confirmed'
    guaranteeGroup.value.adminConfirmedAt = new Date().toISOString()
    
    updateGuaranteeStatus()
    
    const adminMessage = {
      id: Date.now(),
      sender: '管理员',
      content: '✅ 管理员已确认此担保交易，交易正式生效！\\n\\n📋 交易状态更新：\\n• 担保状态：已生效 ✓\\n• 资金监管：已启动 ✓\\n• 交易保障：已激活 ✓\\n\\n🎯 接下来请按照约定进行交易，我会全程监督并提供必要的协助。',
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      isSelf: false,
      avatar: 'https://picsum.photos/seed/admin/40/40.jpg',
      isAdmin: true
    }
    
    messages.value.push(adminMessage)
    saveMessages()
    scrollToBottom()
    
    showToast('管理员确认成功')
    
    // 延迟隐藏状态卡片并发送后续流程指引
    setTimeout(() => {
      showStatusCard.value = false
      sendTransactionGuidance()
    }, 3000)
    
  } catch (error) {
    console.error('管理员确认失败:', error)
    showToast('确认失败，请重试')
  } finally {
    confirming.value = false
  }
}

// 显示联系人详情
const showContactDetails = (contact, role) => {
  selectedContact.value = contact
  selectedContactRole.value = role
  showContactDetailsPopup.value = true
}

// 发送私聊
const sendPrivateMessage = () => {
  showToast(`正在给 ${selectedContact.value?.name} 发送私聊...`)
  showContactDetailsPopup.value = false
  // TODO: 实现私聊功能
}

// 查看用户资料
const viewUserProfile = () => {
  showToast(`查看 ${selectedContact.value?.name} 的资料...`)
  showContactDetailsPopup.value = false
  // TODO: 实现查看资料功能
}

// 拨打电话
const makePhoneCall = () => {
  const phone = selectedContact.value?.phone
  if (phone) {
    showToast(`正在拨打 ${phone}...`)
    // 在实际应用中，可以调用系统拨号功能
    window.location.href = `tel:${phone}`
  } else {
    showToast('该用户没有提供电话号码')
  }
}

// 举报用户
const reportUser = () => {
  showToast(`举报 ${selectedContact.value?.name}...`)
  showContactDetailsPopup.value = false
  // TODO: 实现举报功能
}

// 更新担保状态
const updateGuaranteeStatus = () => {
  // 更新localStorage中的数据
  const chatList = JSON.parse(localStorage.getItem('chatList') || '[]')
  const chatIndex = chatList.findIndex(chat => chat.id === chatId)
  if (chatIndex !== -1) {
    chatList[chatIndex] = guaranteeGroup.value
    localStorage.setItem('chatList', JSON.stringify(chatList))
  }
  
  const orders = JSON.parse(localStorage.getItem('orders') || '[]')
  const orderIndex = orders.findIndex(order => order.id === chatId)
  if (orderIndex !== -1) {
    orders[orderIndex] = guaranteeGroup.value
    localStorage.setItem('orders', JSON.stringify(orders))
  }
  
  // 更新sessionStorage
  sessionStorage.setItem('guaranteeGroup', JSON.stringify(guaranteeGroup.value))
}

// 获取状态类型
const getStatusType = () => {
  if (guaranteeGroup.value.initiatorConfirmed && guaranteeGroup.value.receiverConfirmed) {
    return 'success'
  } else if (guaranteeGroup.value.initiatorConfirmed || guaranteeGroup.value.receiverConfirmed) {
    return 'warning'
  } else {
    return 'primary'
  }
}

// 获取状态文本
const getStatusText = () => {
  if (guaranteeGroup.value.status === 'completed') {
    return '交易完成'
  } else if (guaranteeGroup.value.status === 'delivery') {
    return '待确认收货'
  } else if (guaranteeGroup.value.status === 'service') {
    return '服务进行中'
  } else if (guaranteeGroup.value.initiatorConfirmed && guaranteeGroup.value.receiverConfirmed) {
    return '双方已确认'
  } else if (guaranteeGroup.value.initiatorConfirmed || guaranteeGroup.value.receiverConfirmed) {
    return '部分确认'
  } else {
    return '待确认'
  }
}

// 格式化时间
const formatTime = (timeStr) => {
  if (!timeStr) return ''
  const date = new Date(timeStr)
  return date.toLocaleString('zh-CN')
}

// 滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    if (chatContent.value) {
      chatContent.value.scrollTop = chatContent.value.scrollHeight
    }
  })
}

// 操作选择
const onActionSelect = (action) => {
  showActions.value = false
  
  switch (action.value) {
    case 'rename':
      showToast('修改群名功能开发中...')
      break
    case 'order_manage':
      showToast('订单管理功能开发中...')
      break
    case 'details':
      showTransactionDetails()
      break
    case 'mark_service_complete':
      markServiceComplete()
      break
    case 'force_complete':
      forceCompleteTransaction()
      break
    case 'cancel_transaction':
      cancelTransaction()
      break
    case 'freeze_funds':
      freezeFunds()
      break
    case 'send_notice':
      sendSystemNotice()
      break
    case 'view_logs':
      viewOperationLogs()
      break
    case 'clear':
      clearChatHistory()
      break
  }
}

// 头像点击
const onAvatarClick = (message) => {
  selectedUser.value = {
    id: message.senderId || Math.random().toString(36).substr(2, 9),
    name: message.sender,
    avatar: message.avatar
  }
  showAvatarActions.value = true
}

// 头像操作选择
const onAvatarActionSelect = (action) => {
  showAvatarActions.value = false
  
  if (!selectedUser.value) {
    showToast('用户信息错误，请重试')
    return
  }
  
  switch (action.value) {
    case 'private_chat':
      const privateChatId = `private_${selectedUser.value.id}`
      const userInfo = {
        id: selectedUser.value.id,
        name: selectedUser.value.name,
        avatar: selectedUser.value.avatar
      }
      
      sessionStorage.setItem('privateChatUser', JSON.stringify(userInfo))
      router.push(`/chat/${privateChatId}`)
      showToast(`正在与 ${selectedUser.value.name} 私聊`)
      break
    case 'view_profile':
      showToast(`查看 ${selectedUser.value.name} 的资料`)
      break
  }
  
  selectedUser.value = null
}

// 其他功能
const toggleVoice = () => {
  showToast('语音功能')
}

const showEmoji = () => {
  showToast('表情功能')
}

const showMore = () => {
  showToast('更多功能')
}

const showMoreActions = () => {
  showActions.value = true
}

const onInputFocus = () => {
  setTimeout(() => {
    scrollToBottom()
  }, 300)
}

// 发送交易流程指引
const sendTransactionGuidance = () => {
  const guidanceMessage = {
    id: Date.now(),
    sender: '管理员',
    content: '📝 交易流程指引：\\n\\n1️⃣ 服务提供方开始提供服务\\n2️⃣ 服务完成后，请在群内确认\\n3️⃣ 接收方确认收货/服务完成\\n4️⃣ 管理员核实后释放资金\\n\\n💡 如有任何问题，请随时在群内联系我。平台会全程保障您的交易安全！',
    time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    isSelf: false,
    avatar: 'https://picsum.photos/seed/admin/40/40.jpg',
    isAdmin: true
  }
  
  messages.value.push(guidanceMessage)
  saveMessages()
  scrollToBottom()
}

// 处理服务完成确认
const handleServiceCompletion = (messageContent) => {
  // 检测服务完成相关关键词
  if (messageContent.includes('完成') || messageContent.includes('好了') || 
      messageContent.includes('结束') || messageContent.includes('搞定')) {
    
    setTimeout(() => {
      const adminMessage = {
        id: Date.now(),
        sender: '管理员',
        content: '🔍 检测到服务可能已完成，正在处理...\\n\\n📋 核实步骤：\\n• 确认服务是否真的完成\\n• 检查服务质量\\n• 准备资金释放流程\\n\\n⏳ 请接收方确认服务完成情况。',
        time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
        isSelf: false,
        avatar: 'https://picsum.photos/seed/admin/40/40.jpg',
        isAdmin: true
      }
      
      messages.value.push(adminMessage)
      saveMessages()
      scrollToBottom()
      
      // 更新状态为待确认收货
      guaranteeGroup.value.status = 'delivery'
      updateGuaranteeStatus()
      
    }, 2000)
  }
}

// 处理收货确认
const handleDeliveryConfirmation = (messageContent) => {
  // 检测收货确认相关关键词
  if (messageContent.includes('收到') || messageContent.includes('确认') || 
      messageContent.includes('没问题') || messageContent.includes('满意')) {
    
    setTimeout(() => {
      const adminMessage = {
        id: Date.now(),
        sender: '管理员',
        content: '✅ 收到确认信息，正在准备释放资金...\\n\\n📋 资金释放流程：\\n• 验证收货确认 ✓\\n• 检查交易状态 ✓\\n• 处理资金释放\\n• 更新订单状态\\n\\n⏳ 资金将在3秒内释放给服务提供方。',
        time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
        isSelf: false,
        avatar: 'https://picsum.photos/seed/admin/40/40.jpg',
        isAdmin: true
      }
      
      messages.value.push(adminMessage)
      saveMessages()
      scrollToBottom()
      
      // 3秒后完成资金释放
      setTimeout(() => {
        completeTransaction()
      }, 3000)
      
    }, 1500)
  }
}

// 完成交易
const completeTransaction = () => {
  guaranteeGroup.value.status = 'completed'
  guaranteeGroup.value.completedAt = new Date().toISOString()
  
  updateGuaranteeStatus()
  
  const completionMessage = {
    id: Date.now(),
    sender: '管理员',
    content: '🎉 交易完成！资金已成功释放！\\n\\n📋 交易结算信息：\\n• 交易状态：已完成 ✓\\n• 资金释放：已到账 ✓\\n• 担保费用：已扣除 ✓\\n• 交易评价：待评价\\n\\n💰 服务提供方已收到款项，感谢您使用平台担保服务！\\n\\n⭐ 请双方对本次交易进行评价，这将有助于提升平台服务质量。',
    time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    isSelf: false,
    avatar: 'https://picsum.photos/seed/admin/40/40.jpg',
    isAdmin: true
  }
  
  messages.value.push(completionMessage)
  saveMessages()
  scrollToBottom()
  
  // 发送评价邀请
  setTimeout(() => {
    sendRatingInvitation()
  }, 2000)
}

// 发送评价邀请
const sendRatingInvitation = () => {
  const ratingMessage = {
    id: Date.now(),
    sender: '系统消息',
    content: '⭐ 评价邀请\\n\\n请对本次交易进行评价：\\n👍 好评 - 交易顺利，服务满意\\n👌 中评 - 交易一般，有待改进\\n👎 差评 - 交易有问题，需要处理\\n\\n您的评价将帮助我们改进服务质量，保护其他用户的交易安全。',
    time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    isSelf: false,
    isSystem: true,
    avatar: 'https://picsum.photos/seed/system/40/40.jpg'
  }
  
  messages.value.push(ratingMessage)
  saveMessages()
  scrollToBottom()
}

// 增强自动回复功能
const enhancedAutoReply = (userMessage) => {
  let replyContent = ''
  
  // 先处理特殊流程
  handleServiceCompletion(userMessage)
  handleDeliveryConfirmation(userMessage)
  
  // 然后处理普通回复
  if (userMessage.includes('你好') || userMessage.includes('hi')) {
    replyContent = '你好！我是管理员，有什么可以帮助您的吗？'
  } else if (userMessage.includes('进度') || userMessage.includes('怎么样')) {
    replyContent = `当前交易状态：${getStatusText()}\\n\\n如有任何问题，我会及时协助处理。`
  } else if (userMessage.includes('投诉') || userMessage.includes('问题')) {
    replyContent = '收到您的反馈！我会立即关注并处理相关问题。\\n\\n📞 如需紧急处理，请直接联系客服。'
  } else if (userMessage.includes('取消') || userMessage.includes('中止')) {
    replyContent = '如需取消交易，请说明具体原因。我会根据平台规则协助处理。\\n\\n⚠️ 注意：取消交易可能需要支付相应的手续费。'
  } else if (userMessage.includes('担保') || userMessage.includes('交易')) {
    replyContent = '担保交易正在进行中，我会全程监督，确保交易安全。'
  } else if (userMessage.includes('支付') || userMessage.includes('付款')) {
    replyContent = '请按照担保流程进行支付，支付完成后请告知我进行确认。'
  } else {
    replyContent = '收到您的消息，我会尽快处理。如有紧急问题，请直接联系管理员。'
  }
  
  const replyMessage = {
    id: Date.now(),
    sender: '管理员',
    content: replyContent,
    time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    isSelf: false,
    avatar: 'https://picsum.photos/seed/admin/40/40.jpg',
    isAdmin: true
  }
  
  messages.value.push(replyMessage)
  saveMessages()
  scrollToBottom()
}
</script>

<style lang="scss" scoped>
.guarantee-chat {
  display: flex;
  flex-direction: column;
  height: 100vh;
  padding-top: 0;
  background: #f5f5f5;
}

// 顶部导航栏
.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 44px;
  padding: 0 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  position: relative;
  z-index: 100;

  .header-left {
    display: flex;
    align-items: center;
    cursor: pointer;
    
    .van-icon {
      font-size: 20px;
      margin-right: 8px;
    }
    
    .back-text {
      font-size: 16px;
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
      font-weight: 600;
      max-width: 150px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .chat-status {
      margin-top: 2px;
    }
  }

  .header-right {
    .van-icon {
      font-size: 20px;
      cursor: pointer;
    }
  }
}

// 担保状态卡片
.guarantee-status-card {
  background: white;
  margin: 8px 16px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;

  .status-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;

    .guarantee-icon {
      font-size: 24px;
    }

    .status-title {
      flex: 1;
      font-size: 18px;
      font-weight: 600;
      margin-left: 12px;
    }

    .status-tag {
      background: rgba(255, 255, 255, 0.2);
      border: none;
      color: white;
    }
  }

  .status-content {
    padding: 16px;

    .party-section {
      margin-bottom: 16px;

      .party-item {
        display: flex;
        align-items: center;
        padding: 12px;
        background: #f8f9fa;
        border-radius: 8px;
        margin-bottom: 8px;
        cursor: pointer;
        transition: all 0.3s ease;
        
        &:hover {
          background: #e9ecef;
          transform: translateY(-1px);
        }
        
        .party-arrow {
          margin-left: auto;
          color: #6c757d;
        }

        .party-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          overflow: hidden;
          margin-right: 12px;

          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
        }

        .party-info {
          flex: 1;

          .party-name {
            font-size: 16px;
            font-weight: 600;
            color: #333;
            margin-bottom: 4px;
          }

          .party-role {
            font-size: 12px;
            color: #666;
            margin-bottom: 6px;
          }
        }
      }

      .vs-divider {
        text-align: center;
        font-size: 14px;
        font-weight: 600;
        color: #999;
        margin: 8px 0;
      }
    }

    .transaction-details {
      :deep(.van-cell) {
        padding: 8px 0;
        
        &:not(:last-child) {
          border-bottom: 1px solid #f0f0f0;
        }
      }
    }
  }

  .status-actions {
    padding: 16px;
    border-top: 1px solid #f0f0f0;
    display: flex;
    gap: 8px;
    justify-content: center;
  }
}

// 聊天内容区域
.chat-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background: #f5f5f5;

  .date-divider {
    text-align: center;
    margin: 16px 0;

    .date-text {
      display: inline-block;
      padding: 4px 12px;
      background: rgba(0, 0, 0, 0.1);
      color: #666;
      font-size: 12px;
      border-radius: 10px;
    }
  }

  .message-item {
    margin-bottom: 16px;

    .message-time {
      text-align: center;
      margin: 12px 0;
      font-size: 12px;
      color: #999;
    }

    .message-wrapper {
      display: flex;
      align-items: flex-start;

      &.is-self {
        flex-direction: row-reverse;
      }
    }

    .message-avatar {
      width: 40px;
      height: 40px;
      margin: 0 8px;
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

    .message-body {
      max-width: 65%;
      min-width: 0;

      .sender-name {
        font-size: 12px;
        color: #999;
        margin-bottom: 4px;
        padding-left: 12px;
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .message-bubble {
        position: relative;
        padding: 10px 12px;
        background: #fff;
        border-radius: 8px;
        font-size: 15px;
        line-height: 1.5;
        color: #333;
        word-wrap: break-word;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);

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

        &.is-admin {
          background: #e8f5e8;
          border: 1px solid #28a745;
        }

        &.is-system {
          background: rgba(0, 0, 0, 0.05);
          color: #666;
          font-size: 14px;
          text-align: center;

          &::before {
            display: none;
          }
        }
      }
    }

    &.is-self {
      .message-wrapper {
        flex-direction: row-reverse;
      }

      .message-avatar {
        margin-left: 8px;
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
  }
}

// 输入区域
.input-area {
  background: white;
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
        color: #666;
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
        background: #f5f5f5;
        border-radius: 20px;
        padding: 8px 16px;

        .van-field__control {
          font-size: 15px;
        }
      }
    }

    .send-btn {
      height: 32px;
      padding: 0 16px;
      font-size: 14px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: none;
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
}

// 联系人详情弹窗样式
.contact-details {
  height: 100%;
  display: flex;
  flex-direction: column;
  
  .contact-header {
    display: flex;
    align-items: center;
    padding: 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    
    .contact-avatar {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      overflow: hidden;
      margin-right: 16px;
      border: 3px solid rgba(255, 255, 255, 0.3);
      
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
    
    .contact-info {
      flex: 1;
      
      .contact-name {
        font-size: 18px;
        font-weight: 600;
        margin-bottom: 4px;
      }
      
      .contact-role {
        font-size: 14px;
        opacity: 0.8;
        margin-bottom: 8px;
      }
    }
  }
  
  .contact-actions {
    flex: 1;
    overflow-y: auto;
  }
  
  .contact-close {
    padding: 16px;
    border-top: 1px solid #f0f0f0;
  }
}
</style>