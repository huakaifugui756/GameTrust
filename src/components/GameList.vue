<template>
  <div class="game-list">
    <div
      v-for="game in games"
      :key="game.id"
      class="game-item"
      @click="$emit('view-game', game.id)"
    >
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
</template>

<script setup>
defineProps({
  games: {
    type: Array,
    default: () => []
  }
})

defineEmits(['view-game'])
</script>

<style lang="scss" scoped>
.game-list {
  .game-item {
    display: flex;
    align-items: center;
    background: white;
    border-radius: 8px;
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
        color: #323233;
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
}
</style>