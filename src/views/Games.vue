<template>
  <div class="games page-container">
    <!-- 顶部搜索栏 -->
    <van-search
      v-model="searchValue"
      placeholder="搜索游戏"
      shape="round"
      @search="onSearch"
    />

    <!-- 游戏分类 -->
    <van-tabs v-model:active="activeCategory" sticky>
      <van-tab title="全部" name="all">
        <div class="game-list">
          <div v-for="game in filteredGames" :key="game.id" class="game-item card" @click="$router.push(`/game/${game.id}`)">
            <img :src="game.image" :alt="game.name" class="game-image" />
            <div class="game-info">
              <h4>{{ game.name }}</h4>
              <p>{{ game.description }}</p>
              <div class="game-stats">
                <span class="stat-item">
                  <van-icon name="friends-o" />
                  {{ game.onlineCount }}人在线
                </span>
                <span class="stat-item">
                  <van-icon name="orders-o" />
                  {{ game.orderCount }}笔交易
                </span>
              </div>
            </div>
          </div>
        </div>
      </van-tab>
      
      <van-tab v-for="category in categories" :key="category.name" :title="category.name" :name="category.name">
        <div class="game-list">
          <div v-for="game in getGamesByCategory(category.name)" :key="game.id" class="game-item card" @click="$router.push(`/game/${game.id}`)">
            <img :src="game.image" :alt="game.name" class="game-image" />
            <div class="game-info">
              <h4>{{ game.name }}</h4>
              <p>{{ game.description }}</p>
              <div class="game-stats">
                <span class="stat-item">
                  <van-icon name="friends-o" />
                  {{ game.onlineCount }}人在线
                </span>
                <span class="stat-item">
                  <van-icon name="orders-o" />
                  {{ game.orderCount }}笔交易
                </span>
              </div>
            </div>
          </div>
        </div>
      </van-tab>
    </van-tabs>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const searchValue = ref('')
const activeCategory = ref('all')

// 游戏分类
const categories = ref([
  { name: 'MOBA', icon: 'fire-o' },
  { name: '射击', icon: 'aim' }
])

// 游戏数据
const games = ref([
  {
    id: 1,
    name: '王者荣耀',
    category: 'MOBA',
    description: '5v5公平竞技手游，热门代练游戏',
    image: 'https://picsum.photos/seed/wzry/100/100.jpg',
    onlineCount: 12580,
    orderCount: 3421
  },
  {
    id: 2,
    name: '三角洲',
    category: '射击',
    description: '经典战术射击游戏，段位代练热门',
    image: 'https://picsum.photos/seed/sjz/100/100.jpg',
    onlineCount: 8976,
    orderCount: 2341
  }
])

// 过滤后的游戏列表
const filteredGames = computed(() => {
  if (!searchValue.value) return games.value
  
  return games.value.filter(game => 
    game.name.toLowerCase().includes(searchValue.value.toLowerCase()) ||
    game.description.toLowerCase().includes(searchValue.value.toLowerCase())
  )
})

// 根据分类获取游戏
const getGamesByCategory = (category) => {
  return games.value.filter(game => game.category === category)
}

const onSearch = (value) => {
  console.log('搜索游戏:', value)
}
</script>

<style lang="scss" scoped>
.games {
  padding-top: 0;
}

.game-list {
  padding: 16px;
}

.game-item {
  display: flex;
  align-items: center;
  padding: 16px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: transform 0.2s;
  
  &:active {
    transform: scale(0.98);
  }
  
  .game-image {
    width: 60px;
    height: 60px;
    border-radius: 12px;
    margin-right: 16px;
    object-fit: cover;
  }
  
  .game-info {
    flex: 1;
    
    h4 {
      margin: 0 0 8px 0;
      font-size: 16px;
      font-weight: 600;
    }
    
    p {
      margin: 0 0 12px 0;
      font-size: 14px;
      color: #969799;
      line-height: 1.4;
    }
    
    .game-stats {
      display: flex;
      gap: 16px;
      
      .stat-item {
        display: flex;
        align-items: center;
        gap: 4px;
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