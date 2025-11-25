<template>
  <div class="help page-container">
    <van-nav-bar title="帮助中心" left-arrow @click-left="$router.go(-1)" />
    
    <div class="help-content">
      <!-- 搜索框 -->
      <van-search
        v-model="searchValue"
        placeholder="搜索帮助内容"
        @search="onSearch"
      />
      
      <!-- 常见问题 -->
      <div class="section">
        <h3>常见问题</h3>
        <van-collapse v-model="activeNames">
          <van-collapse-item title="如何下单？" name="1">
            <p>1. 选择您需要的游戏服务</p>
            <p>2. 填写相关信息和要求</p>
            <p>3. 确认订单并支付</p>
            <p>4. 等待代练完成服务</p>
          </van-collapse-item>
          <van-collapse-item title="如何保证交易安全？" name="2">
            <p>平台提供担保交易服务，资金安全有保障。代练完成后，确认满意再放款。</p>
          </van-collapse-item>
          <van-collapse-item title="代练不达标怎么办？" name="3">
            <p>如果代练未达到约定要求，可以申请退款或重新安排代练。</p>
          </van-collapse-item>
        </van-collapse>
      </div>
      
      <!-- 联系方式 -->
      <div class="section contact-section">
        <h3>联系我们</h3>
        <van-cell-group>
          <van-cell title="客服QQ" value="123456789" />
          <van-cell title="客服微信" value="gamekefu" />
          <van-cell title="客服电话" value="400-123-4567" />
        </van-cell-group>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { showToast } from 'vant'

const searchValue = ref('')
const activeNames = ref(['1'])

const onSearch = (value) => {
  if (value.trim()) {
    showToast(`搜索: ${value}`)
  }
}
</script>

<style lang="scss" scoped>
.help {
  padding-top: 0;
  background: #f7f8fa;
  min-height: 100vh;
  padding-bottom: 60px;
}

.help-content {
  padding: 12px;
}

.section {
  margin-bottom: 20px;
  
  h3 {
    margin: 0 0 12px 0;
    font-size: 18px;
    font-weight: 600;
    color: #323233;
  }
}

.contact-section {
  .van-cell-group {
    border-radius: 8px;
    overflow: hidden;
  }
}
</style>