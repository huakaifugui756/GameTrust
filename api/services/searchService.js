const { supabase } = require('../supabaseClient');
const { formatResponse } = require('../middleware/auth');

class SearchService {
  constructor() {
    // 支持的搜索类型
    this.searchTypes = {
      USERS: 'users',
      GAMES: 'games',
      POSTS: 'posts',
      ORDERS: 'orders'
    };
    
    // 搜索权重配置
    this.searchWeights = {
      users: {
        username: 3,
        bio: 2,
        email: 1
      },
      games: {
        name: 3,
        description: 2,
        category: 1
      },
      posts: {
        content: 3,
        title: 2,
        type: 1
      },
      orders: {
        title: 3,
        description: 2,
        type: 1
      }
    };
  }
  
  // 构建全文搜索查询
  buildSearchQuery(query, type) {
    if (!query || !type) return null;
    
    const weights = this.searchWeights[type];
    if (!weights) return null;
    
    // 使用PostgreSQL的全文搜索功能
    const searchTerms = query.trim().split(/\s+/);
    const searchConditions = [];
    
    for (const term of searchTerms) {
      const termConditions = [];
      
      for (const [field, weight] of Object.entries(weights)) {
        termConditions.push(`${field} ILIKE '%${term}%'`);
      }
      
      searchConditions.push(`(${termConditions.join(' OR ')})`);
    }
    
    return searchConditions.join(' AND ');
  }
  
  // 用户搜索
  async searchUsers(query, options = {}) {
    try {
      const {
        limit = 20,
        offset = 0,
        sortBy = 'relevance',
        sortOrder = 'desc',
        filters = {}
      } = options;
      
      let queryBuilder = supabase
        .from('users')
        .select('id, username, avatar, bio, rating, role, created_at')
        .eq('status', 'active');
      
      // 应用过滤器
      if (filters.role) {
        queryBuilder = queryBuilder.eq('role', filters.role);
      }
      
      if (filters.minRating) {
        queryBuilder = queryBuilder.gte('rating', filters.minRating);
      }
      
      // 应用搜索
      if (query) {
        const searchCondition = this.buildSearchQuery(query, this.searchTypes.USERS);
        if (searchCondition) {
          queryBuilder = queryBuilder.or(searchCondition);
        }
      }
      
      // 应用排序
      if (sortBy === 'rating') {
        queryBuilder = queryBuilder.order('rating', { ascending: sortOrder === 'asc' });
      } else if (sortBy === 'created_at') {
        queryBuilder = queryBuilder.order('created_at', { ascending: sortOrder === 'asc' });
      }
      
      // 应用分页
      queryBuilder = queryBuilder.range(offset, offset + limit - 1);
      
      const { data, error } = await queryBuilder;
      
      if (error) {
        throw error;
      }
      
      return {
        success: true,
        data: data || [],
        count: data ? data.length : 0
      };
      
    } catch (error) {
      console.error('用户搜索失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // 游戏搜索
  async searchGames(query, options = {}) {
    try {
      const {
        limit = 20,
        offset = 0,
        sortBy = 'sort_order',
        sortOrder = 'asc',
        filters = {}
      } = options;
      
      let queryBuilder = supabase
        .from('games')
        .select('id, name, description, category, image, is_active, sort_order')
        .eq('is_active', true);
      
      // 应用过滤器
      if (filters.category) {
        queryBuilder = queryBuilder.eq('category', filters.category);
      }
      
      // 应用搜索
      if (query) {
        const searchCondition = this.buildSearchQuery(query, this.searchTypes.GAMES);
        if (searchCondition) {
          queryBuilder = queryBuilder.or(searchCondition);
        }
      }
      
      // 应用排序
      if (sortBy === 'sort_order') {
        queryBuilder = queryBuilder.order('sort_order', { ascending: true });
      } else if (sortBy === 'name') {
        queryBuilder = queryBuilder.order('name', { ascending: sortOrder === 'asc' });
      }
      
      // 应用分页
      queryBuilder = queryBuilder.range(offset, offset + limit - 1);
      
      const { data, error } = await queryBuilder;
      
      if (error) {
        throw error;
      }
      
      return {
        success: true,
        data: data || [],
        count: data ? data.length : 0
      };
      
    } catch (error) {
      console.error('游戏搜索失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // 帖子搜索
  async searchPosts(query, options = {}) {
    try {
      const {
        limit = 20,
        offset = 0,
        sortBy = 'created_at',
        sortOrder = 'desc',
        filters = {}
      } = options;
      
      let queryBuilder = supabase
        .from('posts')
        .select(`
          id, 
          content, 
          type, 
          created_at,
          author:users(id, username, avatar, rating),
          game:games(id, name, category),
          likes_count,
          comments_count,
          is_pinned
        `)
        .eq('is_active', true);
      
      // 应用过滤器
      if (filters.type) {
        queryBuilder = queryBuilder.eq('type', filters.type);
      }
      
      if (filters.game_id) {
        queryBuilder = queryBuilder.eq('game_id', filters.game_id);
      }
      
      if (filters.author_id) {
        queryBuilder = queryBuilder.eq('author_id', filters.author_id);
      }
      
      // 应用搜索
      if (query) {
        const searchCondition = this.buildSearchQuery(query, this.searchTypes.POSTS);
        if (searchCondition) {
          queryBuilder = queryBuilder.or(searchCondition);
        }
      }
      
      // 应用排序
      if (sortBy === 'is_pinned') {
        queryBuilder = queryBuilder.order('is_pinned', { ascending: false });
      }
      queryBuilder = queryBuilder.order(sortBy, { ascending: sortOrder === 'asc' });
      
      // 应用分页
      queryBuilder = queryBuilder.range(offset, offset + limit - 1);
      
      const { data, error } = await queryBuilder;
      
      if (error) {
        throw error;
      }
      
      return {
        success: true,
        data: data || [],
        count: data ? data.length : 0
      };
      
    } catch (error) {
      console.error('帖子搜索失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // 订单搜索
  async searchOrders(query, options = {}) {
    try {
      const {
        limit = 20,
        offset = 0,
        sortBy = 'created_at',
        sortOrder = 'desc',
        filters = {}
      } = options;
      
      let queryBuilder = supabase
        .from('orders')
        .select(`
          id, 
          title, 
          description, 
          type, 
          amount, 
          total_amount,
          status, 
          deadline,
          urgency,
          created_at,
          initiator:users(id, username, avatar, rating),
          acceptor:users(id, username, avatar, rating),
          game:games(id, name, category)
        `);
      
      // 应用过滤器
      if (filters.status) {
        if (Array.isArray(filters.status)) {
          queryBuilder = queryBuilder.in('status', filters.status);
        } else {
          queryBuilder = queryBuilder.eq('status', filters.status);
        }
      }
      
      if (filters.type) {
        queryBuilder = queryBuilder.eq('type', filters.type);
      }
      
      if (filters.minAmount) {
        queryBuilder = queryBuilder.gte('amount', filters.minAmount);
      }
      
      if (filters.maxAmount) {
        queryBuilder = queryBuilder.lte('amount', filters.maxAmount);
      }
      
      if (filters.urgency) {
        queryBuilder = queryBuilder.eq('urgency', filters.urgency);
      }
      
      // 应用搜索
      if (query) {
        const searchCondition = this.buildSearchQuery(query, this.searchTypes.ORDERS);
        if (searchCondition) {
          queryBuilder = queryBuilder.or(searchCondition);
        }
      }
      
      // 应用排序
      queryBuilder = queryBuilder.order(sortBy, { ascending: sortOrder === 'asc' });
      
      // 应用分页
      queryBuilder = queryBuilder.range(offset, offset + limit - 1);
      
      const { data, error } = await queryBuilder;
      
      if (error) {
        throw error;
      }
      
      return {
        success: true,
        data: data || [],
        count: data ? data.length : 0
      };
      
    } catch (error) {
      console.error('订单搜索失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // 高级搜索 - 支持多类型搜索
  async advancedSearch(query, options = {}) {
    try {
      const {
        types = ['users', 'games', 'posts', 'orders'],
        limit = 10,
        offset = 0
      } = options;
      
      const results = {};
      
      // 并行搜索所有类型
      const searchPromises = types.map(type => {
        switch (type) {
          case 'users':
            return this.searchUsers(query, { ...options, limit, offset });
          case 'games':
            return this.searchGames(query, { ...options, limit, offset });
          case 'posts':
            return this.searchPosts(query, { ...options, limit, offset });
          case 'orders':
            return this.searchOrders(query, { ...options, limit, offset });
          default:
            return Promise.resolve({ success: true, data: [], count: 0 });
        }
      });
      
      const searchResults = await Promise.all(searchPromises);
      
      types.forEach((type, index) => {
        results[type] = searchResults[index];
      });
      
      // 计算总数
      const totalCount = Object.values(results).reduce(
        (sum, result) => sum + (result.success ? result.count : 0), 
        0
      );
      
      return {
        success: true,
        data: results,
        totalCount,
        query,
        types
      };
      
    } catch (error) {
      console.error('高级搜索失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // 获取搜索建议
  async getSearchSuggestions(query, type = 'users', limit = 5) {
    try {
      if (!query || query.length < 2) {
        return { success: true, data: [] };
      }
      
      let queryBuilder;
      
      switch (type) {
        case 'users':
          queryBuilder = supabase
            .from('users')
            .select('id, username, avatar')
            .eq('status', 'active')
            .ilike('username', `${query}%`)
            .limit(limit);
          break;
          
        case 'games':
          queryBuilder = supabase
            .from('games')
            .select('id, name, image')
            .eq('is_active', true)
            .ilike('name', `${query}%`)
            .limit(limit);
          break;
          
        default:
          return { success: true, data: [] };
      }
      
      const { data, error } = await queryBuilder;
      
      if (error) {
        throw error;
      }
      
      return {
        success: true,
        data: data || []
      };
      
    } catch (error) {
      console.error('获取搜索建议失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new SearchService();