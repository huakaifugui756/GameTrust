<template>
  <div class="profile-privacy page-container">
    <van-nav-bar title="隐私设置" left-arrow @click-left="$router.go(-1)" />
    
    <div class="privacy-content">
      <van-cell-group>
        <van-cell title="个人资料可见性" is-link @click="setProfileVisibility" :value="profileVisibility" />
        <van-cell title="在线状态" :value="onlineStatus ? '显示' : '隐藏'" @click="toggleOnlineStatus">
          <template #right-icon>
            <van-switch v-model="onlineStatus" />
          </template>
        </van-cell>
        <van-cell title="允许陌生人私信" :value="allowStrangerMessage ? '允许' : '禁止'" @click="toggleStrangerMessage">
          <template #right-icon>
            <van-switch v-model="allowStrangerMessage" />
          </template>
        </van-cell>
      </van-cell-group>
      
      <van-cell-group>
        <van-cell title="黑名单管理" is-link @click="manageBlacklist" />
        <van-cell title="屏蔽词设置" is-link @click="setBlockedWords" />
      </van-cell-group>
      
      <van-cell-group>
        <van-cell title="数据收集" is-link @click="setDataCollection" :value="dataCollection" />
        <van-cell title="个性化推荐" :value="personalizedRecommendation ? '开启' : '关闭'" @click="togglePersonalizedRecommendation">
          <template #right-icon>
            <van-switch v-model="personalizedRecommendation" />
          </template>
        </van-cell>
      </van-cell-group>
      
      <div class="privacy-tips">
        <h4>隐私提示</h4>
        <ul>
          <li>开启在线状态后，其他用户可以看到您的在线状态</li>
          <li>关闭个性化推荐将影响部分功能的用户体验</li>
          <li>黑名单用户无法查看您的个人资料和发送消息</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { showToast, showActionSheet as vanShowActionSheet } from 'vant'

const profileVisibility = ref('所有人可见')
const onlineStatus = ref(true)
const allowStrangerMessage = ref(false)
const dataCollection = ref('必要信息')
const personalizedRecommendation = ref(true)

const setProfileVisibility = () => {
  vanShowActionSheet({
    title: '设置个人资料可见性',
    actions: [
      { name: '所有人可见' },
      { name: '仅好友可见' },
      { name: '完全隐藏' }
    ],
    onSelect: (action) => {
      profileVisibility.value = action.name
      showToast(`已设置: ${action.name}`)
    }
  })
}

const toggleOnlineStatus = () => {
  showToast(onlineStatus.value ? '在线状态已显示' : '在线状态已隐藏')
}

const toggleStrangerMessage = () => {
  showToast(allowStrangerMessage.value ? '允许陌生人私信' : '禁止陌生人私信')
}

const manageBlacklist = () => {
  showToast('黑名单管理功能开发中')
}

const setBlockedWords = () => {
  showToast('屏蔽词设置功能开发中')
}

const setDataCollection = () => {
  vanShowActionSheet({
    title: '设置数据收集',
    actions: [
      { name: '必要信息' },
      { name: '基本信息' },
      { name: '全部信息' }
    ],
    onSelect: (action) => {
      dataCollection.value = action.name
      showToast(`已设置: ${action.name}`)
    }
  })
}

const togglePersonalizedRecommendation = () => {
  showToast(personalizedRecommendation.value ? '个性化推荐已开启' : '个性化推荐已关闭')
}
</script>

<style lang="scss" scoped>
.profile-privacy {
  padding-top: 0;
  background: #f7f8fa;
  min-height: 100vh;
  padding-bottom: 60px;
}

.privacy-content {
  padding: 12px;
}

.van-cell-group {
  margin-bottom: 12px;
}

.privacy-tips {
  margin-top: 20px;
  padding: 16px;
  background: #f0f9ff;
  border: 1px solid #e1f5ff;
  border-radius: 8px;
  
  h4 {
    margin: 0 0 12px 0;
    font-size: 16px;
    font-weight: 600;
    color: #1989fa;
  }
  
  ul {
    margin: 0;
    padding-left: 16px;
    
    li {
      margin-bottom: 8px;
      font-size: 14px;
      color: #646566;
      line-height: 1.5;
      
      &:last-child {
        margin-bottom: 0;
      }
    }
  }
}
</style>