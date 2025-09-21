# 🔧 环境配置说明

## 解决 useSession 错误

你遇到的 `useSession must be wrapped in a <SessionProvider />` 错误是因为认证系统没有正确配置。

### 解决方案：在 `.env.local` 中添加以下配置

```bash
# ===== 认证配置（必需） =====
NEXT_PUBLIC_AUTH_ENABLED=true
AUTH_SECRET=your-secret-key-here-at-least-32-characters

# 至少启用一个认证方式：

# 选项1: Google 认证
NEXT_PUBLIC_AUTH_GOOGLE_ENABLED=true
NEXT_PUBLIC_AUTH_GOOGLE_ID=your-google-client-id
AUTH_GOOGLE_SECRET=your-google-client-secret

# 选项2: GitHub 认证
NEXT_PUBLIC_AUTH_GITHUB_ENABLED=true
NEXT_PUBLIC_AUTH_GITHUB_ID=your-github-client-id
AUTH_GITHUB_SECRET=your-github-client-secret

# ===== 其他必要配置 =====
APICORE_API_KEY=your-apicore-api-key

# ===== 数据库配置（可选，使用 mock 数据时不需要） =====
# DATABASE_URL=postgresql://username:password@localhost:5432/dbname
```

### 快速生成 AUTH_SECRET

运行以下命令生成一个安全的密钥：

```bash
openssl rand -base64 32
```

或者使用 Node.js：

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 获取 OAuth 凭证

#### Google OAuth
1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建新项目或选择现有项目
3. 启用 Google+ API
4. 创建 OAuth 2.0 凭证
5. 添加授权重定向 URI: `http://localhost:3000/api/auth/callback/google`

#### GitHub OAuth
1. 访问 [GitHub Developer Settings](https://github.com/settings/developers)
2. 创建新的 OAuth App
3. 设置 Authorization callback URL: `http://localhost:3000/api/auth/callback/github`

## 如果暂时不想配置认证

如果你想先测试功能而不配置认证，可以：

1. 设置 `NEXT_PUBLIC_AUTH_ENABLED=false`
2. API 会使用 mock 用户 ID
3. 但是 `useSession` 仍然会返回 null

## Mock 数据模式

由于数据库还未配置，API 现在会使用 mock 数据，你不需要真实的数据库连接。