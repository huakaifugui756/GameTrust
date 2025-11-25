<template>
  <div class="profile-notifications page-container">
    <van-nav-bar title="消息通知" left-arrow @click-left="$router.go(-1)" />
    
    <div class="notifications-content">
      <van-cell-group>
        <van-cell title="订单通知" :value="orderNotification ? '已开启' : '已关闭'" @click="toggleOrderNotification">
          <template #right-icon>
            <van-switch v-model="orderNotification" />
          </template>
        </van-cell>
        <van-cell title="系统通知" :value="systemNotification ? '已开启' : '已关闭'" @click="toggleSystemNotification">
          <template #right-icon>
            <van-switch v-model="systemNotification" />
          </template>
        </van-cell>
        <van-cell title="营销通知" :value="marketingNotification ? '已开启' : '已关闭'" @click="toggleMarketingNotification">
          <template #right-icon>
            <van-switch v-model="marketingNotification" />
          </template>
        </van-cell>
      </van-cell-group>
      
      <van-cell-group>
        <van-cell title="免打扰时间" is-link @click="setQuietTime" :value="quietTime" />
        <van-cell title="通知方式" is-link @click="setNotificationMethod" :value="notificationMethod" />
      </van-cell-group>
      
      <div class="recent-notifications">
        <h3>最近通知</h3>
        <div class="notification-list">
          <div class="notification-item" v-for="item in recentNotifications" :key="item.id">
            <div class="notification-header">
              <span class="notification-type">{{ item.type }}</span>
              <span class="notification-time">{{ item.time }}</span>
            </div>
            <div class="notification-content">{{ item.content }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { showToast, showActionSheet as vanShowActionSheet } from 'vant'

const orderNotification = ref(true)
const systemNotification = ref(true)
const marketingNotification = ref(false)
const quietTime = ref('22:00 - 08:00')
const notificationMethod = ref('应用内 + 短信')

const recentNotifications = ref([
  {
    id: 1,
    type: '订单通知',
    content: '您的订单已完成，请及时确认',
    time: '10分钟前'
  },
  {
    id: 2,
    type: '系统通知',
    content: '平台将于今晚23:00进行维护升级',
    time: '1小时前'
  },
  {
    id: 3,
    type: '订单通知',
    content: '您有新的订单消息',
    time: '2小时前'
  }
])

const toggleOrderNotification = () => {
  showToast(orderNotification.value ? '已开启订单通知' : '已关闭订单通知')
}

const toggleSystemNotification = () => {
  showToast(systemNotification.value ? '已开启系统通知' : '已关闭系统通知')
}

const toggleMarketingNotification = () => {
  showToast(marketingNotification.value ? '已开启营销通知' : '已关闭营销通知')
}

const setQuietTime = () => {
  showToast('设置免打扰时间')
}

const setNotificationMethod = () => {
  vanShowActionSheet({
    title: '选择通知方式',
    actions: [
      { name: '仅应用内' },
      { name: '应用内 + 短信' },
      { name: '全部开启' }
    ],
    onSelect: (action) => {
      notificationMethod.value = action.name
      showToast(`已选择: ${action.name}`)
    }
  })
}
</script>

<style lang="scss" scoped>
.profile-notifications {
  padding-top: 0;
  background: #f7f8fa;
  min-height: 100vh;
  padding-bottom: 60px;
}

.notifications-content {
  padding: 12px;
}

.van-cell-group {
  margin-bottom: 12px;
}

.recent-notifications {
  margin-top: 20px;
  
  h3 {
    margin: 0 0 12px 0;
    font-size: 18px;
    font-weight: 600;
    color: #323233;
  }
}

.notification-list {
  background: white;
  border-radius: 8px;
  overflow: hidden;
}

.notification-item {
  padding: 16px;
  border-bottom: 1px solid #ebedf0;
  
  &:last-child {
    border-bottom: none;
  }
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  
  .notification-type {
    font-size: 14px;
    font-weight: 600;
    color: #1989fa;
  }
  
  .notification-time {
    font-size: 12px;
    color: #969799;
  }
}

.notification-content {
  font-size: 14px;
  color: #646566;
  line-height: 1.5;
}
</style>