<template>
  <div class="user-list">
    <div
      v-for="user in users"
      :key="user.id"
      class="user-item"
      @click="$emit('view-user', user.id)"
    >
      <img :src="user.avatar" :alt="user.name" class="user-avatar" />
      <div class="user-info">
        <div class="user-header">
          <h4>{{ user.name }}</h4>
          <van-rate v-model="user.rating" readonly size="12" />
        </div>
        <div class="user-specialty">{{ user.specialty }}</div>
        <div class="user-stats">
          <span class="stat-item">{{ user.orderCount }}单</span>
          <span class="stat-item">{{ user.successRate }}%成功率</span>
        </div>
      </div>
      <van-button size="small" type="primary" @click.stop="contactUser(user.id)">
        联系
      </van-button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

defineProps({
  users: {
    type: Array,
    default: () => []
  }
})

defineEmits(['view-user'])

const contactUser = (userId) => {
  router.push(`/chat/${userId}`)
}
</script>

<style lang="scss" scoped>
.user-list {
  .user-item {
    display: flex;
    align-items: center;
    background: white;
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 12px;
    cursor: pointer;
    transition: transform 0.2s;
    
    &:active {
      transform: scale(0.98);
    }
    
    .user-avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      margin-right: 12px;
    }
    
    .user-info {
      flex: 1;
      
      .user-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 4px;
        
        h4 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: #323233;
        }
      }
      
      .user-specialty {
        font-size: 12px;
        color: #646566;
        margin-bottom: 8px;
      }
      
      .user-stats {
        display: flex;
        gap: 12px;
        
        .stat-item {
          font-size: 12px;
          color: #969799;
        }
      }
    }
  }
}
</style>