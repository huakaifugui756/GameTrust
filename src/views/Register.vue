<template>
  <div class="register page-container">
    <div class="register-header">
      <h1>注册账号</h1>
      <p>加入GameTrust，开启安全游戏交易</p>
    </div>

    <div class="register-form">
      <van-form @submit="onSubmit">
        <van-cell-group inset>
          <van-field
            v-model="form.phone"
            name="phone"
            label="手机号"
            placeholder="请输入手机号"
            :rules="[{ required: true, message: '请输入手机号' }]"
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
            v-model="form.password"
            type="password"
            name="password"
            label="密码"
            placeholder="请设置密码（6-20位）"
            :rules="[
              { required: true, message: '请设置密码' },
              { pattern: /^.{6,20}$/, message: '密码长度为6-20位' }
            ]"
          />
          <van-field
            v-model="form.confirmPassword"
            type="password"
            name="confirmPassword"
            label="确认密码"
            placeholder="请再次输入密码"
            :rules="[
              { required: true, message: '请确认密码' },
              { validator: validatePassword }
            ]"
          />
        </van-cell-group>
        
        <div class="agreement">
          <van-checkbox v-model="agreeTerms">
            我已阅读并同意
            <span class="link" @click.stop="viewTerms">《用户协议》</span>
            和
            <span class="link" @click.stop="viewPrivacy">《隐私政策》</span>
          </van-checkbox>
        </div>
        
        <div class="form-actions">
          <van-button round block type="primary" native-type="submit" :loading="loading" :disabled="!agreeTerms">
            注册
          </van-button>
          
          <div class="form-links">
            <span>已有账号？</span>
            <span @click="$router.push('/login')">立即登录</span>
          </div>
        </div>
      </van-form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'

const router = useRouter()
const loading = ref(false)
const codeCountdown = ref(0)
const agreeTerms = ref(false)

const form = ref({
  phone: '',
  code: '',
  password: '',
  confirmPassword: ''
})

const validatePassword = (value) => {
  if (value !== form.value.password) {
    return '两次输入的密码不一致'
  }
  return true
}

const sendCode = async () => {
  if (!form.value.phone) {
    showToast('请先输入手机号')
    return
  }
  
  // 模拟发送验证码
  showToast('验证码已发送')
  codeCountdown.value = 60
  
  const timer = setInterval(() => {
    codeCountdown.value--
    if (codeCountdown.value <= 0) {
      clearInterval(timer)
    }
  }, 1000)
}

const onSubmit = async () => {
  if (!agreeTerms.value) {
    showToast('请先同意用户协议和隐私政策')
    return
  }
  
  loading.value = true
  
  try {
    // 模拟注册请求
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    showToast('注册成功')
    router.push('/login')
  } catch (error) {
    showToast('注册失败，请重试')
  } finally {
    loading.value = false
  }
}

const viewTerms = () => {
  router.push('/terms')
}

const viewPrivacy = () => {
  router.push('/privacy')
}
</script>

<style lang="scss" scoped>
.register {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.register-header {
  text-align: center;
  color: white;
  margin-bottom: 30px;
  
  h1 {
    margin: 0 0 8px 0;
    font-size: 28px;
    font-weight: 700;
  }
  
  p {
    margin: 0;
    font-size: 14px;
    opacity: 0.9;
  }
}

.register-form {
  .agreement {
    margin: 16px;
    font-size: 14px;
    color: white;
    
    .van-checkbox {
      --van-checkbox-size: 16px;
      --van-checkbox-font-size: 14px;
    }
    
    .link {
      color: #ffd21e;
      text-decoration: underline;
      cursor: pointer;
    }
  }
  
  .form-actions {
    margin: 20px 0;
    
    .van-button {
      margin-bottom: 16px;
    }
    
    .form-links {
      text-align: center;
      font-size: 14px;
      color: white;
      
      span:last-child {
        color: #ffd21e;
        cursor: pointer;
        margin-left: 4px;
      }
    }
  }
}
</style>