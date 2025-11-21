<template>
  <div class="orders-page page-container">
    <!-- 顶部导航 -->
    <van-nav-bar
      title="担保交易"
      left-arrow
      @click-left="$router.go(-1)"
    >
      <template #right>
        <van-icon name="plus" size="18" @click="$router.push('/orders/create')" />
      </template>
    </van-nav-bar>

    <!-- 筛选标签 -->
    <div class="filter-tabs">
      <van-tabs v-model:active="activeTab" @change="onTabChange">
        <van-tab title="全部" name="all" />
        <van-tab title="待确认" name="pending" />
        <van-tab title="进行中" name="processing" />
        <van-tab title="已完成" name="completed" />
        <van-tab title="已取消" name="cancelled" />
      </van-tabs>
    </div>

    <!-- 订单列表 -->
    <div class="orders-list">
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <van-list
          v-model:loading="loading"
          :finished="finished"
          finished-text="没有更多了"
          @load="onLoad"
        >
          <div 
            v-for="order in filteredOrders" 
            :key="order.id" 
            class="order-item"
            @click="viewOrder(order.id)"
          >
            <div class="order-header">
              <div class="order-title">{{ order.title }}</div>
              <van-tag :type="getStatusType(order.status)" size="small">
                {{ getStatusText(order.status) }}
              </van-tag>
            </div>
            
            <div class="order-content">
              <div class="order-info">
                <div class="info-row">
                  <span class="label">交易类型:</span>
                  <span class="value">{{ order.type }}</span>
                </div>
                <div class="info-row" v-if="order.game">
                  <span class="label">游戏:</span>
                  <span class="value">{{ order.game }}</span>
                </div>
                <div class="info-row">
                  <span class="label">交易金额:</span>
                  <span class="value amount">¥{{ order.amount }}</span>
                </div>
                <div class="info-row">
                  <span class="label">创建时间:</span>
                  <span class="value">{{ formatDate(order.createdAt) }}</span>
                </div>
                <div class="info-row" v-if="order.deadline">
                  <span class="label">完成时限:</span>
                  <span class="value" :style="{ color: getTimeColor(order.deadline) }">
                    {{ getTimeRemaining(order.deadline) }}
                  </span>
                </div>
              </div>
              
              <div class="order-user" v-if="order.initiator">
                <van-image
                  :src="order.initiator.avatar"
                  width="32"
                  height="32"
                  round
                />
                <span class="user-name">{{ order.initiator.name }}</span>
              </div>
            </div>
            
            <div class="order-actions" v-if="order.status === 'pending'">
              <van-button size="small" type="success" @click.stop="confirmOrder(order.id)">
                确认交易
              </van-button>
              <van-button size="small" type="danger" @click.stop="cancelOrder(order.id)">
                取消交易
              </van-button>
            </div>
          </div>
        </van-list>
      </van-pull-refresh>
    </div>

    <!-- 空状态 -->
    <van-empty 
      v-if="filteredOrders.length === 0 && !loading" 
      description="暂无订单"
      image="https://picsum.photos/seed/empty-orders/200/200.jpg"
    >
      <van-button type="primary" @click="$router.push('/orders/create')">
        创建担保交易
      </van-button>
    </van-empty>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showConfirmDialog } from 'vant'

const router = useRouter()
const activeTab = ref('all')
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)
const orders = ref([])

// 筛选后的订单
const filteredOrders = computed(() => {
  if (activeTab.value === 'all') {
    return orders.value
  }
  return orders.value.filter(order => order.status === activeTab.value)
})

// 获取订单列表
const loadOrders = () => {
  // 从localStorage获取订单
  const savedOrders = localStorage.getItem('orders')
  if (savedOrders) {
    orders.value = JSON.parse(savedOrders)
  } else {
    // 模拟一些初始数据
    orders.value = [
      {
        id: 'guarantee_1',
        title: '王者荣耀段位提升',
        type: '代练',
        game: '王者荣耀',
        amount: '100',
        status: 'pending',
        initiator: {
          name: '游戏达人',
          avatar: 'https://picsum.photos/seed/user1/40/40.jpg'
        },
        createdAt: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: 'guarantee_2',
        title: '原神材料收集',
        type: '代练',
        game: '原神',
        amount: '50',
        status: 'processing',
        initiator: {
          name: '原神玩家',
          avatar: 'https://picsum.photos/seed/user2/40/40.jpg'
        },
        createdAt: new Date(Date.now() - 172800000).toISOString()
      }
    ]
  }
}

// 加载更多
const onLoad = () => {
  setTimeout(() => {
    loading.value = false
    finished.value = true
  }, 1000)
}

// 刷新
const onRefresh = () => {
  loadOrders()
  setTimeout(() => {
    refreshing.value = false
  }, 1000)
}

// 标签切换
const onTabChange = (name) => {
  activeTab.value = name
}

// 查看订单详情
const viewOrder = (orderId) => {
  router.push(`/order/${orderId}`)
}

// 确认订单
const confirmOrder = async (orderId) => {
  try {
    await showConfirmDialog({
      title: '确认交易',
      message: '确认接受此担保交易？',
    })
    
    // 更新订单状态
    const orderIndex = orders.value.findIndex(order => order.id === orderId)
    if (orderIndex !== -1) {
      orders.value[orderIndex].status = 'processing'
      localStorage.setItem('orders', JSON.stringify(orders.value))
      showToast('交易确认成功')
    }
  } catch {
    // 用户取消
  }
}

// 取消订单
const cancelOrder = async (orderId) => {
  try {
    await showConfirmDialog({
      title: '取消交易',
      message: '确认取消此担保交易？',
    })
    
    // 更新订单状态
    const orderIndex = orders.value.findIndex(order => order.id === orderId)
    if (orderIndex !== -1) {
      orders.value[orderIndex].status = 'cancelled'
      localStorage.setItem('orders', JSON.stringify(orders.value))
      showToast('交易已取消')
    }
  } catch {
    // 用户取消
  }
}

// 获取状态类型
const getStatusType = (status) => {
  const typeMap = {
    pending: 'warning',
    processing: 'primary',
    completed: 'success',
    cancelled: 'danger'
  }
  return typeMap[status] || 'default'
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
  const date = new Date(dateString)
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString().slice(0, 5)
}

// 获取剩余时间
const getTimeRemaining = (deadlineString) => {
  if (!deadlineString) return '未设置'
  
  const deadline = new Date(deadlineString)
  const now = new Date()
  const diff = deadline.getTime() - now.getTime()
  
  if (diff <= 0) {
    return '已过期'
  }
  
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(hours / 24)
  
  if (days > 0) {
    return `${days}天${hours % 24}小时后`
  } else if (hours > 0) {
    return `${hours}小时后`
  } else {
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    return `${minutes}分钟后`
  }
}

// 获取时间颜色
const getTimeColor = (deadlineString) => {
  if (!deadlineString) return '#646566'
  
  const deadline = new Date(deadlineString)
  const now = new Date()
  const diff = deadline.getTime() - now.getTime()
  const hours = diff / (1000 * 60 * 60)
  
  if (diff <= 0) {
    return '#ee0a24' // 红色 - 已过期
  } else if (hours <= 24) {
    return '#ff976a' // 橙色 - 24小时内
  } else if (hours <= 72) {
    return '#1989fa' // 蓝色 - 72小时内
  } else {
    return '#646566' // 灰色 - 充足时间
  }
}

onMounted(() => {
  loadOrders()
})
</script>

<style lang="scss" scoped>
.orders-page {
  background: #f7f8fa;
  min-height: 100vh;
}

.filter-tabs {
  background: white;
  border-bottom: 1px solid #ebedf0;
}

.orders-list {
  padding: 12px;
}

.order-item {
  background: white;
  border-radius: 8px;
  margin-bottom: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:active {
    transform: scale(0.98);
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  }
  
  .order-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    
    .order-title {
      font-size: 16px;
      font-weight: 600;
      color: #323233;
      flex: 1;
      margin-right: 12px;
    }
  }
  
  .order-content {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 12px;
    
    .order-info {
      flex: 1;
      
      .info-row {
        display: flex;
        margin-bottom: 4px;
        font-size: 13px;
        
        .label {
          color: #969799;
          width: 70px;
        }
        
        .value {
          color: #323233;
          flex: 1;
          
          &.amount {
            color: #ee0a24;
            font-weight: 600;
          }
        }
      }
    }
    
    .order-user {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      margin-left: 12px;
      
      .user-name {
        font-size: 12px;
        color: #646566;
        text-align: center;
      }
    }
  }
  
  .order-actions {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
    padding-top: 12px;
    border-top: 1px solid #ebedf0;
  }
}

// 响应式设计
@media (max-width: 375px) {
  .orders-list {
    padding: 8px;
  }
  
  .order-item {
    padding: 12px;
  }
}
</style>