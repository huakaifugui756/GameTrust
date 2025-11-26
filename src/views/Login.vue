<template>
  <div class="login page-container">
    <div class="login-header">
      <h1>GameTrust</h1>
      <p>游戏服务担保交易平台</p>
    </div>

    <div class="login-form">
      <!-- 登录方式切换 -->
      <div class="login-tabs">
        <van-tabs v-model:active="activeTab" @change="onTabChange">
          <van-tab title="密码登录" name="password">
            <van-form @submit="onPasswordLogin">
              <van-cell-group inset>
                <van-field
                  v-model="form.phone"
                  name="phone"
                  label="手机号"
                  placeholder="请输入手机号"
                  :rules="[
                    { required: true, message: '请输入手机号' },
                    { validator: validatePhone, message: '请输入正确的手机号' }
                  ]"
                />
                <van-field
                  v-model="form.password"
                  type="password"
                  name="password"
                  label="密码"
                  placeholder="请输入密码"
                  :rules="[
                    { required: true, message: '请输入密码' },
                    { pattern: /^.{6,20}$/, message: '密码长度为6-20位' }
                  ]"
                />
              </van-cell-group>
            </van-form>
          </van-tab>
          
          <van-tab title="验证码登录" name="sms">
            <van-form @submit="onSmsLogin">
              <van-cell-group inset>
                <van-field
                  v-model="smsForm.phone"
                  name="phone"
                  label="手机号"
                  placeholder="请输入手机号"
                  :rules="[
                    { required: true, message: '请输入手机号' },
                    { validator: validatePhone, message: '请输入正确的手机号' }
                  ]"
                />
                <van-field
                  v-model="smsForm.code"
                  name="code"
                  label="验证码"
                  placeholder="请输入验证码"
                  :rules="[
                    { required: true, message: '请输入验证码' },
                    { pattern: /^\d{6}$/, message: '验证码为6位数字' }
                  ]"
                >
                  <template #button>
                    <van-button
                      size="small"
                      type="primary"
                      :disabled="!canSendSms || smsCountdown > 0"
                      :loading="sendingSms"
                      @click="sendSms"
                    >
                      {{ smsCountdown > 0 ? `${smsCountdown}s后重试` : '获取验证码' }}
                    </van-button>
                  </template>
                </van-field>
              </van-cell-group>
            </van-form>
          </van-tab>
        </van-tabs>
      </div>
        
        <div class="form-actions">
          <van-button round block type="primary" @click="handleLogin" :loading="loading">
            登录
          </van-button>
          
          <div class="test-account">
            <van-button size="small" plain type="default" @click="fillTestAccount">
              使用测试账号
            </van-button>
            <span class="test-tip">测试账号：13800138000 / 123456</span>
          </div>
          
          <div class="form-links">
            <span @click="$router.push('/register')">注册账号</span>
            <span @click="forgotPassword">忘记密码</span>
          </div>
        </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showSuccessToast, showFailToast } from 'vant'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const loading = ref(false)
const activeTab = ref('password')
const sendingSms = ref(false)
const smsCountdown = ref(0)

const form = ref({
  phone: '',
  password: ''
})

const smsForm = ref({
  phone: '',
  code: ''
})

// 页面加载时检查是否有预填充的手机号
onMounted(() => {
  const phone = router.currentRoute.value.query.phone
  if (phone) {
    form.value.phone = phone
  }
})

const validatePhone = (value) => {
  const phoneRegex = /^1[3-9]\d{9}$/
  if (!phoneRegex.test(value)) {
    return '请输入正确的手机号'
  }
  return true
}

const onTabChange = (name) => {
  activeTab.value = name
}

const handleLogin = async () => {
  if (activeTab.value === 'password') {
    await onPasswordLogin()
  } else {
    await onSmsLogin()
  }
}

const onPasswordLogin = async () => {
  if (!form.value.phone || !form.value.password) {
    showToast('请填写完整信息')
    return
  }
  
  if (!validatePhone(form.value.phone)) {
    return
  }

  loading.value = true
  
  try {
    const result = await authStore.login({
      phone: form.value.phone,
      password: form.value.password
    })
    
    if (result.success) {
      showSuccessToast('登录成功')
      const redirect = router.currentRoute.value.query.redirect || '/'
      router.push(redirect)
    } else {
      showFailToast(result.error || '登录失败')
    }
  } catch (error) {
    showFailToast('登录失败，请重试')
  } finally {
    loading.value = false
  }
}

const onSmsLogin = async () => {
  if (!smsForm.value.phone || !smsForm.value.code) {
    showToast('请填写完整信息')
    return
  }
  
  if (!validatePhone(smsForm.value.phone)) {
    return
  }

  loading.value = true
  
  try {
    const result = await authStore.smsLogin({
      phone: smsForm.value.phone,
      code: smsForm.value.code
    })
    
    if (result.success) {
      showSuccessToast('登录成功')
      const redirect = router.currentRoute.value.query.redirect || '/'
      router.push(redirect)
    } else {
      showFailToast(result.error || '验证码错误')
    }
  } catch (error) {
    showFailToast('登录失败，请重试')
  } finally {
    loading.value = false
  }
}

const canSendSms = computed(() => {
  return validatePhone(smsForm.value.phone) === true
})

const sendSms = async () => {
  if (!canSendSms.value) {
    return
  }

  sendingSms.value = true
  
  try {
    // 模拟发送短信
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 开始倒计时
    smsCountdown.value = 60
    const timer = setInterval(() => {
      smsCountdown.value--
      if (smsCountdown.value <= 0) {
        clearInterval(timer)
      }
    }, 1000)
    
    showToast('验证码已发送')
  } catch (error) {
    showToast('发送失败，请重试')
  } finally {
    sendingSms.value = false
  }
}

const forgotPassword = () => {
  router.push('/forgot-password')
}





// 测试账号快速填充
const fillTestAccount = () => {
  form.value.phone = '13800138000'
  form.value.password = '123456'
  showToast('已填充测试账号')
}
</script>

<style lang="scss" scoped>
.login {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-header {
  text-align: center;
  color: white;
  margin-bottom: 40px;
  
  h1 {
    margin: 0 0 8px 0;
    font-size: 32px;
    font-weight: 700;
  }
  
  p {
    margin: 0;
    font-size: 16px;
    opacity: 0.9;
  }
}

.login-form {
  .login-tabs {
    margin-bottom: 20px;
    
    :deep(.van-tabs__nav) {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      padding: 4px;
    }
    
    :deep(.van-tab) {
      color: rgba(255, 255, 255, 0.7);
      font-weight: 500;
    }
    
    :deep(.van-tab--active) {
      color: white;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 6px;
    }
    
    :deep(.van-tabs__line) {
      display: none;
    }
    
    :deep(.van-cell-group) {
      background: rgba(255, 255, 255, 0.95);
      border-radius: 8px;
      overflow: hidden;
    }
  }
  
  .form-actions {
    margin: 20px 0;
    
    .van-button {
      margin-bottom: 16px;
    }
    
    .test-account {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-bottom: 16px;
      
      .van-button {
        margin-bottom: 8px;
        background: rgba(255, 255, 255, 0.1);
        border-color: rgba(255, 255, 255, 0.2);
        color: white;
        
        &:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      }
      
      .test-tip {
        font-size: 12px;
        color: rgba(255, 255, 255, 0.7);
      }
    }
    
    .form-links {
      display: flex;
      justify-content: space-between;
      font-size: 14px;
      color: white;
      
      span {
        cursor: pointer;
        opacity: 0.9;
        
        &:hover {
          opacity: 1;
        }
      }
    }
  }
}


</style>