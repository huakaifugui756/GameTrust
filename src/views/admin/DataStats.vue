<template>
  <div class="data-stats page-container">
    <!-- 导航栏 -->
    <van-nav-bar title="数据统计" class="stats-nav">
      <template #left>
        <van-icon name="arrow-left" @click="$router.go(-1)" />
      </template>
    </van-nav-bar>

    <!-- 时间筛选 -->
    <div class="time-filter">
      <van-tabs v-model:active="timeRange" @change="onTimeRangeChange">
        <van-tab title="今日" name="today" />
        <van-tab title="本周" name="week" />
        <van-tab title="本月" name="month" />
        <van-tab title="全部" name="all" />
      </van-tabs>
    </div>

    <!-- 核心指标 -->
    <div class="core-metrics">
      <h3>核心指标</h3>
      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-icon">
            <van-icon name="friends-o" />
          </div>
          <div class="metric-content">
            <div class="metric-value">{{ stats.totalUsers }}</div>
            <div class="metric-label">总用户数</div>
            <div class="metric-change" :class="{ 'positive': stats.userGrowth > 0 }">
              <van-icon :name="stats.userGrowth > 0 ? 'arrow-up' : 'arrow-down'" />
              {{ Math.abs(stats.userGrowth) }}%
            </div>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon">
            <van-icon name="orders-o" />
          </div>
          <div class="metric-content">
            <div class="metric-value">{{ stats.totalOrders }}</div>
            <div class="metric-label">总订单数</div>
            <div class="metric-change" :class="{ 'positive': stats.orderGrowth > 0 }">
              <van-icon :name="stats.orderGrowth > 0 ? 'arrow-up' : 'arrow-down'" />
              {{ Math.abs(stats.orderGrowth) }}%
            </div>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon">
            <van-icon name="balance-o" />
          </div>
          <div class="metric-content">
            <div class="metric-value">¥{{ stats.totalRevenue }}</div>
            <div class="metric-label">总收入</div>
            <div class="metric-change" :class="{ 'positive': stats.revenueGrowth > 0 }">
              <van-icon :name="stats.revenueGrowth > 0 ? 'arrow-up' : 'arrow-down'" />
              {{ Math.abs(stats.revenueGrowth) }}%
            </div>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon">
            <van-icon name="success" />
          </div>
          <div class="metric-content">
            <div class="metric-value">{{ stats.successRate }}%</div>
            <div class="metric-label">成功率</div>
            <div class="metric-change" :class="{ 'positive': stats.successRateChange > 0 }">
              <van-icon :name="stats.successRateChange > 0 ? 'arrow-up' : 'arrow-down'" />
              {{ Math.abs(stats.successRateChange) }}%
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 图表区域 -->
    <div class="charts-section">
      <h3>趋势分析</h3>
      
      <!-- 订单趋势图 -->
      <div class="chart-card">
        <div class="chart-header">
          <h4>订单趋势</h4>
          <van-tag type="primary" size="small">{{ timeRangeText }}</van-tag>
        </div>
        <div class="chart-placeholder">
          <van-icon name="chart-trending-o" />
          <p>订单趋势图表</p>
          <span>{{ orderTrendData.length }} 个数据点</span>
        </div>
      </div>

      <!-- 收入分析 -->
      <div class="chart-card">
        <div class="chart-header">
          <h4>收入分析</h4>
          <van-tag type="success" size="small">{{ timeRangeText }}</van-tag>
        </div>
        <div class="chart-placeholder">
          <van-icon name="bar-chart-o" />
          <p>收入分析图表</p>
          <span>总收入: ¥{{ stats.totalRevenue }}</span>
        </div>
      </div>
    </div>

    <!-- 详细数据 -->
    <div class="detailed-stats">
      <h3>详细数据</h3>
      
      <van-cell-group>
        <van-cell title="新增用户" :value="stats.newUsers" />
        <van-cell title="活跃用户" :value="stats.activeUsers" />
        <van-cell title="新增订单" :value="stats.newOrders" />
        <van-cell title="完成订单" :value="stats.completedOrders" />
        <van-cell title="平均订单金额" :value="`¥${stats.avgOrderAmount}`" />
        <van-cell title="担保费收入" :value="`¥${stats.guaranteeFeeRevenue}`" />
      </van-cell-group>
    </div>

    <!-- 热门游戏排行 -->
    <div class="game-ranking">
      <h3>热门游戏排行</h3>
      <div class="ranking-list">
        <div 
          v-for="(game, index) in gameRanking" 
          :key="game.id"
          class="ranking-item"
        >
          <div class="rank-number" :class="{ 'top-three': index < 3 }">
            {{ index + 1 }}
          </div>
          <div class="game-info">
            <img :src="game.image" :alt="game.name" />
            <div class="game-details">
              <div class="game-name">{{ game.name }}</div>
              <div class="game-orders">{{ game.orderCount }} 单</div>
            </div>
          </div>
          <div class="game-revenue">¥{{ game.revenue }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'

const router = useRouter()
const timeRange = ref('month')

// 统计数据
const stats = ref({
  totalUsers: 12580,
  userGrowth: 12.5,
  totalOrders: 3421,
  orderGrowth: 8.3,
  totalRevenue: 256890,
  revenueGrowth: 15.7,
  successRate: 98.5,
  successRateChange: 2.1,
  newUsers: 156,
  activeUsers: 3240,
  newOrders: 89,
  completedOrders: 76,
  avgOrderAmount: 75.6,
  guaranteeFeeRevenue: 12845
})

// 订单趋势数据
const orderTrendData = ref([
  { date: '01-01', orders: 45 },
  { date: '01-02', orders: 52 },
  { date: '01-03', orders: 38 },
  { date: '01-04', orders: 61 },
  { date: '01-05', orders: 49 },
  { date: '01-06', orders: 73 },
  { date: '01-07', orders: 58 }
])

// 游戏排行数据
const gameRanking = ref([
  {
    id: 1,
    name: '王者荣耀',
    image: 'https://picsum.photos/seed/wzry/40/40.jpg',
    orderCount: 1234,
    revenue: 98720
  },
  {
    id: 2,
    name: '英雄联盟',
    image: 'https://picsum.photos/seed/lol/40/40.jpg',
    orderCount: 856,
    revenue: 68480
  },
  {
    id: 3,
    name: '和平精英',
    image: 'https://picsum.photos/seed/pubg/40/40.jpg',
    orderCount: 623,
    revenue: 49840
  },
  {
    id: 4,
    name: '原神',
    image: 'https://picsum.photos/seed/ys/40/40.jpg',
    orderCount: 412,
    revenue: 32960
  },
  {
    id: 5,
    name: '穿越火线',
    image: 'https://picsum.photos/seed/cf/40/40.jpg',
    orderCount: 296,
    revenue: 23680
  }
])

onMounted(() => {
  loadStats()
})

const loadStats = () => {
  console.log('加载统计数据')
  // 根据时间范围加载数据
  updateStatsByTimeRange()
}

const onTimeRangeChange = (value) => {
  console.log('时间范围变更:', value)
  updateStatsByTimeRange()
}

const updateStatsByTimeRange = () => {
  // 模拟根据时间范围更新数据
  switch (timeRange.value) {
    case 'today':
      stats.value.totalUsers = 12580
      stats.value.totalOrders = 89
      stats.value.totalRevenue = 6780
      break
    case 'week':
      stats.value.totalUsers = 12580
      stats.value.totalOrders = 456
      stats.value.totalRevenue = 34560
      break
    case 'month':
      stats.value.totalUsers = 12580
      stats.value.totalOrders = 3421
      stats.value.totalRevenue = 256890
      break
    case 'all':
      stats.value.totalUsers = 12580
      stats.value.totalOrders = 15678
      stats.value.totalRevenue = 1234567
      break
  }
}

// 计算属性
const timeRangeText = computed(() => {
  const textMap = {
    today: '今日',
    week: '本周',
    month: '本月',
    all: '全部'
  }
  return textMap[timeRange.value] || '本月'
})
</script>

<style lang="scss" scoped>
.data-stats {
  padding-top: 0;
  background: #f7f8fa;
  min-height: 100vh;
}

.stats-nav {
  background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
  color: white;

  :deep(.van-nav-bar__title) {
    color: white;
    font-weight: 600;
  }

  :deep(.van-icon) {
    color: white;
  }
}

.time-filter {
  background: white;
  margin-bottom: 8px;
}

.core-metrics,
.charts-section,
.detailed-stats,
.game-ranking {
  margin: 16px;

  h3 {
    margin: 0 0 12px 0;
    font-size: 16px;
    font-weight: 600;
    color: #323233;
  }
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;

  .metric-card {
    background: white;
    border-radius: 8px;
    padding: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    display: flex;
    align-items: center;

    .metric-icon {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 12px;

      .van-icon {
        font-size: 20px;
        color: white;
      }
    }

    .metric-content {
      flex: 1;

      .metric-value {
        font-size: 18px;
        font-weight: 600;
        color: #333;
        margin-bottom: 4px;
      }

      .metric-label {
        font-size: 12px;
        color: #999;
        margin-bottom: 4px;
      }

      .metric-change {
        font-size: 12px;
        display: flex;
        align-items: center;
        gap: 2px;

        &.positive {
          color: #07c160;
        }

        &:not(.positive) {
          color: #ee0a24;
        }

        .van-icon {
          font-size: 12px;
        }
      }
    }
  }
}

.charts-section {
  .chart-card {
    background: white;
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;

      h4 {
        margin: 0;
        font-size: 14px;
        font-weight: 600;
        color: #333;
      }
    }

    .chart-placeholder {
      text-align: center;
      padding: 40px 20px;
      background: #f8f9fa;
      border-radius: 8px;

      .van-icon {
        font-size: 48px;
        color: #ddd;
        margin-bottom: 8px;
      }

      p {
        margin: 0 0 4px 0;
        font-size: 14px;
        color: #999;
      }

      span {
        font-size: 12px;
        color: #ccc;
      }
    }
  }
}

.game-ranking {
  .ranking-list {
    .ranking-item {
      display: flex;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid #f0f0f0;

      &:last-child {
        border-bottom: none;
      }

      .rank-number {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: #f0f0f0;
        color: #999;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: 600;
        margin-right: 12px;

        &.top-three {
          background: linear-gradient(135deg, #ffd700 0%, #ffb300 100%);
          color: white;
        }
      }

      .game-info {
        flex: 1;
        display: flex;
        align-items: center;

        img {
          width: 32px;
          height: 32px;
          border-radius: 6px;
          margin-right: 8px;
          object-fit: cover;
        }

        .game-details {
          .game-name {
            font-size: 14px;
            font-weight: 500;
            color: #333;
            margin-bottom: 2px;
          }

          .game-orders {
            font-size: 12px;
            color: #999;
          }
        }
      }

      .game-revenue {
        font-size: 14px;
        font-weight: 600;
        color: #ee0a24;
      }
    }
  }
}
</style>