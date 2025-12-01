const { supabase } = require('../supabaseClient');
const { formatResponse } = require('../middleware/auth');

class ReportService {
  constructor() {
    // 举报类型
    this.types = {
      USER: 'user',
      POST: 'post',
      ORDER: 'order',
      COMMENT: 'comment',
      MESSAGE: 'message'
    };
    
    // 举报原因
    this.reasons = {
      SPAM: 'spam',
      INAPPROPRIATE_CONTENT: 'inappropriate_content',
      HARASSMENT: 'harassment',
      FRAUD: 'fraud',
      VIOLENCE: 'violence',
      COPYRIGHT: 'copyright',
      FALSE_INFORMATION: 'false_information',
      OTHER: 'other'
    };
    
    // 举报状态
    this.statuses = {
      PENDING: 'pending',
      REVIEWING: 'reviewing',
      RESOLVED: 'resolved',
      DISMISSED: 'dismissed'
    };
  }
  
  // 创建举报
  async createReport(reporterId, targetType, targetId, reason, description, options = {}) {
    try {
      const {
        evidence = [],
        additionalData = {}
      } = options;
      
      // 验证参数
      if (!reporterId || !targetType || !targetId || !reason) {
        throw new Error('缺少必要参数');
      }
      
      // 检查是否已经举报过相同内容
      const { data: existingReport } = await supabase
        .from('reports')
        .select('id')
        .eq('reporter_id', reporterId)
        .eq('target_type', targetType)
        .eq('target_id', targetId)
        .eq('status', this.statuses.PENDING)
        .single();
      
      if (existingReport) {
        return {
          success: false,
          error: '您已经举报过此内容，请等待处理结果'
        };
      }
      
      const { data: report, error } = await supabase
        .from('reports')
        .insert([{
          reporter_id: reporterId,
          target_type: targetType,
          target_id: targetId,
          reason,
          description,
          evidence: JSON.stringify(evidence),
          additional_data: JSON.stringify(additionalData),
          status: this.statuses.PENDING
        }])
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      // 通知管理员有新的举报
      await this.notifyAdmins(report);
      
      return {
        success: true,
        data: report
      };
      
    } catch (error) {
      console.error('创建举报失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // 获取举报列表
  async getReports(options = {}) {
    try {
      const {
        limit = 20,
        offset = 0,
        status = null,
        targetType = null,
        reason = null,
        reporterId = null
      } = options;
      
      let queryBuilder = supabase
        .from('reports')
        .select(`
          *,
          reporter:users(id, username, avatar),
          target_user:users(id, username, avatar)!filter(inner) ->> $.id = target_id AND target_type = 'user'
        `)
        .order('created_at', { ascending: false });
      
      // 应用过滤器
      if (status) {
        queryBuilder = queryBuilder.eq('status', status);
      }
      
      if (targetType) {
        queryBuilder = queryBuilder.eq('target_type', targetType);
      }
      
      if (reason) {
        queryBuilder = queryBuilder.eq('reason', reason);
      }
      
      if (reporterId) {
        queryBuilder = queryBuilder.eq('reporter_id', reporterId);
      }
      
      // 应用分页
      queryBuilder = queryBuilder.range(offset, offset + limit - 1);
      
      const { data, error } = await queryBuilder;
      
      if (error) {
        throw error;
      }
      
      return {
        success: true,
        data: data || []
      };
      
    } catch (error) {
      console.error('获取举报列表失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // 获取举报详情
  async getReportById(reportId) {
    try {
      const { data: report, error } = await supabase
        .from('reports')
        .select(`
          *,
          reporter:users(id, username, avatar),
          target_user:users(id, username, avatar)!filter(inner) ->> $.id = target_id AND target_type = 'user'
        `)
        .eq('id', reportId)
        .single();
      
      if (error) {
        throw error;
      }
      
      // 获取目标内容详情
      if (report) {
        report.target_details = await this.getTargetDetails(report.target_type, report.target_id);
      }
      
      return {
        success: true,
        data: report
      };
      
    } catch (error) {
      console.error('获取举报详情失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // 获取目标内容详情
  async getTargetDetails(targetType, targetId) {
    try {
      let query;
      
      switch (targetType) {
        case this.types.USER:
          query = supabase
            .from('users')
            .select('id, username, avatar, bio, rating, created_at')
            .eq('id', targetId)
            .single();
          break;
          
        case this.types.POST:
          query = supabase
            .from('posts')
            .select('id, content, type, created_at, author:users(id, username, avatar)')
            .eq('id', targetId)
            .single();
          break;
          
        case this.types.ORDER:
          query = supabase
            .from('orders')
            .select('id, title, description, amount, status, created_at, initiator:users(id, username, avatar)')
            .eq('id', targetId)
            .single();
          break;
          
        case this.types.COMMENT:
          query = supabase
            .from('comments')
            .select('id, content, created_at, author:users(id, username, avatar), post:posts(id)')
            .eq('id', targetId)
            .single();
          break;
          
        default:
          return null;
      }
      
      const { data, error } = await query;
      
      if (error) {
        return null;
      }
      
      return data;
      
    } catch (error) {
      console.error('获取目标详情失败:', error);
      return null;
    }
  }
  
  // 更新举报状态
  async updateReportStatus(reportId, status, adminId, options = {}) {
    try {
      const {
        resolution = null,
        adminNotes = null
      } = options;
      
      const updateData = {
        status,
        reviewed_by: adminId,
        reviewed_at: new Date().toISOString()
      };
      
      if (resolution) {
        updateData.resolution = resolution;
      }
      
      if (adminNotes) {
        updateData.admin_notes = adminNotes;
      }
      
      const { data, error } = await supabase
        .from('reports')
        .update(updateData)
        .eq('id', reportId)
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      // 根据处理结果通知举报人
      await this.notifyReporter(data);
      
      return {
        success: true,
        data
      };
      
    } catch (error) {
      console.error('更新举报状态失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // 通知管理员有新举报
  async notifyAdmins(report) {
    try {
      // 获取所有管理员
      const { data: admins } = await supabase
        .from('users')
        .select('id, email')
        .eq('role', 'admin');
      
      if (!admins || admins.length === 0) {
        return;
      }
      
      // 为每个管理员创建通知
      const notificationPromises = admins.map(admin => {
        return supabase
          .from('notifications')
          .insert([{
            user_id: admin.id,
            type: 'system_announcement',
            title: '新的举报',
            content: `有新的${this.getTargetTypeName(report.target_type)}举报需要处理`,
            priority: 'high',
            related_id: report.id,
            related_type: 'report',
            data: JSON.stringify({ report })
          }]);
      });
      
      await Promise.all(notificationPromises);
      
      return { success: true };
      
    } catch (error) {
      console.error('通知管理员失败:', error);
      return { success: false, error: error.message };
    }
  }
  
  // 通知举报人处理结果
  async notifyReporter(report) {
    try {
      let title, content, priority = 'normal';
      
      switch (report.status) {
        case this.statuses.RESOLVED:
          title = '举报处理完成';
          content = '您的举报已经处理完成，感谢您的反馈';
          priority = 'normal';
          break;
          
        case this.statuses.DISMISSED:
          title = '举报已驳回';
          content = '您的举报已被驳回，可能是因为证据不足或不符合举报标准';
          priority = 'normal';
          break;
          
        default:
          return;
      }
      
      await supabase
        .from('notifications')
        .insert([{
          user_id: report.reporter_id,
          type: 'system_announcement',
          title,
          content,
          priority,
          related_id: report.id,
          related_type: 'report',
          data: JSON.stringify({ report })
        }]);
      
      return { success: true };
      
    } catch (error) {
      console.error('通知举报人失败:', error);
      return { success: false, error: error.message };
    }
  }
  
  // 获取目标类型名称
  getTargetTypeName(targetType) {
    const typeNames = {
      [this.types.USER]: '用户',
      [this.types.POST]: '帖子',
      [this.types.ORDER]: '订单',
      [this.types.COMMENT]: '评论',
      [this.types.MESSAGE]: '消息'
    };
    
    return typeNames[targetType] || '内容';
  }
  
  // 获取原因名称
  getReasonName(reason) {
    const reasonNames = {
      [this.reasons.SPAM]: '垃圾信息',
      [this.reasons.INAPPROPRIATE_CONTENT]: '不当内容',
      [this.reasons.HARASSMENT]: '骚扰',
      [this.reasons.FRAUD]: '欺诈',
      [this.reasons.VIOLENCE]: '暴力',
      [this.reasons.COPYRIGHT]: '版权问题',
      [this.reasons.FALSE_INFORMATION]: '虚假信息',
      [this.reasons.OTHER]: '其他'
    };
    
    return reasonNames[reason] || reason;
  }
  
  // 生成举报统计
  async getReportStatistics(options = {}) {
    try {
      const {
        startDate = null,
        endDate = null
      } = options;
      
      let queryBuilder = supabase
        .from('reports')
        .select('*');
      
      // 应用日期范围过滤
      if (startDate) {
        queryBuilder = queryBuilder.gte('created_at', startDate);
      }
      
      if (endDate) {
        queryBuilder = queryBuilder.lte('created_at', endDate);
      }
      
      const { data, error } = await queryBuilder;
      
      if (error) {
        throw error;
      }
      
      // 生成统计数据
      const statistics = {
        total: data ? data.length : 0,
        byStatus: {},
        byTargetType: {},
        byReason: {},
        pending: 0,
        resolved: 0
      };
      
      if (data) {
        data.forEach(report => {
          // 按状态统计
          if (!statistics.byStatus[report.status]) {
            statistics.byStatus[report.status] = 0;
          }
          statistics.byStatus[report.status]++;
          
          // 按目标类型统计
          if (!statistics.byTargetType[report.target_type]) {
            statistics.byTargetType[report.target_type] = 0;
          }
          statistics.byTargetType[report.target_type]++;
          
          // 按原因统计
          if (!statistics.byReason[report.reason]) {
            statistics.byReason[report.reason] = 0;
          }
          statistics.byReason[report.reason]++;
          
          // 特定状态计数
          if (report.status === this.statuses.PENDING) {
            statistics.pending++;
          } else if (report.status === this.statuses.RESOLVED) {
            statistics.resolved++;
          }
        });
      }
      
      return {
        success: true,
        data: statistics
      };
      
    } catch (error) {
      console.error('生成举报统计失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new ReportService();