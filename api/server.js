const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3005;

// 中间件
app.use(cors());
app.use(bodyParser.json());

// 模拟数据
const games = [
  { id: 1, name: '王者荣耀', description: '热门MOBA手游代练', category: 'MOBA' },
  { id: 2, name: '三角洲', description: '经典战术射击游戏', category: 'FPS' },
  { id: 3, name: '和平精英', description: '战术竞技射击游戏', category: 'FPS' },
  { id: 4, name: '英雄联盟', description: '经典MOBA端游代练', category: 'MOBA' }
];

const posts = [
  {
    id: 1,
    type: '需求',
    content: '王者荣耀星耀段位，需要代练上王者，价格私聊，要求效率高，信誉好的代练。',
    user: { name: '游戏小王', avatar: 'https://picsum.photos/seed/user1/40/40.jpg' },
    createTime: '2024-01-15 10:30:00',
    views: 156,
    likes: 12,
    comments: 8
  },
  {
    id: 2,
    type: '服务',
    content: '专业三角洲代练，段位提升，武器解锁，长期接单，价格优惠，信誉第一。',
    user: { name: '三角洲达人', avatar: 'https://picsum.photos/seed/user2/40/40.jpg' },
    createTime: '2024-01-15 09:15:00',
    views: 89,
    likes: 6,
    comments: 3
  }
];

// API 路由
app.get('/api/games', (req, res) => {
  res.json({ success: true, data: games });
});

app.get('/api/games/:id', (req, res) => {
  const game = games.find(g => g.id === parseInt(req.params.id));
  if (game) {
    res.json({ success: true, data: game });
  } else {
    res.status(404).json({ success: false, message: '游戏不存在' });
  }
});

app.get('/api/posts', (req, res) => {
  res.json({ success: true, data: posts });
});

app.post('/api/posts', (req, res) => {
  const newPost = {
    id: posts.length + 1,
    ...req.body,
    createTime: new Date().toISOString(),
    views: 0,
    likes: 0,
    comments: 0
  };
  posts.push(newPost);
  res.json({ success: true, data: newPost });
});

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  // 简单的模拟登录
  if (username && password) {
    res.json({
      success: true,
      data: {
        token: 'mock-jwt-token',
        user: { id: 1, name: username, avatar: 'https://picsum.photos/seed/user/40/40.jpg' }
      }
    });
  } else {
    res.status(401).json({ success: false, message: '用户名或密码错误' });
  }
});

app.post('/api/auth/register', (req, res) => {
  const { username, password, phone } = req.body;
  if (username && password && phone) {
    res.json({
      success: true,
      data: {
        token: 'mock-jwt-token',
        user: { id: 2, name: username, avatar: 'https://picsum.photos/seed/newuser/40/40.jpg' }
      }
    });
  } else {
    res.status(400).json({ success: false, message: '请填写完整信息' });
  }
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 API服务器运行在 http://localhost:${PORT}`);
  console.log(`📱 前端地址: http://localhost:3000`);
});