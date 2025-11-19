<template>
  <div class="order-detail page-container">
    <van-nav-bar
      title="订单详情"
      left-arrow
      @click-left="$router.go(-1)"
    />

    <div v-if="order" class="order-content">
      <!-- 订单状态 -->
      <div class="status-card card">
        <div class="status-header">
          <van-tag :type="order.statusColor" size="large">{{ order.statusText }}</van-tag>
          <span class="order-id">{{ order.id }}</span>
        </div>
        <div class="status-desc">{{ getStatusDescription(order.status) }}</div>
      </div>

      <!-- 订单信息 -->
      <div class="info-card card">
        <h3>订单信息</h3>
        <div class="info-item">
          <span class="label">交易类型</span>
          <span class="value">{{ order.type }}</span>
        </div>
        <div class="info-item">
          <span class="label">游戏名称</span>
          <span class="value">{{ order.game }}</span>
        </div>
        <div class="info-item">
          <span class="label">服务内容</span>
          <span class="value">{{ order.content }}</span>
        </div>
        <div v-if="order.deadline" class="info-item">
          <span class="label">完成时限</span>
          <span class="value">{{ formatTime(order.deadline) }}</span>
        </div>
        <div class="info-item">
          <span class="label">创建时间</span>
          <span class="value">{{ formatTime(order.createTime) }}</span>
        </div>
        <div v-if="order.completeTime" class="info-item">
          <span class="label">完成时间</span>
          <span class="value">{{ formatTime(order.completeTime) }}</span>
        </div>
      </div>

      <!-- 交易双方 -->
      <div class="participants-card card">
        <h3>交易双方</h3>
        <div class="participant-item">
          <div class="participant-header">
            <img :src="order.buyer.avatar" :alt="order.buyer.name" class="avatar" />
            <div class="user-info">
              <div class="name">{{ order.buyer.name }}</div>
              <div class="role">买家</div>
            </div>
            <van-button size="small" @click="chatWithUser(order.buyer.id)">私信</van-button>
          </div>
        </div>
        <div class="participant-item">
          <div class="participant-header">
            <img :src="order.seller.avatar" :alt="order.seller.name" class="avatar" />
            <div class="user-info">
              <div class="name">{{ order.seller.name }}</div>
              <div class="role">卖家</div>
            </div>
            <van-button size="small" @click="chatWithUser(order.seller.id)">私信</van-button>
          </div>
        </div>
      </div>

      <!-- 担保信息 -->
      <div class="guarantee-card card">
        <h3>担保信息</h3>
        <div class="guarantee-info">
          <div class="info-item">
            <span class="label">交易金额</span>
            <span class="value price">¥{{ order.price.toFixed(2) }}</span>
          </div>
          <div class="info-item">
            <span class="label">平台服务费</span>
            <span class="value">¥{{ (order.price * 0.05).toFixed(2) }}</span>
          </div>
          <div class="info-item">
            <span class="label">担保状态</span>
            <span class="value text-success">资金已冻结</span>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="action-buttons card">
        <van-button v-if="order.status === '待确认'" type="primary" block @click="confirmOrder">
          确认完成
        </van-button>
        <van-button v-if="order.status === '进行中'" type="warning" block @click="disputeOrder">
          申请仲裁
        </van-button>
        <van-button v-if="order.status === '纠纷中'" type="danger" block @click="contactSupport">
          联系客服
        </van-button>
        <van-button plain block @click="viewChatHistory">查看聊天记录</van-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast, showConfirmDialog } from 'vant'

const route = useRoute()
const router = useRouter()

const order = ref(null)

onMounted(() => {
  const orderId = route.params.id
  loadOrderDetail(orderId)
})

const loadOrderDetail = (orderId) => {
  // 模拟加载订单详情
  order.value = {
    id: 'ORD20240115001',
    type: '代肝服务',
    game: '王者荣耀',
    status: '进行中',
    statusText: '进行中',
    statusColor: 'primary',
    content: '星耀段位代练上王者，要求效率高，账号安全第一',
    price: 150.00,
    createTime: '2024-01-15 10:30:00',
    deadline: '2024-01-20 23:59:59',
    buyer: {
      id: 1,
      name: '游戏小王',
      avatar: 'https://picsum.photos/seed/buyer1/40/40.jpg'
    },
    seller: {
      id: 2,
      name: '代练达人',
      avatar: 'https://picsum.photos/seed/seller1/40/40.jpg'
    }
  }
}

const getStatusDescription = (status) => {
  const descriptions = {
    '待付款': '等待双方付款到担保账户',
    '进行中': '双方已付款，服务正在进行中',
    '待确认': '服务已完成，等待买家确认',
    '已完成': '交易成功完成，资金已结算',
    '纠纷中': '产生纠纷，客服介入处理',
    '已取消': '交易已取消'
  }
  return descriptions[status] || ''
}

const confirmOrder = async () => {
  try {
    await showConfirmDialog({
      title: '确认完成',
      message: '确认订单已完成？确认后资金将结算给卖家。',
    })
    showToast('确认成功')
    order.value.status = '已完成'
    order.value.statusText = '已完成'
    order.value.statusColor = 'success'
    order.value.completeTime = new Date().toISOString()
  } catch {
    // 用户取消
  }
}

const disputeOrder = async () => {
  try {
    await showConfirmDialog({
      title: '申请仲裁',
      message: '确定要申请仲裁吗？客服将介入处理。',
    })
    showToast('仲裁申请已提交')
    order.value.status = '纠纷中'
    order.value.statusText = '纠纷中'
    order.value.statusColor = 'danger'
  } catch {
    // 用户取消
  }
}

const contactSupport = () => {
  router.push('/support')
}

const chatWithUser = (userId) => {
  router.push(`/chat/${userId}`)
}

const viewChatHistory = () => {
  router.push(`/chat/order/${order.value.id}`)
}

const formatTime = (time) => {
  const date = new Date(time)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style lang="scss" scoped>
.order-detail {
  padding-top: 0;
}

.status-card {
  text-align: center;
  
  .status-header {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    margin-bottom: 8px;
    
    .order-id {
      font-size: 14px;
      color: #969799;
    }
  }
  
  .status-desc {
    font-size: 14px;
    color: #646566;
  }
}

.info-card, .participants-card, .guarantee-card, .action-buttons {
  margin-top: 12px;
  
  h3 {
    margin: 0 0 16px 0;
    font-size: 16px;
    font-weight: 600;
  }
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-size: 14px;
  
  .label {
    color: #969799;
  }
  
  .value {
    color: #323233;
    
    &.price {
      font-size: 16px;
      font-weight: 600;
      color: #ee0a24;
    }
    
    &.text-success {
      color: #07c160;
    }
  }
}

.participant-item {
  margin-bottom: 16px;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  .participant-header {
    display: flex;
    align-items: center;
    gap: 12px;
    
    .avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
    }
    
    .user-info {
      flex: 1;
      
      .name {
        font-size: 14px;
        font-weight: 600;
        margin-bottom: 4px;
      }
      
      .role {
        font-size: 12px;
        color: #969799;
      }
    }
  }
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
  
  .van-button {
    margin: 0;
  }
}
</style>