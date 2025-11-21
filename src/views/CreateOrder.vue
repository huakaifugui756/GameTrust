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
        <van-cell 
          is-link 
          @click="showUserSelector = true"
          :value="userInfo.name ? userInfo.name : '选择交易对象'"
        >
          <template #title>
            <div class="user-info" v-if="userInfo.name">
              <van-image
                :src="userInfo.avatar"
                width="40"
                height="40"
                round
              />
              <div class="user-details">
                <span class="user-name">{{ userInfo.name }}</span>
                <span class="user-rating">信誉分: {{ userInfo.rating }}</span>
              </div>
            </div>
            <span v-else class="placeholder">请选择交易对象</span>
          </template>
        </van-cell>
      </van-cell-group>

      <!-- 交易类型 -->
      <van-cell-group title="交易类型">
        <van-field name="radio" label="交易类型">
          <template #input>
            <van-radio-group v-model="orderInfo.type" direction="horizontal">
              <van-radio name="代练">代练</van-radio>
              <van-radio name="道具">道具</van-radio>
              <van-radio name="账号">账号</van-radio>
              <van-radio name="其他">其他</van-radio>
            </van-radio-group>
          </template>
        </van-field>
      </van-cell-group>

      <!-- 游戏选择 -->
      <van-cell-group title="游戏信息" v-if="orderInfo.type !== '其他'">
        <van-cell 
          is-link 
          @click="showGameSelector = true"
          :value="selectedGame.name ? selectedGame.name : '选择游戏'"
        >
          <template #title>
            <div class="game-info" v-if="selectedGame.name">
              <van-image
                :src="selectedGame.image"
                width="40"
                height="40"
                round
              />
              <span class="game-name">{{ selectedGame.name }}</span>
            </div>
            <span v-else class="placeholder">请选择游戏</span>
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
          :rules="[{ required: true, message: '请输入交易标题' }]"
        />
        <van-field
          v-model="orderInfo.amount"
          label="交易金额"
          placeholder="请输入交易金额"
          type="number"
          required
          :rules="[{ required: true, message: '请输入交易金额' }]"
        >
          <template #right-icon>
            <span class="currency">元</span>
          </template>
        </van-field>
        <van-field
          v-model="orderInfo.description"
          label="交易描述"
          placeholder="请详细描述交易内容、要求等"
          type="textarea"
          rows="4"
          maxlength="500"
          show-word-limit
          required
          :rules="[{ required: true, message: '请输入交易描述' }]"
        />
      </van-cell-group>

      <!-- 时间要求 -->
      <van-cell-group title="时间要求">
        <van-field
          v-model="deadlineDisplay"
          label="完成时限"
          placeholder="请选择完成时间"
          is-link
          readonly
          @click="showTimeSelector = true"
          required
          :rules="[{ required: true, message: '请选择完成时限' }]"
        />
        <van-field name="stepper" label="紧急程度">
          <template #input>
            <van-stepper v-model="orderInfo.urgency" :min="1" :max="5" />
          </template>
        </van-field>
        <van-cell title="预计工作时长" :value="`${estimatedHours}小时`" v-if="estimatedHours > 0" />
        <van-cell title="加急费用" :value="urgencyFee > 0 ? `¥${urgencyFee}` : '无'" v-if="urgencyFee > 0" />
      </van-cell-group>

      <!-- 担保条款 -->
      <van-cell-group title="担保条款">
        <van-cell>
          <template #title>
            <div class="guarantee-terms">
              <van-checkbox v-model="agreeTerms">
                我已阅读并同意
                <span class="terms-link" @click.stop="showTerms = true">《担保交易服务条款》</span>
              </van-checkbox>
            </div>
          </template>
        </van-cell>
        <van-cell title="担保费用" :value="`¥${guaranteeFee}`" />
      </van-cell-group>

      <!-- 提交按钮 -->
      <div class="submit-section">
        <van-button
          type="primary"
          block
          size="large"
          @click="submitOrder"
          :loading="submitting"
          :disabled="!canSubmit"
        >
          创建担保交易 (总费用: ¥{{ (parseFloat(guaranteeFee) + parseFloat(urgencyFee)).toFixed(2) }})
        </van-button>
      </div>
    </div>

    <!-- 用户选择器 -->
    <van-popup v-model:show="showUserSelector" position="bottom" :style="{ height: '60%' }">
      <div class="user-selector">
        <van-nav-bar
          title="选择交易对象"
          left-arrow
          @click-left="showUserSelector = false"
        />
        <van-search
          v-model="userSearchQuery"
          placeholder="搜索用户"
          @search="searchUsers"
        />
        <div class="user-list">
          <van-cell
            v-for="user in filteredUsers"
            :key="user.id"
            @click="selectUser(user)"
            class="user-item"
          >
            <template #title>
              <div class="user-info">
                <van-image :src="user.avatar" width="40" height="40" round />
                <div class="user-details">
                  <span class="user-name">{{ user.name }}</span>
                  <span class="user-rating">信誉分: {{ user.rating }}</span>
                </div>
              </div>
            </template>
          </van-cell>
        </div>
      </div>
    </van-popup>

    <!-- 游戏选择器 -->
    <van-popup v-model:show="showGameSelector" position="bottom" :style="{ height: '60%' }">
      <div class="game-selector">
        <van-nav-bar
          title="选择游戏"
          left-arrow
          @click-left="showGameSelector = false"
        />
        <div class="game-list">
          <van-cell
            v-for="game in games"
            :key="game.id"
            @click="selectGame(game)"
            class="game-item"
          >
            <template #title>
              <div class="game-info">
                <van-image :src="game.image" width="40" height="40" round />
                <span class="game-name">{{ game.name }}</span>
              </div>
            </template>
          </van-cell>
        </div>
      </div>
    </van-popup>

    <!-- 时间选择器 -->
    <van-popup v-model:show="showTimeSelector" position="bottom" :style="{ height: '80%' }">
      <div class="time-selector">
        <van-nav-bar
          title="选择完成时限"
          left-arrow
          @click-left="showTimeSelector = false"
        >
          <template #right>
            <van-button size="small" type="primary" @click="confirmTimeSelection">
              确定
            </van-button>
          </template>
        </van-nav-bar>
        
        <!-- 快速选择 -->
        <div class="quick-select">
          <van-cell-group title="快速选择">
            <van-cell 
              v-for="option in quickTimeOptions" 
              :key="option.value"
              :title="option.label"
              :label="option.desc"
              clickable
              @click="selectQuickTime(option)"
              :class="{ active: selectedQuickTime === option.value }"
            >
              <template #right-icon>
                <van-icon name="success" v-if="selectedQuickTime === option.value" />
              </template>
            </van-cell>
          </van-cell-group>
        </div>
        
        <!-- 自定义时间 -->
        <div class="custom-time">
          <van-cell-group title="自定义时间">
            <van-field
              v-model="customDays"
              label="天数"
              type="number"
              placeholder="请输入天数"
              :min="1"
              @input="updateCustomTime"
            />
            <van-field
              v-model="customHours"
              label="小时"
              type="number"
              placeholder="请输入小时"
              :min="0"
              :max="23"
              @input="updateCustomTime"
            />
          </van-cell-group>
        </div>
        
        <!-- 日期时间选择 -->
        <div class="datetime-picker">
          <van-cell-group title="具体截止时间">
            <van-field
              v-model="deadlineDateTime"
              label="截止时间"
              placeholder="选择具体日期时间"
              is-link
              readonly
              @click="showDateTimePicker = true"
            />
          </van-cell-group>
        </div>
      </div>
    </van-popup>

    <!-- 日期时间选择器 -->
    <van-popup v-model:show="showDateTimePicker" position="bottom">
      <van-picker
        :columns="dateTimeColumns"
        @confirm="onDateTimeConfirm"
        @cancel="showDateTimePicker = false"
      />
    </van-popup>

    <!-- 条款弹窗 -->
    <van-popup v-model:show="showTerms" position="bottom" :style="{ height: '80%' }">
      <div class="terms-popup">
        <van-nav-bar
          title="担保交易服务条款"
          left-arrow
          @click-left="showTerms = false"
        />
        <div class="terms-content">
          <h4>1. 服务说明</h4>
          <p>担保交易是指平台作为第三方，为买卖双方提供资金担保和交易监督的服务。</p>
          
          <h4>2. 担保费用</h4>
          <p>担保费用按交易金额的3%收取，最低1元，最高100元。</p>
          
          <h4>3. 交易流程</h4>
          <p>买家发起担保 → 卖家确认 → 买家付款到平台 → 卖家完成服务 → 买家确认收货 → 平台放款给卖家</p>
          
          <h4>4. 争议处理</h4>
          <p>如发生交易争议，平台将根据双方提供的证据进行公正裁决。</p>
          
          <h4>5. 注意事项</h4>
          <p>请确保交易信息真实有效，平台不对虚假交易造成的损失负责。</p>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showConfirmDialog } from 'vant'

const router = useRouter()
const submitting = ref(false)

// 用户相关
const userInfo = ref({
  id: '',
  name: '',
  avatar: '',
  rating: 0
})

const showUserSelector = ref(false)
const userSearchQuery = ref('')
const users = ref([
  { id: 1, name: '游戏达人小王', avatar: 'https://picsum.photos/seed/user1/40/40.jpg', rating: 98 },
  { id: 2, name: '代练大师', avatar: 'https://picsum.photos/seed/user2/40/40.jpg', rating: 95 },
  { id: 3, name: '专业玩家', avatar: 'https://picsum.photos/seed/user3/40/40.jpg', rating: 92 },
  { id: 4, name: '信誉商家', avatar: 'https://picsum.photos/seed/user4/40/40.jpg', rating: 99 },
  { id: 5, name: '快速代练', avatar: 'https://picsum.photos/seed/user5/40/40.jpg', rating: 88 }
])

// 游戏相关
const showGameSelector = ref(false)
const selectedGame = ref({
  id: '',
  name: '',
  image: ''
})

const games = ref([
  { id: 1, name: '王者荣耀', image: 'https://picsum.photos/seed/game1/40/40.jpg' },
  { id: 2, name: '和平精英', image: 'https://picsum.photos/seed/game2/40/40.jpg' },
  { id: 3, name: '原神', image: 'https://picsum.photos/seed/game3/40/40.jpg' },
  { id: 4, name: '三角洲', image: 'https://picsum.photos/seed/game4/40/40.jpg' },
  { id: 5, name: '英雄联盟', image: 'https://picsum.photos/seed/game5/40/40.jpg' }
])

// 订单信息
const orderInfo = ref({
  title: '',
  amount: '',
  description: '',
  type: '代练',
  deadline: '',
  urgency: 3
})

// 其他状态
const showTimeSelector = ref(false)
const showDateTimePicker = ref(false)
const selectedDateTime = ref(new Date())
const agreeTerms = ref(false)
const showTerms = ref(false)

// 时间选择相关
const selectedQuickTime = ref('')
const customDays = ref('')
const customHours = ref('')
const deadlineDateTime = ref('')

// 快速时间选项
const quickTimeOptions = ref([
  { value: '1h', label: '1小时内', desc: '加急处理', hours: 1 },
  { value: '3h', label: '3小时内', desc: '快速处理', hours: 3 },
  { value: '6h', label: '6小时内', desc: '标准加急', hours: 6 },
  { value: '12h', label: '12小时内', desc: '当日完成', hours: 12 },
  { value: '1d', label: '1天内', desc: '次日完成', hours: 24 },
  { value: '3d', label: '3天内', desc: '常规处理', hours: 72 },
  { value: '7d', label: '7天内', desc: '宽松时限', hours: 168 }
])

// 计算属性
const guaranteeFee = computed(() => {
  const amount = parseFloat(orderInfo.value.amount) || 0
  const fee = amount * 0.03
  return Math.max(Math.min(fee, 100), 1).toFixed(2)
})

const deadlineDisplay = computed(() => {
  if (orderInfo.value.deadline) {
    return formatDeadline(orderInfo.value.deadline)
  }
  return ''
})

const estimatedHours = computed(() => {
  if (selectedQuickTime.value) {
    const option = quickTimeOptions.value.find(opt => opt.value === selectedQuickTime.value)
    return option ? option.hours : 0
  }
  if (customDays.value || customHours.value) {
    const days = parseInt(customDays.value) || 0
    const hours = parseInt(customHours.value) || 0
    return days * 24 + hours
  }
  return 0
})

const urgencyFee = computed(() => {
  const baseAmount = parseFloat(orderInfo.value.amount) || 0
  const urgency = orderInfo.value.urgency || 3
  
  if (urgency >= 5) {
    return (baseAmount * 0.2).toFixed(2) // 20% 加急费
  } else if (urgency >= 4) {
    return (baseAmount * 0.1).toFixed(2) // 10% 加急费
  } else if (estimatedHours.value <= 6) {
    return (baseAmount * 0.15).toFixed(2) // 15% 快速处理费
  }
  return 0
})

const canSubmit = computed(() => {
  return userInfo.value.name &&
         orderInfo.value.title.trim() &&
         orderInfo.value.amount.trim() &&
         orderInfo.value.description.trim() &&
         agreeTerms.value
})

const filteredUsers = computed(() => {
  if (!userSearchQuery.value.trim()) {
    return users.value
  }
  return users.value.filter(user => 
    user.name.toLowerCase().includes(userSearchQuery.value.toLowerCase())
  )
})

// 日期时间选择器列数据
const dateTimeColumns = computed(() => {
  const now = new Date()
  const dates = []
  const hours = []
  const minutes = []
  
  // 生成日期选项（未来30天）
  for (let i = 0; i < 30; i++) {
    const date = new Date(now)
    date.setDate(now.getDate() + i)
    dates.push({
      text: formatDate(date),
      value: date.toISOString()
    })
  }
  
  // 生成小时选项
  for (let i = 0; i < 24; i++) {
    hours.push({
      text: i.toString().padStart(2, '0') + '时',
      value: i
    })
  }
  
  // 生成分钟选项
  for (let i = 0; i < 60; i += 5) {
    minutes.push({
      text: i.toString().padStart(2, '0') + '分',
      value: i
    })
  }
  
  return [dates, hours, minutes]
})

// 方法
const selectUser = (user) => {
  userInfo.value = { ...user }
  showUserSelector.value = false
}

const selectGame = (game) => {
  selectedGame.value = { ...game }
  showGameSelector.value = false
}

const searchUsers = () => {
  // 搜索逻辑已在计算属性中处理
}

// 快速选择时间
const selectQuickTime = (option) => {
  selectedQuickTime.value = option.value
  customDays.value = ''
  customHours.value = ''
  
  // 计算截止时间
  const now = new Date()
  const deadline = new Date(now.getTime() + option.hours * 60 * 60 * 1000)
  orderInfo.value.deadline = deadline.toISOString()
  deadlineDateTime.value = formatDateTime(deadline)
}

// 更新自定义时间
const updateCustomTime = () => {
  selectedQuickTime.value = ''
  
  const days = parseInt(customDays.value) || 0
  const hours = parseInt(customHours.value) || 0
  
  if (days > 0 || hours > 0) {
    const now = new Date()
    const deadline = new Date(now.getTime() + (days * 24 + hours) * 60 * 60 * 1000)
    orderInfo.value.deadline = deadline.toISOString()
    deadlineDateTime.value = formatDateTime(deadline)
  }
}

// 确认时间选择
const confirmTimeSelection = () => {
  if (!orderInfo.value.deadline) {
    showToast('请选择完成时限')
    return
  }
  showTimeSelector.value = false
}

// 日期时间确认
const onDateTimeConfirm = (selectedValues) => {
  const [dateValue, hourValue, minuteValue] = selectedValues
  
  // 构建完整的日期时间
  const date = new Date(dateValue)
  date.setHours(hourValue, minuteValue, 0, 0)
  
  selectedDateTime.value = date
  orderInfo.value.deadline = date.toISOString()
  deadlineDateTime.value = formatDateTime(date)
  
  // 清除其他选择
  selectedQuickTime.value = ''
  customDays.value = ''
  customHours.value = ''
  
  showDateTimePicker.value = false
}

// 格式化截止时间显示
const formatDeadline = (deadlineString) => {
  if (!deadlineString) return ''
  
  const deadline = new Date(deadlineString)
  const now = new Date()
  const diff = deadline.getTime() - now.getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(hours / 24)
  
  if (days > 0) {
    return `${days}天${hours % 24}小时后 (${formatDateTime(deadline)})`
  } else if (hours > 0) {
    return `${hours}小时后 (${formatDateTime(deadline)})`
  } else {
    return `即将到期 (${formatDateTime(deadline)})`
  }
}

// 格式化日期
const formatDate = (date) => {
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

// 格式化日期时间
const formatDateTime = (date) => {
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const submitOrder = async () => {
  if (!canSubmit.value) {
    showToast('请完善所有必填信息')
    return
  }

  if (!orderInfo.value.deadline) {
    showToast('请选择完成时限')
    return
  }

  const totalFee = (parseFloat(guaranteeFee.value) + parseFloat(urgencyFee.value)).toFixed(2)
  const totalAmount = (parseFloat(orderInfo.value.amount) + parseFloat(totalFee)).toFixed(2)

  try {
    let message = `交易金额: ¥${orderInfo.value.amount}
担保费用: ¥${guaranteeFee.value}`
    if (urgencyFee.value > 0) {
      message += `
加急费用: ¥${urgencyFee.value}`
    }
    message += `
总计: ¥${totalAmount}`
    
    await showConfirmDialog({
      title: '确认创建担保交易',
      message: message,
    })
  } catch {
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
      type: orderInfo.value.type,
      game: selectedGame.value.name,
      initiator: userInfo.value,
      amount: orderInfo.value.amount,
      guaranteeFee: guaranteeFee.value,
      urgencyFee: urgencyFee.value,
      totalAmount: totalAmount,
      description: orderInfo.value.description,
      deadline: orderInfo.value.deadline,
      urgency: orderInfo.value.urgency,
      estimatedHours: estimatedHours.value,
      status: 'pending',
      createdAt: new Date().toISOString()
    }
    
    // 保存担保交易群信息
    sessionStorage.setItem('guaranteeGroup', JSON.stringify(guaranteeGroup))
    
    // 保存到订单列表
    const orders = JSON.parse(localStorage.getItem('orders') || '[]')
    orders.push(guaranteeGroup)
    localStorage.setItem('orders', JSON.stringify(orders))
    
    showToast('担保交易创建成功')
    
    // 跳转到担保交易群聊
    router.push(`/chat/${guaranteeGroup.id}`)
  }, 1500)
}

onMounted(() => {
  // 获取用户信息（如果从其他页面传递过来）
  const savedUserInfo = sessionStorage.getItem('orderUserInfo')
  if (savedUserInfo) {
    const user = JSON.parse(savedUserInfo)
    userInfo.value = {
      ...user,
      rating: user.rating || Math.floor(Math.random() * 20) + 80
    }
    sessionStorage.removeItem('orderUserInfo')
  }
})
</script>

<style lang="scss" scoped>
.create-order {
  background: #f7f8fa;
  min-height: 100vh;
}

.order-form {
  padding: 16px;
}

.user-info, .game-info {
  display: flex;
  align-items: center;
  gap: 12px;
  
  .user-details, .game-details {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  
  .user-name, .game-name {
    font-size: 16px;
    font-weight: 500;
    color: #333;
  }
  
  .user-rating {
    font-size: 12px;
    color: #666;
  }
}

.placeholder {
  color: #999;
  font-size: 14px;
}

.currency {
  color: #666;
  font-size: 14px;
}

.guarantee-terms {
  font-size: 14px;
  
  .terms-link {
    color: #1989fa;
    text-decoration: underline;
  }
}

.submit-section {
  margin-top: 32px;
  padding: 0 16px;
}

// 弹窗样式
.user-selector, .game-selector {
  height: 100%;
  display: flex;
  flex-direction: column;
  
  .user-list, .game-list {
    flex: 1;
    overflow-y: auto;
  }
  
  .user-item, .game-item {
    &:active {
      background: #f2f3f5;
    }
  }
}

.terms-popup {
  height: 100%;
  display: flex;
  flex-direction: column;
  
  .terms-content {
    flex: 1;
    padding: 16px;
    overflow-y: auto;
    
    h4 {
      margin: 16px 0 8px;
      color: #333;
      font-size: 16px;
    }
    
    p {
      margin: 8px 0;
      color: #666;
      font-size: 14px;
      line-height: 1.6;
    }
  }
}

// 时间选择器样式
.time-selector {
  height: 100%;
  display: flex;
  flex-direction: column;
  
  .quick-select, .custom-time, .datetime-picker {
    flex: 1;
    overflow-y: auto;
  }
  
  .van-cell.active {
    background: #f2f3f5;
    color: #1989fa;
  }
}

// 响应式设计
@media (max-width: 375px) {
  .order-form {
    padding: 12px;
  }
  
  .submit-section {
    padding: 0 12px;
  }
}
</style>