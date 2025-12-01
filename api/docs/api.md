# GameTrust API 文档

## 概述

GameTrust API 提供了一个完整的游戏陪练平台后端服务，包括用户管理、游戏陪练订单、聊天系统、支付功能等。

## 基础信息

- **基础URL**: `https://your-domain.vercel.app/api`
- **API版本**: v1
- **认证方式**: JWT Token
- **数据格式**: JSON

## 认证

大部分API需要在请求头中包含JWT Token：

```
Authorization: Bearer <your-jwt-token>
```

## 错误处理

API使用标准的HTTP状态码和统一的错误响应格式：

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "错误描述",
    "details": {}
  }
}
```

## API 端点

### 用户管理

#### 用户注册

```http
POST /api/auth/register
```

**请求体**:
```json
{
  "phone": "13800138000",
  "password": "password123",
  "username": "玩家昵称",
  "role": "player"
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "phone": "13800138000",
      "username": "玩家昵称",
      "role": "player",
      "rating": 0,
      "is_active": true,
      "created_at": "2023-12-01T00:00:00.000Z"
    },
    "token": "jwt-token"
  }
}
```

#### 用户登录

```http
POST /api/auth/login
```

**请求体**:
```json
{
  "phone": "13800138000",
  "password": "password123"
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "phone": "13800138000",
      "username": "玩家昵称",
      "role": "player",
      "rating": 0,
      "is_active": true
    },
    "token": "jwt-token"
  }
}
```

#### 获取当前用户信息

```http
GET /api/users/me
```

**响应**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "phone": "13800138000",
    "username": "玩家昵称",
    "role": "player",
    "rating": 0,
    "is_active": true,
    "balance": 0,
    "created_at": "2023-12-01T00:00:00.000Z"
  }
}
```

#### 更新用户信息

```http
PUT /api/users/me
```

**请求体**:
```json
{
  "username": "新昵称",
  "avatar_url": "https://example.com/avatar.jpg",
  "bio": "个人简介"
}
```

### 游戏管理

#### 获取游戏列表

```http
GET /api/games
```

**查询参数**:
- `category`: 游戏分类 (可选)
- `is_active`: 是否激活 (可选, 默认: true)
- `page`: 页码 (可选, 默认: 1)
- `limit`: 每页数量 (可选, 默认: 20)

**响应**:
```json
{
  "success": true,
  "data": {
    "games": [
      {
        "id": "uuid",
        "name": "王者荣耀",
        "category": "mobile",
        "icon_url": "https://example.com/game-icon.jpg",
        "is_active": true,
        "sort_order": 1
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 10,
      "pages": 1
    }
  }
}
```

### 订单管理

#### 创建订单

```http
POST /api/orders
```

**请求体**:
```json
{
  "game_id": "uuid",
  "title": "王者荣耀排位赛",
  "description": "需要一位高手带我上分",
  "requirements": "段位钻石以上",
  "deliverables": "完成10场排位赛",
  "amount": 50,
  "urgency": 3,
  "deadline": "2023-12-10T00:00:00.000Z",
  "tags": ["排位赛", "上分"]
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "order": {
      "id": "uuid",
      "game_id": "uuid",
      "initiator_id": "uuid",
      "title": "王者荣耀排位赛",
      "description": "需要一位高手带我上分",
      "requirements": "段位钻石以上",
      "deliverables": "完成10场排位赛",
      "amount": 50,
      "urgency": 3,
      "deadline": "2023-12-10T00:00:00.000Z",
      "status": "pending",
      "tags": ["排位赛", "上分"],
      "created_at": "2023-12-01T00:00:00.000Z"
    }
  }
}
```

#### 获取订单列表

```http
GET /api/orders
```

**查询参数**:
- `status`: 订单状态 (可选)
- `game_id`: 游戏ID (可选)
- `initiator_id`: 发起者ID (可选)
- `acceptor_id`: 接受者ID (可选)
- `page`: 页码 (可选, 默认: 1)
- `limit`: 每页数量 (可选, 默认: 20)

**响应**:
```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": "uuid",
        "game_id": "uuid",
        "game": {
          "name": "王者荣耀",
          "category": "mobile"
        },
        "initiator_id": "uuid",
        "acceptor_id": null,
        "title": "王者荣耀排位赛",
        "amount": 50,
        "urgency": 3,
        "deadline": "2023-12-10T00:00:00.000Z",
        "status": "pending",
        "created_at": "2023-12-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 5,
      "pages": 1
    }
  }
}
```

#### 接受订单

```http
POST /api/orders/{orderId}/accept
```

**响应**:
```json
{
  "success": true,
  "data": {
    "order": {
      "id": "uuid",
      "status": "accepted",
      "acceptor_id": "uuid",
      "accepted_at": "2023-12-01T01:00:00.000Z"
    }
  }
}
```

#### 完成订单

```http
POST /api/orders/{orderId}/complete
```

**请求体**:
```json
{
  "completion_proof": [
    "https://example.com/screenshot1.jpg",
    "https://example.com/screenshot2.jpg"
  ]
}
```

### 聊天系统

#### 获取聊天室列表

```http
GET /api/chat/rooms
```

**查询参数**:
- `type`: 聊天室类型 (可选)
- `page`: 页码 (可选, 默认: 1)
- `limit`: 每页数量 (可选, 默认: 20)

**响应**:
```json
{
  "success": true,
  "data": {
    "rooms": [
      {
        "id": "uuid",
        "name": "王者荣耀交流群",
        "type": "public",
        "member_count": 100,
        "is_active": true,
        "last_message_time": "2023-12-01T01:00:00.000Z",
        "created_at": "2023-12-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 3,
      "pages": 1
    }
  }
}
```

#### 获取聊天消息

```http
GET /api/chat/rooms/{roomId}/messages
```

**查询参数**:
- `page`: 页码 (可选, 默认: 1)
- `limit`: 每页数量 (可选, 默认: 50)

**响应**:
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "id": "uuid",
        "sender_id": "uuid",
        "sender": {
          "username": "玩家昵称",
          "avatar_url": "https://example.com/avatar.jpg"
        },
        "content": "大家好",
        "type": "text",
        "created_at": "2023-12-01T01:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 100,
      "pages": 2
    }
  }
}
```

#### 发送消息

```http
POST /api/chat/rooms/{roomId}/messages
```

**请求体**:
```json
{
  "content": "大家好",
  "type": "text"
}
```

### 支付系统

#### 充值

```http
POST /api/payments/deposit
```

**请求体**:
```json
{
  "amount": 100,
  "method": "alipay"
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "payment": {
      "id": "uuid",
      "user_id": "uuid",
      "amount": 100,
      "method": "alipay",
      "status": "pending",
      "payment_url": "https://payment.gateway.com/pay/uuid"
    }
  }
}
```

#### 提现

```http
POST /api/payments/withdraw
```

**请求体**:
```json
{
  "amount": 50,
  "method": "alipay",
  "account": "13800138000"
}
```

#### 获取余额记录

```http
GET /api/payments/balance/logs
```

**查询参数**:
- `type`: 记录类型 (可选)
- `page`: 页码 (可选, 默认: 1)
- `limit`: 每页数量 (可选, 默认: 20)

### 举报系统

#### 提交举报

```http
POST /api/reports
```

**请求体**:
```json
{
  "target_type": "user",
  "target_id": "uuid",
  "reason": "欺诈行为",
  "description": "该用户未完成服务就申请了完成",
  "evidence": [
    "https://example.com/evidence1.jpg"
  ]
}
```

#### 获取举报列表

```http
GET /api/reports
```

**查询参数**:
- `status`: 举报状态 (可选)
- `page`: 页码 (可选, 默认: 1)
- `limit`: 每页数量 (可选, 默认: 20)

## 限制

- API请求频率限制：每分钟60次
- 单次上传文件大小限制：5MB
- 消息长度限制：1000字符
- 订单标题长度限制：50字符
- 订单描述长度限制：1000字符

## SDK

提供JavaScript SDK方便前端集成：

```javascript
import GameTrustAPI from 'gametrust-api-sdk';

const api = new GameTrustAPI({
  baseURL: 'https://your-domain.vercel.app/api',
  token: 'your-jwt-token'
});

// 示例：获取游戏列表
const games = await api.games.get();

// 示例：创建订单
const order = await api.orders.create({
  game_id: 'uuid',
  title: '王者荣耀排位赛',
  amount: 50
});
```

## WebSocket

API支持WebSocket连接以实现实时通信：

```
wss://your-domain.vercel.app/ws
```

连接时需要在查询参数中提供token：

```
wss://your-domain.vercel.app/ws?token=your-jwt-token
```

### 消息格式

所有WebSocket消息都是JSON格式：

```json
{
  "type": "message_type",
  "data": {}
}
```

### 消息类型

- `ping`/`pong` - 心跳检测
- `join_room` - 加入聊天室
- `leave_room` - 离开聊天室
- `new_message` - 新消息
- `typing` - 正在输入
- `order_status_update` - 订单状态更新

## 更新日志

### v1.2.0 (2023-12-01)
- 添加举报系统
- 优化订单状态管理
- 增加缓存机制

### v1.1.0 (2023-11-15)
- 添加WebSocket支持
- 增强安全性
- 优化API性能

### v1.0.0 (2023-11-01)
- 初始版本发布
- 完整的用户和订单管理功能
- 聊天系统和支付功能