<template>
  <div class="order-detail page-container">
    <!-- 顶部导航 -->
    <van-nav-bar
      title="订单详情"
      left-arrow
      @click-left="$router.go(-1)"
    />

    <div v-if="order" class="detail-content">
      <!-- 订单状态 -->
      <div class="status-card">
        <div class="status-header">
          <van-icon :name="getStatusIcon(order.status)" :color="getStatusColor(order.status)" size="24" />
          <span class="status-text" :style="{ color: getStatusColor(order.status) }">
            {{ getStatusText(order.status) }}
          </span>
        </div>
        <div class="order-title">{{ order.title }}</div>
      </div>

      <!-- 交易信息 -->
      <van-cell-group title="交易信息">
        <van-cell title="交易类型" :value="order.type" />
        <van-cell title="游戏" :value="order.game" v-if="order.game" />
        <van-cell title="交易金额" :value="`¥${order.amount}`" value-class="amount" />
        <van-cell title="担保费用" :value="`¥${order.guaranteeFee || '0.00'}`" />
        <van-cell title="加急费用" :value="`¥${order.urgencyFee || '0.00'}`" v-if="order.urgencyFee && order.urgencyFee > 0" />
        <van-cell title="总金额" :value="`¥${order.totalAmount || order.amount}`" value-class="total-amount" />
        <van-cell title="创建时间" :value="formatDate(order.createdAt)" />
        <van-cell title="完成时限" :value="formatDeadline(order.deadline)" v-if="order.deadline" />
        <van-cell title="紧急程度" :value="`${order.urgency || 3}/5`" v-if="order.urgency" />
        <van-cell title="预计工作时长" :value="`${order.estimatedHours || 0}小时`" v-if="order.estimatedHours" />
        <van-cell title="剩余时间" :value="getTimeRemaining(order.deadline)" v-if="order.deadline && order.status === 'processing'" />
      </van-cell-group>

      <!-- 交易描述 -->
      <van-cell-group title="交易描述">
        <van-cell>
          <template #title>
            <div class="description">{{ order.description }}</div>
          </template>
        </van-cell>
      </van-cell-group>

      <!-- 交易双方 -->
      <van-cell-group title="交易双方">
        <van-cell>
          <template #title>
            <div class="party-info">
              <div class="party-label">发起方</div>
              <div class="party-user">
                <van-image
                  :src="order.initiator.avatar"
                  width="40"
                  height="40"
                  round
                />
                <div class="user-details">
                  <div class="user-name">{{ order.initiator.name }}</div>
                  <div class="user-rating">信誉分: {{ order.initiator.rating || 95 }}</div>
                </div>
              </div>
            </div>
          </template>
        </van-cell>
      </van-cell-group>

      <!-- 操作按钮 -->
      <div class="action-buttons" v-if="order.status === 'pending'">
        <van-button type="success" size="large" block @click="confirmOrder">
          确认交易
        </van-button>
        <van-button type="danger" size="large" block plain @click="cancelOrder" style="margin-top: 12px;">
          取消交易
        </van-button>
      </div>

      <div class="action-buttons" v-else-if="order.status === 'processing'">
        <van-button type="primary" size="large" block @click="completeOrder">
          确认完成
        </van-button>
        <van-button type="warning" size="large" block plain @click="disputeOrder" style="margin-top: 12px;">
          申请仲裁
        </van-button>
      </div>

      <div class="action-buttons" v-else-if="order.status === 'completed'">
        <van-button type="primary" size="large" block @click="createNewOrder">
          再次发起担保
        </van-button>
      </div>
    </div>

    <!-- 空状态 -->
    <van-empty 
      v-else 
      description="订单不存在"
      image="https://picsum.photos/seed/order-not-found/200/200.jpg"
    >
      <van-button type="primary" @click="$router.push('/orders')">
        返回订单列表
      </van-button>
    </van-empty>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast, showConfirmDialog } from 'vant'

const router = useRouter()
const route = useRoute()
const order = ref(null)

// 获取订单详情
const loadOrderDetail = () => {
  const orderId = route.params.id
  const orders = JSON.parse(localStorage.getItem('orders') || '[]')
  const foundOrder = orders.find(o => o.id === orderId)
  
  if (foundOrder) {
    order.value = foundOrder
  } else {
    // 尝试从sessionStorage获取（刚创建的订单）
    const guaranteeGroup = sessionStorage.getItem('guaranteeGroup')
    if (guaranteeGroup) {
      const group = JSON.parse(guaranteeGroup)
      if (group.id === orderId) {
        order.value = group
      }
    }
  }
}

// 确认订单
const confirmOrder = async () => {
  try {
    await showConfirmDialog({
      title: '确认交易',
      message: '确认接受此担保交易？确认后交易将正式开始。',
    })
    
    // 更新订单状态
    const orders = JSON.parse(localStorage.getItem('orders') || '[]')
    const orderIndex = orders.findIndex(o => o.id === order.value.id)
    
    if (orderIndex !== -1) {
      orders[orderIndex].status = 'processing'
      orders[orderIndex].confirmedAt = new Date().toISOString()
      localStorage.setItem('orders', JSON.stringify(orders))
      order.value.status = 'processing'
      showToast('交易确认成功')
    }
  } catch {
    // 用户取消
  }
}

// 取消订单
const cancelOrder = async () => {
  try {
    await showConfirmDialog({
      title: '取消交易',
      message: '确认取消此担保交易？取消后无法恢复。',
    })
    
    // 更新订单状态
    const orders = JSON.parse(localStorage.getItem('orders') || '[]')
    const orderIndex = orders.findIndex(o => o.id === order.value.id)
    
    if (orderIndex !== -1) {
      orders[orderIndex].status = 'cancelled'
      orders[orderIndex].cancelledAt = new Date().toISOString()
      localStorage.setItem('orders', JSON.stringify(orders))
      order.value.status = 'cancelled'
      showToast('交易已取消')
    }
  } catch {
    // 用户取消
  }
}

// 完成订单
const completeOrder = async () => {
  try {
    await showConfirmDialog({
      title: '确认完成',
      message: '确认交易已完成？确认后平台将释放资金给卖家。',
    })
    
    // 更新订单状态
    const orders = JSON.parse(localStorage.getItem('orders') || '[]')
    const orderIndex = orders.findIndex(o => o.id === order.value.id)
    
    if (orderIndex !== -1) {
      orders[orderIndex].status = 'completed'
      orders[orderIndex].completedAt = new Date().toISOString()
      localStorage.setItem('orders', JSON.stringify(orders))
      order.value.status = 'completed'
      showToast('交易已完成')
    }
  } catch {
    // 用户取消
  }
}

// 申请仲裁
const disputeOrder = () => {
  showToast('仲裁功能开发中...')
}

// 创建新订单
const createNewOrder = () => {
  router.push('/orders/create')
}

// 获取状态图标
const getStatusIcon = (status) => {
  const iconMap = {
    pending: 'clock-o',
    processing: 'play-circle-o',
    completed: 'success',
    cancelled: 'cross'
  }
  return iconMap[status] || 'info-o'
}

// 获取状态颜色
const getStatusColor = (status) => {
  const colorMap = {
    pending: '#ff976a',
    processing: '#1989fa',
    completed: '#07c160',
    cancelled: '#ee0a24'
  }
  return colorMap[status] || '#909399'
}

// 获取状态文本
const getStatusText = (status) => {
  const textMap = {
    pending: '待确认',
    processing: '进行中',
    completed: '已完成',
    cancelled: '已取消'
  }
  return textMap[status] || '未知'
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '未设置'
  const date = new Date(dateString)
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString().slice(0, 5)
}

// 格式化截止时间
const formatDeadline = (deadlineString) => {
  if (!deadlineString) return '未设置'
  
  const deadline = new Date(deadlineString)
  const now = new Date()
  const diff = deadline.getTime() - now.getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(hours / 24)
  
  if (days > 0) {
    return `${days}天${hours % 24}小时后 (${formatDate(deadlineString)})`
  } else if (hours > 0) {
    return `${hours}小时后 (${formatDate(deadlineString)})`
  } else {
    return `即将到期 (${formatDate(deadlineString)})`
  }
}

// 获取剩余时间
const getTimeRemaining = (deadlineString) => {
  if (!deadlineString) return '未设置'
  
  const deadline = new Date(deadlineString)
  const now = new Date()
  const diff = deadline.getTime() - now.getTime()
  
  if (diff <= 0) {
    return '<span style="color: #ee0a24;">已过期</span>'
  }
  
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(hours / 24)
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  
  if (days > 0) {
    return `${days}天${hours % 24}小时${minutes}分钟`
  } else if (hours > 0) {
    return `${hours}小时${minutes}分钟`
  } else {
    return `${minutes}分钟`
  }
}

onMounted(() => {
  loadOrderDetail()
})
</script>

<style lang="scss" scoped>
.order-detail {
  background: #f7f8fa;
  min-height: 100vh;
}

.detail-content {
  padding: 12px;
}

.status-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 12px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  
  .status-header {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-bottom: 12px;
    
    .status-text {
      font-size: 18px;
      font-weight: 600;
    }
  }
  
  .order-title {
    font-size: 16px;
    color: #323233;
    line-height: 1.5;
  }
}

.description {
  color: #646566;
  font-size: 14px;
  line-height: 1.6;
  white-space: pre-wrap;
}

.party-info {
  .party-label {
    font-size: 14px;
    color: #969799;
    margin-bottom: 8px;
  }
  
  .party-user {
    display: flex;
    align-items: center;
    gap: 12px;
    
    .user-details {
      .user-name {
        font-size: 16px;
        font-weight: 500;
        color: #323233;
        margin-bottom: 2px;
      }
      
      .user-rating {
        font-size: 12px;
        color: #666;
      }
    }
  }
}

.action-buttons {
  margin: 24px 12px;
}

:deep(.amount) {
  color: #ee0a24;
  font-weight: 600;
}

:deep(.total-amount) {
  color: #ee0a24;
  font-weight: 700;
  font-size: 16px;
}

// 响应式设计
@media (max-width: 375px) {
  .detail-content {
    padding: 8px;
  }
  
  .action-buttons {
    margin: 20px 8px;
  }
}
</style>