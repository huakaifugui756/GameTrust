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
      
      <!-- 分类帮助内容 -->
      <div class="section" v-if="helpType">
        <h3>{{ getHelpTitle(helpType) }}</h3>
        <div class="help-content-detail" v-html="getHelpContent(helpType)"></div>
      </div>
      
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
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { showToast } from 'vant'

const route = useRoute()
const searchValue = ref('')
const activeNames = ref(['1'])

// 获取帮助类型
const helpType = computed(() => route.query.type)

// 获取帮助标题
const getHelpTitle = (type) => {
  const titles = {
    order: '订单问题',
    payment: '支付问题', 
    account: '账号问题',
    security: '安全担保'
  }
  return titles[type] || '帮助中心'
}

// 获取帮助内容
const getHelpContent = (type) => {
  const contents = {
    order: `
      <h4>订单相关问题</h4>
      <p><strong>如何下单？</strong></p>
      <ul>
        <li>选择您需要的游戏服务类型</li>
        <li>填写详细的服务要求和联系方式</li>
        <li>确认订单信息并完成支付</li>
        <li>等待服务提供者接单并完成服务</li>
      </ul>
      
      <p><strong>如何查看订单状态？</strong></p>
      <ul>
        <li>在"我的"页面点击"订单管理"</li>
        <li>可以查看所有订单的实时状态</li>
        <li>订单状态包括：待接单、进行中、待确认、已完成</li>
      </ul>
      
      <p><strong>如何取消订单？</strong></p>
      <ul>
        <li>订单未被接单前可以随时取消</li>
        <li>已接单的订单需要协商处理</li>
        <li>支持全额退款或部分退款</li>
      </ul>
    `,
    payment: `
      <h4>支付相关问题</h4>
      <p><strong>支持哪些支付方式？</strong></p>
      <ul>
        <li>微信支付</li>
        <li>支付宝</li>
        <li>银行卡支付</li>
        <li>平台余额支付</li>
      </ul>
      
      <p><strong>支付失败怎么办？</strong></p>
      <ul>
        <li>检查网络连接是否正常</li>
        <li>确认账户余额充足</li>
        <li>尝试更换支付方式</li>
        <li>联系客服协助处理</li>
      </ul>
      
      <p><strong>如何申请退款？</strong></p>
      <ul>
        <li>在订单详情页点击"申请退款"</li>
        <li>填写退款原因和金额</li>
        <li>等待平台审核处理</li>
        <li>退款将在1-3个工作日内到账</li>
      </ul>
    `,
    account: `
      <h4>账号相关问题</h4>
      <p><strong>如何注册账号？</strong></p>
      <ul>
        <li>点击"注册"按钮</li>
        <li>填写手机号和验证码</li>
        <li>设置登录密码</li>
        <li>完成实名认证</li>
      </ul>
      
      <p><strong>忘记密码怎么办？</strong></p>
      <ul>
        <li>点击"忘记密码"链接</li>
        <li>输入注册手机号</li>
        <li>接收验证码并重置密码</li>
        <li>使用新密码登录</li>
      </ul>
      
      <p><strong>如何修改个人信息？</strong></p>
      <ul>
        <li>在"我的"页面点击"编辑资料"</li>
        <li>可以修改昵称、头像、简介等</li>
        <li>实名认证信息不可修改</li>
        <li>保存修改后立即生效</li>
      </ul>
    `,
    security: `
      <h4>安全担保服务</h4>
      <p><strong>什么是担保交易？</strong></p>
      <ul>
        <li>买家支付资金到平台托管</li>
        <li>卖家完成服务后申请放款</li>
        <li>买家确认满意后平台放款</li>
        <li>全程保障双方资金安全</li>
      </ul>
      
      <p><strong>担保交易的优势</strong></p>
      <ul>
        <li>资金安全：平台全程托管</li>
        <li>纠纷仲裁：专业客服处理</li>
        <li>实名认证：确保用户真实</li>
        <li>7×24小时：全天候服务</li>
      </ul>
      
      <p><strong>如何发起担保交易？</strong></p>
      <ul>
        <li>点击首页"发起担保"按钮</li>
        <li>填写交易双方信息和金额</li>
        <li>买家支付担保金到平台</li>
        <li>卖家完成服务后申请放款</li>
      </ul>
    `
  }
  return contents[type] || '<p>暂无相关帮助内容</p>'
}

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

.help-content-detail {
  background: white;
  padding: 16px;
  border-radius: 8px;
  line-height: 1.6;
  
  h4 {
    margin: 0 0 12px 0;
    color: #323233;
    font-size: 16px;
  }
  
  p {
    margin: 8px 0;
    color: #646566;
    
    strong {
      color: #323233;
    }
  }
  
  ul {
    margin: 8px 0;
    padding-left: 20px;
    
    li {
      margin: 4px 0;
      color: #646566;
    }
  }
}
</style>