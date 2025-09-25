# 🚀 PIXELART 快速启动指南

## 立即运行（3 分钟）

### 1️⃣ 复制环境配置文件
```bash
cp .env.local.example .env.local
```

### 2️⃣ 编辑 `.env.local` 文件

**最少配置**（只需要这两个）：
```bash
# APICore API 密钥（必需）
APICORE_API_KEY=你的_apicore_密钥

# 数据库连接（必需）
DATABASE_URL=postgresql://用户名:密码@localhost:5432/数据库名
```

### 3️⃣ 安装依赖并运行
```bash
# 安装依赖
pnpm install

# 生成数据库表
pnpm db:generate
pnpm db:migrate

# 启动开发服务器
pnpm dev
```

### 4️⃣ 访问应用
打开浏览器访问：http://localhost:3000

## 🎮 使用方法

1. 在输入框中输入任何 emoji（例如：🍦、😂、🎨）
2. 点击 "Pixelate Now" 按钮
3. 等待 1-2 秒，像素艺术会出现在画廊中

## ⚡ 快速故障排除

### 问题：数据库连接失败
**解决方案**：
- 确保 PostgreSQL 已安装并运行
- 或使用云数据库服务（如 Supabase、Neon）

### 问题：APICore 密钥无效
**解决方案**：
- 从 https://api.apicore.ai 获取密钥
- 确保密钥有足够的配额

### 问题：图片无法显示
**解决方案**：
- 检查 AWS S3 配置是否正确
- 或临时使用本地存储进行测试

## 🔥 演示模式

当前配置已经支持无需登录的演示模式：
- 所有用户共享 "demo-user" 账号
- 图片会保存在公共画廊中
- 适合快速测试和演示

## 📞 需要帮助？

查看详细文档：[PIXELART-SETUP.md](./PIXELART-SETUP.md)