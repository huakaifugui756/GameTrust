<template>
  <div class="message-list">
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="onLoad"
      >
        <div
          v-for="message in messages"
          :key="message.id"
          class="message-item"
          @click="$emit('click', message)"
        >
          <div class="message-avatar">
            <img :src="message.avatar" :alt="message.title" />
            <div v-if="message.unread > 0" class="unread-badge">
              {{ message.unread > 99 ? '99+' : message.unread }}
            </div>
          </div>
          <div class="message-content">
            <div class="message-header">
              <span class="message-title">{{ message.title }}</span>
              <span class="message-time">{{ message.time }}</span>
            </div>
            <div class="message-text">{{ message.content }}</div>
          </div>
          <van-icon name="arrow" class="arrow-icon" />
        </div>
      </van-list>
    </van-pull-refresh>

    <!-- 空状态 -->
    <van-empty
      v-if="messages.length === 0 && !loading"
      description="暂无消息"
      image="https://picsum.photos/seed/empty/160/160.jpg"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

defineProps({
  messages: {
    type: Array,
    default: () => []
  }
})

defineEmits(['click'])

const refreshing = ref(false)
const loading = ref(false)
const finished = ref(false)

onMounted(() => {
  // 初始化数据
})

const onRefresh = () => {
  // 模拟刷新
  setTimeout(() => {
    refreshing.value = false
  }, 1000)
}

const onLoad = () => {
  // 模拟加载更多
  setTimeout(() => {
    loading.value = false
    finished.value = true
  }, 1000)
}
</script>

<style lang="scss" scoped>
.message-list {
  .message-item {
    display: flex;
    align-items: center;
    padding: 16px;
    background: white;
    border-bottom: 1px solid #ebedf0;
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
      background: #f7f8fa;
    }

    .message-avatar {
      position: relative;
      margin-right: 12px;

      img {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        object-fit: cover;
      }

      .unread-badge {
        position: absolute;
        top: -4px;
        right: -4px;
        background: #ee0a24;
        color: white;
        font-size: 10px;
        padding: 2px 6px;
        border-radius: 10px;
        min-width: 16px;
        text-align: center;
        line-height: 1.2;
      }
    }

    .message-content {
      flex: 1;

      .message-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 4px;

        .message-title {
          font-size: 16px;
          font-weight: 500;
          color: #323233;
        }

        .message-time {
          font-size: 12px;
          color: #969799;
        }
      }

      .message-text {
        font-size: 14px;
        color: #646566;
        line-height: 1.4;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
      }
    }

    .arrow-icon {
      color: #c8c9cc;
      font-size: 16px;
    }
  }
}
</style>