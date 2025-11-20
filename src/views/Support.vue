<template>
  <div class="support page-container">
    <!-- 顶部导航 -->
    <van-nav-bar
      title="客服中心"
      left-text="返回"
      left-arrow
      @click-left="$router.go(-1)"
    />

    <!-- 客服信息卡片 -->
    <div class="support-card card">
      <div class="support-header">
        <img src="https://picsum.photos/seed/support/60/60.jpg" alt="客服" class="support-avatar" />
        <div class="support-info">
          <h3>GameTrust客服</h3>
          <div class="status">
            <van-tag type="success" size="small">在线</van-tag>
            <span class="response-time">平均响应时间 5分钟</span>
          </div>
        </div>
        <van-button type="primary" size="small" @click="contactSupport">
          <van-icon name="chat-o" />
          在线咨询
        </van-button>
      </div>
    </div>

    <!-- 快速帮助 -->
    <div class="quick-help card">
      <h3>快速帮助</h3>
      <div class="help-grid">
        <div class="help-item" @click="goToHelp('order')">
          <van-icon name="orders-o" />
          <span>订单问题</span>
        </div>
        <div class="help-item" @click="goToHelp('payment')">
          <van-icon name="balance-o" />
          <span>支付问题</span>
        </div>
        <div class="help-item" @click="goToHelp('account')">
          <van-icon name="user-o" />
          <span>账号问题</span>
        </div>
        <div class="help-item" @click="goToHelp('security')">
          <van-icon name="shield-o" />
          <span>安全担保</span>
        </div>
      </div>
    </div>

    <!-- 常见问题 -->
    <div class="faq-section card">
      <h3>常见问题</h3>
      <van-collapse v-model="activeNames">
        <van-collapse-item title="如何发布需求？" name="1">
          <p>1. 点击首页的"需求大厅"进入需求列表页面</p>
          <p>2. 点击右下角的"+"按钮发布新需求</p>
          <p>3. 填写需求详情，包括游戏类型、预算、时间要求等</p>
          <p>4. 提交后等待服务者接单</p>
        </van-collapse-item>
        <van-collapse-item title="如何发起担保交易？" name="2">
          <p>1. 点击首页的"发起担保"按钮</p>
          <p>2. 填写交易信息，包括交易金额、双方信息等</p>
          <p>3. 买家支付担保金到平台</p>
          <p>4. 卖家完成服务后，买家确认收货</p>
          <p>5. 平台释放资金给卖家</p>
        </van-collapse-item>
        <van-collapse-item title="担保交易安全吗？" name="3">
          <p>GameTrust采用第三方担保交易模式，确保交易安全：</p>
          <p>• 资金由平台托管，交易完成前不会释放给卖家</p>
          <p>• 支持交易纠纷仲裁，保障双方权益</p>
          <p>• 实名认证体系，确保用户真实性</p>
          <p>• 7×24小时客服支持</p>
        </van-collapse-item>
        <van-collapse-item title="如何成为服务提供者？" name="4">
          <p>1. 注册并完成实名认证</p>
          <p>2. 完善个人资料和技能信息</p>
          <p>3. 在需求大厅寻找合适的订单</p>
          <p>4. 点击"立即接单"开始提供服务</p>
          <p>5. 完成服务后获得评价和收益</p>
        </van-collapse-item>
        <van-collapse-item title="交易费用如何收取？" name="5">
          <p>平台收取交易成功金额的3%作为服务费：</p>
          <p>• 买家承担2%，卖家承担1%</p>
          <p>• 单笔交易最低收费1元，最高50元</p>
          <p>• 交易失败不收取任何费用</p>
        </van-collapse-item>
      </van-collapse>
    </div>

    <!-- 联系方式 -->
    <div class="contact-section card">
      <h3>其他联系方式</h3>
      <div class="contact-list">
        <div class="contact-item" @click="copyToClipboard('support@gametrust.com')">
          <van-icon name="envelop-o" />
          <div class="contact-info">
            <div class="contact-label">邮箱</div>
            <div class="contact-value">support@gametrust.com</div>
          </div>
          <van-icon name="copy" />
        </div>
        <div class="contact-item" @click="copyToClipboard('400-123-4567')">
          <van-icon name="phone-o" />
          <div class="contact-info">
            <div class="contact-label">客服热线</div>
            <div class="contact-value">400-123-4567</div>
          </div>
          <van-icon name="copy" />
        </div>
        <div class="contact-item" @click="openWechat">
          <van-icon name="wechat" />
          <div class="contact-info">
            <div class="contact-label">微信客服</div>
            <div class="contact-value">GameTrust2024</div>
          </div>
          <van-icon name="qr" />
        </div>
      </div>
    </div>

    <!-- 服务时间 -->
    <div class="service-time card">
      <div class="time-header">
        <van-icon name="clock-o" />
        <h3>服务时间</h3>
      </div>
      <div class="time-content">
        <div class="time-item">
          <span class="label">在线客服：</span>
          <span class="value">7×24小时</span>
        </div>
        <div class="time-item">
          <span class="label">电话客服：</span>
          <span class="value">9:00-22:00</span>
        </div>
        <div class="time-item">
          <span class="label">邮件回复：</span>
          <span class="value">24小时内</span>
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
const activeNames = ref(['1'])

const contactSupport = () => {
  router.push('/chat/support')
}

const goToHelp = (type) => {
  router.push(`/help/${type}`)
}

const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    showToast('已复制到剪贴板')
  } catch (err) {
    showToast('复制失败，请手动复制')
  }
}

const openWechat = () => {
  showToast('请添加微信客服：GameTrust2024')
}
</script>

<style lang="scss" scoped>
.support {
  background: #f7f8fa;
  padding-bottom: 60px;
}

.support-card {
  margin: 16px;
  padding: 20px;
  
  .support-header {
    display: flex;
    align-items: center;
    
    .support-avatar {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      margin-right: 16px;
    }
    
    .support-info {
      flex: 1;
      
      h3 {
        margin: 0 0 8px;
        font-size: 18px;
        font-weight: 600;
      }
      
      .status {
        display: flex;
        align-items: center;
        gap: 8px;
        
        .response-time {
          font-size: 12px;
          color: #969799;
        }
      }
    }
  }
}

.quick-help {
  margin: 0 16px 16px;
  
  h3 {
    margin: 0 0 16px;
    font-size: 16px;
    font-weight: 600;
  }
  
  .help-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    
    .help-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 16px;
      background: #f7f8fa;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
      
      &:active {
        background: #ebedf0;
        transform: scale(0.98);
      }
      
      .van-icon {
        font-size: 24px;
        color: #1989fa;
      }
      
      span {
        font-size: 14px;
        color: #323233;
      }
    }
  }
}

.faq-section {
  margin: 0 16px 16px;
  
  h3 {
    margin: 0 0 16px;
    font-size: 16px;
    font-weight: 600;
  }
  
  :deep(.van-collapse-item__content) {
    padding: 16px;
    font-size: 14px;
    line-height: 1.6;
    color: #646566;
    
    p {
      margin: 0 0 8px;
      
      &:last-child {
        margin-bottom: 0;
      }
    }
  }
}

.contact-section {
  margin: 0 16px 16px;
  
  h3 {
    margin: 0 0 16px;
    font-size: 16px;
    font-weight: 600;
  }
  
  .contact-list {
    .contact-item {
      display: flex;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid #ebedf0;
      cursor: pointer;
      
      &:last-child {
        border-bottom: none;
      }
      
      &:active {
        background: #f7f8fa;
      }
      
      .van-icon {
        font-size: 20px;
        color: #1989fa;
        margin-right: 12px;
        
        &:last-child {
          margin-right: 0;
          color: #969799;
        }
      }
      
      .contact-info {
        flex: 1;
        
        .contact-label {
          font-size: 12px;
          color: #969799;
          margin-bottom: 2px;
        }
        
        .contact-value {
          font-size: 14px;
          color: #323233;
        }
      }
    }
  }
}

.service-time {
  margin: 0 16px 16px;
  
  .time-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;
    
    .van-icon {
      font-size: 20px;
      color: #1989fa;
    }
    
    h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
    }
  }
  
  .time-content {
    .time-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      
      .label {
        font-size: 14px;
        color: #646566;
      }
      
      .value {
        font-size: 14px;
        font-weight: 600;
        color: #323233;
      }
    }
  }
}
</style>