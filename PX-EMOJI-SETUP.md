# PX-EMOJI 设置和测试指南

## 🚀 快速开始

### 1. 环境配置

在 `.env.local` 文件中添加必要的环境变量：

```bash
# APICore AI 服务配置
APICORE_API_KEY=your_apicore_api_key_here

# 数据库配置
DATABASE_URL=your_postgresql_connection_string

# 身份验证配置
AUTH_SECRET=your_nextauth_secret

# 文件存储配置 (AWS S3 兼容)
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=your_region
AWS_BUCKET=your_bucket_name
```

### 2. 数据库迁移

```bash
# 生成迁移文件
pnpm db:generate

# 运行迁移
pnpm db:migrate
```

### 3. 启动开发服务器

```bash
pnpm dev
```

## 🧪 功能测试

### 手动测试流程

1. **访问主页** - 打开 `http://localhost:3000`
2. **登录账户** - 点击右上角登录按钮
3. **输入 Emoji** - 在输入框中输入单个 emoji，如 `🍦`
4. **生成像素艺术** - 点击 "Pixelate Now" 按钮
5. **查看结果** - 等待 1-2 秒，新生成的像素艺术会出现在画廊顶部

### API 测试

#### 测试像素化 API

```bash
curl -X POST http://localhost:3000/api/pixelate \
  -H "Content-Type: application/json" \
  -d '{"emoji": "🍦"}' \
  -H "Cookie: your_session_cookie"
```

#### 测试画廊 API

```bash
curl http://localhost:3000/api/gallery?limit=10
```

## 🎨 界面设计

### 主页布局
- **标题区域**: "Turn Any Emoji Into Pixel Art"
- **输入区域**: 横向布局，输入框 + 紫色按钮
- **画廊区域**: 4列响应式网格，展示像素艺术作品

### 卡片设计
- **正方形比例**: 1:1 宽高比
- **左上角徽标**: 显示原始 emoji
- **中央图片**: 512x512 像素艺术
- **悬浮效果**: 鼠标悬停显示创建时间

## 🔧 技术架构

### API 端点
- `POST /api/pixelate` - 生成像素艺术
- `GET /api/gallery` - 获取作品列表

### 数据库表
```sql
CREATE TABLE works (
  id SERIAL PRIMARY KEY,
  uuid VARCHAR(255) UNIQUE NOT NULL,
  user_uuid VARCHAR(255) NOT NULL,
  emoji VARCHAR(50) NOT NULL,
  image_url VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 组件结构
```
src/components/blocks/
├── emoji-input/     # Emoji 输入组件
├── pixel-gallery/   # 画廊展示组件
└── work-card/       # 单个作品卡片
```

## 🐛 故障排除

### 常见问题

1. **生成失败** - 检查 APICORE_API_KEY 是否正确配置
2. **图片不显示** - 确认文件存储配置正确
3. **登录问题** - 检查 AUTH_SECRET 和数据库连接
4. **样式异常** - 确认 TailwindCSS 正常工作

### 调试模式

启用控制台日志查看详细错误信息：

```bash
# 开发模式下会显示详细的 API 调用日志
pnpm dev
```

## 📊 性能指标

### 目标性能
- **生成时间**: ≤ 1.5 秒 (P95)
- **图片大小**: ≤ 80KB
- **首屏加载**: ≤ 2.0 秒

### 监控方法
- 浏览器开发者工具 Network 面板
- 控制台时间日志
- 用户体验反馈

## 🎯 验收清单

- [ ] 用户可以成功登录
- [ ] 输入单个 emoji 可以生成像素艺术
- [ ] 生成的图片正确显示在画廊中
- [ ] 响应式布局在不同设备上正常工作
- [ ] 错误处理和用户提示完善
- [ ] 性能符合预期指标

## 🚀 部署准备

部署前确认：
1. 所有环境变量已配置
2. 数据库迁移已执行
3. 文件存储服务正常
4. API 密钥有效且有足够配额

---

💡 **提示**: 如果遇到问题，请检查浏览器控制台和服务器日志获取详细错误信息。