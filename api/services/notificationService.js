const { supabase } = require('../supabaseClient');
const { formatResponse } = require('../middleware/auth');

class NotificationService {
  constructor() {
    // 通知类型
    this.types = {
      ORDER_CREATED: 'order_created',
      ORDER_UPDATED: 'order_updated',
      ORDER_COMPLETED: 'order_completed',
      ORDER_CANCELLED: 'order_cancelled',
      MESSAGE_RECEIVED: 'message_received',
      COMMENT_ADDED: 'comment_added',
      LIKE_RECEIVED: 'like_received',
      PAYMENT_RECEIVED: 'payment_received',
      SYSTEM_ANNOUNCEMENT: 'system_announcement',
      SECURITY_ALERT: 'security_alert',
      PROMOTION: 'promotion'
    };
    
    // 通知优先级
    this.priorities = {
      LOW: 'low',
      NORMAL: 'normal',
      HIGH: 'high',
      URGENT: 'urgent'
    };
  }
  
  // 创建通知
  async createNotification(userId, type, title, content, options = {}) {
    try {
      const {
        priority = this.priorities.NORMAL,
        relatedId = null,
        relatedType = null,
        data = {},
        channels = ['app'], // app, email, sms
        expireAt = null
      } = options;
      
      const { data: notification, error } = await supabase
        .from('notifications')
        .insert([{
          user_id: userId,
          type,
          title,
          content,
          priority,
          related_id: relatedId,
          related_type: relatedType,
          data: JSON.stringify(data),
          channels: JSON.stringify(channels),
          expires_at: expireAt
        }])
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      // 根据通知类型和优先级，发送实时通知
      await this.sendRealtimeNotification(userId, notification, channels);
      
      return {
        success: true,
        data: notification
      };
      
    } catch (error) {
      console.error('创建通知失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // 发送实时通知
  async sendRealtimeNotification(userId, notification, channels) {
    try {
      // 这里可以集成WebSocket或Server-Sent Events
      // 目前使用Supabase的实时功能
      const channelName = `notification_${userId}`;
      
      const payload = {
        type: 'notification',
        notification: notification,
        timestamp: new Date().toISOString()
      };
      
      // 使用Supabase Realtime发送通知
      // 注意：这需要在Supabase项目中启用Realtime
      console.log(`发送实时通知到频道 ${channelName}:`, payload);
      
      // 如果需要发送邮件通知
      if (channels.includes('email')) {
        await this.sendEmailNotification(userId, notification);
      }
      
      // 如果需要发送短信通知
      if (channels.includes('sms')) {
        await this.sendSMSNotification(userId, notification);
      }
      
      return { success: true };
      
    } catch (error) {
      console.error('发送实时通知失败:', error);
      return { success: false, error: error.message };
    }
  }
  
  // 发送邮件通知
  async sendEmailNotification(userId, notification) {
    try {
      // 获取用户邮箱
      const { data: user, error } = await supabase
        .from('users')
        .select('email')
        .eq('id', userId)
        .single();
      
      if (error || !user || !user.email) {
        throw new Error('用户邮箱不存在');
      }
      
      // 这里集成邮件服务，如SendGrid、AWS SES等
      console.log(`发送邮件通知到 ${user.email}:`, {
        subject: notification.title,
        body: notification.content
      });
      
      return { success: true };
      
    } catch (error) {
      console.error('发送邮件通知失败:', error);
      return { success: false, error: error.message };
    }
  }
  
  // 发送短信通知
  async sendSMSNotification(userId, notification) {
    try {
      // 获取用户手机号
      const { data: user, error } = await supabase
        .from('users')
        .select('phone')
        .eq('id', userId)
        .single();
      
      if (error || !user || !user.phone) {
        throw new Error('用户手机号不存在');
      }
      
      // 这里集成短信服务，如阿里云短信、腾讯云短信等
      console.log(`发送短信通知到 ${user.phone}:`, notification.content);
      
      return { success: true };
      
    } catch (error) {
      console.error('发送短信通知失败:', error);
      return { success: false, error: error.message };
    }
  }
  
  // 获取用户通知列表
  async getUserNotifications(userId, options = {}) {
    try {
      const {
        limit = 20,
        offset = 0,
        unreadOnly = false,
        type = null,
        priority = null
      } = options;
      
      let queryBuilder = supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId);
      
      // 过滤未读通知
      if (unreadOnly) {
        queryBuilder = queryBuilder.eq('is_read', false);
      }
      
      // 过滤通知类型
      if (type) {
        queryBuilder = queryBuilder.eq('type', type);
      }
      
      // 过滤优先级
      if (priority) {
        queryBuilder = queryBuilder.eq('priority', priority);
      }
      
      // 排序和分页
      queryBuilder = queryBuilder
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
      
      const { data, error } = await queryBuilder;
      
      if (error) {
        throw error;
      }
      
      return {
        success: true,
        data: data || []
      };
      
    } catch (error) {
      console.error('获取通知列表失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // 标记通知为已读
  async markAsRead(userId, notificationIds) {
    try {
      // 支持单个ID或ID数组
      const ids = Array.isArray(notificationIds) ? notificationIds : [notificationIds];
      
      const { data, error } = await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .in('id', ids)
        .eq('user_id', userId);
      
      if (error) {
        throw error;
      }
      
      return {
        success: true,
        data
      };
      
    } catch (error) {
      console.error('标记通知为已读失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // 标记所有通知为已读
  async markAllAsRead(userId) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('is_read', false);
      
      if (error) {
        throw error;
      }
      
      return {
        success: true,
        data
      };
      
    } catch (error) {
      console.error('标记所有通知为已读失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // 删除通知
  async deleteNotifications(userId, notificationIds) {
    try {
      // 支持单个ID或ID数组
      const ids = Array.isArray(notificationIds) ? notificationIds : [notificationIds];
      
      const { error } = await supabase
        .from('notifications')
        .delete()
        .in('id', ids)
        .eq('user_id', userId);
      
      if (error) {
        throw error;
      }
      
      return {
        success: true
      };
      
    } catch (error) {
      console.error('删除通知失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // 获取未读通知数量
  async getUnreadCount(userId) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('id')
        .eq('user_id', userId)
        .eq('is_read', false);
      
      if (error) {
        throw error;
      }
      
      return {
        success: true,
        count: data ? data.length : 0
      };
      
    } catch (error) {
      console.error('获取未读通知数量失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // 预设通知创建方法
  
  // 订单相关通知
  async notifyOrderCreated(order, initiatorId) {
    return this.createNotification(
      initiatorId,
      this.types.ORDER_CREATED,
      '订单创建成功',
      `您的订单 "${order.title}" 已成功创建，等待接单`,
      {
        priority: this.priorities.NORMAL,
        relatedId: order.id,
        relatedType: 'order',
        data: { order }
      }
    );
  }
  
  async notifyOrderUpdated(order, userId) {
    return this.createNotification(
      userId,
      this.types.ORDER_UPDATED,
      '订单状态更新',
      `您的订单 "${order.title}" 状态已更新为 "${this.getStatusText(order.status)}"`,
      {
        priority: this.priorities.NORMAL,
        relatedId: order.id,
        relatedType: 'order',
        data: { order }
      }
    );
  }
  
  async notifyOrderCompleted(order, acceptorId) {
    return this.createNotification(
      acceptorId,
      this.types.ORDER_COMPLETED,
      '订单已完成',
      `订单 "${order.title}" 已完成，收益已到账`,
      {
        priority: this.priorities.HIGH,
        relatedId: order.id,
        relatedType: 'order',
        data: { order }
      }
    );
  }
  
  // 消息通知
  async notifyMessageReceived(message, receiverId) {
    return this.createNotification(
      receiverId,
      this.types.MESSAGE_RECEIVED,
      '新消息',
      `您收到了来自 "${message.sender_name}" 的消息`,
      {
        priority: this.priorities.NORMAL,
        relatedId: message.room_id,
        relatedType: 'chat',
        data: { message }
      }
    );
  }
  
  // 获取状态文本
  getStatusText(status) {
    const statusMap = {
      pending: '待处理',
      processing: '进行中',
      completed: '已完成',
      cancelled: '已取消',
      disputed: '有争议'
    };
    
    return statusMap[status] || status;
  }
}

module.exports = new NotificationService();