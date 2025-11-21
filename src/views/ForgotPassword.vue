<template>
  <div class="forgot-password page-container">
    <div class="header">
      <van-nav-bar
        title="找回密码"
        left-arrow
        @click-left="$router.go(-1)"
      />
    </div>

    <div class="content">
      <div class="form-container">
        <van-form @submit="onSubmit">
          <van-cell-group inset>
            <van-field
              v-model="form.phone"
              name="phone"
              label="手机号"
              placeholder="请输入注册手机号"
              :rules="[
                { required: true, message: '请输入手机号' },
                { validator: validatePhone, message: '请输入正确的手机号' }
              ]"
            />
            <van-field
              v-model="form.code"
              center
              label="验证码"
              placeholder="请输入验证码"
              :rules="[{ required: true, message: '请输入验证码' }]"
            >
              <template #button>
                <van-button
                  size="small"
                  type="primary"
                  :disabled="codeCountdown > 0"
                  @click="sendCode"
                >
                  {{ codeCountdown > 0 ? `${codeCountdown}s` : '发送验证码' }}
                </van-button>
              </template>
            </van-field>
            <van-field
              v-model="form.newPassword"
              type="password"
              name="newPassword"
              label="新密码"
              placeholder="请设置新密码（6-20位）"
              :rules="[
                { required: true, message: '请设置新密码' },
                { pattern: /^.{6,20}$/, message: '密码长度为6-20位' }
              ]"
            />
            <van-field
              v-model="form.confirmPassword"
              type="password"
              name="confirmPassword"
              label="确认密码"
              placeholder="请再次输入新密码"
              :rules="[
                { required: true, message: '请确认密码' },
                { validator: validatePassword }
              ]"
            />
          </van-cell-group>
          
          <div class="form-actions">
            <van-button round block type="primary" native-type="submit" :loading="loading">
              重置密码
            </van-button>
          </div>
        </van-form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showSuccessToast, showFailToast } from 'vant'

const router = useRouter()
const loading = ref(false)
const codeCountdown = ref(0)

const form = ref({
  phone: '',
  code: '',
  newPassword: '',
  confirmPassword: ''
})

const validatePhone = (value) => {
  const phoneRegex = /^1[3-9]\d{9}$/
  if (!phoneRegex.test(value)) {
    return '请输入正确的手机号'
  }
  return true
}

const validatePassword = (value) => {
  if (value !== form.value.newPassword) {
    return '两次输入的密码不一致'
  }
  return true
}

const sendCode = async () => {
  if (!form.value.phone) {
    showToast('请先输入手机号')
    return
  }
  
  if (validatePhone(form.value.phone) !== true) {
    showToast('请输入正确的手机号')
    return
  }
  
  try {
    // 模拟发送验证码API
    await new Promise(resolve => setTimeout(resolve, 500))
    showSuccessToast('验证码已发送')
    codeCountdown.value = 60
    
    const timer = setInterval(() => {
      codeCountdown.value--
      if (codeCountdown.value <= 0) {
        clearInterval(timer)
      }
    }, 1000)
  } catch (error) {
    showFailToast('发送验证码失败，请重试')
  }
}

const onSubmit = async () => {
  // 验证验证码（模拟）
  if (form.value.code !== '123456') {
    showToast('验证码错误，测试验证码：123456')
    return
  }
  
  loading.value = true
  
  try {
    // 模拟重置密码API
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    showSuccessToast('密码重置成功，请登录')
    router.push('/login')
  } catch (error) {
    showFailToast('重置密码失败，请重试')
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.forgot-password {
  background: #f7f8fa;
  min-height: 100vh;
}

.header {
  background: white;
  margin-bottom: 20px;
}

.content {
  padding: 0 16px;
}

.form-container {
  .form-actions {
    margin: 20px 0;
    
    .van-button {
      height: 50px;
      font-size: 16px;
    }
  }
}
</style>