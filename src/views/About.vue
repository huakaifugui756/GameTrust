<template>
  <div class="about page-container">
    <van-nav-bar title="关于我们" left-arrow @click-left="$router.go(-1)" />
    
    <div class="about-content">
      <!-- Logo和介绍 -->
      <div class="app-info">
        <div class="logo">
          <img src="https://picsum.photos/seed/logo/120/120.jpg" alt="Logo" />
        </div>
        <h2>GameTrust</h2>
        <p class="version">版本 1.0.0</p>
        <p class="description">
          专业的游戏代练担保交易平台，为玩家提供安全、可靠的代练服务。
        </p>
      </div>
      
      <!-- 特色功能 -->
      <div class="features">
        <h3>平台特色</h3>
        <div class="feature-list">
          <div class="feature-item">
            <van-icon name="shield-o" />
            <span>担保交易</span>
          </div>
          <div class="feature-item">
            <van-icon name="user-circle-o" />
            <span>实名认证</span>
          </div>
          <div class="feature-item">
            <van-icon name="clock-o" />
            <span>24小时客服</span>
          </div>
          <div class="feature-item">
            <van-icon name="medal-o" />
            <span>品质保证</span>
          </div>
        </div>
      </div>
      
      <!-- 联系信息 -->
      <div class="contact-info">
        <h3>联系我们</h3>
        <van-cell-group>
          <van-cell title="公司名称" value="GameTrust科技有限公司" />
          <van-cell title="客服邮箱" value="support@gametrust.com" />
          <van-cell title="公司地址" value="北京市朝阳区xxx大厦" />
        </van-cell-group>
      </div>
      
      <!-- 版权信息 -->
      <div class="copyright">
        <p>© 2024 GameTrust. All rights reserved.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
// 无需额外逻辑
</script>

<style lang="scss" scoped>
.about {
  padding-top: 0;
  background: #f7f8fa;
  min-height: 100vh;
  padding-bottom: 60px;
}

.about-content {
  padding: 20px;
}

.app-info {
  text-align: center;
  margin-bottom: 30px;
  
  .logo {
    margin-bottom: 16px;
    
    img {
      width: 80px;
      height: 80px;
      border-radius: 16px;
    }
  }
  
  h2 {
    margin: 0 0 8px 0;
    font-size: 24px;
    font-weight: 700;
    color: #323233;
  }
  
  .version {
    margin: 0 0 16px 0;
    font-size: 14px;
    color: #969799;
  }
  
  .description {
    margin: 0;
    font-size: 14px;
    color: #646566;
    line-height: 1.5;
  }
}

.features {
  margin-bottom: 30px;
  
  h3 {
    margin: 0 0 16px 0;
    font-size: 18px;
    font-weight: 600;
    color: #323233;
  }
  
  .feature-list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
  
  .feature-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 16px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    
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

.contact-info {
  margin-bottom: 30px;
  
  h3 {
    margin: 0 0 12px 0;
    font-size: 18px;
    font-weight: 600;
    color: #323233;
  }
  
  .van-cell-group {
    border-radius: 8px;
    overflow: hidden;
  }
}

.copyright {
  text-align: center;
  padding: 20px 0;
  
  p {
    margin: 0;
    font-size: 12px;
    color: #969799;
  }
}
</style>