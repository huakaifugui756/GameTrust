<template>
  <div class="profile-favorites page-container">
    <van-nav-bar title="我的收藏" left-arrow @click-left="$router.go(-1)" />
    
    <div class="favorites-list">
      <van-empty v-if="favorites.length === 0" description="暂无收藏" />
      
      <div v-else class="favorite-item" v-for="item in favorites" :key="item.id">
        <div class="item-info">
          <img :src="item.image" class="item-image" />
          <div class="item-details">
            <h4>{{ item.title }}</h4>
            <p>{{ item.description }}</p>
            <div class="item-meta">
              <span class="price">¥{{ item.price }}</span>
              <span class="time">{{ item.time }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const favorites = ref([
  {
    id: 1,
    title: '王者荣耀段位提升',
    description: '专业代练团队，快速安全上分',
    image: 'https://picsum.photos/seed/fav1/80/80.jpg',
    price: 15,
    time: '收藏于 2024-01-15'
  },
  {
    id: 2,
    title: '三角洲武器解锁',
    description: '全武器解锁服务，支持各种模式',
    image: 'https://picsum.photos/seed/fav2/80/80.jpg',
    price: 30,
    time: '收藏于 2024-01-14'
  }
])
</script>

<style lang="scss" scoped>
.profile-favorites {
  padding-top: 0;
  background: #f7f8fa;
  min-height: 100vh;
  padding-bottom: 60px;
}

.favorites-list {
  padding: 12px;
}

.favorite-item {
  background: white;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.item-info {
  display: flex;
  gap: 12px;
}

.item-image {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  object-fit: cover;
}

.item-details {
  flex: 1;
  
  h4 {
    margin: 0 0 8px 0;
    font-size: 16px;
    font-weight: 600;
    color: #323233;
  }
  
  p {
    margin: 0 0 8px 0;
    font-size: 14px;
    color: #646566;
    line-height: 1.4;
  }
}

.item-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  .price {
    font-size: 16px;
    font-weight: 600;
    color: #ee0a24;
  }
  
  .time {
    font-size: 12px;
    color: #969799;
  }
}
</style>