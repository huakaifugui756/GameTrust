<template>
  <div class="orders page-container">
    <!-- 顶部导航 -->
    <van-tabs v-model:active="activeTab" sticky>
      <van-tab title="全部" name="all">
        <OrderList :orders="allOrders" @view-order="viewOrder" />
      </van-tab>
      
      <van-tab title="进行中" name="ongoing">
        <OrderList :orders="ongoingOrders" @view-order="viewOrder" />
      </van-tab>
      
      <van-tab title="待确认" name="pending">
        <OrderList :orders="pendingOrders" @view-order="viewOrder" />
      </van-tab>
      
      <van-tab title="已完成" name="completed">
        <OrderList :orders="completedOrders" @view-order="viewOrder" />
      </van-tab>
    </van-tabs>

    <!-- 创建订单按钮 -->
    <van-floating-bubble icon="plus" axis="xy" @click="createOrder" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import OrderList from '@/components/OrderList.vue'

const router = useRouter()
const activeTab = ref('all')

// 全部订单
const allOrders = ref([
  {
    id: 'ORD20240115001',
    type: '代肝服务',
    game: '王者荣耀',
    status: '进行中',
    statusText: '进行中',
    statusColor: 'primary',
    content: '星耀段位代练上王者',
    price: 150.00,
    createTime: '2024-01-15 10:30:00',
    buyer: {
      name: '游戏小王',
      avatar: 'https://picsum.photos/seed/buyer1/40/40.jpg'
    },
    seller: {
      name: '代练达人',
      avatar: 'https://picsum.photos/seed/seller1/40/40.jpg'
    },
    deadline: '2024-01-20 23:59:59'
  },
  {
    id: 'ORD20240115002',
    type: '账号交易',
    game: '原神',
    status: '待确认',
    statusText: '待确认',
    statusColor: 'warning',
    content: '60级满角色账号出售',
    price: 899.00,
    createTime: '2024-01-15 09:15:00',
    buyer: {
      name: '原神爱好者',
      avatar: 'https://picsum.photos/seed/buyer2/40/40.jpg'
    },
    seller: {
      name: '账号卖家',
      avatar: 'https://picsum.photos/seed/seller2/40/40.jpg'
    },
    deadline: '2024-01-18 23:59:59'
  },
  {
    id: 'ORD20240114001',
    type: '代肝服务',
    game: '和平精英',
    status: '已完成',
    statusText: '已完成',
    statusColor: 'success',
    content: '钻石上皇冠段位',
    price: 200.00,
    createTime: '2024-01-14 15:20:00',
    completeTime: '2024-01-15 08:30:00',
    buyer: {
      name: '射击玩家',
      avatar: 'https://picsum.photos/seed/buyer3/40/40.jpg'
    },
    seller: {
      name: '射击代练',
      avatar: 'https://picsum.photos/seed/seller3/40/40.jpg'
    }
  }
])

// 进行中订单
const ongoingOrders = ref([
  {
    id: 'ORD20240115001',
    type: '代肝服务',
    game: '王者荣耀',
    status: '进行中',
    statusText: '进行中',
    statusColor: 'primary',
    content: '星耀段位代练上王者',
    price: 150.00,
    createTime: '2024-01-15 10:30:00',
    buyer: {
      name: '游戏小王',
      avatar: 'https://picsum.photos/seed/buyer1/40/40.jpg'
    },
    seller: {
      name: '代练达人',
      avatar: 'https://picsum.photos/seed/seller1/40/40.jpg'
    },
    deadline: '2024-01-20 23:59:59'
  }
])

// 待确认订单
const pendingOrders = ref([
  {
    id: 'ORD20240115002',
    type: '账号交易',
    game: '原神',
    status: '待确认',
    statusText: '待确认',
    statusColor: 'warning',
    content: '60级满角色账号出售',
    price: 899.00,
    createTime: '2024-01-15 09:15:00',
    buyer: {
      name: '原神爱好者',
      avatar: 'https://picsum.photos/seed/buyer2/40/40.jpg'
    },
    seller: {
      name: '账号卖家',
      avatar: 'https://picsum.photos/seed/seller2/40/40.jpg'
    },
    deadline: '2024-01-18 23:59:59'
  }
])

// 已完成订单
const completedOrders = ref([
  {
    id: 'ORD20240114001',
    type: '代肝服务',
    game: '和平精英',
    status: '已完成',
    statusText: '已完成',
    statusColor: 'success',
    content: '钻石上皇冠段位',
    price: 200.00,
    createTime: '2024-01-14 15:20:00',
    completeTime: '2024-01-15 08:30:00',
    buyer: {
      name: '射击玩家',
      avatar: 'https://picsum.photos/seed/buyer3/40/40.jpg'
    },
    seller: {
      name: '射击代练',
      avatar: 'https://picsum.photos/seed/seller3/40/40.jpg'
    }
  }
])

onMounted(() => {
  loadOrders()
})

const loadOrders = () => {
  // 加载订单数据
  console.log('加载订单数据')
}

const createOrder = () => {
  router.push('/orders/create')
}

const viewOrder = (orderId) => {
  router.push(`/order/${orderId}`)
}
</script>

<style lang="scss" scoped>
.orders {
  padding-top: 0;
}
</style>