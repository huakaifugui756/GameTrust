<template>
  <div class="test-component">
    <h1>GameTrust 测试页面</h1>
    <p>如果您看到此页面，则应用基本功能正常。</p>
    <p>当前环境: {{ envInfo.mode }}</p>
    <p>Supabase URL: {{ supabaseUrl ? '已设置' : '未设置' }}</p>
    <van-button type="primary" @click="testButton">测试按钮</van-button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const envInfo = ref({
  mode: import.meta.env.MODE
})
const supabaseUrl = ref(import.meta.env.VITE_SUPABASE_URL)

const testButton = () => {
  console.log('测试按钮被点击')
  alert('测试按钮功能正常!')
}

onMounted(() => {
  console.log('测试组件已挂载')
})
</script>

<style scoped>
.test-component {
  padding: 20px;
  text-align: center;
}

h1 {
  color: #1989fa;
  margin-bottom: 20px;
}

p {
  margin: 10px 0;
}
</style>