<template>
  <div class="profile page-container">
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

    <!-- 钱包信息 -->
    <div class="wallet-card card">
      <div class="wallet-header">
        <h4>我的钱包</h4>
        <van-button size="small" @click="$router.push('/wallet')">详情</van-button>
      </div>
      <div class="wallet-balance">
        <div class="balance-item">
          <span class="label">可用余额</span>
          <span class="value">¥{{ wallet.balance.toFixed(2) }}</span>
        </div>
        <div class="balance-item">
          <span class="label">冻结资金</span>
          <span class="value">¥{{ wallet.frozen.toFixed(2) }}</span>
        </div>
      </div>
      <div class="wallet-actions">
        <van-button type="primary" size="small" @click="recharge">充值</van-button>
        <van-button type="default" size="small" @click="withdraw">提现</van-button>
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
      
      <van-cell-group>
        <van-cell title="退出登录" @click="logout" />
      </van-cell-group>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showConfirmDialog } from 'vant'

const router = useRouter()

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

const wallet = ref({
  balance: 568.50,
  frozen: 150.00
})

onMounted(() => {
  loadUserInfo()
})

const loadUserInfo = () => {
  // 加载用户信息
  console.log('加载用户信息')
}

const editProfile = () => {
  router.push('/profile/edit')
}

const recharge = () => {
  router.push('/wallet/recharge')
}

const withdraw = () => {
  router.push('/wallet/withdraw')
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

.wallet-card {
  margin: 16px;
  
  .wallet-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    
    h4 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
    }
  }
  
  .wallet-balance {
    margin-bottom: 16px;
    
    .balance-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
      
      .label {
        font-size: 14px;
        color: #969799;
      }
      
      .value {
        font-size: 16px;
        font-weight: 600;
        color: #323233;
      }
    }
  }
  
  .wallet-actions {
    display: flex;
    gap: 12px;
  }
}

.menu-list {
  .van-cell-group {
    margin-bottom: 12px;
  }
}
</style>