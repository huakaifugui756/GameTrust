/**
 * Jest测试环境设置
 */

// 设置测试环境变量
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key';
process.env.SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_ANON_KEY = 'test-anon-key';
process.env.LOG_LEVEL = 'error';

// 全局测试超时时间
jest.setTimeout(30000);

// 控制台输出（在测试中静默某些日志）
const originalConsoleLog = console.log;
console.log = (...args) => {
  // 只显示包含特定关键词的日志
  const message = args.join(' ');
  if (message.includes('SKIP') || message.includes('WARN')) {
    originalConsoleLog(...args);
  }
};

// 在所有测试完成后恢复原始的console.log
afterAll(() => {
  console.log = originalConsoleLog;
});