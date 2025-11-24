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
import { showToast, showSuccessToast, showFailToast } from 'vant'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const loading = ref(false)
const agreeTerms = ref(false)

const form = ref({
  phone: '',
  password: '',
  confirmPassword: ''
})

const validatePassword = (value) => {
  if (value !== form.value.password) {
    return '两次输入的密码不一致'
  }
  return true
}

const validatePhone = (value) => {
  const phoneRegex = /^1[3-9]\d{9}$/
  if (!phoneRegex.test(value)) {
    return '请输入正确的手机号'
  }
  return true
}



const onSubmit = async (values) => {
  if (!agreeTerms.value) {
    showToast('请先同意用户协议和隐私政策')
    return
  }
  
  loading.value = true
  
  try {
    const result = await authStore.register({
      phone: values.phone,
      password: values.password
    })
    
    if (result.success) {
      showSuccessToast('注册成功，请登录')
      // 注册成功后自动填充登录表单
      router.push({
        path: '/login',
        query: { phone: values.phone }
      })
    } else {
      showFailToast(result.error || '注册失败')
    }
  } catch (error) {
    showFailToast('注册失败，请重试')
  } finally {
    loading.value = false
  }
}

const viewTerms = () => {
  // 创建用户协议页面或显示弹窗
  showToast('用户协议页面开发中')
}

const viewPrivacy = () => {
  // 创建隐私政策页面或显示弹窗
  showToast('隐私政策页面开发中')
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