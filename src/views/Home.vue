<template>
  <div class="home page-container">
    <!-- 顶部搜索栏 -->
    <div class="search-header">
      <van-search
        v-model="searchValue"
        placeholder="搜索游戏、服务、用户"
        shape="round"
        background="transparent"
        @search="onSearch"
      />
      <div class="location-info">
        <van-icon name="location-o" />
        <span>当前位置</span>
      </div>
    </div>

    <!-- 轮播图 -->
    <van-swipe class="banner-swipe" :autoplay="3000" indicator-color="white">
      <van-swipe-item v-for="(banner, index) in banners" :key="index">
        <div class="banner-content">
          <img :src="banner.image" :alt="banner.title" class="banner-image" />
          <div class="banner-overlay">
            <h3>{{ banner.title }}</h3>
            <p>{{ banner.subtitle }}</p>
          </div>
        </div>
      </van-swipe-item>
    </van-swipe>

    <!-- 快捷入口 -->
    <div class="quick-entry card">
      <van-grid :column-num="4" :border="false">
        <van-grid-item 
          v-for="item in quickEntries" 
          :key="item.name" 
          :icon="item.icon" 
          :text="item.name" 
          @click="item.onClick"
          class="quick-entry-item"
        />
      </van-grid>
    </div>

    <!-- 数据统计 -->
    <div class="stats-section card">
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-number">{{ stats.totalUsers }}</div>
          <div class="stat-label">注册用户</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">{{ stats.totalOrders }}</div>
          <div class="stat-label">成功订单</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">{{ stats.totalGames }}</div>
          <div class="stat-label">支持游戏</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">{{ stats.successRate }}%</div>
          <div class="stat-label">成功率</div>
        </div>
      </div>
    </div>

    <!-- 热门游戏 -->
    <div class="section">
      <div class="section-header flex-between">
        <div class="section-title">
          <van-icon name="fire-o" class="title-icon" />
          <h3>热门游戏</h3>
        </div>
        <van-button type="primary" size="small" plain @click="$router.push('/games')">
          查看更多
          <van-icon name="arrow" />
        </van-button>
      </div>
      <div class="game-grid">
        <div v-for="game in hotGames" :key="game.id" class="game-card" @click="$router.push(`/game/${game.id}`)">
          <div class="game-image-wrapper">
            <img :src="game.image" :alt="game.name" class="game-image" />
            <div class="game-badge" v-if="game.isHot">HOT</div>
          </div>
          <div class="game-info">
            <div class="game-title">{{ game.name }}</div>
            <div class="game-desc">{{ game.description }}</div>
            <div class="game-meta">
              <span class="price">¥{{ game.price }}</span>
              <span class="orders">{{ game.orderCount }}单</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 推荐服务 -->
    <div class="section">
      <div class="section-header flex-between">
        <div class="section-title">
          <van-icon name="star-o" class="title-icon" />
          <h3>推荐服务</h3>
        </div>
        <van-button type="primary" size="small" plain @click="$router.push('/services')">
          查看更多
          <van-icon name="arrow" />
        </van-button>
      </div>
      <div class="service-list">
        <div v-for="service in recommendServices" :key="service.id" class="service-item card" @click="viewService(service.id)">
          <div class="service-header">
            <img :src="service.provider.avatar" :alt="service.provider.name" class="provider-avatar" />
            <div class="provider-info">
              <div class="provider-name">{{ service.provider.name }}</div>
              <div class="provider-rating">
                <van-rate v-model="service.provider.rating" readonly size="12" />
                <span class="rating-text">{{ service.provider.rating }}</span>
              </div>
            </div>
            <van-tag type="success" size="small">{{ service.type }}</van-tag>
          </div>
          <div class="service-content">
            <h4>{{ service.title }}</h4>
            <p>{{ service.description }}</p>
          </div>
          <div class="service-footer">
            <div class="service-price">
              <span class="price-label">起步价</span>
              <span class="price-value">¥{{ service.price }}</span>
            </div>
            <div class="service-stats">
              <span class="stat-item">{{ service.completedCount }}完成</span>
              <span class="stat-item">{{ service.responseTime }}响应</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 安全保障 -->
    <div class="security-section card">
      <div class="security-header">
        <van-icon name="shield-o" class="security-icon" />
        <h3>安全保障</h3>
      </div>
      <div class="security-grid">
        <div class="security-item" v-for="item in securityFeatures" :key="item.title">
          <van-icon :name="item.icon" />
          <span>{{ item.title }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const searchValue = ref('')

// 轮播图数据
const banners = ref([
  {
    image: 'https://picsum.photos/seed/banner1/375/180.jpg',
    title: '新人专享优惠',
    subtitle: '首单立减20元，更有专属客服服务'
  },
  {
    image: 'https://picsum.photos/seed/banner2/375/180.jpg',
    title: '担保交易安全',
    subtitle: '平台担保，资金安全，交易无忧'
  },
  {
    image: 'https://picsum.photos/seed/banner3/375/180.jpg',
    title: '专业代练团队',
    subtitle: '1000+认证代练，24小时在线服务'
  }
])

// 快捷入口
const quickEntries = ref([
  {
    name: '发起担保',
    icon: 'shield-o',
    onClick: () => router.push('/orders/create')
  },
  {
    name: '客服中心',
    icon: 'service',
    onClick: () => router.push('/support')
  }
])

// 数据统计
const stats = ref({
  totalUsers: '12.5K',
  totalOrders: '8.9K',
  totalGames: '2',
  successRate: 99.8
})

// 热门游戏
const hotGames = ref([
  {
    id: 1,
    name: '王者荣耀',
    description: '热门MOBA手游代练',
    image: 'https://picsum.photos/seed/game1/200/120.jpg',
    price: '15-50',
    orderCount: 1234,
    isHot: true
  },
  {
    id: 2,
    name: '三角洲',
    description: '经典战术射击游戏',
    image: 'https://picsum.photos/seed/game2/200/120.jpg',
    price: '20-80',
    orderCount: 856,
    isHot: true
  }
])

// 推荐服务
const recommendServices = ref([
  {
    id: 1,
    title: '王者荣耀段位提升',
    description: '专业代练团队，快速安全上分，支持所有段位',
    type: '段位代练',
    price: 15,
    completedCount: 2341,
    responseTime: '5分钟',
    provider: {
      name: '王者代练工作室',
      avatar: 'https://picsum.photos/seed/provider1/40/40.jpg',
      rating: 4.8
    }
  },
  {
    id: 2,
    title: '三角洲武器解锁',
    description: '全武器解锁服务，支持各种模式，安全可靠',
    type: '武器解锁',
    price: 30,
    completedCount: 1823,
    responseTime: '10分钟',
    provider: {
      name: '三角洲专家',
      avatar: 'https://picsum.photos/seed/provider2/40/40.jpg',
      rating: 4.9
    }
  }
])

// 安全保障特性
const securityFeatures = ref([
  {
    icon: 'shield-o',
    title: '资金担保'
  },
  {
    icon: 'user-circle-o',
    title: '实名认证'
  },
  {
    icon: 'clock-o',
    title: '24小时客服'
  },
  {
    icon: 'medal-o',
    title: '品质保证'
  }
])

const onSearch = (value) => {
  if (value.trim()) {
    router.push(`/search?q=${encodeURIComponent(value)}`)
  }
}

const viewService = (serviceId) => {
  // 暂时跳转到需求详情页面
  router.push(`/demand/${serviceId}`)
}
</script>

<style lang="scss" scoped>
.home {
  padding-top: 0;
  background: linear-gradient(180deg, #f8f9ff 0%, #f7f8fa 100%);
}

// 搜索头部
.search-header {
  position: relative;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 12px 16px 20px;
  
  .van-search {
    padding: 8px 0;
    
    :deep(.van-search__content) {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
    }
  }
  
  .location-info {
    position: absolute;
    right: 16px;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    align-items: center;
    gap: 4px;
    color: white;
    font-size: 12px;
    
    .van-icon {
      font-size: 14px;
    }
  }
}

// 轮播图
.banner-swipe {
  height: 180px;
  margin: 8px 16px 16px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  
  .banner-content {
    position: relative;
    height: 100%;
    
    .banner-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .banner-overlay {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
      color: white;
      padding: 20px 16px 16px;
      
      h3 {
        margin: 0 0 4px;
        font-size: 18px;
        font-weight: 600;
      }
      
      p {
        margin: 0;
        font-size: 12px;
        opacity: 0.9;
      }
    }
  }
}

// 快捷入口
.quick-entry {
  margin: 0 16px 20px;
  background: white;
  border-radius: 12px;
  padding: 20px 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  
  .quick-entry-item {
    :deep(.van-grid-item__content) {
      padding: 12px 8px;
      
      &:active {
        background: #f2f3f5;
        border-radius: 8px;
      }
    }
    
    :deep(.van-grid-item__icon) {
      font-size: 24px;
      margin-bottom: 8px;
    }
    
    :deep(.van-grid-item__text) {
      font-size: 12px;
      color: #323233;
    }
  }
}

// 数据统计
.stats-section {
  margin: 0 16px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 20px;
  color: white;
  
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    
    .stat-item {
      text-align: center;
      
      .stat-number {
        font-size: 20px;
        font-weight: 700;
        margin-bottom: 4px;
      }
      
      .stat-label {
        font-size: 12px;
        opacity: 0.9;
      }
    }
  }
}

// 通用区块样式
.section {
  margin-bottom: 24px;
  
  .section-header {
    padding: 0 16px;
    margin-bottom: 16px;
    
    .section-title {
      display: flex;
      align-items: center;
      gap: 8px;
      
      .title-icon {
        color: #1989fa;
        font-size: 20px;
      }
      
      h3 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        color: #323233;
      }
    }
    
    .van-button {
      :deep(.van-icon) {
        margin-left: 4px;
        font-size: 12px;
      }
    }
  }
}

// 游戏网格
.game-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  padding: 0 16px;
  
  .game-card {
    background: white;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:active {
      transform: scale(0.98);
      box-shadow: 0 1px 6px rgba(0, 0, 0, 0.08);
    }
    
    .game-image-wrapper {
      position: relative;
      
      .game-image {
        width: 100%;
        height: 120px;
        object-fit: cover;
      }
      
      .game-badge {
        position: absolute;
        top: 8px;
        right: 8px;
        background: linear-gradient(135deg, #ff6b6b, #ff8e53);
        color: white;
        font-size: 10px;
        font-weight: 600;
        padding: 2px 6px;
        border-radius: 4px;
      }
    }
    
    .game-info {
      padding: 12px;
      
      .game-title {
        font-size: 14px;
        font-weight: 600;
        margin-bottom: 4px;
        color: #323233;
      }
      
      .game-desc {
        font-size: 12px;
        color: #969799;
        line-height: 1.4;
        margin-bottom: 8px;
      }
      
      .game-meta {
        display: flex;
        justify-content: space-between;
        align-items: center;
        
        .price {
          font-size: 14px;
          font-weight: 600;
          color: #ee0a24;
        }
        
        .orders {
          font-size: 11px;
          color: #969799;
        }
      }
    }
  }
}

// 服务列表
.service-list {
  padding: 0 16px;
  
  .service-item {
    margin-bottom: 12px;
    padding: 16px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:active {
      transform: scale(0.98);
      box-shadow: 0 1px 6px rgba(0, 0, 0, 0.08);
    }
    
    .service-header {
      display: flex;
      align-items: center;
      margin-bottom: 12px;
      
      .provider-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        margin-right: 12px;
      }
      
      .provider-info {
        flex: 1;
        
        .provider-name {
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 2px;
        }
        
        .provider-rating {
          display: flex;
          align-items: center;
          gap: 4px;
          
          .rating-text {
            font-size: 12px;
            color: #969799;
          }
        }
      }
    }
    
    .service-content {
      margin-bottom: 12px;
      
      h4 {
        margin: 0 0 4px;
        font-size: 15px;
        font-weight: 600;
        color: #323233;
      }
      
      p {
        margin: 0;
        font-size: 13px;
        color: #646566;
        line-height: 1.5;
      }
    }
    
    .service-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 12px;
      border-top: 1px solid #ebedf0;
      
      .service-price {
        display: flex;
        align-items: baseline;
        gap: 4px;
        
        .price-label {
          font-size: 12px;
          color: #969799;
        }
        
        .price-value {
          font-size: 16px;
          font-weight: 600;
          color: #ee0a24;
        }
      }
      
      .service-stats {
        display: flex;
        gap: 12px;
        
        .stat-item {
          font-size: 11px;
          color: #969799;
        }
      }
    }
  }
}

// 安全保障
.security-section {
  margin: 0 16px 20px;
  background: linear-gradient(135deg, #f8f9ff 0%, #e8f4ff 100%);
  border: 1px solid #e1f5ff;
  
  .security-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;
    
    .security-icon {
      font-size: 20px;
      color: #1989fa;
    }
    
    h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: #323233;
    }
  }
  
  .security-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    
    .security-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      
      .van-icon {
        font-size: 20px;
        color: #1989fa;
      }
      
      span {
        font-size: 12px;
        color: #646566;
      }
    }
  }
}

// 响应式设计
@media (max-width: 375px) {
  .stats-grid {
    gap: 12px;
    
    .stat-number {
      font-size: 18px !important;
    }
  }
  
  .security-grid {
    gap: 12px;
  }
}
</style>