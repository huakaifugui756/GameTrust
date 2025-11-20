<template>
  <div class="community page-container">
    <!-- 顶部导航 -->
    <van-tabs v-model:active="activeTab" sticky>
      <van-tab title="推荐" name="recommend">
        <PostList :posts="recommendPosts" @view-post="viewPost" @like-post="likePost" />
      </van-tab>
      
      <van-tab title="需求" name="demand">
        <PostList :posts="demandPosts" @view-post="viewPost" @like-post="likePost" />
      </van-tab>
      
      <van-tab title="服务" name="service">
        <PostList :posts="servicePosts" @view-post="viewPost" @like-post="likePost" />
      </van-tab>
      
      <van-tab title="交流" name="chat">
        <PostList :posts="chatPosts" @view-post="viewPost" @like-post="likePost" />
      </van-tab>
      
      <van-tab title="聊天室" name="chatroom">
        <div class="chatroom-list">
          <div class="section-title">
            <h3>热门聊天室</h3>
          </div>
          <div class="chatroom-grid">
            <div 
              v-for="room in chatRooms" 
              :key="room.id" 
              class="chatroom-card"
              @click="enterChatRoom(room)"
            >
              <div class="room-avatar">
                <img :src="room.avatar" :alt="room.name" />
              </div>
              <div class="room-info">
                <div class="room-name">{{ room.name }}</div>
                <div class="room-desc">{{ room.description }}</div>
                <div class="room-stats">
                  <span class="member-count">{{ room.memberCount }}人</span>
                  <span class="online-status" :class="{ 'online': room.online }">
                    {{ room.online ? '在线' : '离线' }}
                  </span>
                </div>
              </div>
              <div class="room-arrow">
                <van-icon name="arrow" />
              </div>
            </div>
          </div>
        </div>
      </van-tab>
    </van-tabs>

    <!-- 发布按钮 -->
    <van-floating-bubble icon="plus" axis="xy" @click="showPostDialog" />

    <!-- 发布帖子弹窗 -->
    <van-dialog v-model:show="postDialogVisible" title="发布帖子" show-cancel-button>
      <div class="post-form">
        <van-field name="radio" label="帖子类型">
          <template #input>
            <van-radio-group v-model="postType" direction="horizontal">
              <van-radio name="需求">需求</van-radio>
              <van-radio name="服务">服务</van-radio>
              <van-radio name="交流">交流</van-radio>
            </van-radio-group>
          </template>
        </van-field>
        
        <van-field
          v-model="postTitle"
          placeholder="请输入标题"
        />
        
        <van-field
          v-model="postContent"
          type="textarea"
          placeholder="请输入内容..."
          rows="4"
          autosize
        />
        
        <van-field
          v-model="postPrice"
          placeholder="价格（可选）"
          v-if="postType === '服务'"
        />
        
        <van-field name="uploader" label="图片上传">
          <template #input>
            <van-uploader v-model="postImages" :max-count="3" />
          </template>
        </van-field>
      </div>
      <template #footer>
        <van-button size="small" @click="postDialogVisible = false">取消</van-button>
        <van-button type="primary" size="small" @click="submitPost">发布</van-button>
      </template>
    </van-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import PostList from '@/components/PostList.vue'

const router = useRouter()
const activeTab = ref('recommend')

const postDialogVisible = ref(false)
const postType = ref('需求')
const postTitle = ref('')
const postContent = ref('')
const postPrice = ref('')
const postImages = ref([])

// 推荐帖子
const recommendPosts = ref([
  {
    id: 1,
    type: '需求',
    title: '王者荣耀星耀上王者',
    content: '星耀段位，需要代练上王者，价格私聊，要求效率高，信誉好的代练。账号安全第一，可以提供各种验证。',
    user: {
      id: 1,
      name: '游戏小王',
      avatar: 'https://picsum.photos/seed/user1/40/40.jpg',
      reputation: 4.8
    },
    createTime: '2024-01-15 10:30:00',
    views: 156,
    likes: 12,
    comments: 8,
    images: ['https://picsum.photos/seed/post1/300/200.jpg'],
    game: '王者荣耀'
  },
  {
    id: 2,
    type: '服务',
    title: '专业原神代练团队',
    content: '专业原神代练，深渊满星，材料收集，长期接单，价格优惠，信誉第一。团队经验丰富，效率高。',
    user: {
      id: 2,
      name: '原神达人',
      avatar: 'https://picsum.photos/seed/user2/40/40.jpg',
      reputation: 4.9
    },
    createTime: '2024-01-15 09:15:00',
    views: 89,
    likes: 6,
    comments: 3,
    images: [],
    game: '原神'
  }
])

// 需求帖子
const demandPosts = ref([
  {
    id: 3,
    type: '需求',
    title: '和平精英上分',
    content: '需要代练上分，当前钻石段位，目标皇冠，价格私聊。',
    user: {
      id: 3,
      name: '射击爱好者',
      avatar: 'https://picsum.photos/seed/user3/40/40.jpg',
      reputation: 4.5
    },
    createTime: '2024-01-15 08:45:00',
    views: 67,
    likes: 4,
    comments: 2,
    images: [],
    game: '和平精英'
  }
])

// 服务帖子
const servicePosts = ref([
  {
    id: 4,
    type: '服务',
    title: '英雄联盟代练',
    content: '多年英雄联盟代练经验，主打效率和安全，价格合理，长期接单。',
    user: {
      id: 4,
      name: 'LOL代练王',
      avatar: 'https://picsum.photos/seed/user4/40/40.jpg',
      reputation: 4.7
    },
    createTime: '2024-01-15 07:30:00',
    views: 123,
    likes: 8,
    comments: 5,
    images: ['https://picsum.photos/seed/post4/300/200.jpg'],
    game: '英雄联盟'
  }
])

// 交流帖子
const chatPosts = ref([
  {
    id: 5,
    type: '交流',
    title: '王者荣耀新版本攻略',
    content: '新版本英雄调整解析，上分英雄推荐，欢迎大家一起讨论。',
    user: {
      id: 5,
      name: '游戏攻略君',
      avatar: 'https://picsum.photos/seed/user5/40/40.jpg',
      reputation: 4.6
    },
    createTime: '2024-01-15 06:20:00',
    views: 234,
    likes: 18,
    comments: 12,
    images: ['https://picsum.photos/seed/post5/300/200.jpg'],
    game: '王者荣耀'
  }
])

// 聊天室数据
const chatRooms = ref([
  {
    id: 1,
    name: '王者荣耀代练群',
    description: '专业代练交流，段位提升讨论',
    avatar: 'https://picsum.photos/seed/wangzhe/60/60.jpg',
    memberCount: 128,
    online: true,
    category: '代练'
  },
  {
    id: 2,
    name: '和平精英交流群',
    description: '战术交流，组队开黑',
    avatar: 'https://picsum.photos/seed/heping/60/60.jpg',
    memberCount: 86,
    online: true,
    category: '交流'
  },
  {
    id: 3,
    name: '原神玩家群',
    description: '原神攻略，材料分享',
    avatar: 'https://picsum.photos/seed/yuanshen/60/60.jpg',
    memberCount: 95,
    online: false,
    category: '攻略'
  },
  {
    id: 4,
    name: '英雄联盟代练',
    description: 'LOL代练服务，上分保障',
    avatar: 'https://picsum.photos/seed/lol/60/60.jpg',
    memberCount: 67,
    online: true,
    category: '代练'
  },
  {
    id: 5,
    name: '游戏账号交易',
    description: '安全账号买卖，担保交易',
    avatar: 'https://picsum.photos/seed/trade/60/60.jpg',
    memberCount: 45,
    online: false,
    category: '交易'
  },
  {
    id: 6,
    name: '新手玩家互助',
    description: '新手指导，问题解答',
    avatar: 'https://picsum.photos/seed/newbie/60/60.jpg',
    memberCount: 112,
    online: true,
    category: '互助'
  }
])

onMounted(() => {
  loadPosts()
})

const loadPosts = () => {
  // 加载帖子数据
  console.log('加载帖子数据')
}

const showPostDialog = () => {
  postType.value = '需求'
  postTitle.value = ''
  postContent.value = ''
  postPrice.value = ''
  postImages.value = []
  postDialogVisible.value = true
}

const submitPost = () => {
  if (!postTitle.value.trim() || !postContent.value.trim()) {
    showToast('请填写标题和内容')
    return
  }
  
  showToast('发布成功')
  postDialogVisible.value = false
  
  // 刷新帖子列表
  loadPosts()
}

const viewPost = (postId) => {
  router.push(`/community/post/${postId}`)
}

const likePost = (postId) => {
  showToast('点赞成功')
}

const enterChatRoom = (room) => {
  router.push(`/chat/${room.id}`)
}
</script>

<style lang="scss" scoped>
.community {
  padding-top: 0;
}

.post-form {
  padding: 16px;
  
  .van-field {
    margin-bottom: 12px;
  }
}

// 聊天室列表样式
.chatroom-list {
  padding: 16px;

  .section-title {
    margin-bottom: 16px;

    h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #333;
    }
  }

  .chatroom-grid {
    .chatroom-card {
      display: flex;
      align-items: center;
      padding: 16px;
      background: #fff;
      border-radius: 12px;
      margin-bottom: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
      cursor: pointer;
      transition: all 0.3s ease;

      &:active {
        transform: scale(0.98);
        background: #f8f9fa;
      }

      .room-avatar {
        width: 50px;
        height: 50px;
        margin-right: 12px;
        flex-shrink: 0;

        img {
          width: 100%;
          height: 100%;
          border-radius: 10px;
          object-fit: cover;
        }
      }

      .room-info {
        flex: 1;
        min-width: 0;

        .room-name {
          font-size: 16px;
          font-weight: 600;
          color: #333;
          margin-bottom: 4px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .room-desc {
          font-size: 13px;
          color: #666;
          margin-bottom: 6px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .room-stats {
          display: flex;
          align-items: center;
          gap: 12px;

          .member-count {
            font-size: 12px;
            color: #999;
          }

          .online-status {
            font-size: 12px;
            color: #ff4d4f;

            &.online {
              color: #52c41a;
            }
          }
        }
      }

      .room-arrow {
        margin-left: 12px;

        .van-icon {
          color: #ccc;
          font-size: 16px;
        }
      }
    }
  }
}
</style>