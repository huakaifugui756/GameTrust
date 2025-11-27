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
      <div class="header-actions">
        <div class="location-info" @click="refreshLocation">
          <van-icon name="location-o" />
          <span>{{ currentLocation }}</span>
        </div>
        <van-button
          size="small"
          type="primary"
          @click="goToAuth"
          class="login-btn"
        >
          {{ authStore.isLoggedIn ? "个人中心" : "登录/注册" }}
        </van-button>
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
        <van-button
          type="primary"
          size="small"
          plain
          @click="$router.push('/games')"
        >
          查看更多
          <van-icon name="arrow" />
        </van-button>
      </div>
      <div class="game-grid">
        <div
          v-for="game in hotGames"
          :key="game.id"
          class="game-card"
          @click="$router.push(`/game/${game.id}`)"
        >
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



    <!-- 安全保障 -->
    <div class="security-section card">
      <div class="security-header">
        <van-icon name="shield-o" class="security-icon" />
        <h3>安全保障</h3>
      </div>
      <div class="security-grid">
        <div
          class="security-item"
          v-for="item in securityFeatures"
          :key="item.title"
        >
          <van-icon :name="item.icon" />
          <span>{{ item.title }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { showToast, showLoadingToast, closeToast } from "vant";

const router = useRouter();
const authStore = useAuthStore();
const searchValue = ref("");
const currentLocation = ref("获取位置中...");

// 确保响应式变量正确初始化
if (!currentLocation.value) {
  currentLocation.value = "获取位置中...";
}

// 轮播图数据
const banners = ref([
  {
    image: "https://picsum.photos/seed/banner1/375/180.jpg",
    title: "新人专享优惠",
    subtitle: "首单立减20元，更有专属客服服务",
  },
  {
    image: "https://picsum.photos/seed/banner2/375/180.jpg",
    title: "担保交易安全",
    subtitle: "平台担保，资金安全，交易无忧",
  },
  {
    image: "https://picsum.photos/seed/banner3/375/180.jpg",
    title: "专业代练团队",
    subtitle: "1000+认证代练，24小时在线服务",
  },
]);



// 数据统计
const stats = ref({
  totalUsers: "12.5K",
  totalOrders: "8.9K",
  totalGames: "2",
  successRate: 99.8,
});

// 热门游戏
const hotGames = ref([
  {
    id: 1,
    name: "王者荣耀",
    description: "热门MOBA手游代练",
    image: "https://picsum.photos/seed/game1/200/120.jpg",
    price: "15-50",
    orderCount: 1234,
    isHot: true,
  },
  {
    id: 2,
    name: "三角洲",
    description: "经典战术射击游戏",
    image: "https://picsum.photos/seed/game2/200/120.jpg",
    price: "20-80",
    orderCount: 856,
    isHot: true,
  },
]);



// 安全保障特性
const securityFeatures = ref([
  {
    icon: "shield-o",
    title: "资金担保",
  },
  {
    icon: "user-circle-o",
    title: "实名认证",
  },
  {
    icon: "clock-o",
    title: "24小时客服",
  },
  {
    icon: "medal-o",
    title: "品质保证",
  },
]);

const onSearch = (value) => {
  if (value.trim()) {
    router.push(`/search?q=${encodeURIComponent(value)}`);
  }
};

const goToAuth = () => {
  if (authStore.isLoggedIn) {
    router.push("/profile");
  } else {
    router.push("/login");
  }
};

// 获取用户位置
const getUserLocation = async () => {
  if (!navigator.geolocation) {
    currentLocation.value = "不支持定位";
    showToast("您的浏览器不支持定位功能");
    return;
  }

  try {
    showLoadingToast({
      message: '获取位置中...',
      forbidClick: true,
      duration: 0
    });

    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5分钟缓存
      });
    });

    closeToast();
    
    // 使用逆地理编码API获取地址信息
    const { latitude, longitude } = position.coords;
    const address = await reverseGeocode(latitude, longitude);
    currentLocation.value = address;
    
    // 保存到本地存储
    localStorage.setItem('userLocation', address);
    localStorage.setItem('userCoords', JSON.stringify({ latitude, longitude }));
    
  } catch (error) {
    closeToast();
    console.error('获取位置失败:', error);
    
    // 尝试从本地存储获取
    const savedLocation = localStorage.getItem('userLocation');
    if (savedLocation) {
      currentLocation.value = savedLocation;
      showToast('使用上次位置信息');
    } else {
      currentLocation.value = "定位失败";
      showToast('获取位置失败，请检查定位权限');
    }
  }
};

// 逆地理编码 - 将坐标转换为地址
const reverseGeocode = async (lat, lng) => {
  try {
    // 使用高德地图API（需要申请API Key）
    // 这里使用模拟数据，实际项目中需要替换为真实的API调用
    const mockAddresses = [
      "北京市朝阳区",
      "上海市浦东新区", 
      "广州市天河区",
      "深圳市南山区",
      "杭州市西湖区"
    ];
    
    // 根据坐标模拟返回不同城市
    const index = Math.abs(Math.floor((lat + lng) * 10)) % mockAddresses.length;
    return mockAddresses[index];
    
    // 实际API调用示例：
    // const response = await fetch(
    //   `https://restapi.amap.com/v3/geocode/regeo?key=YOUR_API_KEY&location=${lng},${lat}&poitype=&radius=1000&extensions=all&batch=false&roadlevel=0`
    // );
    // const data = await response.json();
    // return data.regeocode.formatted_address || '未知位置';
    
  } catch (error) {
    console.error('逆地理编码失败:', error);
    return "未知位置";
  }
};

// 刷新位置
const refreshLocation = () => {
  getUserLocation();
};

// 页面加载时获取位置
onMounted(() => {
  // 先尝试从本地存储获取
  const savedLocation = localStorage.getItem('userLocation');
  if (savedLocation) {
    currentLocation.value = savedLocation;
  } else {
    getUserLocation();
  }
});


</script>

<style lang="scss" scoped>
.home {
  padding-top: 0;
  background: linear-gradient(180deg, #f8f9ff 0%, #f7f8fa 100%);
}

// 搜索头部
.search-header {
  position: relative;
  background: linear-gradient(135deg, #007bff 0%, #006eff 100%);
  padding: 12px 16px 20px;

  .van-search {
    padding: 8px 0;

    :deep(.van-search__content) {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
    }
  }

  .header-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 8px;
  }

  .location-info {
    display: flex;
    align-items: center;
    gap: 4px;
    color: rgba(255, 255, 255, 0.9);
    font-size: 12px;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 12px;
    transition: all 0.3s ease;
    max-width: 120px;
    
    &:hover {
      background: rgba(255, 255, 255, 0.1);
    }
    
    &:active {
      background: rgba(255, 255, 255, 0.2);
      transform: scale(0.95);
    }

    .van-icon {
      font-size: 14px;
      flex-shrink: 0;
    }
    
    span {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .login-btn {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.3);
    color: white;
    font-size: 12px;
    padding: 4px 12px;
    height: 28px;

    &:hover {
      background: rgba(255, 255, 255, 0.3);
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



// 数据统计
.stats-section {
  margin: 0 16px 20px;
  background: linear-gradient(135deg, #0084ff 0%, #0099ff 100%);
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
