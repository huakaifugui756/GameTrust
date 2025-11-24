<template>
  <div class="login page-container">
    <div class="login-header">
      <h1>GameTrust</h1>
      <p>游戏服务担保交易平台</p>
    </div>

    <div class="login-form">
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
            placeholder="请输入密码"
            :rules="[
              { required: true, message: '请输入密码' },
              { pattern: /^.{6,20}$/, message: '密码长度为6-20位' }
            ]"
          />
        </van-cell-group>
        
        <div class="form-actions">
          <van-button round block type="primary" native-type="submit" :loading="loading">
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
      </van-form>

      <!-- 第三方登录 -->
      <div class="third-party-login">
        <div class="divider">
          <span>其他登录方式</span>
        </div>
        <div class="third-party-buttons">
          <van-button icon="wechat" type="success" size="large" round @click="wechatLogin">
            微信登录
          </van-button>
          <van-button icon="qq" type="primary" size="large" round @click="qqLogin">
            QQ登录
          </van-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showSuccessToast, showFailToast } from 'vant'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const loading = ref(false)

const form = ref({
  phone: '',
  password: ''
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

const onSubmit = async (values) => {
  loading.value = true
  
  try {
    const result = await authStore.login({
      phone: values.phone,
      password: values.password
    })
    
    if (result.success) {
      showSuccessToast('登录成功')
      // 登录成功后跳转到首页或之前的页面
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

const forgotPassword = () => {
  router.push('/forgot-password')
}

const wechatLogin = async () => {
  showToast('微信登录功能开发中')
}

const qqLogin = async () => {
  showToast('QQ登录功能开发中')
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

.third-party-login {
  margin-top: 40px;
  
  .divider {
    position: relative;
    text-align: center;
    margin: 20px 0;
    
    &::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 0;
      right: 0;
      height: 1px;
      background: rgba(255, 255, 255, 0.3);
    }
    
    span {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 0 16px;
      color: rgba(255, 255, 255, 0.8);
      font-size: 14px;
    }
  }
  
  .third-party-buttons {
    display: flex;
    gap: 12px;
    
    .van-button {
      flex: 1;
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(255, 255, 255, 0.2);
      color: white;
      
      &:hover {
        background: rgba(255, 255, 255, 0.2);
      }
    }
  }
}
</style>