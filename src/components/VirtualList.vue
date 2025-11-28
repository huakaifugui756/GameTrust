<template>
  <div class="virtual-list" ref="container" :style="{ height: containerHeight + 'px' }">
    <div class="virtual-list-phantom" :style="{ height: totalHeight + 'px' }"></div>
    <div class="virtual-list-content" :style="{ transform: `translateY(${offsetY}px)` }">
      <div
        v-for="item in visibleItems"
        :key="getItemKey(item)"
        class="virtual-list-item"
        :style="{ height: itemHeight + 'px' }"
      >
        <slot :item="item" :index="item.index"></slot>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

const props = defineProps({
  items: {
    type: Array,
    required: true
  },
  itemHeight: {
    type: Number,
    default: 50
  },
  containerHeight: {
    type: Number,
    default: 300
  },
  getItemKey: {
    type: Function,
    default: (item, index) => index
  }
})

const container = ref(null)
const scrollTop = ref(0)
const startIndex = ref(0)
const endIndex = ref(0)

const totalHeight = computed(() => {
  return props.items.length * props.itemHeight
})

const visibleCount = computed(() => {
  return Math.ceil(props.containerHeight / props.itemHeight) + 2 // 缓冲2项
})

const offsetY = computed(() => {
  return startIndex.value * props.itemHeight
})

const visibleItems = computed(() => {
  const start = Math.max(0, startIndex.value - 1) // 前面缓冲1项
  const end = Math.min(props.items.length, endIndex.value + 1) // 后面缓冲1项
  
  return props.items.slice(start, end).map((item, index) => ({
    ...item,
    index: start + index
  }))
})

const handleScroll = () => {
  if (!container.value) return
  
  scrollTop.value = container.value.scrollTop
  startIndex.value = Math.floor(scrollTop.value / props.itemHeight)
  endIndex.value = Math.min(
    props.items.length - 1,
    startIndex.value + visibleCount.value
  )
}

const scrollToIndex = (index) => {
  if (!container.value) return
  
  const targetScrollTop = index * props.itemHeight
  container.value.scrollTop = targetScrollTop
}

const scrollToBottom = () => {
  if (!container.value) return
  
  container.value.scrollTop = totalHeight.value
}

// 暴露方法给父组件
defineExpose({
  scrollToIndex,
  scrollToBottom
})

onMounted(() => {
  if (container.value) {
    container.value.addEventListener('scroll', handleScroll)
    handleScroll() // 初始化计算可见项
  }
})

onUnmounted(() => {
  if (container.value) {
    container.value.removeEventListener('scroll', handleScroll)
  }
})

// 当items变化时重新计算
watch(() => props.items, () => {
  handleScroll()
}, { deep: true })
</script>

<style lang="scss" scoped>
.virtual-list {
  position: relative;
  overflow-y: auto;
  overflow-x: hidden;
  
  .virtual-list-phantom {
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    z-index: -1;
  }
  
  .virtual-list-content {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    
    .virtual-list-item {
      box-sizing: border-box;
      overflow: hidden;
    }
  }
}
</style>