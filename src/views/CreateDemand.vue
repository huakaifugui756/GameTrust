<template>
  <div class="create-demand page-container">
    <!-- 顶部导航 -->
    <van-nav-bar
      title="发布需求"
      left-text="返回"
      left-arrow
      @click-left="$router.go(-1)"
    />

    <!-- 表单内容 -->
    <div class="form-content">
      <!-- 需求类型 -->
      <div class="form-section card">
        <h3 class="section-title">需求类型</h3>
        <van-radio-group v-model="form.type" direction="horizontal">
          <van-radio name="代练">代练</van-radio>
          <van-radio name="陪玩">陪玩</van-radio>
          <van-radio name="咨询">咨询</van-radio>
          <van-radio name="其他">其他</van-radio>
        </van-radio-group>
      </div>

      <!-- 游戏选择 -->
      <div class="form-section card">
        <h3 class="section-title">选择游戏</h3>
        <van-cell
          :title="selectedGame?.name || '请选择游戏'"
          is-link
          @click="showGamePicker = true"
        />
        <van-popup v-model:show="showGamePicker" position="bottom">
          <van-picker
            :columns="gameColumns"
            @confirm="onGameConfirm"
            @cancel="showGamePicker = false"
          />
        </van-popup>
      </div>

      <!-- 需求标题 -->
      <div class="form-section card">
        <h3 class="section-title">需求标题</h3>
        <van-field
          v-model="form.title"
          placeholder="请输入需求标题，如：王者荣耀星耀上王者"
          maxlength="50"
          show-word-limit
        />
      </div>

      <!-- 详细描述 -->
      <div class="form-section card">
        <h3 class="section-title">详细描述</h3>
        <van-field
          v-model="form.description"
          type="textarea"
          placeholder="请详细描述您的需求，包括：&#10;1. 当前段位/等级&#10;2. 目标段位/等级&#10;3. 时间要求&#10;4. 其他特殊要求"
          rows="6"
          maxlength="500"
          show-word-limit
        />
      </div>

      <!-- 预算范围 -->
      <div class="form-section card">
        <h3 class="section-title">预算范围</h3>
        <div class="price-range">
          <van-field
            v-model="form.minPrice"
            type="number"
            placeholder="最低价格"
            label="¥"
          />
          <span class="separator">-</span>
          <van-field
            v-model="form.maxPrice"
            type="number"
            placeholder="最高价格"
            label="¥"
          />
        </div>
      </div>

      <!-- 时间要求 -->
      <div class="form-section card">
        <h3 class="section-title">时间要求</h3>
        <van-cell
          :title="form.deadline || '请选择完成时间'"
          is-link
          @click="showDatePicker = true"
        />
        <van-popup v-model:show="showDatePicker" position="bottom">
          <van-date-picker
            v-model="selectedDate"
            @confirm="onDateConfirm"
            @cancel="showDatePicker = false"
          />
        </van-popup>
      </div>

      <!-- 联系方式 -->
      <div class="form-section card">
        <h3 class="section-title">联系方式</h3>
        <van-field
          v-model="form.contact"
          placeholder="请输入微信号或QQ号"
          label="联系方式"
        />
        <van-field
          v-model="form.contactTime"
          placeholder="方便联系的时间"
          label="联系时间"
        />
      </div>

      <!-- 附加要求 -->
      <div class="form-section card">
        <h3 class="section-title">附加要求</h3>
        <van-checkbox-group v-model="form.requirements">
          <van-checkbox name="需要直播">需要直播</van-checkbox>
          <van-checkbox name="账号安全">账号安全</van-checkbox>
          <van-checkbox name="效率优先">效率优先</van-checkbox>
          <van-checkbox name="经验丰富">经验丰富</van-checkbox>
        </van-checkbox-group>
      </div>

      <!-- 提交按钮 -->
      <div class="submit-section">
        <van-button
          type="primary"
          size="large"
          :loading="submitting"
          @click="submitDemand"
        >
          发布需求
        </van-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showConfirmDialog } from 'vant'

const router = useRouter()
const submitting = ref(false)

// 表单数据
const form = reactive({
  type: '代练',
  gameId: '',
  title: '',
  description: '',
  minPrice: '',
  maxPrice: '',
  deadline: '',
  contact: '',
  contactTime: '',
  requirements: []
})

// 游戏选择
const showGamePicker = ref(false)
const selectedGame = ref(null)
const gameColumns = [
  { text: '王者荣耀', value: 1 },
  { text: '和平精英', value: 2 },
  { text: '三角洲', value: 3 },
  { text: '原神', value: 4 },
  { text: '英雄联盟', value: 5 },
  { text: '绝地求生', value: 6 },
  { text: '穿越火线', value: 7 },
  { text: '永劫无间', value: 8 }
]

// 日期选择
const showDatePicker = ref(false)
const selectedDate = ref(new Date())

const onGameConfirm = ({ selectedOptions }) => {
  selectedGame.value = selectedOptions[0]
  form.gameId = selectedOptions[0].value
  showGamePicker.value = false
}

const onDateConfirm = () => {
  const date = selectedDate.value
  form.deadline = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  showDatePicker.value = false
}

const validateForm = () => {
  if (!form.gameId) {
    showToast('请选择游戏')
    return false
  }
  if (!form.title.trim()) {
    showToast('请输入需求标题')
    return false
  }
  if (!form.description.trim()) {
    showToast('请输入详细描述')
    return false
  }
  if (!form.minPrice || !form.maxPrice) {
    showToast('请设置预算范围')
    return false
  }
  if (Number(form.minPrice) > Number(form.maxPrice)) {
    showToast('最低价格不能高于最高价格')
    return false
  }
  if (!form.deadline) {
    showToast('请选择完成时间')
    return false
  }
  if (!form.contact.trim()) {
    showToast('请输入联系方式')
    return false
  }
  return true
}

const submitDemand = async () => {
  if (!validateForm()) return

  try {
    await showConfirmDialog({
      title: '确认发布',
      message: '确定要发布这个需求吗？发布后将有服务者接单。',
      confirmButtonText: '确定发布',
      cancelButtonText: '再想想'
    })

    submitting.value = true

    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 2000))

    // 模拟成功响应
    const demandData = {
      id: Date.now(),
      ...form,
      gameName: selectedGame.value.text,
      status: '待接单',
      createTime: new Date().toISOString(),
      views: 0,
      likes: 0,
      comments: 0
    }

    console.log('发布需求:', demandData)

    showToast({
      type: 'success',
      message: '需求发布成功！'
    })

    // 跳转到需求详情页
    setTimeout(() => {
      router.push(`/demand/${demandData.id}`)
    }, 1500)

  } catch (error) {
    if (error !== 'cancel') {
      showToast('发布失败，请重试')
    }
  } finally {
    submitting.value = false
  }
}
</script>

<style lang="scss" scoped>
.create-demand {
  background: #f7f8fa;
  padding-bottom: 80px;
}

.form-content {
  padding: 16px;
}

.form-section {
  margin-bottom: 16px;
  
  .section-title {
    margin: 0 0 16px;
    font-size: 16px;
    font-weight: 600;
    color: #323233;
  }
}

.price-range {
  display: flex;
  align-items: center;
  gap: 12px;
  
  .van-field {
    flex: 1;
  }
  
  .separator {
    color: #969799;
    font-weight: 500;
  }
}

.submit-section {
  margin-top: 32px;
  padding: 0 16px;
  
  .van-button {
    width: 100%;
    height: 50px;
    font-size: 16px;
    font-weight: 600;
    border-radius: 25px;
  }
}

// 复选框样式
:deep(.van-checkbox-group) {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  
  .van-checkbox {
    padding: 8px 12px;
    background: #f7f8fa;
    border-radius: 8px;
    
    &:active {
      background: #ebedf0;
    }
  }
}

// 单选框样式
:deep(.van-radio-group) {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  
  .van-radio {
    padding: 8px 12px;
    background: #f7f8fa;
    border-radius: 8px;
    justify-content: center;
    
    &:active {
      background: #ebedf0;
    }
    
    &.van-radio--checked {
      background: #e8f4ff;
      color: #1989fa;
    }
  }
}

// 输入框样式
:deep(.van-field) {
  margin-bottom: 12px;
  
  &:last-child {
    margin-bottom: 0;
  }
}

// 单元格样式
:deep(.van-cell) {
  padding: 16px;
  background: #fff;
  border-radius: 8px;
  margin-bottom: 12px;
}
</style>