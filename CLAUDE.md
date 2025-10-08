# CLAUDE.md

此文件为 Claude Code (claude.ai/code) 在此仓库中工作时提供指导。

## 项目概述

这是一个 PixelArt Template One 项目 - 基于 Next.js 的 SaaS 样板，具有 AI 能力、身份验证、支付和多语言支持。项目使用 TypeScript、React 19 构建，可快速部署到 Vercel 或 Cloudflare。

## 技术栈

- 使用 Next.js 并基于 React 的全栈框架，使用 App Router
- 代码使用 TypeScript 进行编写，不允许使用 any 类型
- 使用 Tailwind CSS v4 作为 CSS 框架
- UI 组件库使用 shadcn/ui，使用 Lucide React 图标库
- 使用 recharts 作为数据可视化图表库
- 数据库使用 PostgreSQL，用 Drizzle 作为 ORM 框架
- 使用 Zod 做数据验证工具
- 包管理器使用 pnpm，为了快速、节省磁盘空间

## 常用开发命令

### 开发
```bash
pnpm dev                    # 使用 Turbopack 启动开发服务器
pnpm build                  # 构建生产版本
pnpm start                  # 启动生产服务器
pnpm lint                   # 运行 Next.js 代码检查
```

### 数据库管理 (Drizzle ORM with PostgreSQL)
```bash
pnpm db:generate            # 生成数据库迁移文件
pnpm db:migrate             # 运行数据库迁移
pnpm db:studio              # 打开 Drizzle Studio 进行数据库管理
pnpm db:push                # 将架构更改推送到数据库
```

### 部署
```bash
# Vercel 部署（通过 git push 自动部署）

# Cloudflare 部署（需要 cloudflare 分支）
pnpm cf:preview             # 在 Cloudflare 上预览
pnpm cf:deploy              # 部署到 Cloudflare
pnpm cf:upload              # 上传到 Cloudflare
```

### Docker
```bash
pnpm docker:build           # 构建 Docker 镜像
```

## 开发规范

### 代码规范

- 始终使用 `globals.css` 中设定的预定义 CSS 变量编写代码
- 项目使用 TypeScript 编写代码，始终为变量增加类型而不是使用 `any`
- 项目中不使用 `any` 类型，总是为代码找出或写出合适的类型
- `components/ui` 下面是 shadcn ui 的组件，不要在这个目录下增加组件
- 页面上所有文字均需要使用多语言实现，使用的框架是 `next-intl`
- 编写项目页面时统一使用 `components/ui` 的 shadcn ui 组件，CSS 使用 `globals.css` 中预定义的变量
- 项目中 `import` 组件时应该使用 `@` 作为路径开始
- 新增环境变量应该先添加到 `/lib/env.ts` 里面去验证，然后再在其他文件中使用
- 项目使用 Biome 进行 lint 和 format
- 创建 `class` 时不要在里面放 `static member`

### 构建和修改规范

- 每次做改修改的代码是否实现了多语言，是否遵循下方的多语言错误规范
- 新实现或修改的代码只实现了多语言，是否遵循下方的多语言错误规范
- 都使用 `pnpm build` 确保构建正常通过

## 架构概览

### 目录结构

#### 核心目录

- **`/app`** - Next.js App Router 页面和布局
- **`/components/ui`** - 可复用的 UI 组件
- **`/db`** - 数据库模式和迁移
- **`/lib`** - 工具函数和项目配置
- **`/hooks`** - 自定义 React hooks

#### 详细结构说明

- **`/src/app`**: 支持国际化的 Next.js 15 应用路由
  - `[locale]`: 用于 i18n 的动态语言路由
  - `(default)`: 面向公众的页面
  - `(admin)`: 管理仪表板页面
  - `(console)`: 用户控制台页面
  - `(docs)`: 文档页面
  - `api/`: API 路由，包括身份验证、支付和演示端点

- **`/src/components`**: 可复用的 React 组件
  - `ui/`: shadcn/ui 组件库
  - `blocks/`: 页面级构建块（英雄区、功能区、价格区等）
  - `console/`: 控制台特定组件
  - `dashboard/`: 仪表板特定组件

- **`/src/db`**: 使用 Drizzle ORM 的数据库配置
  - `schema.ts`: 数据库架构定义
  - `config.ts`: Drizzle 配置
  - `index.ts`: 数据库连接

- **`/src/i18n`**: 国际化
  - `messages/`: 每种语言的翻译文件
  - `pages/`: 页面特定的内容翻译

- **`/src/auth`**: NextAuth.js 身份验证配置

- **`/src/lib`**: 工具函数和共享逻辑

- **`/src/hooks`**: 自定义 React hooks

### 核心技术栈

- **框架**: Next.js 15 with App Router and Turbopack
- **UI**: React 19, Tailwind CSS v4, shadcn/ui components
- **数据库**: PostgreSQL with Drizzle ORM
- **身份验证**: NextAuth.js v5 (beta) 支持 Google/GitHub 登录
- **支付**: Stripe 或 Creem 集成
- **AI**: 多个 AI 提供商（OpenAI、DeepSeek、Replicate、OpenRouter）
- **分析**: Google Analytics、OpenPanel 或 Plausible
- **国际化**: next-intl 支持动态语言路由
- **文档**: Fumadocs MDX

### 环境配置

项目使用环境变量进行配置。将 `.env.example` 复制为 `.env.development` 或 `.env.local` 并配置：
- 数据库连接 (`DATABASE_URL`)
- 身份验证 (`AUTH_SECRET`，提供商凭证)
- 支付提供商（Stripe/Creem 密钥）
- 分析 ID
- 存储配置（AWS S3 兼容）

### API 路由模式

API 路由在 `/src/app/api/` 中遵循 RESTful 约定：
- 身份验证: `/api/auth/[...nextauth]`
- 支付: `/api/pay/notify/[provider]`, `/api/checkout`
- 用户操作: `/api/get-user-info`, `/api/get-user-credits`
- 演示端点: `/api/demo/gen-text`, `/api/demo/gen-image`

### 状态管理

- 服务器状态: Server Components 和 Server Actions
- 客户端状态: React hooks 和 context providers
- 用户会话: NextAuth.js 会话管理
- 应用上下文: 自定义 AppContext provider

### 样式规范

- Tailwind CSS 在 `src/app/theme.css` 中自定义主题配置
- 使用 class-variance-authority (CVA) 的组件变体
- 一致使用 cn() 工具函数合并 className

## 项目规则引用

- 多语言错误码规范 `@~/.claude/project-rule/error-code-design.md`
- 项目中 json 字段命名规范 `@~/.claude/project-rule/json-key-naming.md`
- drizzle-orm 使用规范 `@~/.claude/project-rule/drizzle-orm-using.md`
- 前后端通信数据类型规范 `@~/.claude/project-rule/api-contract.md`
- 编写 react 组件的规范 `@~/.claude/project-rule/react-component-rule.md`