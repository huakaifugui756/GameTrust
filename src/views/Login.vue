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
            :rules="[{ required: true, message: '请输入手机号' }]"
          />
          <van-field
            v-model="form.password"
            type="password"
            name="password"
            label="密码"
            placeholder="请输入密码"
            :rules="[{ required: true, message: '请输入密码' }]"
          />
        </van-cell-group>
        
        <div class="form-actions">
          <van-button round block type="primary" native-type="submit" :loading="loading">
            登录
          </van-button>
          
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
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'

const router = useRouter()
const loading = ref(false)

const form = ref({
  phone: '',
  password: ''
})

const onSubmit = async () => {
  loading.value = true
  
  try {
    // 模拟登录请求
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    showToast('登录成功')
    router.push('/')
  } catch (error) {
    showToast('登录失败，请重试')
  } finally {
    loading.value = false
  }
}

const forgotPassword = () => {
  showToast('忘记密码功能')
}

const wechatLogin = () => {
  showToast('微信登录')
}

const qqLogin = () => {
  showToast('QQ登录')
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