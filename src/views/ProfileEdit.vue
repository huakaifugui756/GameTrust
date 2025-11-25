<template>
  <div class="profile-edit page-container">
    <van-nav-bar title="编辑资料" left-arrow @click-left="$router.go(-1)" />
    
    <div class="edit-form">
      <van-cell-group>
        <van-cell title="头像" is-link @click="changeAvatar">
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
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
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

const changeAvatar = () => {
  showToast('头像上传功能开发中')
}

const saveProfile = () => {
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
</style>