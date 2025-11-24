<template>
  <div class="profile page-container">
    <!-- 导航栏 -->
    <van-nav-bar 
      title="个人中心" 
      class="profile-nav"
    >
      <template #right>
        <van-button 
          size="small" 
          type="danger" 
          plain 
          @click="logout"
          class="logout-btn"
        >
          退出登录
        </van-button>
      </template>
    </van-nav-bar>

    <!-- 用户信息卡片 -->
    <div class="user-card">
      <div class="user-info">
        <img :src="userInfo.avatar" :alt="userInfo.name" class="avatar" />
        <div class="info">
          <h3>{{ userInfo.name }}</h3>
          <div class="reputation">
            <van-rate v-model="userInfo.reputation" size="14" color="#ffd21e" void-icon="star" void-color="#c8c9cc" readonly />
            <span class="score">{{ userInfo.reputation }}分</span>
          </div>
        </div>
        <van-button size="small" @click="editProfile">编辑</van-button>
      </div>
      
      <div class="user-stats">
        <div class="stat-item">
          <div class="value">{{ userInfo.orderCount }}</div>
          <div class="label">订单</div>
        </div>
        <div class="stat-item">
          <div class="value">{{ userInfo.followCount }}</div>
          <div class="label">关注</div>
        </div>
        <div class="stat-item">
          <div class="value">{{ userInfo.fansCount }}</div>
          <div class="label">粉丝</div>
        </div>
      </div>
    </div>



    <!-- 功能菜单 -->
    <div class="menu-list">
      <van-cell-group>
        <van-cell title="我的订单" is-link @click="$router.push('/orders')" />
        <van-cell title="我的帖子" is-link @click="$router.push('/profile/posts')" />
        <van-cell title="我的收藏" is-link @click="$router.push('/profile/favorites')" />
        <van-cell title="实名认证" is-link @click="goToVerification" :value="userInfo.verified ? '已认证' : '未认证'" />
      </van-cell-group>
      
      <van-cell-group>
        <van-cell title="安全设置" is-link @click="$router.push('/profile/security')" />
        <van-cell title="消息通知" is-link @click="$router.push('/profile/notifications')" />
        <van-cell title="隐私设置" is-link @click="$router.push('/profile/privacy')" />
      </van-cell-group>
      
      <van-cell-group>
        <van-cell title="帮助中心" is-link @click="$router.push('/help')" />
        <van-cell title="联系客服" is-link @click="contactSupport" />
        <van-cell title="关于我们" is-link @click="$router.push('/about')" />
      </van-cell-group>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showConfirmDialog } from 'vant'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const userInfo = ref({
  id: 1,
  name: '游戏玩家',
  avatar: 'https://picsum.photos/seed/user/80/80.jpg',
  reputation: 4.8,
  orderCount: 23,
  followCount: 45,
  fansCount: 128,
  verified: false
})



onMounted(() => {
  loadUserInfo()
})

const loadUserInfo = () => {
  // 加载用户信息
  if (authStore.user) {
    userInfo.value = { ...userInfo.value, ...authStore.user }
  }
}

const editProfile = () => {
  router.push('/profile/edit')
}



const goToVerification = () => {
  if (!userInfo.value.verified) {
    router.push('/profile/verification')
  }
}

const contactSupport = () => {
  router.push('/support')
}

const logout = async () => {
  try {
    await showConfirmDialog({
      title: '退出登录',
      message: '确定要退出登录吗？',
    })
    if (authStore && authStore.logout) {
      authStore.logout()
    }
    showToast('退出成功')
    router.push('/login')
  } catch {
    // 用户取消
  }
}
</script>

<style lang="scss" scoped>
.profile {
  padding-top: 0;
  background: #f7f8fa;
  min-height: 100vh;
  padding-bottom: 60px; // 为底部导航栏留出空间
}

.profile-nav {
  background: linear-gradient(135deg, #1989fa 0%, #1c7ed6 100%);
  color: white;
  
  :deep(.van-nav-bar__title) {
    color: white;
    font-weight: 600;
  }
  
  .logout-btn {
    color: #ff4d4f;
    border-color: rgba(255, 77, 79, 0.3);
    background: rgba(255, 77, 79, 0.1);
    font-size: 12px;
    padding: 4px 12px;
    height: 28px;
    
    &:hover {
      background: rgba(255, 77, 79, 0.2);
      border-color: rgba(255, 77, 79, 0.5);
    }
  }
}

.user-card {
  background: linear-gradient(135deg, #1989fa 0%, #1c7ed6 100%);
  color: white;
  padding: 20px 16px;
  
  .user-info {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
    
    .avatar {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      border: 3px solid rgba(255, 255, 255, 0.3);
      margin-right: 16px;
    }
    
    .info {
      flex: 1;
      
      h3 {
        margin: 0 0 8px 0;
        font-size: 20px;
        font-weight: 600;
      }
      
      .reputation {
        display: flex;
        align-items: center;
        gap: 8px;
        
        .score {
          font-size: 14px;
        }
      }
    }
    
    .van-button {
      background: rgba(255, 255, 255, 0.2);
      border-color: rgba(255, 255, 255, 0.3);
      color: white;
    }
  }
  
  .user-stats {
    display: flex;
    justify-content: space-around;
    
    .stat-item {
      text-align: center;
      
      .value {
        font-size: 20px;
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



.menu-list {
  margin-top: 16px;
  
  .van-cell-group {
    margin-bottom: 12px;
  }
}
</style>