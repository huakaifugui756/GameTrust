<template>
  <div class="demand-detail page-container">
    <!-- 顶部导航 -->
    <van-nav-bar
      title="需求详情"
      left-text="返回"
      left-arrow
      @click-left="$router.go(-1)"
    >
      <template #right>
        <van-icon name="share-o" @click="shareDemand" />
      </template>
    </van-nav-bar>

    <!-- 需求内容 -->
    <div class="content" v-if="demand">
      <!-- 需求状态卡片 -->
      <div class="status-card card">
        <div class="status-header">
          <van-tag :type="statusType" size="large">{{ demand.status }}</van-tag>
          <div class="price">¥{{ demand.minPrice }}-{{ demand.maxPrice }}</div>
        </div>
        <div class="deadline">截止时间：{{ demand.deadline }}</div>
      </div>

      <!-- 需求信息 -->
      <div class="demand-info card">
        <h2 class="title">{{ demand.title }}</h2>
        <div class="meta-info">
          <van-tag type="primary">{{ demand.type }}</van-tag>
          <van-tag type="success">{{ demand.gameName }}</van-tag>
        </div>
        <div class="description">
          <h3>需求描述</h3>
          <p>{{ demand.description }}</p>
        </div>
        
        <!-- 附加要求 -->
        <div class="requirements" v-if="demand.requirements?.length">
          <h3>附加要求</h3>
          <div class="requirement-tags">
            <van-tag v-for="req in demand.requirements" :key="req" type="warning">
              {{ req }}
            </van-tag>
          </div>
        </div>

        <!-- 联系信息 -->
        <div class="contact-info">
          <h3>联系方式</h3>
          <div class="contact-item">
            <van-icon name="contact" />
            <span>{{ demand.contact }}</span>
          </div>
          <div class="contact-item" v-if="demand.contactTime">
            <van-icon name="clock-o" />
            <span>{{ demand.contactTime }}</span>
          </div>
        </div>
      </div>

      <!-- 发布者信息 -->
      <div class="publisher-info card">
        <div class="publisher-header">
          <img :src="demand.publisher?.avatar || defaultAvatar" :alt="demand.publisher?.name" class="avatar" />
          <div class="publisher-details">
            <div class="name">{{ demand.publisher?.name || '匿名用户' }}</div>
            <div class="rating">
              <van-rate :model-value="demand.publisher?.rating || 5" readonly size="12" />
              <span>{{ demand.publisher?.rating || 5.0 }}</span>
            </div>
          </div>
          <van-button size="small" type="primary" @click="contactPublisher">
            <van-icon name="chat-o" />
            联系TA
          </van-button>
        </div>
        <div class="publisher-stats">
          <div class="stat-item">
            <span class="label">发布需求</span>
            <span class="value">{{ demand.publisher?.demandCount || 0 }}</span>
          </div>
          <div class="stat-item">
            <span class="label">成功交易</span>
            <span class="value">{{ demand.publisher?.successCount || 0 }}</span>
          </div>
          <div class="stat-item">
            <span class="label">好评率</span>
            <span class="value">{{ demand.publisher?.goodRate || 100 }}%</span>
          </div>
        </div>
      </div>

      <!-- 互动数据 -->
      <div class="interaction-stats card">
        <div class="stat-item" @click="showLikes = true">
          <van-icon name="good-job-o" />
          <span>{{ demand.likes || 0 }}</span>
        </div>
        <div class="stat-item" @click="showComments = true">
          <van-icon name="chat-o" />
          <span>{{ demand.comments || 0 }}</span>
        </div>
        <div class="stat-item">
          <van-icon name="eye-o" />
          <span>{{ demand.views || 0 }}</span>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <van-button
          v-if="demand.status === '待接单'"
          type="primary"
          size="large"
          @click="acceptDemand"
        >
          立即接单
        </van-button>
        <van-button
          v-else-if="demand.status === '进行中'"
          type="success"
          size="large"
          disabled
        >
          交易进行中
        </van-button>
        <van-button
          v-else
          type="default"
          size="large"
          disabled
        >
          {{ demand.status }}
        </van-button>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-else class="loading">
      <van-loading size="24px">加载中...</van-loading>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast, showShareSheet } from 'vant'

const route = useRoute()
const router = useRouter()

const demand = ref(null)
const loading = ref(true)

const defaultAvatar = 'https://picsum.photos/seed/default-avatar/40/40.jpg'

const statusType = computed(() => {
  const statusMap = {
    '待接单': 'warning',
    '进行中': 'success',
    '已完成': 'primary',
    '已取消': 'danger'
  }
  return statusMap[demand.value?.status] || 'default'
})

// 模拟获取需求详情
const fetchDemandDetail = async () => {
  try {
    loading.value = true
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 模拟数据
    demand.value = {
      id: route.params.id,
      type: '代练',
      gameName: '王者荣耀',
      title: '王者荣耀星耀段位，需要代练上王者',
      description: '当前星耀二，需要上到王者段位。要求效率高，信誉好的代练。希望能在3天内完成，账号安全第一，需要直播过程。',
      minPrice: 50,
      maxPrice: 100,
      deadline: '2024-01-20',
      contact: 'wx_game123',
      contactTime: '晚上7-10点',
      requirements: ['需要直播', '账号安全', '效率优先'],
      status: '待接单',
      createTime: '2024-01-15 10:30:00',
      views: 156,
      likes: 12,
      comments: 8,
      publisher: {
        name: '游戏小王',
        avatar: 'https://picsum.photos/seed/publisher1/40/40.jpg',
        rating: 4.8,
        demandCount: 5,
        successCount: 4,
        goodRate: 95
      }
    }
  } catch (error) {
    showToast('加载失败')
  } finally {
    loading.value = false
  }
}

const shareDemand = () => {
  const options = [
    { name: '微信', icon: 'wechat' },
    { name: '微博', icon: 'weibo' },
    { name: 'QQ', icon: 'qq' },
    { name: '复制链接', icon: 'link' }
  ]
  
  showShareSheet({
    options,
    onSelect: (option) => {
      showToast(`分享到${option.name}`)
    }
  })
}

const contactPublisher = () => {
  router.push(`/chat/${demand.value.publisher.id}`)
}

const acceptDemand = async () => {
  try {
    showToast({
      type: 'loading',
      message: '接单中...',
      forbidClick: true,
      duration: 1500
    })
    
    // 模拟接单API
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    demand.value.status = '进行中'
    
    showToast({
      type: 'success',
      message: '接单成功！'
    })
    
    // 跳转到订单详情
    setTimeout(() => {
      router.push(`/order/${Date.now()}`)
    }, 1500)
    
  } catch (error) {
    showToast('接单失败，请重试')
  }
}

onMounted(() => {
  fetchDemandDetail()
})
</script>

<style lang="scss" scoped>
.demand-detail {
  background: #f7f8fa;
  padding-bottom: 80px;
}

.content {
  padding: 16px;
}

.status-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  margin-bottom: 16px;
  
  .status-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    
    .price {
      font-size: 20px;
      font-weight: 700;
    }
  }
  
  .deadline {
    font-size: 14px;
    opacity: 0.9;
  }
}

.demand-info {
  margin-bottom: 16px;
  
  .title {
    margin: 0 0 16px;
    font-size: 20px;
    font-weight: 600;
    color: #323233;
    line-height: 1.4;
  }
  
  .meta-info {
    display: flex;
    gap: 8px;
    margin-bottom: 20px;
  }
  
  .description, .requirements, .contact-info {
    margin-bottom: 20px;
    
    h3 {
      margin: 0 0 12px;
      font-size: 16px;
      font-weight: 600;
      color: #323233;
    }
    
    p {
      margin: 0;
      font-size: 14px;
      color: #646566;
      line-height: 1.6;
    }
  }
  
  .requirement-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  
  .contact-item {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
    font-size: 14px;
    color: #646566;
    
    .van-icon {
      color: #1989fa;
    }
  }
}

.publisher-info {
  margin-bottom: 16px;
  
  .publisher-header {
    display: flex;
    align-items: center;
    margin-bottom: 16px;
    
    .avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      margin-right: 12px;
    }
    
    .publisher-details {
      flex: 1;
      
      .name {
        font-size: 16px;
        font-weight: 600;
        margin-bottom: 4px;
      }
      
      .rating {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 12px;
        color: #969799;
      }
    }
  }
  
  .publisher-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    padding-top: 16px;
    border-top: 1px solid #ebedf0;
    
    .stat-item {
      text-align: center;
      
      .label {
        display: block;
        font-size: 12px;
        color: #969799;
        margin-bottom: 4px;
      }
      
      .value {
        font-size: 16px;
        font-weight: 600;
        color: #323233;
      }
    }
  }
}

.interaction-stats {
  display: flex;
  justify-content: space-around;
  margin-bottom: 20px;
  
  .stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    cursor: pointer;
    
    .van-icon {
      font-size: 20px;
      color: #969799;
    }
    
    span {
      font-size: 12px;
      color: #969799;
    }
  }
}

.action-buttons {
  padding: 0 16px;
  
  .van-button {
    width: 100%;
    height: 50px;
    font-size: 16px;
    font-weight: 600;
    border-radius: 25px;
  }
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}
</style>