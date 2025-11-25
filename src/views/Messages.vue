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
        <div style="background: #e8f5e8; padding: 8px; text-align: center; color: #28a745; font-size: 12px;">
          群聊模式 - 点击下方群聊进入群聊界面
        </div>
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
import { showToast } from 'vant'
import MessageList from '@/components/MessageList.vue'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const searchValue = ref('')
const activeTab = ref('all')
const showSystemDetail = ref(false)
const currentSystemMessage = ref(null)

const messages = ref([
  {
    id: 1,
    type: 'system',
    title: '系统通知',
    content: '欢迎使用游戏担保交易平台',
    time: '10:30',
    unread: 1,
    avatar: 'https://picsum.photos/seed/system/40/40.jpg'
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
  console.log('Messages页面加载')
  console.log('当前用户:', authStore.user)
  loadMessages()
  // 创建测试担保群
  createTestGuaranteeGroups()
  // 重新加载消息以确保担保群显示
  setTimeout(() => {
    loadMessages()
  }, 1000)
})

const loadMessages = () => {
  console.log('加载消息列表')
  console.log('当前用户权限:', authStore.user?.isAdmin ? '管理员' : '普通用户')
  
  // 先清空消息列表，重新加载
  const originalMessages = [...messages.value]
  
  // 管理员可以看到所有群聊（包括担保群）
  if (authStore.user?.isAdmin) {
    console.log('管理员权限，加载所有担保交易群聊')
    // 加载所有担保交易群聊
    const chatList = JSON.parse(localStorage.getItem('chatList') || '[]')
    console.log('chatList中的群聊:', chatList)
    
    chatList.forEach(chat => {
      if (chat.isGuarantee && !messages.value.find(msg => msg.id === chat.id)) {
        console.log('添加担保群到消息列表:', chat.name)
        messages.value.push({
          id: chat.id,
          type: 'group',
          title: chat.name,
          content: chat.lastMessage || '担保交易群聊',
          time: chat.lastTime,
          unread: chat.unreadCount || 0,
          avatar: chat.avatar,
          memberCount: chat.members?.length || 2,
          isGuarantee: true,
          groupId: chat.id
        })
      }
    })
    
    // 从localStorage加载担保交易群
    const guaranteeGroups = JSON.parse(localStorage.getItem('orders') || '[]')
    console.log('orders中的担保群:', guaranteeGroups)
    
    guaranteeGroups.forEach(order => {
      if (!messages.value.find(msg => msg.id === order.id)) {
        console.log('添加担保订单到消息列表:', order.title)
        messages.value.push({
          id: order.id,
          type: 'group',
          title: order.title,
          content: `担保交易进行中 - ${order.status}`,
          time: new Date(order.createdAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
          unread: 0,
          avatar: 'https://picsum.photos/seed/guarantee/40/40.jpg',
          isGuarantee: true,
          memberCount: 3,
          groupId: order.id
        })
      }
    })
  }
  
  console.log('最终消息列表:', messages.value)
}

const onSearch = (value) => {
  console.log('搜索消息:', value)
}

const goToChat = (message) => {
  console.log('=== 点击消息 ===')
  console.log('消息:', message)
  console.log('消息类型:', message.type)
  console.log('是否是担保群:', message.isGuarantee)
  
  try {
    switch (message.type) {
      case 'group':
        // 群聊消息跳转到群聊页面
        let groupChatId
        if (message.isGuarantee && message.groupId) {
          // 担保交易群使用特殊ID
          groupChatId = message.groupId
        } else {
          // 普通群聊
          groupChatId = `group_${message.id}`
        }
        
        console.log('🟢 点击群聊，message:', message)
        console.log('🟢 生成的群聊ID:', groupChatId)
        
        // 保存群聊信息到sessionStorage
        const groupInfo = {
          id: message.id,
          name: message.title,
          avatar: message.avatar,
          memberCount: message.memberCount || 0,
          isGuarantee: message.isGuarantee || false
        }
        console.log('🟢 保存群聊信息:', groupInfo)
        sessionStorage.setItem('groupChatInfo', JSON.stringify(groupInfo))
        
        // 验证保存是否成功
        const saved = sessionStorage.getItem('groupChatInfo')
        console.log('🟢 验证保存的群聊信息:', saved)
        
        // 担保群跳转到专门的担保聊天页面
        if (message.isGuarantee) {
          console.log('🟢 担保群，跳转到担保聊天页面')
          showToast(`正在进入担保交易群 ${message.title}`)
          setTimeout(() => {
            window.location.href = `/guarantee-chat/${groupChatId}`
          }, 500)
        } else {
          // 普通群聊跳转到普通聊天页面
          console.log('🟢 普通群聊，跳转到聊天页面')
          showToast(`正在进入 ${message.title}`)
          setTimeout(() => {
            window.location.href = `/chat/${groupChatId}`
          }, 500)
        }
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
        console.log('🟢 跳转到私聊:', privateChatId)
        showToast(`正在与 ${message.title} 私聊`)
        setTimeout(() => {
          router.push(`/chat/${privateChatId}`)
        }, 500)
        break
        
      case 'system':
        // 系统消息显示详情弹窗
        showSystemMessageDetail(message)
        break

      default:
        // 其他消息跳转到聊天页面
        console.log('🟢 默认跳转到聊天页面:', message.id)
        router.push(`/chat/${message.id}`)
    }
  } catch (error) {
    console.error('🔴 跳转出错:', error)
    showToast('跳转失败，请重试')
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

// 创建测试担保群
const createTestGuaranteeGroups = () => {
  console.log('创建测试担保群')
  
  // 检查是否已存在测试群
  const existingGroups = JSON.parse(localStorage.getItem('chatList') || '[]')
  const testGroupIds = ['test_guarantee_1', 'test_guarantee_2', 'test_guarantee_3', 'test_guarantee_4', 'test_guarantee_5']
  
  if (existingGroups.some(chat => testGroupIds.includes(chat.id))) {
    console.log('测试群已存在，跳过创建')
    return
  }
  
  // 创建5个测试担保群，防止混淆
  const testGroups = [
    {
      id: 'test_guarantee_1',
      name: '🎮 王者荣耀段位担保群',
      avatar: 'https://picsum.photos/seed/wangzhe/40/40.jpg',
      lastMessage: '管理员已确认收款，开始代练服务',
      lastTime: '10:30',
      unreadCount: 0,
      isGroup: true,
      isGuarantee: true,
      members: [
        { name: '玩家小李', phone: '18800000001', avatar: 'https://picsum.photos/seed/player1/40/40.jpg', role: 'buyer' },
        { name: '代练师小王', phone: '18800000002', avatar: 'https://picsum.photos/seed/seller1/40/40.jpg', role: 'seller' },
        { name: '管理员', phone: '18800000000', avatar: 'https://picsum.photos/seed/admin/40/40.jpg', role: 'admin' }
      ]
    },
    {
      id: 'test_guarantee_2', 
      name: '🎯 和平精英装备担保群',
      avatar: 'https://picsum.photos/seed/peace/40/40.jpg',
      lastMessage: '等待买家确认收货',
      lastTime: '09:15',
      unreadCount: 2,
      isGroup: true,
      isGuarantee: true,
      members: [
        { name: '买家小张', phone: '18800000003', avatar: 'https://picsum.photos/seed/player2/40/40.jpg', role: 'buyer' },
        { name: '卖家小陈', phone: '18800000004', avatar: 'https://picsum.photos/seed/seller2/40/40.jpg', role: 'seller' },
        { name: '管理员', phone: '18800000000', avatar: 'https://picsum.photos/seed/admin/40/40.jpg', role: 'admin' }
      ]
    },
    {
      id: 'test_guarantee_3',
      name: '⚔️ 原神账号担保群', 
      avatar: 'https://picsum.photos/seed/genshin/40/40.jpg',
      lastMessage: '账号交易已完成，资金已释放',
      lastTime: '昨天',
      unreadCount: 0,
      isGroup: true,
      isGuarantee: true,
      members: [
        { name: '买家小刘', phone: '18800000005', avatar: 'https://picsum.photos/seed/player3/40/40.jpg', role: 'buyer' },
        { name: '卖家小赵', phone: '18800000006', avatar: 'https://picsum.photos/seed/seller3/40/40.jpg', role: 'seller' },
        { name: '管理员', phone: '18800000000', avatar: 'https://picsum.photos/seed/admin/40/40.jpg', role: 'admin' }
      ]
    },
    {
      id: 'test_guarantee_4',
      name: '🏅 英雄联盟皮肤担保群',
      avatar: 'https://picsum.photos/seed/lol/40/40.jpg',
      lastMessage: '皮肤交易已成功完成',
      lastTime: '前天',
      unreadCount: 0,
      isGroup: true,
      isGuarantee: true,
      members: [
        { name: '皮肤收藏家', phone: '18800000007', avatar: 'https://picsum.photos/seed/collector/40/40.jpg', role: 'buyer' },
        { name: '皮肤交易商', phone: '18800000008', avatar: 'https://picsum.photos/seed/trader/40/40.jpg', role: 'seller' },
        { name: '管理员', phone: '18800000000', avatar: 'https://picsum.photos/seed/admin/40/40.jpg', role: 'admin' }
      ]
    },
    {
      id: 'test_guarantee_5',
      name: '🎲 绝地求生道具担保群',
      avatar: 'https://picsum.photos/seed/pubg/40/40.jpg',
      lastMessage: '道具已交付，请确认收货',
      lastTime: '3天前',
      unreadCount: 1,
      isGroup: true,
      isGuarantee: true,
      members: [
        { name: '道具买家', phone: '18800000009', avatar: 'https://picsum.photos/seed/itembuyer/40/40.jpg', role: 'buyer' },
        { name: '道具卖家', phone: '18800000010', avatar: 'https://picsum.photos/seed/itemseller/40/40.jpg', role: 'seller' },
        { name: '管理员', phone: '18800000000', avatar: 'https://picsum.photos/seed/admin/40/40.jpg', role: 'admin' }
      ]
    }
  ]
  
  // 保存到聊天列表
  const chatList = JSON.parse(localStorage.getItem('chatList') || '[]')
  testGroups.forEach(group => {
    chatList.push(group)
    
    // 为每个群创建聊天消息
    const messages = createGroupMessages(group)
    localStorage.setItem(`chat_messages_${group.id}`, JSON.stringify(messages))
  })
  
  localStorage.setItem('chatList', JSON.stringify(chatList))
  
  // 保存到订单列表
  const orders = JSON.parse(localStorage.getItem('orders') || '[]')
  testGroups.forEach(group => {
    const statusMap = {
      'test_guarantee_1': 'confirmed',
      'test_guarantee_2': 'pending', 
      'test_guarantee_3': 'completed',
      'test_guarantee_4': 'completed',
      'test_guarantee_5': 'pending'
    }
    
    const amountMap = {
      'test_guarantee_1': '200',
      'test_guarantee_2': '150',
      'test_guarantee_3': '300',
      'test_guarantee_4': '180',
      'test_guarantee_5': '120'
    }
    
    orders.push({
      id: group.id,
      title: group.name,
      status: statusMap[group.id],
      amount: amountMap[group.id],
      guaranteeFee: Math.floor(parseFloat(amountMap[group.id]) * 0.05).toString(),
      createdAt: new Date().toISOString(),
      participants: group.members.map(m => m.name).join(', '),
      description: `${group.name} - 担保交易`,
      initiator: group.members[0],
      receiver: group.members[1],
      initiatorConfirmed: statusMap[group.id] !== 'pending',
      receiverConfirmed: statusMap[group.id] === 'completed'
    })
  })
  localStorage.setItem('orders', JSON.stringify(orders))
  
  console.log('测试担保群创建完成')
}

// 创建群聊消息
const createGroupMessages = (group) => {
  const baseMessages = [
    {
      id: 1,
      sender: '系统消息',
      content: `${group.name} 已创建`,
      time: '09:00',
      isSelf: false,
      avatar: 'https://picsum.photos/seed/system/40/40.jpg',
      showTime: true,
      isSystem: true
    },
    {
      id: 2,
      sender: '系统消息',
      content: '管理员已自动加入群聊',
      time: '09:01',
      isSelf: false,
      avatar: 'https://picsum.photos/seed/system/40/40.jpg',
      isSystem: true
    },
    {
      id: 3,
      sender: '管理员',
      content: '大家好，我是管理员。担保交易已创建，请按照流程操作。',
      time: '09:02',
      isSelf: false,
      avatar: 'https://picsum.photos/seed/admin/40/40.jpg',
      isAdmin: true
    }
  ]
  
  // 根据群状态添加不同的消息
  if (group.id === 'test_guarantee_1') {
    baseMessages.push(
      {
        id: 4,
        sender: '玩家小李',
        content: '已支付，请确认',
        time: '10:00',
        isSelf: false,
        avatar: 'https://picsum.photos/seed/player1/40/40.jpg'
      },
      {
        id: 5,
        sender: '管理员',
        content: '✅ 收款确认成功！\n\n📋 资金到账信息：\n• 支付状态：已到账 ✓\n• 资金金额：已核实 ✓\n• 担保状态：生效中 ✓\n\n🎯 资金已安全到账，现在可以开始交易。',
        time: '10:30',
        isSelf: false,
        avatar: 'https://picsum.photos/seed/admin/40/40.jpg',
        isAdmin: true
      }
    )
  } else if (group.id === 'test_guarantee_2') {
    baseMessages.push(
      {
        id: 4,
        sender: '代练师小陈',
        content: '装备已准备好，等待买家付款',
        time: '09:10',
        isSelf: false,
        avatar: 'https://picsum.photos/seed/seller2/40/40.jpg'
      },
      {
        id: 5,
        sender: '买家小张',
        content: '我准备付款了',
        time: '09:15',
        isSelf: false,
        avatar: 'https://picsum.photos/seed/player2/40/40.jpg'
      }
    )
  } else if (group.id === 'test_guarantee_3') {
    baseMessages.push(
      {
        id: 4,
        sender: '买家小刘',
        content: '账号已收到，确认收货',
        time: '昨天 15:00',
        isSelf: false,
        avatar: 'https://picsum.photos/seed/player3/40/40.jpg'
      },
      {
        id: 5,
        sender: '管理员',
        content: '✅ 交易已完成，资金已释放给卖家',
        time: '昨天',
        isSelf: false,
        avatar: 'https://picsum.photos/seed/admin/40/40.jpg',
        isAdmin: true
      }
    )
  }
  
  return baseMessages
}

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