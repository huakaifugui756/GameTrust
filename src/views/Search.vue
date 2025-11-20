<template>
  <div class="search page-container">
    <!-- 搜索栏 -->
    <div class="search-header">
      <van-search
        v-model="searchQuery"
        placeholder="搜索游戏、服务、用户"
        show-action
        @search="onSearch"
        @cancel="$router.go(-1)"
        autofocus
      />
    </div>

    <!-- 搜索历史 -->
    <div class="search-history card" v-if="!searchQuery && searchHistory.length">
      <div class="history-header">
        <h3>搜索历史</h3>
        <van-icon name="delete-o" @click="clearHistory" />
      </div>
      <div class="history-tags">
        <van-tag
          v-for="item in searchHistory"
          :key="item"
          type="primary"
          plain
          size="medium"
          @click="searchQuery = item; onSearch(item)"
        >
          {{ item }}
        </van-tag>
      </div>
    </div>

    <!-- 热门搜索 -->
    <div class="hot-search card" v-if="!searchQuery">
      <h3>热门搜索</h3>
      <div class="hot-tags">
        <van-tag
          v-for="item in hotSearches"
          :key="item"
          :type="item.type"
          size="medium"
          @click="searchQuery = item.text; onSearch(item.text)"
        >
          {{ item.text }}
        </van-tag>
      </div>
    </div>

    <!-- 搜索结果 -->
    <div class="search-results" v-if="searchQuery">
      <!-- 结果分类标签 -->
      <van-tabs v-model:active="activeTab" sticky>
        <van-tab title="全部" name="all">
          <div class="result-section">
            <div class="section-title">需求</div>
            <DemandList :demands="searchResults.demands" @view-demand="viewDemand" />
            
            <div class="section-title">游戏</div>
            <GameList :games="searchResults.games" @view-game="viewGame" />
            
            <div class="section-title">用户</div>
            <UserList :users="searchResults.users" @view-user="viewUser" />
          </div>
        </van-tab>
        
        <van-tab title="需求" name="demands">
          <DemandList :demands="searchResults.demands" @view-demand="viewDemand" />
        </van-tab>
        
        <van-tab title="游戏" name="games">
          <GameList :games="searchResults.games" @view-game="viewGame" />
        </van-tab>
        
        <van-tab title="用户" name="users">
          <UserList :users="searchResults.users" @view-user="viewUser" />
        </van-tab>
      </van-tabs>
    </div>

    <!-- 空状态 -->
    <van-empty
      v-if="searchQuery && !hasResults"
      description="没有找到相关结果"
      image="search"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast } from 'vant'
import DemandList from '@/components/DemandList.vue'
import GameList from '@/components/GameList.vue'
import UserList from '@/components/UserList.vue'

const router = useRouter()
const route = useRoute()

const searchQuery = ref('')
const activeTab = ref('all')
const searchHistory = ref([])
const searching = ref(false)

// 热门搜索
const hotSearches = ref([
  { text: '王者荣耀', type: 'danger' },
  { text: '代练', type: 'primary' },
  { text: '和平精英', type: 'success' },
  { text: '陪玩', type: 'warning' },
  { text: '原神', type: 'primary' },
  { text: '账号交易', type: 'default' },
  { text: '三角洲', type: 'success' },
  { text: '上分', type: 'danger' }
])

// 搜索结果
const searchResults = reactive({
  demands: [],
  games: [],
  users: []
})

// 是否有搜索结果
const hasResults = computed(() => {
  return searchResults.demands.length > 0 || 
         searchResults.games.length > 0 || 
         searchResults.users.length > 0
})

// 模拟数据
const mockDemands = [
  {
    id: 1,
    title: '王者荣耀星耀段位，需要代练上王者',
    type: '代练',
    gameName: '王者荣耀',
    description: '当前星耀二，需要上到王者段位。要求效率高，信誉好的代练。',
    minPrice: 50,
    maxPrice: 100,
    status: '待接单',
    publisher: {
      name: '游戏小王',
      avatar: 'https://picsum.photos/seed/user1/32/32.jpg'
    }
  }
]

const mockGames = [
  {
    id: 1,
    name: '王者荣耀',
    category: 'MOBA',
    description: '5v5公平竞技手游，热门代练游戏',
    image: 'https://picsum.photos/seed/wzry/100/100.jpg',
    onlineCount: 12580,
    orderCount: 3421
  }
]

const mockUsers = [
  {
    id: 1,
    name: '代练达人',
    avatar: 'https://picsum.photos/seed/provider1/40/40.jpg',
    rating: 4.8,
    specialty: '王者荣耀、和平精英',
    orderCount: 234,
    successRate: 99.5
  }
]

onMounted(() => {
  // 从路由参数获取搜索关键词
  if (route.query.q) {
    searchQuery.value = route.query.q
    onSearch(route.query.q)
  }
  
  loadSearchHistory()
})

const loadSearchHistory = () => {
  const history = localStorage.getItem('searchHistory')
  if (history) {
    searchHistory.value = JSON.parse(history)
  }
}

const saveSearchHistory = (query) => {
  if (!query.trim()) return
  
  const history = [...searchHistory.value]
  const index = history.indexOf(query)
  
  if (index > -1) {
    history.splice(index, 1)
  }
  
  history.unshift(query)
  
  // 只保留最近10条
  if (history.length > 10) {
    history.splice(10)
  }
  
  searchHistory.value = history
  localStorage.setItem('searchHistory', JSON.stringify(history))
}

const onSearch = async (query) => {
  if (!query || !query.trim()) {
    showToast('请输入搜索关键词')
    return
  }
  
  searching.value = true
  searchQuery.value = query.trim()
  
  try {
    // 保存搜索历史
    saveSearchHistory(searchQuery.value)
    
    // 模拟搜索API调用
    await new Promise(resolve => setTimeout(resolve, 800))
    
    // 模拟搜索结果
    const keyword = searchQuery.value.toLowerCase()
    
    // 搜索需求
    searchResults.demands = mockDemands.filter(demand => 
      demand.title.toLowerCase().includes(keyword) ||
      demand.description.toLowerCase().includes(keyword) ||
      demand.gameName.toLowerCase().includes(keyword) ||
      demand.type.toLowerCase().includes(keyword)
    )
    
    // 搜索游戏
    searchResults.games = mockGames.filter(game => 
      game.name.toLowerCase().includes(keyword) ||
      game.description.toLowerCase().includes(keyword) ||
      game.category.toLowerCase().includes(keyword)
    )
    
    // 搜索用户
    searchResults.users = mockUsers.filter(user => 
      user.name.toLowerCase().includes(keyword) ||
      user.specialty.toLowerCase().includes(keyword)
    )
    
  } catch (error) {
    showToast('搜索失败，请重试')
  } finally {
    searching.value = false
  }
}

const clearHistory = () => {
  searchHistory.value = []
  localStorage.removeItem('searchHistory')
  showToast('搜索历史已清空')
}

const viewDemand = (id) => {
  router.push(`/demand/${id}`)
}

const viewGame = (id) => {
  router.push(`/game/${id}`)
}

const viewUser = (id) => {
  router.push(`/profile/${id}`)
}
</script>

<style lang="scss" scoped>
.search {
  background: #f7f8fa;
  padding-bottom: 60px;
}

.search-header {
  position: sticky;
  top: 0;
  z-index: 10;
  background: white;
  border-bottom: 1px solid #ebedf0;
}

.search-history, .hot-search {
  margin: 16px;
  
  .history-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    
    h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
    }
    
    .van-icon {
      color: #969799;
      cursor: pointer;
      
      &:active {
        color: #323233;
      }
    }
  }
  
  h3 {
    margin: 0 0 16px;
    font-size: 16px;
    font-weight: 600;
  }
  
  .history-tags, .hot-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    
    .van-tag {
      cursor: pointer;
      
      &:active {
        opacity: 0.8;
      }
    }
  }
}

.search-results {
  .result-section {
    padding: 16px;
    
    .section-title {
      font-size: 16px;
      font-weight: 600;
      color: #323233;
      margin: 24px 0 12px;
      
      &:first-child {
        margin-top: 0;
      }
    }
  }
}
</style>