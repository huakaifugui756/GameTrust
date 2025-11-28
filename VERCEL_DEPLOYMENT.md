# Vercel 部署指南

本指南将帮助您将 GameTrust 项目部署到 Vercel 平台。

## 前置条件

1. 拥有一个 Vercel 账户（可以通过 GitHub 账户登录）
2. 项目代码已推送到 GitHub 仓库

## 部署步骤

### 1. 安装 Vercel CLI（可选）

```bash
npm i -g vercel
```

### 2. 通过 Vercel 网站界面部署

1. 访问 [vercel.com](https://vercel.com)
2. 点击 "Sign Up" 或 "Login"，使用您的 GitHub 账户登录
3. 点击 "New Project"
4. 导入您的 GitHub 仓库 `huakaifugui756/GameTrust`
5. 配置项目设置

### 3. 环境变量配置

在 Vercel 项目设置中添加以下环境变量：

**步骤：**
1. 在 Vercel 项目仪表板中，点击 "Settings" 选项卡
2. 在左侧菜单中点击 "Environment Variables"
3. 添加以下环境变量：

| 名称 | 值 | 环境 | 说明 |
|------|------|------|------|
| `VITE_SUPABASE_URL` | `https://vunlqahnzdparmujchpc.supabase.co` | Production, Preview, Development | Supabase 项目 URL |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1bmxxYWhuemRwYXJtdWpjaHBjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyODE1MzMsImV4cCI6MjA3OTg1NzUzM30.RT1bUUTZmIVdA0xOx-CH6VnIEQyUve8N0zmYj4Jb9Fo` | Production, Preview, Development | Supabase 匿名访问密钥 |

**注意：**
- 确保环境变量名称完全一致，包括前缀 `VITE_`
- 选择适当的环境（Production, Preview, Development）
- 添加环境变量后，需要重新部署项目才能生效

### 4. 构建设置

Vercel 会自动检测项目类型并使用以下设置：

- **构建命令**: `npm run vercel-build`
- **输出目录**: `dist`
- **安装命令**: `npm install`

### 5. 部署

点击 "Deploy" 按钮开始部署过程。部署完成后，您将获得一个 `.vercel.app` 域名。

## 后续步骤

1. **自定义域名**（可选）：
   - 在项目设置中点击 "Domains"
   - 添加您的自定义域名

2. **分支部署**（可选）：
   - 启用分支部署，以便每个 git 分支都有独立的预览环境

3. **环境变量管理**：
   - 为不同环境（开发、预览、生产）配置不同的环境变量

## 常见问题

### 构建失败

1. 检查 `package.json` 中的依赖是否正确
2. 确保所有环境变量已正确设置
3. 查看构建日志以获取详细错误信息

### 环境变量错误

如果遇到类似 "Environment Variable 'VITE_SUPABASE_URL' references Secret 'supabase-url', which does not exist" 的错误：

1. 确保在 Vercel 项目设置中直接添加环境变量，而不是引用 Secret
2. 环境变量名称必须完全匹配，包括 `VITE_` 前缀
3. 添加环境变量后需要重新部署项目
4. 确保环境变量值中没有多余的空格或换行符

### 环境变量未生效

如果环境变量添加后似乎未生效：

1. 确保变量名以 `VITE_` 开头（Vite 要求）
2. 在代码中使用 `import.meta.env.VITE_SUPABASE_URL` 访问变量
3. 添加环境变量后触发新的部署
4. 检查构建日志中是否显示了正确的环境变量值

### JavaScript 模块加载错误

如果遇到类似 "Failed to load module script: Expected a JavaScript-or-Wasm module script but the server responded with a MIME type of 'text/html'" 的错误：

1. 检查 `vercel.json` 中的路由配置是否正确
2. 确保静态资源（JS、CSS等）有自己的路由规则，不被重定向到 index.html
3. 正确的路由配置应该优先处理静态资源，然后再处理SPA路由
4. 重新部署项目使路由配置生效

### API 路由问题

如果您的应用有 API 路由，确保：

1. API 路由文件位于 `api` 目录中
2. API 路由导出默认的处理函数
3. 环境变量在服务器端也可访问

### 数据库连接问题

确保：

1. Supabase 项目处于活跃状态
2. 网络策略允许从 Vercel 访问 Supabase
3. 环境变量配置正确

## 性能优化建议

1. 启用 Vercel Analytics 监控性能
2. 配置图片优化
3. 使用 Vercel Edge Functions 处理地理位置相关的请求
4. 考虑使用 Vercel KV 作为缓存层

## 生产环境注意事项

1. 确保所有敏感信息都已通过环境变量配置
2. 启用 Vercel 的安全功能（如密码保护）
3. 定期更新依赖以修复安全漏洞
4. 监控应用性能和错误率

## 本地测试

在部署到生产环境前，您可以使用 Vercel CLI 在本地进行测试：

```bash
vercel dev
```

这将启动本地开发服务器，模拟 Vercel 的生产环境。