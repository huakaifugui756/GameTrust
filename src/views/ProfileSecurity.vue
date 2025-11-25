<template>
  <div class="profile-security page-container">
    <van-nav-bar title="安全设置" left-arrow @click-left="$router.go(-1)" />
    
    <div class="security-content">
      <van-cell-group>
        <van-cell title="修改密码" is-link @click="changePassword" />
        <van-cell title="修改手机号" is-link @click="changePhone" />
        <van-cell title="修改邮箱" is-link @click="changeEmail" />
      </van-cell-group>
      
      <van-cell-group>
        <van-cell title="登录保护" :value="loginProtection ? '已开启' : '已关闭'" @click="toggleLoginProtection">
          <template #right-icon>
            <van-switch v-model="loginProtection" />
          </template>
        </van-cell>
        <van-cell title="设备管理" is-link @click="manageDevices" />
      </van-cell-group>
      
      <van-cell-group>
        <van-cell title="账号冻结" is-link @click="freezeAccount" />
        <van-cell title="注销账号" is-link @click="deleteAccount" />
      </van-cell-group>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { showToast, showConfirmDialog } from 'vant'

const loginProtection = ref(true)

const changePassword = () => {
  showToast('修改密码功能开发中')
}

const changePhone = () => {
  showToast('修改手机号功能开发中')
}

const changeEmail = () => {
  showToast('修改邮箱功能开发中')
}

const toggleLoginProtection = () => {
  showToast(loginProtection.value ? '已开启登录保护' : '已关闭登录保护')
}

const manageDevices = () => {
  showToast('设备管理功能开发中')
}

const freezeAccount = async () => {
  try {
    await showConfirmDialog({
      title: '账号冻结',
      message: '确定要冻结账号吗？冻结后将无法登录，可联系客服解冻。',
    })
    showToast('账号已冻结')
  } catch {
    // 用户取消
  }
}

const deleteAccount = async () => {
  try {
    await showConfirmDialog({
      title: '注销账号',
      message: '确定要注销账号吗？此操作不可恢复，所有数据将被删除。',
    })
    showToast('账号注销申请已提交')
  } catch {
    // 用户取消
  }
}
</script>

<style lang="scss" scoped>
.profile-security {
  padding-top: 0;
  background: #f7f8fa;
  min-height: 100vh;
  padding-bottom: 60px;
}

.security-content {
  padding: 12px;
}

.van-cell-group {
  margin-bottom: 12px;
}
</style>