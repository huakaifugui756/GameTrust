<template>
  <div class="admin-dashboard page-container">
    <!-- 导航栏 -->
    <van-nav-bar title="管理员控制台" class="admin-nav">
      <template #left>
        <van-icon name="arrow-left" @click="$router.go(-1)" />
      </template>
    </van-nav-bar>

    <!-- 管理员信息卡片 -->
    <div class="admin-card">
      <div class="admin-header">
        <img :src="adminInfo.avatar" :alt="adminInfo.name" class="admin-avatar" />
        <div class="admin-info">
          <h2>{{ adminInfo.name }}</h2>
          <van-tag type="danger" size="medium">超级管理员</van-tag>
        </div>
      </div>
      <div class="admin-stats">
        <div class="stat-item">
          <div class="value">{{ stats.totalUsers }}</div>
          <div class="label">总用户数</div>
        </div>
        <div class="stat-item">
          <div class="value">{{ stats.totalOrders }}</div>
          <div class="label">总订单数</div>
        </div>
        <div class="stat-item">
          <div class="value">{{ stats.pendingReviews }}</div>
          <div class="label">待审核</div>
        </div>
      </div>
    </div>

    <!-- 管理功能网格 -->
    <div class="admin-functions">
      <h3>管理功能</h3>
      <van-grid :column-num="2" :gutter="12">
        <van-grid-item 
          v-for="func in adminFunctions" 
          :key="func.id"
          :icon="func.icon"
          :text="func.name"
          :icon-color="func.color"
          @click="handleFunctionClick(func)"
        />
      </van-grid>
    </div>

    <!-- 快速操作 -->
    <div class="quick-actions">
      <h3>快速操作</h3>
      <van-cell-group>
        <van-cell 
          title="发布公告" 
          is-link 
          @click="showAnnouncementDialog"
          icon="volume-o"
        />
        <van-cell 
          title="系统维护" 
          is-link 
          @click="showMaintenanceDialog"
          icon="warning-o"
        />
        <van-cell 
          title="数据备份" 
          is-link 
          @click="handleDataBackup"
          icon="records-o"
        />
      </van-cell-group>
    </div>

    <!-- 公告弹窗 -->
    <van-dialog v-model:show="showAnnouncement" title="发布公告" :show-confirm-button="false">
      <div class="announcement-form">
        <van-field
          v-model="announcement.title"
          label="标题"
          placeholder="请输入公告标题"
        />
        <van-field
          v-model="announcement.content"
          label="内容"
          type="textarea"
          placeholder="请输入公告内容"
          rows="3"
        />
        <div class="dialog-actions">
          <van-button size="small" @click="showAnnouncement = false">取消</van-button>
          <van-button size="small" type="primary" @click="publishAnnouncement">发布</van-button>
        </div>
      </div>
    </van-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showConfirmDialog } from 'vant'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const adminInfo = ref({
  name: '系统管理员',
  avatar: 'https://picsum.photos/seed/admin/100/100.jpg'
})

const stats = ref({
  totalUsers: 1234,
  totalOrders: 567,
  pendingReviews: 8
})

const adminFunctions = ref([
  { id: 1, name: '用户管理', icon: 'manager-o', color: '#1989fa', route: '/admin/users' },
  { id: 2, name: '订单审核', icon: 'orders-o', color: '#07c160', route: '/admin/orders' },
  { id: 3, name: '内容管理', icon: 'description-o', color: '#ff976a', route: '/admin/content' },
  { id: 4, name: '系统设置', icon: 'setting-o', color: '#7232dd', route: '/admin/settings' },
  { id: 5, name: '数据统计', icon: 'chart-trending-o', color: '#f44336', route: '/admin/stats' },
  { id: 6, name: '日志查看', icon: 'records-o', color: '#607d8b', route: '/admin/logs' }
])

const showAnnouncement = ref(false)
const announcement = ref({
  title: '',
  content: ''
})

onMounted(() => {
  if (authStore.user) {
    adminInfo.value = {
      ...adminInfo.value,
      name: authStore.user.name,
      avatar: authStore.user.avatar
    }
  }
})

const handleFunctionClick = (func) => {
  showToast(`${func.name}功能开发中...`)
  // router.push(func.route)
}

const showAnnouncementDialog = () => {
  announcement.value = { title: '', content: '' }
  showAnnouncement.value = true
}

const publishAnnouncement = () => {
  if (!announcement.value.title || !announcement.value.content) {
    showToast('请填写完整信息')
    return
  }
  
  showToast('公告发布成功！')
  showAnnouncement.value = false
}

const showMaintenanceDialog = () => {
  showConfirmDialog({
    title: '系统维护',
    message: '确定要进行系统维护吗？这将暂时影响用户访问。',
  }).then(() => {
    showToast('系统维护模式已开启')
  }).catch(() => {
    // 用户取消
  })
}

const handleDataBackup = () => {
  showToast('数据备份功能开发中...')
}
</script>

<style lang="scss" scoped>
.admin-dashboard {
  padding-top: 0;
  background: #f7f8fa;
  min-height: 100vh;
  padding-bottom: 60px;
}

.admin-nav {
  background: linear-gradient(135deg, #ff4d4f 0%, #f5222d 100%);
  color: white;

  :deep(.van-nav-bar__title) {
    color: white;
    font-weight: 600;
  }

  :deep(.van-icon) {
    color: white;
  }
}

.admin-card {
  background: linear-gradient(135deg, #ff4d4f 0%, #f5222d 100%);
  color: white;
  padding: 20px 16px;
  margin-bottom: 16px;

  .admin-header {
    display: flex;
    align-items: center;
    margin-bottom: 20px;

    .admin-avatar {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      border: 3px solid rgba(255, 255, 255, 0.3);
      margin-right: 16px;
    }

    .admin-info {
      h2 {
        margin: 0 0 8px 0;
        font-size: 18px;
        font-weight: 600;
      }
    }
  }

  .admin-stats {
    display: flex;
    justify-content: space-around;

    .stat-item {
      text-align: center;

      .value {
        font-size: 18px;
        font-weight: 600;
        margin-bottom: 4px;
      }

      .label {
        font-size: 12px;
        opacity: 0.8;
      }
    }
  }
}

.admin-functions, .quick-actions {
  margin: 16px;

  h3 {
    margin: 0 0 12px 0;
    font-size: 16px;
    font-weight: 600;
    color: #323233;
  }
}

.announcement-form {
  padding: 16px;

  .dialog-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 16px;
  }
}

:deep(.van-grid-item__content) {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;

  &:active {
    transform: scale(0.95);
  }
}
</style>