<template>
  <div class="profile-edit page-container">
    <van-nav-bar title="编辑资料" left-arrow @click-left="$router.go(-1)" />
    
    <div class="edit-form">
      <van-cell-group>
        <van-cell title="头像" is-link @click="showAvatarActions">
          <template #right-icon>
            <img :src="formData.avatar" class="avatar-preview" />
          </template>
        </van-cell>
        <van-field
          v-model="formData.name"
          label="昵称"
          placeholder="请输入昵称"
        />
        <van-field
          v-model="formData.phone"
          label="手机号"
          placeholder="请输入手机号"
          readonly
        />
        <van-field
          v-model="formData.email"
          label="邮箱"
          placeholder="请输入邮箱"
        />
        <van-field
          v-model="formData.bio"
          label="个人简介"
          type="textarea"
          placeholder="介绍一下自己吧"
          rows="3"
        />
      </van-cell-group>
      
      <div class="submit-section">
        <van-button type="primary" block @click="saveProfile">保存</van-button>
      </div>
    </div>
    
    <!-- 头像选择弹窗 -->
    <van-action-sheet
      v-model:show="showAvatarSheet"
      :actions="avatarActions"
      @select="onAvatarSelect"
      cancel-text="取消"
    />
    
    <!-- 头像裁剪弹窗 -->
    <van-dialog
      v-model:show="showCropDialog"
      title="裁剪头像"
      show-cancel-button
      @confirm="confirmCrop"
    >
      <div class="crop-container">
        <div class="crop-preview">
          <img :src="tempAvatar" ref="cropImage" />
        </div>
        <div class="crop-controls">
          <van-slider
            v-model="cropScale"
            :min="50"
            :max="200"
            @change="updateCropPreview"
          />
        </div>
      </div>
    </van-dialog>
    
    <!-- 默认头像选择弹窗 -->
    <van-popup v-model:show="showDefaultAvatarDialog" position="bottom" :style="{ height: '60%' }">
      <div class="default-avatar-popup">
        <div class="popup-header">
          <h3>选择默认头像</h3>
          <van-icon name="cross" @click="showDefaultAvatarDialog = false" />
        </div>
        <div class="avatar-grid">
          <div 
            v-for="(avatar, index) in defaultAvatars" 
            :key="index"
            class="avatar-item"
            :class="{ 'selected': formData.avatar === avatar }"
            @click="selectDefaultAvatar(avatar)"
          >
            <img :src="avatar" :alt="`头像 ${index + 1}`" />
            <van-icon v-if="formData.avatar === avatar" name="success" class="selected-icon" />
          </div>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showLoadingToast, closeToast } from 'vant'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const formData = ref({
  avatar: 'https://picsum.photos/seed/user/80/80.jpg',
  name: '游戏玩家',
  phone: '13800138000',
  email: 'user@example.com',
  bio: ''
})

// 头像相关状态
const showAvatarSheet = ref(false)
const showCropDialog = ref(false)
const showDefaultAvatarDialog = ref(false)
const tempAvatar = ref('')
const cropScale = ref(100)
const cropImage = ref(null)

// 头像操作选项
const avatarActions = [
  { name: '拍照', value: 'camera' },
  { name: '从相册选择', value: 'gallery' },
  { name: '默认头像', value: 'default' }
]

// 默认头像列表
const defaultAvatars = [
  'https://picsum.photos/seed/avatar1/80/80.jpg',
  'https://picsum.photos/seed/avatar2/80/80.jpg',
  'https://picsum.photos/seed/avatar3/80/80.jpg',
  'https://picsum.photos/seed/avatar4/80/80.jpg',
  'https://picsum.photos/seed/avatar5/80/80.jpg',
  'https://picsum.photos/seed/avatar6/80/80.jpg'
]

onMounted(() => {
  // 初始化表单数据
  if (authStore.user) {
    formData.value = {
      ...formData.value,
      ...authStore.user
    }
  }
})

const showAvatarActions = () => {
  showAvatarSheet.value = true
}

const onAvatarSelect = (action) => {
  showAvatarSheet.value = false
  
  switch (action.value) {
    case 'camera':
      openCamera()
      break
    case 'gallery':
      openGallery()
      break
    case 'default':
      showDefaultAvatars()
      break
  }
}

const openCamera = () => {
  // 创建文件输入元素
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.capture = 'camera'
  input.onchange = handleFileSelect
  input.click()
}

const openGallery = () => {
  // 创建文件输入元素
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = handleFileSelect
  input.click()
}

const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (!file) return
  
  // 验证文件类型
  if (!file.type.startsWith('image/')) {
    showToast('请选择图片文件')
    return
  }
  
  // 验证文件大小 (5MB)
  if (file.size > 5 * 1024 * 1024) {
    showToast('图片大小不能超过5MB')
    return
  }
  
  // 读取文件并预览
  const reader = new FileReader()
  reader.onload = (e) => {
    tempAvatar.value = e.target.result
    showCropDialog.value = true
  }
  reader.readAsDataURL(file)
}

const showDefaultAvatars = () => {
  showDefaultAvatarDialog.value = true
}

const selectDefaultAvatar = (avatarUrl) => {
  formData.value.avatar = avatarUrl
  showToast('已选择默认头像')
  showDefaultAvatarDialog.value = false
}

const updateCropPreview = () => {
  // 更新裁剪预览
  if (cropImage.value) {
    cropImage.value.style.transform = `scale(${cropScale.value / 100})`
  }
}

const confirmCrop = () => {
  // 模拟裁剪和上传
  showLoadingToast({
    message: '上传中...',
    forbidClick: true,
    duration: 0
  })
  
  // 模拟上传过程
  setTimeout(() => {
    // 在实际应用中，这里应该上传到服务器
    // 现在直接使用裁剪后的图片
    formData.value.avatar = tempAvatar.value
    
    closeToast()
    showToast('头像更新成功')
    showCropDialog.value = false
  }, 1500)
}

const saveProfile = () => {
  // 验证表单
  if (!formData.value.name.trim()) {
    showToast('请输入昵称')
    return
  }
  
  if (!formData.value.email.trim()) {
    showToast('请输入邮箱')
    return
  }
  
  // 验证邮箱格式
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(formData.value.email)) {
    showToast('请输入正确的邮箱格式')
    return
  }
  
  // 更新用户信息
  if (authStore.user) {
    authStore.updateUser(formData.value)
  }
  
  showToast('保存成功')
  router.push('/profile')
}
</script>

<style lang="scss" scoped>
.profile-edit {
  padding-top: 0;
  background: #f7f8fa;
  min-height: 100vh;
  padding-bottom: 60px;
}

.edit-form {
  margin-top: 12px;
}

.avatar-preview {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.submit-section {
  padding: 20px 16px;
}

.crop-container {
  padding: 20px;
  
  .crop-preview {
    width: 200px;
    height: 200px;
    margin: 0 auto 20px;
    border-radius: 50%;
    overflow: hidden;
    border: 2px solid #ebedf0;
    display: flex;
    align-items: center;
    justify-content: center;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }
  }
  
  .crop-controls {
    padding: 0 20px;
    
    .van-slider {
      margin: 10px 0;
    }
  }
}

/* 默认头像选择弹窗样式 */
.default-avatar-popup {
  height: 100%;
  display: flex;
  flex-direction: column;
  
  .popup-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid #ebedf0;
    
    h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 500;
    }
    
    .van-icon {
      font-size: 20px;
      color: #969799;
      cursor: pointer;
    }
  }
  
  .avatar-grid {
    flex: 1;
    padding: 20px;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    overflow-y: auto;
    
    .avatar-item {
      position: relative;
      width: 80px;
      height: 80px;
      border-radius: 50%;
      overflow: hidden;
      cursor: pointer;
      border: 3px solid transparent;
      transition: all 0.3s ease;
      margin: 0 auto;
      
      &:hover {
        border-color: #1989fa;
        transform: scale(1.05);
      }
      
      &.selected {
        border-color: #1989fa;
      }
      
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      
      .selected-icon {
        position: absolute;
        bottom: 0;
        right: 0;
        background: #1989fa;
        color: white;
        border-radius: 50%;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
      }
    }
  }
}

/* 头像选择弹窗样式 */
.van-action-sheet__content {
  .avatar-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    padding: 16px;
    
    .avatar-item {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      overflow: hidden;
      cursor: pointer;
      border: 2px solid transparent;
      transition: all 0.3s ease;
      
      &:hover {
        border-color: #1989fa;
        transform: scale(1.05);
      }
      
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
  }
}
</style>