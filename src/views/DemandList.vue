<template>
  <div class="demand-list page-container">
    <!-- 顶部导航 -->
    <van-nav-bar
      title="需求大厅"
      left-text="返回"
      left-arrow
      @click-left="$router.go(-1)"
    >
      <template #right>
        <van-icon name="plus" @click="$router.push('/demand/create')" />
      </template>
    </van-nav-bar>

    <!-- 筛选栏 -->
    <div class="filter-bar">
      <van-dropdown-menu>
        <van-dropdown-item v-model="filters.type" :options="typeOptions" @change="onFilterChange" />
        <van-dropdown-item v-model="filters.game" :options="gameOptions" @change="onFilterChange" />
        <van-dropdown-item v-model="filters.status" :options="statusOptions" @change="onFilterChange" />
        <van-dropdown-item v-model="filters.sort" :options="sortOptions" @change="onFilterChange" />
      </van-dropdown-menu>
    </div>

    <!-- 需求列表 -->
    <div class="list-content">
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <van-list
          v-model:loading="loading"
          :finished="finished"
          finished-text="没有更多了"
          @load="onLoad"
        >
          <div
            v-for="demand in demands"
            :key="demand.id"
            class="demand-item card"
            @click="viewDemand(demand.id)"
          >
            <!-- 需求头部 -->
            <div class="demand-header">
              <div class="demand-title" v-html="sanitizeHtml(demand.title)"></div>
              <van-tag :type="getStatusType(demand.status)" size="small">
                {{ demand.status }}
              </van-tag>
            </div>

            <!-- 需求信息 -->
            <div class="demand-info">
              <div class="meta-tags">
                <van-tag type="primary" size="small">{{ demand.type }}</van-tag>
                <van-tag type="success" size="small">{{ demand.gameName }}</van-tag>
              </div>
              <div class="price-range">¥{{ demand.minPrice }}-{{ demand.maxPrice }}</div>
            </div>

            <!-- 描述 -->
            <div class="demand-desc" v-html="sanitizeHtml(demand.description)"></div>

            <!-- 附加要求 -->
            <div class="requirements" v-if="demand.requirements?.length">
              <van-tag
                v-for="req in demand.requirements.slice(0, 2)"
                :key="req"
                type="warning"
                size="small"
              >
                {{ req }}
              </van-tag>
              <span v-if="demand.requirements.length > 2" class="more-reqs">
                +{{ demand.requirements.length - 2 }}
              </span>
            </div>

            <!-- 底部信息 -->
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
                <span class="stat-item">
                  <van-icon name="chat-o" />
                  {{ demand.comments }}
                </span>
              </div>
            </div>
          </div>
        </van-list>
      </van-pull-refresh>
    </div>

    <!-- 空状态 -->
    <van-empty v-if="!loading && !demands.length" description="暂无需求" />
    
    <!-- 发布需求浮动按钮 -->
    <van-floating-bubble
      axis="xy"
      icon="plus"
      @click="router.push('/demand/create')"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast } from 'vant'

const router = useRouter()
const route = useRoute()

// 数据状态
const demands = ref([])
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)
const page = ref(1)
const pageSize = 10

const defaultAvatar = 'https://picsum.photos/seed/default-avatar/32/32.jpg'

// 筛选条件
const filters = reactive({
  type: '',
  game: '',
  status: '',
  sort: 'latest'
})

// 筛选选项
const typeOptions = [
  { text: '全部类型', value: '' },
  { text: '代练', value: '代练' },
  { text: '陪玩', value: '陪玩' },
  { text: '咨询', value: '咨询' },
  { text: '其他', value: '其他' }
]

const gameOptions = [
  { text: '全部游戏', value: '' },
  { text: '王者荣耀', value: '王者荣耀' },
  { text: '和平精英', value: '和平精英' },
  { text: '三角洲', value: '三角洲' },
  { text: '原神', value: '原神' },
  { text: '英雄联盟', value: '英雄联盟' }
]

const statusOptions = [
  { text: '全部状态', value: '' },
  { text: '待接单', value: '待接单' },
  { text: '进行中', value: '进行中' },
  { text: '已完成', value: '已完成' }
]

const sortOptions = [
  { text: '最新发布', value: 'latest' },
  { text: '价格最高', value: 'price_high' },
  { text: '价格最低', value: 'price_low' },
  { text: '最多关注', value: 'popular' }
]

// 模拟数据
const mockDemands = [
  {
    id: 1,
    title: '王者荣耀星耀段位，需要代练上王者',
    type: '代练',
    gameName: '王者荣耀',
    description: '当前星耀二，需要上到王者段位。要求效率高，信誉好的代练。希望能在3天内完成。',
    minPrice: 50,
    maxPrice: 100,
    status: '待接单',
    requirements: ['需要直播', '账号安全', '效率优先'],
    createTime: '2024-01-15 10:30:00',
    views: 156,
    likes: 12,
    comments: 8,
    publisher: {
      name: '游戏小王',
      avatar: 'https://picsum.photos/seed/user1/32/32.jpg'
    }
  },
  {
    id: 2,
    title: '和平精英四排，需要靠谱队友一起上分',
    type: '陪玩',
    gameName: '和平精英',
    description: '钻石段位，想找几个靠谱的队友一起四排上分，要求有麦克风，配合默契。',
    minPrice: 20,
    maxPrice: 50,
    status: '待接单',
    requirements: ['有麦克风', '配合默契'],
    createTime: '2024-01-15 09:15:00',
    views: 89,
    likes: 6,
    comments: 3,
    publisher: {
      name: '和平精英爱好者',
      avatar: 'https://picsum.photos/seed/user2/32/32.jpg'
    }
  },
  {
    id: 3,
    title: '原神深渊12层满星攻略指导',
    type: '咨询',
    gameName: '原神',
    description: '需要大佬指导深渊12层满星攻略，有多个角色可以搭配，希望详细讲解阵容和打法。',
    minPrice: 30,
    maxPrice: 80,
    status: '进行中',
    requirements: ['经验丰富'],
    createTime: '2024-01-14 20:45:00',
    views: 234,
    likes: 18,
    comments: 12,
    publisher: {
      name: '原神萌新',
      avatar: 'https://picsum.photos/seed/user3/32/32.jpg'
    }
  }
]

// HTML 清理函数 - 防止 XSS 攻击
const sanitizeHtml = (text) => {
  if (!text) return ''
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

// 获取需求列表
const fetchDemands = async (isRefresh = false) => {
  try {
    if (isRefresh) {
      page.value = 1
      finished.value = false
    }

    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 模拟筛选逻辑 - 使用单次遍历优化性能
    let filteredDemands = mockDemands.filter(demand => {
      // 搜索筛选
      const searchKeyword = route.query.search?.toLowerCase()
      if (searchKeyword) {
        const searchText = `${demand.title} ${demand.description} ${demand.gameName}`.toLowerCase()
        if (!searchText.includes(searchKeyword)) return false
      }
      
      // 类型筛选
      if (filters.type && demand.type !== filters.type) return false
      // 游戏筛选
      if (filters.game && demand.gameName !== filters.game) return false
      // 状态筛选
      if (filters.status && demand.status !== filters.status) return false
      
      return true
    })

    // 排序逻辑 - 使用预定义的比较函数
    const sortFunctions = {
      price_high: (a, b) => b.maxPrice - a.maxPrice,
      price_low: (a, b) => a.minPrice - b.minPrice,
      popular: (a, b) => b.likes - a.likes,
      latest: (a, b) => new Date(b.createTime) - new Date(a.createTime)
    }

    filteredDemands.sort(sortFunctions[filters.sort] || sortFunctions.latest)

    // 分页逻辑
    const start = (page.value - 1) * pageSize
    const end = start + pageSize
    const pageData = filteredDemands.slice(start, end)

    if (isRefresh) {
      demands.value = pageData
    } else {
      demands.value.push(...pageData)
    }

    if (end >= filteredDemands.length) {
      finished.value = true
    }

    page.value++

  } catch (error) {
    console.error('获取需求列表失败:', error)
    showToast('加载失败')
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

// 下拉刷新
const onRefresh = () => {
  refreshing.value = true
  fetchDemands(true)
}

// 加载更多
const onLoad = () => {
  if (!refreshing.value) {
    loading.value = true
    fetchDemands()
  }
}

// 筛选变化
const onFilterChange = () => {
  fetchDemands(true)
}

// 查看需求详情
const viewDemand = (id) => {
  router.push(`/demand/${id}`)
}

// 获取状态类型
const getStatusType = (status) => {
  const statusMap = {
    '待接单': 'warning',
    '进行中': 'success',
    '已完成': 'primary',
    '已取消': 'danger'
  }
  return statusMap[status] || 'default'
}

// 格式化时间
const formatTime = (time) => {
  const date = new Date(time)
  const now = new Date()
  const diff = now - date
  
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  return `${Math.floor(diff / 86400000)}天前`
}

// 监听路由参数变化
watch(() => route.query.search, (newSearch) => {
  fetchDemands(true)
})

onMounted(() => {
  fetchDemands(true)
})
</script>

<style lang="scss" scoped>
.demand-list {
  background: #f7f8fa;
  padding-bottom: 60px;
}

.filter-bar {
  position: sticky;
  top: 46px;
  z-index: 10;
  background: white;
  border-bottom: 1px solid #ebedf0;
}

.list-content {
  padding: 16px;
}

.demand-item {
  margin-bottom: 12px;
  padding: 16px;
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
    display: -moz-box;
    display: box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    -moz-box-orient: vertical;
    box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    min-height: 42px; /* 确保至少有两行的高度 */
  }
  
  .demand-desc:empty {
    display: none;
  }
  
  .requirements {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 12px;
    
    .more-reqs {
      font-size: 12px;
      color: #969799;
    }
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
</style>