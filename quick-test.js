// 快速测试脚本 - 验证担保交易群功能
console.log('🔍 开始测试担保交易群功能...');

// 模拟管理员用户
const adminUser = {
  id: 1,
  phone: '18800000001',
  name: '管理员0001',
  isAdmin: true
};

console.log('✅ 管理员用户信息:', adminUser);

// 检查localStorage中的测试数据
const chatList = JSON.parse(localStorage.getItem('chatList') || '[]');
const orders = JSON.parse(localStorage.getItem('orders') || '[]');

console.log('📋 chatList中的群聊数量:', chatList.length);
console.log('📋 orders中的订单数量:', orders.length);

// 检查担保交易群
const guaranteeGroups = chatList.filter(chat => chat.isGuarantee);
console.log('🛡️ 担保交易群数量:', guaranteeGroups.length);

if (guaranteeGroups.length > 0) {
  console.log('🛡️ 担保交易群列表:');
  guaranteeGroups.forEach((group, index) => {
    console.log(`  ${index + 1}. ${group.name} (${group.id})`);
  });
} else {
  console.log('❌ 没有找到担保交易群');
}

console.log('🎯 测试完成！');
console.log('');
console.log('📖 使用说明:');
console.log('1. 访问 http://localhost:3007');
console.log('2. 使用管理员账号登录: 18800000001 / 123456');
console.log('3. 进入"消息"页面，点击"群聊"标签');
console.log('4. 应该能看到担保交易群');