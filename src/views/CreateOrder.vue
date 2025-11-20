<template>
  <div class="create-order page-container">
    <!-- 顶部导航 -->
    <van-nav-bar
      title="创建担保交易"
      left-arrow
      @click-left="$router.go(-1)"
    />

    <div class="order-form">
      <!-- 交易对象信息 -->
      <van-cell-group title="交易对象">
        <van-cell>
          <template #title>
            <div class="user-info">
              <van-image
                :src="userInfo.avatar"
                width="40"
                height="40"
                round
              />
              <span class="user-name">{{ userInfo.name }}</span>
            </div>
          </template>
        </van-cell>
      </van-cell-group>

      <!-- 交易信息 -->
      <van-cell-group title="交易信息">
        <van-field
          v-model="orderInfo.title"
          label="交易标题"
          placeholder="请输入交易标题"
          required
        />
        <van-field
          v-model="orderInfo.amount"
          label="交易金额"
          placeholder="请输入交易金额"
          type="number"
          required
        />
        <van-field
          v-model="orderInfo.description"
          label="交易描述"
          placeholder="请详细描述交易内容"
          type="textarea"
          rows="3"
          required
        />
      </van-cell-group>

      <!-- 提交按钮 -->
      <div class="submit-section">
        <van-button
          type="primary"
          block
          size="large"
          @click="submitOrder"
          :loading="submitting"
        >
          创建担保交易
        </van-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'

const router = useRouter()
const submitting = ref(false)

const userInfo = ref({
  id: '',
  name: '',
  avatar: ''
})

const orderInfo = ref({
  title: '',
  amount: '',
  description: ''
})

onMounted(() => {
  // 获取用户信息
  const savedUserInfo = sessionStorage.getItem('orderUserInfo')
  if (savedUserInfo) {
    userInfo.value = JSON.parse(savedUserInfo)
  } else {
    showToast('用户信息获取失败')
    router.go(-1)
  }
})

const submitOrder = () => {
  if (!orderInfo.value.title.trim()) {
    showToast('请输入交易标题')
    return
  }
  
  if (!orderInfo.value.amount.trim()) {
    showToast('请输入交易金额')
    return
  }
  
  if (!orderInfo.value.description.trim()) {
    showToast('请输入交易描述')
    return
  }

  submitting.value = true
  
  // 模拟创建订单
  setTimeout(() => {
    submitting.value = false
    
    // 创建担保交易群
    const guaranteeGroup = {
      id: 'guarantee_' + Date.now(),
      title: `担保交易：${orderInfo.value.title}`,
      initiator: userInfo.value,
      amount: orderInfo.value.amount,
      description: orderInfo.value.description,
      createdAt: new Date().toISOString()
    }
    
    // 保存担保交易群信息
    sessionStorage.setItem('guaranteeGroup', JSON.stringify(guaranteeGroup))
    
    showToast('担保交易创建成功')
    
    // 跳转到担保交易群聊
    router.push(`/chat/${guaranteeGroup.id}`)
  }, 1500)
}
</script>

<style lang="scss" scoped>
.create-order {
  background: #f7f8fa;
  min-height: 100vh;
}

.order-form {
  padding: 16px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  
  .user-name {
    font-size: 16px;
    font-weight: 500;
    color: #333;
  }
}

.submit-section {
  margin-top: 32px;
  padding: 0 16px;
}
</style>