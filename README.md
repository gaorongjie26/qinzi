
# 亲子沟通模拟器

一个帮助家长学习亲子沟通技巧的互动游戏应用。

## 技术栈

- **Framework**: Next.js 16 (App Router)
- **Core**: React 19
- **Language**: TypeScript 5
- **UI 组件**: shadcn/ui (基于 Radix UI)
- **Styling**: Tailwind CSS 4
- **Database**: PostgreSQL with Drizzle ORM
- **Package Manager**: pnpm

## 功能特性

- 用户注册和登录
- 亲子沟通场景游戏
- 游戏记录和排行榜
- 亲子沟通博客文章
- 游戏结果分享

## 快速开始

### 前置要求

- Node.js (LTS 版本)
- pnpm 9.0.0+
- PostgreSQL 数据库

### 安装依赖

```bash
pnpm install
```

### 环境变量配置

创建 `.env.local` 文件并配置：

```env
DATABASE_URL=postgresql://user:password@localhost:5432/database_name

# Coze SDK 配置
COZE_WORKLOAD_IDENTITY_API_KEY=your_api_key
COZE_INTEGRATION_BASE_URL=https://integration.coze.cn
COZE_INTEGRATION_MODEL_BASE_URL=https://integration.coze.cn/api/v3
COZE_API_KEY=your_coze_api_key
```

### 数据库初始化

```bash
npx tsx scripts/init-db.ts
```

### 启动开发服务器

```bash
pnpm dev
```

访问 http://localhost:3000 查看应用。

## 项目结构

```
├── src/
│   ├── app/                # Next.js App Router
│   │   └── api/            # API 路由
│   ├── components/         # React 组件
│   ├── hooks/             # 自定义 Hooks
│   ├── lib/               # 工具函数
│   ├── contexts/          # React Context
│   └── storage/
│       └── database/      # 数据库相关
│           ├── shared/    # 数据库 schema
│           └── db.ts      # 数据库连接
├── scripts/               # 脚本文件
├── public/                # 静态资源
└── package.json
```

## 数据库

项目使用 PostgreSQL 数据库，通过 Drizzle ORM 进行数据操作。主要表结构：

- `users` - 用户表
- `blog_posts` - 博客文章表
- `game_records` - 游戏记录表

## 部署

### 构建

```bash
pnpm build
```

### 启动生产服务器

```bash
pnpm start
```

## 许可证

MIT

