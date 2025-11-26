<template>
  <div class="order-review page-container">
    <!-- 导航栏 -->
    <van-nav-bar title="订单审核" class="review-nav">
      <template #left>
        <van-icon name="arrow-left" @click="$router.go(-1)" />
      </template>
    </van-nav-bar>

    <!-- 筛选器 -->
    <div class="filter-section">
      <van-tabs v-model:active="activeTab" @change="onTabChange">
        <van-tab title="待审核" name="pending" />
        <van-tab title="已通过" name="approved" />
        <van-tab title="已拒绝" name="rejected" />
        <van-tab title="全部" name="all" />
      </van-tabs>
    </div>

    <!-- 订单列表 -->
    <div class="order-list">
      <div 
        v-for="order in filteredOrders" 
        :key="order.id" 
        class="order-item card"
        @click="viewOrderDetail(order)"
      >
        <div class="order-header">
          <div class="order-info">
            <span class="order-id">订单号: {{ order.id }}</span>
            <van-tag 
              :type="getStatusType(order.status)" 
              size="small"
            >
              {{ getStatusText(order.status) }}
            </van-tag>
          </div>
          <div class="order-time">{{ formatTime(order.createTime) }}</div>
        </div>

        <div class="order-content">
          <div class="service-info">
            <h4>{{ order.title }}</h4>
            <p>{{ order.description }}</p>
          </div>
          
          <div class="party-info">
            <div class="party">
              <img :src="order.initiator.avatar" :alt="order.initiator.name" />
              <span>{{ order.initiator.name }}</span>
            </div>
            <van-icon name="arrow" />
            <div class="party">
              <img :src="order.receiver.avatar" :alt="order.receiver.name" />
              <span>{{ order.receiver.name }}</span>
            </div>
          </div>

          <div class="order-amount">
            <span class="amount">¥{{ order.amount }}</span>
            <span class="fee">担保费: ¥{{ order.guaranteeFee }}</span>
          </div>
        </div>

        <!-- 审核操作按钮 -->
        <div class="review-actions" v-if="order.status === 'pending'">
          <van-button 
            size="small" 
            type="success" 
            @click.stop="approveOrder(order)"
            :loading="order.loading"
          >
            通过
          </van-button>
          <van-button 
            size="small" 
            type="danger" 
            @click.stop="rejectOrder(order)"
            :loading="order.loading"
          >
            拒绝
          </van-button>
        </div>
      </div>

      <!-- 空状态 -->
      <van-empty 
        v-if="filteredOrders.length === 0" 
        description="暂无订单" 
        image="https://picsum.photos/seed/empty/200/200.jpg"
      />
    </div>

    <!-- 拒绝理由弹窗 -->
    <van-dialog
      v-model:show="showRejectDialog"
      title="拒绝理由"
      show-cancel-button
      @confirm="confirmReject"
    >
      <div class="reject-form">
        <van-field
          v-model="rejectReason"
          type="textarea"
          placeholder="请输入拒绝理由"
          rows="3"
          maxlength="200"
          show-word-limit
        />
      </div>
    </van-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showConfirmDialog } from 'vant'

const router = useRouter()
const activeTab = ref('pending')
const showRejectDialog = ref(false)
const rejectReason = ref('')
const currentOrder = ref(null)

// 订单列表
const orders = ref([
  {
    id: 'ORD001',
    title: '王者荣耀星耀上王者',
    description: '需要从星耀段位代练到王者段位',
    amount: 150,
    guaranteeFee: 7.5,
    status: 'pending',
    createTime: '2024-01-15 10:30:00',
    initiator: {
      id: 1,
      name: '玩家小明',
      avatar: 'https://picsum.photos/seed/user1/40/40.jpg'
    },
    receiver: {
      id: 2,
      name: '代练达人',
      avatar: 'https://picsum.photos/seed/user2/40/40.jpg'
    },
    loading: false
  },
  {
    id: 'ORD002',
    title: 'LOL黄金上铂金',
    description: '英雄联盟黄金段位提升到铂金',
    amount: 80,
    guaranteeFee: 4,
    status: 'approved',
    createTime: '2024-01-15 09:20:00',
    initiator: {
      id: 3,
      name: '游戏玩家',
      avatar: 'https://picsum.photos/seed/user3/40/40.jpg'
    },
    receiver: {
      id: 4,
      name: '专业代练',
      avatar: 'https://picsum.photos/seed/user4/40/40.jpg'
    },
    loading: false
  },
  {
    id: 'ORD003',
    title: '和平精英段位提升',
    description: '需要提升段位到皇冠',
    amount: 120,
    guaranteeFee: 6,
    status: 'rejected',
    createTime: '2024-01-15 08:15:00',
    initiator: {
      id: 5,
      name: '新手玩家',
      avatar: 'https://picsum.photos/seed/user5/40/40.jpg'
    },
    receiver: {
      id: 6,
      name: '代练团队',
      avatar: 'https://picsum.photos/seed/user6/40/40.jpg'
    },
    loading: false,
    rejectReason: '价格过低，不符合平台标准'
  }
])

onMounted(() => {
  loadOrders()
})

const loadOrders = () => {
  console.log('加载订单列表')
}

// 计算属性
const filteredOrders = computed(() => {
  if (activeTab.value === 'all') {
    return orders.value
  }
  return orders.value.filter(order => order.status === activeTab.value)
})

const onTabChange = (name) => {
  console.log('切换标签:', name)
}

const viewOrderDetail = (order) => {
  router.push(`/order/${order.id}`)
}

const approveOrder = async (order) => {
  try {
    await showConfirmDialog({
      title: '确认通过',
      message: `确定要通过订单 ${order.id} 的审核吗？`
    })

    order.loading = true
    order.status = 'approved'

    setTimeout(() => {
      order.loading = false
      showToast('订单已通过审核')
    }, 1000)

  } catch {
    // 用户取消
  }
}

const rejectOrder = (order) => {
  currentOrder.value = order
  rejectReason.value = ''
  showRejectDialog.value = true
}

const confirmReject = () => {
  if (!rejectReason.value.trim()) {
    showToast('请输入拒绝理由')
    return
  }

  if (currentOrder.value) {
    currentOrder.value.status = 'rejected'
    currentOrder.value.rejectReason = rejectReason.value
    showToast('订单已拒绝')
  }

  showRejectDialog.value = false
  currentOrder.value = null
  rejectReason.value = ''
}

const getStatusType = (status) => {
  const typeMap = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger'
  }
  return typeMap[status] || 'default'
}

const getStatusText = (status) => {
  const textMap = {
    pending: '待审核',
    approved: '已通过',
    rejected: '已拒绝'
  }
  return textMap[status] || '未知'
}

const formatTime = (time) => {
  const date = new Date(time)
  return date.toLocaleString('zh-CN')
}
</script>

<style lang="scss" scoped>
.order-review {
  padding-top: 0;
  background: #f7f8fa;
  min-height: 100vh;
}

.review-nav {
  background: linear-gradient(135deg, #07c160 0%, #06ae56 100%);
  color: white;

  :deep(.van-nav-bar__title) {
    color: white;
    font-weight: 600;
  }

  :deep(.van-icon) {
    color: white;
  }
}

.filter-section {
  background: white;
  margin-bottom: 8px;
}

.order-list {
  padding: 16px;

  .order-item {
    margin-bottom: 12px;
    padding: 16px;
    cursor: pointer;

    .order-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;

      .order-info {
        display: flex;
        align-items: center;
        gap: 8px;

        .order-id {
          font-size: 14px;
          font-weight: 500;
          color: #333;
        }
      }

      .order-time {
        font-size: 12px;
        color: #999;
      }
    }

    .order-content {
      margin-bottom: 12px;

      .service-info {
        margin-bottom: 12px;

        h4 {
          margin: 0 0 4px 0;
          font-size: 16px;
          font-weight: 600;
          color: #333;
        }

        p {
          margin: 0;
          font-size: 14px;
          color: #666;
          line-height: 1.4;
        }
      }

      .party-info {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 12px;

        .party {
          display: flex;
          align-items: center;
          gap: 8px;

          img {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            object-fit: cover;
          }

          span {
            font-size: 14px;
            color: #333;
          }
        }

        .van-icon {
          color: #999;
          font-size: 16px;
        }
      }

      .order-amount {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .amount {
          font-size: 18px;
          font-weight: 600;
          color: #ee0a24;
        }

        .fee {
          font-size: 12px;
          color: #999;
        }
      }
    }

    .review-actions {
      display: flex;
      gap: 8px;
      justify-content: flex-end;
      padding-top: 12px;
      border-top: 1px solid #f0f0f0;
    }
  }
}

.reject-form {
  padding: 16px;

  .van-field {
    margin-bottom: 8px;
  }
}
</style>