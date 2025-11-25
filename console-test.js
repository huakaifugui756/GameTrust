// 在浏览器控制台中运行此脚本来测试担保交易群功能
console.log('🔍 开始测试担保交易群功能...');

// 1. 检查当前数据
const chatList = JSON.parse(localStorage.getItem('chatList') || '[]');
const orders = JSON.parse(localStorage.getItem('orders') || '[]');
const guaranteeGroups = chatList.filter(chat => chat.isGuarantee);

console.log('📊 数据统计:');
console.log('- 聊天列表总数:', chatList.length);
console.log('- 担保交易群数量:', guaranteeGroups.length);
console.log('- 订单数量:', orders.length);

// 2. 显示担保交易群详情
if (guaranteeGroups.length > 0) {
    console.log('🛡️ 担保交易群列表:');
    guaranteeGroups.forEach((group, index) => {
        console.log(`${index + 1}. ${group.name} (${group.id})`);
        console.log(`   - 成员数: ${group.members?.length || 0}`);
        console.log(`   - 最后消息: ${group.lastMessage}`);
    });
} else {
    console.log('❌ 没有找到担保交易群');
    console.log('🔧 正在创建测试数据...');
    createTestData();
}

// 3. 检查聊天消息
let totalMessages = 0;
guaranteeGroups.forEach(group => {
    const messages = JSON.parse(localStorage.getItem(`chat_messages_${group.id}`) || '[]');
    totalMessages += messages.length;
    console.log(`📨 ${group.name}: ${messages.length} 条消息`);
});

console.log(`📨 总消息数: ${totalMessages}`);

// 4. 创建测试数据函数
function createTestData() {
    const testGroups = [
        {
            id: 'test_guarantee_1',
            name: '王者荣耀段位担保群',
            avatar: 'https://picsum.photos/seed/game1/40/40.jpg',
            lastMessage: '管理员已确认收款，开始代练服务',
            lastTime: '10:30',
            unreadCount: 0,
            isGroup: true,
            isGuarantee: true,
            members: [
                { name: '玩家小李', avatar: 'https://picsum.photos/seed/player1/40/40.jpg', role: 'buyer' },
                { name: '代练师小王', avatar: 'https://picsum.photos/seed/seller1/40/40.jpg', role: 'seller' },
                { name: '管理员', avatar: 'https://picsum.photos/seed/admin/40/40.jpg', role: 'admin' }
            ]
        },
        {
            id: 'test_guarantee_2', 
            name: '和平精英装备担保群',
            avatar: 'https://picsum.photos/seed/game2/40/40.jpg',
            lastMessage: '等待买家确认收货',
            lastTime: '09:15',
            unreadCount: 2,
            isGroup: true,
            isGuarantee: true,
            members: [
                { name: '买家小张', avatar: 'https://picsum.photos/seed/player2/40/40.jpg', role: 'buyer' },
                { name: '卖家小陈', avatar: 'https://picsum.photos/seed/seller2/40/40.jpg', role: 'seller' },
                { name: '管理员', avatar: 'https://picsum.photos/seed/admin/40/40.jpg', role: 'admin' }
            ]
        },
        {
            id: 'test_guarantee_3',
            name: '原神账号担保群', 
            avatar: 'https://picsum.photos/seed/game3/40/40.jpg',
            lastMessage: '账号交易已完成，资金已释放',
            lastTime: '昨天',
            unreadCount: 0,
            isGroup: true,
            isGuarantee: true,
            members: [
                { name: '买家小刘', avatar: 'https://picsum.photos/seed/player3/40/40.jpg', role: 'buyer' },
                { name: '卖家小赵', avatar: 'https://picsum.photos/seed/seller3/40/40.jpg', role: 'seller' },
                { name: '管理员', avatar: 'https://picsum.photos/seed/admin/40/40.jpg', role: 'admin' }
            ]
        }
    ];
    
    // 保存到聊天列表
    const currentChatList = JSON.parse(localStorage.getItem('chatList') || '[]');
    testGroups.forEach(group => {
        if (!currentChatList.find(chat => chat.id === group.id)) {
            currentChatList.push(group);
        }
        
        // 创建基本聊天消息
        const messages = [
            {
                id: 1,
                sender: '系统消息',
                content: `${group.name} 已创建`,
                time: '09:00',
                isSelf: false,
                avatar: 'https://picsum.photos/seed/system/40/40.jpg',
                showTime: true,
                isSystem: true
            },
            {
                id: 2,
                sender: '管理员',
                content: '大家好，我是管理员。担保交易已创建，请按照流程操作。',
                time: '09:02',
                isSelf: false,
                avatar: 'https://picsum.photos/seed/admin/40/40.jpg',
                isAdmin: true
            }
        ];
        
        localStorage.setItem(`chat_messages_${group.id}`, JSON.stringify(messages));
    });
    localStorage.setItem('chatList', JSON.stringify(currentChatList));
    
    // 保存到订单列表
    const currentOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    testGroups.forEach(group => {
        if (!currentOrders.find(order => order.id === group.id)) {
            currentOrders.push({
                id: group.id,
                title: group.name,
                status: group.id === 'test_guarantee_1' ? 'confirmed' : group.id === 'test_guarantee_2' ? 'pending' : 'completed',
                amount: group.id === 'test_guarantee_1' ? '200' : group.id === 'test_guarantee_2' ? '150' : '300',
                createdAt: new Date().toISOString()
            });
        }
    });
    localStorage.setItem('orders', JSON.stringify(currentOrders));
    
    console.log('✅ 测试数据创建完成！');
}

console.log('🎯 测试完成！');
console.log('');
console.log('📖 使用说明:');
console.log('1. 确保使用管理员账号登录 (188开头的手机号)');
console.log('2. 进入消息页面，查看群聊标签');
console.log('3. 应该能看到担保交易群');
console.log('');
console.log('💡 如果没有看到担保群，请刷新页面或重新登录');