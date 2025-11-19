<template>
  <div class="order-list">
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="onLoad"
      >
        <div v-for="order in orders" :key="order.id" class="order-card card" @click="$emit('viewOrder', order.id)">
          <div class="order-header">
            <div class="order-info">
              <span class="order-id">{{ order.id }}</span>
              <van-tag :type="order.statusColor">{{ order.statusText }}</van-tag>
            </div>
            <div class="order-time">{{ formatTime(order.createTime) }}</div>
          </div>
          
          <div class="order-content">
            <div class="content-item">
              <span class="label">类型：</span>
              <span class="value">{{ order.type }}</span>
            </div>
            <div class="content-item">
              <span class="label">游戏：</span>
              <span class="value">{{ order.game }}</span>
            </div>
            <div class="content-item">
              <span class="label">内容：</span>
              <span class="value">{{ order.content }}</span>
            </div>
            <div v-if="order.deadline" class="content-item">
              <span class="label">截止：</span>
              <span class="value">{{ formatTime(order.deadline) }}</span>
            </div>
          </div>
          
          <div class="order-participants">
            <div class="participant">
              <img :src="order.buyer.avatar" :alt="order.buyer.name" class="avatar" />
              <span class="name">买家：{{ order.buyer.name }}</span>
            </div>
            <div class="participant">
              <img :src="order.seller.avatar" :alt="order.seller.name" class="avatar" />
              <span class="name">卖家：{{ order.seller.name }}</span>
            </div>
          </div>
          
          <div class="order-footer">
            <div class="price">
              <span class="price-label">交易金额：</span>
              <span class="price-value">¥{{ order.price.toFixed(2) }}</span>
            </div>
            <div class="order-actions">
              <van-button v-if="order.status === '待确认'" type="primary" size="small" @click.stop="confirmOrder(order.id)">
                确认完成
              </van-button>
              <van-button v-if="order.status === '进行中'" type="warning" size="small" @click.stop="disputeOrder(order.id)">
                申请仲裁
              </van-button>
            </div>
          </div>
        </div>
      </van-list>
    </van-pull-refresh>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { showToast, showConfirmDialog } from 'vant'

defineProps({
  orders: {
    type: Array,
    default: () => []
  }
})

defineEmits(['viewOrder'])

const refreshing = ref(false)
const loading = ref(false)
const finished = ref(false)

const onRefresh = () => {
  setTimeout(() => {
    refreshing.value = false
  }, 1000)
}

const onLoad = () => {
  setTimeout(() => {
    loading.value = false
    finished.value = true
  }, 1000)
}

const confirmOrder = async (orderId) => {
  try {
    await showConfirmDialog({
      title: '确认完成',
      message: '确认订单已完成？确认后资金将结算给卖家。',
    })
    showToast('确认成功')
  } catch {
    // 用户取消
  }
}

const disputeOrder = async (orderId) => {
  try {
    await showConfirmDialog({
      title: '申请仲裁',
      message: '确定要申请仲裁吗？客服将介入处理。',
    })
    showToast('仲裁申请已提交')
  } catch {
    // 用户取消
  }
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
.order-list {
  padding: 16px;
}

.order-card {
  margin-bottom: 12px;
  cursor: pointer;
  transition: transform 0.2s;
  
  &:active {
    transform: scale(0.98);
  }
  
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
        font-weight: 600;
        color: #323233;
      }
    }
    
    .order-time {
      font-size: 12px;
      color: #969799;
    }
  }
  
  .order-content {
    margin-bottom: 12px;
    
    .content-item {
      display: flex;
      margin-bottom: 6px;
      font-size: 14px;
      
      .label {
        color: #969799;
        width: 60px;
        flex-shrink: 0;
      }
      
      .value {
        flex: 1;
        color: #323233;
      }
    }
  }
  
  .order-participants {
    display: flex;
    justify-content: space-between;
    margin-bottom: 12px;
    padding: 8px 0;
    border-top: 1px solid #ebedf0;
    border-bottom: 1px solid #ebedf0;
    
    .participant {
      display: flex;
      align-items: center;
      gap: 8px;
      
      .avatar {
        width: 24px;
        height: 24px;
        border-radius: 50%;
      }
      
      .name {
        font-size: 12px;
        color: #646566;
      }
    }
  }
  
  .order-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .price {
      .price-label {
        font-size: 14px;
        color: #646566;
      }
      
      .price-value {
        font-size: 16px;
        font-weight: 600;
        color: #ee0a24;
      }
    }
    
    .order-actions {
      display: flex;
      gap: 8px;
    }
  }
}
</style>