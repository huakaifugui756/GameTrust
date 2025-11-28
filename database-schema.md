# GameTrust 数据库表结构设计

## 用户表 (users)
- `id` (uuid) 主键 - 对应Supabase auth.users.id
- `phone` (varchar, 11) - 手机号
- `username` (varchar, 50) - 用户名
- `avatar` (text) - 头像URL
- `rating` (decimal, 5,2) - 信誉评分 (0-5.0)
- `balance` (decimal, 10,2) - 账户余额
- `role` (varchar, 20) - 角色 (user/admin)
- `is_verified` (boolean) - 是否实名认证
- `verification_data` (jsonb) - 认证数据
- `created_at` (timestamp) - 创建时间
- `updated_at` (timestamp) - 更新时间

## 游戏表 (games)
- `id` (uuid) 主键
- `name` (varchar, 100) - 游戏名称
- `category` (varchar, 50) - 游戏分类
- `description` (text) - 游戏描述
- `image` (text) - 游戏图片URL
- `is_active` (boolean) - 是否启用
- `sort_order` (integer) - 排序
- `created_at` (timestamp) - 创建时间
- `updated_at` (timestamp) - 更新时间

## 订单表 (orders)
- `id` (uuid) 主键
- `title` (varchar, 200) - 订单标题
- `description` (text) - 订单描述
- `type` (varchar, 20) - 订单类型 (代练/道具/账号/其他)
- `amount` (decimal, 10,2) - 交易金额
- `guarantee_fee` (decimal, 10,2) - 担保费用
- `urgency_fee` (decimal, 10,2) - 加急费用
- `total_amount` (decimal, 10,2) - 总金额
- `status` (varchar, 20) - 订单状态 (pending/processing/completed/cancelled)
- `deadline` (timestamp) - 完成时限
- `urgency` (integer, 1-5) - 紧急程度
- `estimated_hours` (integer) - 预计工作时长
- `initiator_id` (uuid) - 发起人ID (外键 -> users.id)
- `acceptor_id` (uuid) - 接受人ID (外键 -> users.id)
- `game_id` (uuid) - 游戏ID (外键 -> games.id)
- `created_at` (timestamp) - 创建时间
- `updated_at` (timestamp) - 更新时间

## 聊天室表 (chat_rooms)
- `id` (uuid) 主键
- `name` (varchar, 200) - 聊天室名称
- `type` (varchar, 20) - 聊天室类型 (private/group/guarantee)
- `is_active` (boolean) - 是否活跃
- `last_message` (text) - 最后一条消息
- `last_message_time` (timestamp) - 最后消息时间
- `order_id` (uuid) - 关联订单ID (外键 -> orders.id, 可为空)
- `created_at` (timestamp) - 创建时间
- `updated_at` (timestamp) - 更新时间

## 聊天成员表 (chat_members)
- `id` (uuid) 主键
- `room_id` (uuid) - 聊天室ID (外键 -> chat_rooms.id)
- `user_id` (uuid) - 用户ID (外键 -> users.id)
- `role` (varchar, 20) - 角色 (member/admin)
- `joined_at` (timestamp) - 加入时间
- `last_read_at` (timestamp) - 最后阅读时间

## 聊天消息表 (chat_messages)
- `id` (uuid) 主键
- `room_id` (uuid) - 聊天室ID (外键 -> chat_rooms.id)
- `sender_id` (uuid) - 发送者ID (外键 -> users.id)
- `content` (text) - 消息内容
- `type` (varchar, 20) - 消息类型 (text/image/system)
- `metadata` (jsonb) - 消息元数据
- `is_read` (boolean) - 是否已读
- `created_at` (timestamp) - 创建时间

## 帖子表 (posts)
- `id` (uuid) 主键
- `content` (text) - 帖子内容
- `type` (varchar, 20) - 帖子类型 (需求/服务/分享)
- `author_id` (uuid) - 作者ID (外键 -> users.id)
- `game_id` (uuid) - 游戏ID (外键 -> games.id, 可为空)
- `views` (integer) - 浏览次数
- `likes_count` (integer) - 点赞数
- `comments_count` (integer) - 评论数
- `is_pinned` (boolean) - 是否置顶
- `is_active` (boolean) - 是否活跃
- `created_at` (timestamp) - 创建时间
- `updated_at` (timestamp) - 更新时间

## 评论表 (comments)
- `id` (uuid) 主键
- `content` (text) - 评论内容
- `post_id` (uuid) - 帖子ID (外键 -> posts.id)
- `author_id` (uuid) - 评论者ID (外键 -> users.id)
- `parent_id` (uuid) - 父评论ID (外键 -> comments.id, 可为空)
- `likes_count` (integer) - 点赞数
- `is_deleted` (boolean) - 是否已删除
- `created_at` (timestamp) - 创建时间
- `updated_at` (timestamp) - 更新时间

## 点赞表 (likes)
- `id` (uuid) 主键
- `user_id` (uuid) - 用户ID (外键 -> users.id)
- `target_type` (varchar, 20) - 目标类型 (post/comment)
- `target_id` (uuid) - 目标ID (外键 -> posts.id 或 comments.id)
- `created_at` (timestamp) - 创建时间

## 支付记录表 (payments)
- `id` (uuid) 主键
- `user_id` (uuid) - 用户ID (外键 -> users.id)
- `order_id` (uuid) - 订单ID (外键 -> orders.id)
- `amount` (decimal, 10,2) - 支付金额
- `type` (varchar, 20) - 支付类型 (deposit/payment/refund)
- `method` (varchar, 20) - 支付方式 (wechat/alipay/balance)
- `status` (varchar, 20) - 支付状态 (pending/completed/failed)
- `transaction_id` (varchar, 100) - 第三方交易ID
- `created_at` (timestamp) - 创建时间
- `updated_at` (timestamp) - 更新时间

## 用户余额变动表 (balance_logs)
- `id` (uuid) 主键
- `user_id` (uuid) - 用户ID (外键 -> users.id)
- `amount` (decimal, 10,2) - 变动金额
- `type` (varchar, 20) - 变动类型 (deposit/withdraw/payment earning)
- `description` (text) - 变动描述
- `related_id` (uuid) - 关联ID (订单ID/支付ID等)
- `created_at` (timestamp) - 创建时间

## 系统通知表 (notifications)
- `id` (uuid) 主键
- `user_id` (uuid) - 用户ID (外键 -> users.id)
- `title` (varchar, 200) - 通知标题
- `content` (text) - 通知内容
- `type` (varchar, 20) - 通知类型 (order/system/payment)
- `related_id` (uuid) - 关联ID
- `is_read` (boolean) - 是否已读
- `created_at` (timestamp) - 创建时间

## 权限策略配置

### 表级权限策略 (RLS)
1. users表:
   - 用户只能查看和更新自己的信息
   - 管理员可以查看所有用户信息

2. orders表:
   - 用户只能查看自己参与的订单
   - 管理员可以查看所有订单

3. chat_rooms, chat_members, chat_messages表:
   - 用户只能查看自己参与的聊天
   - 管理员可以查看所有聊天

4. posts表:
   - 所有用户可以查看帖子
   - 作者和管理员可以编辑/删除自己的帖子

5. payments和balance_logs表:
   - 用户只能查看自己的支付和余额记录
   - 管理员可以查看所有记录

### 数据库函数
1. 计算用户信誉评分
2. 计算订单总费用
3. 更新帖子统计信息
4. 发送系统通知

## 索引设计
1. users表: phone索引
2. orders表: initiator_id, acceptor_id, status索引
3. chat_messages表: room_id, created_at索引
4. posts表: author_id, game_id, created_at索引
5. payments表: user_id, order_id, created_at索引