<template>
  <div class="profile-verification page-container">
    <van-nav-bar title="实名认证" left-arrow @click-left="$router.go(-1)" />
    
    <div class="verification-content">
      <van-steps :active="activeStep" direction="vertical">
        <van-step>填写身份信息</van-step>
        <van-step>上传身份证照片</van-step>
        <van-step>等待审核</van-step>
      </van-steps>
      
      <div class="form-section">
        <van-cell-group>
          <van-field
            v-model="formData.name"
            label="真实姓名"
            placeholder="请输入真实姓名"
            required
          />
          <van-field
            v-model="formData.idCard"
            label="身份证号"
            placeholder="请输入身份证号"
            required
          />
        </van-cell-group>
        
        <div class="upload-section">
          <h4>上传身份证照片</h4>
          <div class="upload-grid">
            <div class="upload-item" @click="uploadFront">
              <img v-if="formData.idCardFront" :src="formData.idCardFront" />
              <div v-else class="upload-placeholder">
                <van-icon name="photograph" />
                <span>身份证正面</span>
              </div>
            </div>
            <div class="upload-item" @click="uploadBack">
              <img v-if="formData.idCardBack" :src="formData.idCardBack" />
              <div v-else class="upload-placeholder">
                <van-icon name="photograph" />
                <span>身份证反面</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="submit-section">
          <van-button type="primary" block @click="submitVerification">提交认证</van-button>
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
const activeStep = ref(0)

const formData = ref({
  name: '',
  idCard: '',
  idCardFront: '',
  idCardBack: ''
})

const uploadFront = () => {
  showToast('请上传身份证正面照片')
}

const uploadBack = () => {
  showToast('请上传身份证反面照片')
}

const submitVerification = () => {
  if (!formData.value.name || !formData.value.idCard) {
    showToast('请填写完整信息')
    return
  }
  
  activeStep.value = 2
  showToast('认证信息已提交，请等待审核')
  setTimeout(() => {
    router.push('/profile')
  }, 2000)
}
</script>

<style lang="scss" scoped>
.profile-verification {
  padding-top: 0;
  background: #f7f8fa;
  min-height: 100vh;
  padding-bottom: 60px;
}

.verification-content {
  padding: 20px;
}

.form-section {
  margin-top: 20px;
}

.upload-section {
  margin: 20px 0;
  
  h4 {
    margin: 0 0 12px 0;
    font-size: 16px;
    font-weight: 600;
    color: #323233;
  }
}

.upload-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.upload-item {
  aspect-ratio: 1.586;
  border: 2px dashed #dcdee0;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #969799;
  
  .van-icon {
    font-size: 24px;
    margin-bottom: 8px;
  }
  
  span {
    font-size: 12px;
  }
}

.submit-section {
  margin-top: 30px;
}
</style>