<template>
  <div class="demand-list">
    <div
      v-for="demand in demands"
      :key="demand.id"
      class="demand-item"
      @click="$emit('view-demand', demand.id)"
    >
      <div class="demand-header">
        <div class="demand-title">{{ demand.title }}</div>
        <van-tag :type="getStatusType(demand.status)" size="small">
          {{ demand.status }}
        </van-tag>
      </div>

      <div class="demand-info">
        <div class="meta-tags">
          <van-tag type="primary" size="small">{{ demand.type }}</van-tag>
          <van-tag type="success" size="small">{{ demand.gameName }}</van-tag>
        </div>
        <div class="price-range">¥{{ demand.minPrice }}-{{ demand.maxPrice }}</div>
      </div>

      <div class="demand-desc">{{ demand.description }}</div>

      <div class="demand-footer">
        <div class="publisher-info">
          <img :src="demand.publisher?.avatar || defaultAvatar" :alt="demand.publisher?.name" class="avatar" />
          <span class="publisher-name">{{ demand.publisher?.name || '匿名用户' }}</span>
          <span class="time">{{ formatTime(demand.createTime) }}</span>
        </div>
        <div class="stats">
          <span class="stat-item">
            <van-icon name="eye-o" />
            {{ demand.views }}
          </span>
          <span class="stat-item">
            <van-icon name="good-job-o" />
            {{ demand.likes }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  demands: {
    type: Array,
    default: () => []
  }
})

defineEmits(['view-demand'])

const defaultAvatar = 'https://picsum.photos/seed/default-avatar/32/32.jpg'

const getStatusType = (status) => {
  const statusMap = {
    '待接单': 'warning',
    '进行中': 'success',
    '已完成': 'primary',
    '已取消': 'danger'
  }
  return statusMap[status] || 'default'
}

const formatTime = (time) => {
  const date = new Date(time)
  const now = new Date()
  const diff = now - date
  
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  return `${Math.floor(diff / 86400000)}天前`
}
</script>

<style lang="scss" scoped>
.demand-list {
  .demand-item {
    background: white;
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:active {
      transform: scale(0.98);
      box-shadow: 0 1px 6px rgba(0, 0, 0, 0.08);
    }
    
    .demand-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 12px;
      
      .demand-title {
        flex: 1;
        font-size: 16px;
        font-weight: 600;
        color: #323233;
        line-height: 1.4;
        margin-right: 8px;
      }
    }
    
    .demand-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      
      .meta-tags {
        display: flex;
        gap: 6px;
      }
      
      .price-range {
        font-size: 16px;
        font-weight: 600;
        color: #ee0a24;
      }
    }
    
    .demand-desc {
      font-size: 14px;
      color: #646566;
      line-height: 1.5;
      margin-bottom: 12px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    
    .demand-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 12px;
      border-top: 1px solid #ebedf0;
      
      .publisher-info {
        display: flex;
        align-items: center;
        gap: 8px;
        
        .avatar {
          width: 24px;
          height: 24px;
          border-radius: 50%;
        }
        
        .publisher-name {
          font-size: 13px;
          color: #323233;
        }
        
        .time {
          font-size: 12px;
          color: #969799;
        }
      }
      
      .stats {
        display: flex;
        gap: 12px;
        
        .stat-item {
          display: flex;
          align-items: center;
          gap: 2px;
          font-size: 12px;
          color: #969799;
          
          .van-icon {
            font-size: 14px;
          }
        }
      }
    }
  }
}
</style>