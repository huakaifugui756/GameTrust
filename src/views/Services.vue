<template>
  <div class="services-page page-container">
    <!-- 顶部导航 -->
    <van-nav-bar
      title="推荐服务"
      left-arrow
      @click-left="$router.go(-1)"
    />

    <!-- 筛选标签 -->
    <div class="filter-tabs">
      <van-tabs v-model:active="activeTab" @change="onTabChange">
        <van-tab title="全部" name="all" />
        <van-tab title="代练" name="代练" />
        <van-tab title="道具" name="道具" />
        <van-tab title="账号" name="账号" />
        <van-tab title="其他" name="其他" />
      </van-tabs>
    </div>

    <!-- 服务列表 -->
    <div class="services-list">
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <van-list
          v-model:loading="loading"
          :finished="finished"
          finished-text="没有更多了"
          @load="onLoad"
        >
          <div 
            v-for="service in filteredServices" 
            :key="service.id" 
            class="service-item"
            @click="viewService(service.id)"
          >
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
        </van-list>
      </van-pull-refresh>
    </div>

    <!-- 空状态 -->
    <van-empty 
      v-if="filteredServices.length === 0 && !loading" 
      description="暂无服务"
      image="https://picsum.photos/seed/empty-services/200/200.jpg"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const activeTab = ref('all')
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)
const services = ref([])

// 筛选后的服务
const filteredServices = computed(() => {
  if (activeTab.value === 'all') {
    return services.value
  }
  return services.value.filter(service => service.type === activeTab.value)
})

// 加载服务列表
const loadServices = () => {
  services.value = [
    {
      id: 1,
      title: '王者荣耀段位提升',
      description: '专业代练团队，快速安全上分，支持所有段位',
      type: '代练',
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
      type: '道具',
      price: 30,
      completedCount: 1823,
      responseTime: '10分钟',
      provider: {
        name: '三角洲专家',
        avatar: 'https://picsum.photos/seed/provider2/40/40.jpg',
        rating: 4.9
      }
    },
    {
      id: 3,
      title: '原神材料收集',
      description: '高效材料收集服务，解放你的双手',
      type: '代练',
      price: 25,
      completedCount: 987,
      responseTime: '15分钟',
      provider: {
        name: '原神助手',
        avatar: 'https://picsum.photos/seed/provider3/40/40.jpg',
        rating: 4.7
      }
    },
    {
      id: 4,
      title: '和平精英段位提升',
      description: '专业射击玩家代练，保证效率和安全',
      type: '代练',
      price: 20,
      completedCount: 1567,
      responseTime: '8分钟',
      provider: {
        name: '射击达人',
        avatar: 'https://picsum.photos/seed/provider4/40/40.jpg',
        rating: 4.6
      }
    },
    {
      id: 5,
      title: '高价值账号出售',
      description: '满级账号，多角色，装备齐全，安全交易',
      type: '账号',
      price: 599,
      completedCount: 234,
      responseTime: '30分钟',
      provider: {
        name: '账号商城',
        avatar: 'https://picsum.photos/seed/provider5/40/40.jpg',
        rating: 4.9
      }
    }
  ]
}

// 加载更多
const onLoad = () => {
  setTimeout(() => {
    loading.value = false
    finished.value = true
  }, 1000)
}

// 刷新
const onRefresh = () => {
  loadServices()
  setTimeout(() => {
    refreshing.value = false
  }, 1000)
}

// 标签切换
const onTabChange = (name) => {
  activeTab.value = name
}

// 查看服务详情
const viewService = (serviceId) => {
  // 暂时跳转到需求详情页面
  router.push(`/demand/${serviceId}`)
}

onMounted(() => {
  loadServices()
})
</script>

<style lang="scss" scoped>
.services-page {
  background: #f7f8fa;
  min-height: 100vh;
}

.filter-tabs {
  background: white;
  border-bottom: 1px solid #ebedf0;
}

.services-list {
  padding: 12px;
}

.service-item {
  background: white;
  border-radius: 12px;
  margin-bottom: 12px;
  padding: 16px;
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

// 响应式设计
@media (max-width: 375px) {
  .services-list {
    padding: 8px;
  }
  
  .service-item {
    padding: 12px;
  }
}
</style>