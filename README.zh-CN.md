<div align="center">

# 🧱 Confession Wall（心声墙）

**一个安全、匿名的心灵分享空间。**

*一个精心打造的匿名心声墙，专为职场情感健康而设计——每一张卡片都是某人内心的一部分，在安全的寂静中分享。*

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%26%20DB-3ECF8E?logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://www.typescriptlang.org/)

**🌐 其他语言 / Other Languages:**
[![EN](https://img.shields.io/badge/🇺🇸-English-blue)](./README.md)
[![ID](https://img.shields.io/badge/🇮🇩-Indonesia-red)](./README.id.md)
[![ZH](https://img.shields.io/badge/🇨🇳-简体中文-green)](./README.zh-CN.md)

[🚀 快速开始](#-快速开始) · [✨ 功能特性](#-功能特性) · [📡 API 文档](#-api-参考) · [🤝 贡献指南](./CONTRIBUTING.md) · [📄 许可证](#-许可证)

</div>

---

## 📸 截图

<!-- 在此添加您的截图！示例： -->
<!--
| 心声墙 | 投稿表单 | HR 管理面板 |
|--------|----------|-------------|
| ![Wall](./docs/screenshots/wall.png) | ![Form](./docs/screenshots/form.png) | ![Dashboard](./docs/screenshots/dashboard.png) |
-->

> 🎯 **提示：** 截取您运行中的应用截图并放入 `docs/screenshots/` 目录，然后取消上面表格的注释。

---

## ✨ 功能特性

### 🎨 视觉风格 — 字体选择
每一条心声都应有自己的风格。从 4 种精心挑选的字体中选择：

| 字体 | 字型 | 风格 |
|------|------|------|
| **Sans** | Inter | 现代 & 直接 |
| **Serif** | Playfair Display | 沉思 & 文学 |
| **Mono** | Fira Code | 原始 & 无滤镜 |
| **Handwriting** | Dancing Script | 个人 & 亲密 |

### 🧱 瀑布流布局
心声以漂亮的响应式瀑布流网格布局展示——就像真实墙上的便签纸。每张卡片根据内容长度呈现不同的节奏。

### ❤️ 点赞系统
- 乐观 UI 更新，即时反馈
- 一键切换 点赞/取消点赞
- 与服务器同步的点赞数
- 需要登录，优雅地回退到登录弹窗

### 💬 评论系统
- 对任何心声发表评论
- 基于弹窗的评论界面
- 卡片上显示评论数
- 仅在作者允许回复时可用

### 🔒 隐私控制
每条心声都让作者完全掌控：

| 设置 | 描述 |
|------|------|
| **公开 / 私密** | 公开心声显示在墙上；私密心声仅发送给 HR |
| **允许回复** | 切换是否允许他人评论您的心声 |
| **匿名身份** | 隐藏或显示您的用户名 — 您的选择，您的安全 |

### 🛡️ 内容审核
- **不良语言过滤** — 提交前自动检测印尼语和英语的不当词汇
- **发布前审查** — 新心声以 `pending`（待审核）状态开始，需要 HR 批准
- **自动发布计时** — 待审核心声在 3 小时后自动发布（如未审查）
- **HR 审核** — 从管理面板批准、拒绝或删除

### 🔔 通知系统
- 顶部导航栏的通知铃铛
- 未读计数徽章
- HR 私密回复您的心声时收到通知
- 一键标记为已读
- 通知弹窗，在上下文中查看 HR 回复

### 🏢 HR 管理面板
为 HR 团队提供的功能完备的管理面板：

| 功能 | 描述 |
|------|------|
| **指标卡片** | 总心声数、待审核数、情感健康百分比、已发布数 |
| **标签导航** | 在"待审核"和"已过滤"视图间切换 |
| **批量操作** | 一键批准所有待审核的公开心声 |
| **单个操作** | 单独批准、拒绝、删除或发送私密 HR 回复 |
| **私密 HR 回复** | 保密回复 — 只有心声作者能看到 |
| **分页** | 两个标签页都有清晰的分页（每页 20 条） |
| **响应式** | 桌面端表格视图 + 移动端卡片视图 |

### 👤 身份认证
- 集成 Supabase Auth
- 流畅的登录弹窗体验
- 通过 `is_admin` 个人资料标志检测管理员
- 动态导航（Dashboard 链接仅对管理员显示）
- 用户心声历史记录显示在头像下拉菜单中

### 📝 写作体验
- **自动保存草稿** — 永不丢失您的文字；草稿保存在 localStorage 中
- **实时预览** — 在提交前查看您的心声将如何呈现
- **字符计数器** — 带有警告/危险状态的视觉进度条
- **验证** — 最少 10 个字符，最多 2000 个字符

### 📱 响应式设计
- 移动优先，触控友好的交互目标
- 汉堡菜单 + 下滑导航抽屉
- 响应式瀑布流网格（移动端 1 列 → 桌面端多列）
- 快速投稿的浮动操作按钮

### 🦴 加载与错误状态
- 数据加载时的骨架屏卡片网格
- 带重试按钮的错误状态
- 带有鼓励信息的空状态
- 异步操作的旋转加载动画

---

## 🏗️ 技术栈

| 技术 | 用途 |
|------|------|
| [Next.js 16](https://nextjs.org/) | React 框架，支持 App Router 和 API Routes |
| [React 19](https://react.dev/) | 具有最新特性的 UI 库 |
| [Supabase](https://supabase.com/) | 身份认证、PostgreSQL 数据库、行级安全 |
| [Tailwind CSS v4](https://tailwindcss.com/) | 实用优先的 CSS 框架 |
| [TypeScript 5](https://www.typescriptlang.org/) | 类型安全的 JavaScript |
| [Material Symbols](https://fonts.google.com/icons) | 图标系统 |

---

## 🚀 快速开始

### 前提条件

- **Node.js** ≥ 18
- **npm** 或 **pnpm** 或 **yarn**
- 一个 [Supabase](https://supabase.com/) 账户（免费版即可！）

### 1. 克隆仓库

```bash
git clone https://github.com/nuuwbiie/confession-wall.git
cd confession-wall
```

### 2. 安装依赖

```bash
npm install
```

### 3. 设置环境变量

```bash
cp .env.example .env.local
```

用您的 Supabase 凭据编辑 `.env.local`：

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

> 💡 从 [Supabase 控制台 → 设置 → API](https://app.supabase.com/project/_/settings/api) 获取这些信息

### 4. 设置 Supabase 数据库

1. 进入您的 Supabase 项目的 **SQL 编辑器**
2. 复制并运行 [`supabase/migration.sql`](./supabase/migration.sql) 中的内容
3. 如有需要，可运行 [`supabase/fix_admin_column.sql`](./supabase/fix_admin_column.sql)

### 5. 启用 Supabase 身份认证

在 Supabase 控制台中：
1. 进入 **Authentication → Providers**
2. 启用 **Email** 提供商
3. 配置您的网站 URL 和重定向 URL

### 6. 创建管理员用户

1. 通过应用的登录弹窗注册新用户
2. 在 Supabase SQL 编辑器中，将该用户设置为管理员：

```sql
UPDATE profiles SET is_admin = true WHERE username = 'your-username';
```

### 7. 运行开发服务器

```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000)，开始倾诉心声！🎉

### 8.（可选）设置自动发布定时任务

要自动发布超过 3 小时的待审核心声，请设置一个定时任务调用：

```
GET https://your-domain.com/api/cron/publish
```

您可以使用 [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs)、[Supabase Edge Functions](https://supabase.com/docs/guides/functions) 或任何外部定时任务服务。

---

## ⚙️ 环境变量

| 变量 | 必填 | 描述 |
|------|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | 您的 Supabase 项目 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase 匿名/公开密钥（客户端安全） |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Supabase 服务角色密钥（仅服务器端，绕过 RLS） |

> ⚠️ **切勿将 `SUPABASE_SERVICE_ROLE_KEY` 暴露给客户端！** 它仅在服务器端 API 路由中使用。

---

## 📂 项目结构

```
confession-wall/
├── public/                     # 静态资源
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx            # 首页 — The Wall（瀑布流网格）
│   │   ├── layout.tsx          # 根布局，包含 Provider
│   │   ├── confess/            # 撰写心声页面
│   │   ├── dashboard/          # HR 管理员面板
│   │   ├── login/              # 登录页面
│   │   ├── auth/               # 认证回调处理
│   │   └── api/                # API 路由
│   │       ├── confessions/    # CRUD + 点赞 + 评论 + HR 回复
│   │       ├── moderate/       # 管理员审核操作
│   │       ├── notifications/  # 通知端点
│   │       ├── auth/           # 管理员检查
│   │       ├── comments/       # 评论 CRUD
│   │       ├── user/           # 用户专属数据
│   │       └── cron/           # 自动发布定时端点
│   ├── components/             # React 组件
│   │   ├── Header.tsx          # 导航、认证、通知
│   │   ├── WallCard.tsx        # 心声卡片，带点赞/评论
│   │   ├── ConfessionForm.tsx  # 撰写表单，包含所有控件
│   │   ├── ConfessionPreview.tsx
│   │   ├── CommentModal.tsx    # 评论线程弹窗
│   │   ├── NotificationModal.tsx
│   │   ├── LoginModal.tsx      # 认证弹窗
│   │   ├── LoginModalWrapper.tsx
│   │   ├── AuthProvider.tsx    # 全局认证上下文
│   │   ├── MasonryGrid.tsx    # CSS 瀑布流布局
│   │   ├── SkeletonCard.tsx    # 加载骨架屏
│   │   └── Footer.tsx
│   ├── hooks/
│   │   └── useConfessionForm.ts  # 使用 useReducer 管理表单状态
│   └── lib/
│       ├── constants.ts        # 字体、限制、示例数据
│       ├── profanity-filter.ts # 印尼语 + 英语不良词汇过滤
│       ├── username-generator.ts
│       ├── auth-helpers.ts
│       ├── actions/
│       └── supabase/
│           └── client.ts       # Supabase 浏览器客户端
├── supabase/
│   ├── migration.sql           # 完整数据库架构
│   └── fix_admin_column.sql   # 管理员列修复
├── .env.example                # 环境变量模板
├── CONTRIBUTING.md             # 贡献指南
└── LICENSE                     # MIT 许可证
```

---

## 🗄️ 数据库架构

### 实体关系

```
┌─────────────┐       ┌──────────────────┐       ┌──────────────┐
│  profiles   │       │   confessions    │       │    likes      │
├─────────────┤       ├──────────────────┤       ├──────────────┤
│ id (PK, FK) │──┐    │ id (PK)          │───┐   │ id (PK)      │
│ username    │  │    │ content          │   │   │ confession_id│
│ is_admin    │  └───▶│ user_id (FK)     │   └──▶│ user_id (FK) │
│ created_at  │       │ font             │       │ created_at   │
└─────────────┘       │ is_public        │       └──────────────┘
                      │ allow_replies    │
                      │ is_anonymous     │       ┌──────────────┐
                      │ status (enum)    │       │   comments   │
                      │ likes            │       ├──────────────┤
                      │ published_at     │       │ id (PK)      │
                      └──────┬──────────┘       │ confession_id│
                             │                   │ content      │
                     ┌───────┴───────┐           │ user_id (FK) │
                     │               │           │ created_at   │
              ┌──────┴─────┐  ┌─────┴──────┐    └──────────────┘
              │ hr_replies │  │notifications│
              ├────────────┤  ├────────────┤
              │ id (PK)    │  │ id (PK)    │
              │confession_id│  │ user_id    │
              │ content    │  │confession_id│
              │ admin_id   │  │ type       │
              │ created_at │  │ content    │
              └────────────┘  │ is_read    │
                              │ created_at │
                              └────────────┘
```

### 状态枚举（`confession_status`）

| 状态 | 描述 |
|------|------|
| `pending` | 等待 HR 审核（3 小时后自动发布） |
| `published` | 在墙上可见 |
| `private` | 仅 HR 可见（不显示在墙上） |
| `rejected` | 被 HR 过滤 |

### 行级安全（RLS）

所有表都启用了 RLS，并具有精心设计的安全策略：

- **公开心声** — 所有人可读
- **自己的心声** — 用户可以查看自己的待审核/私密帖子
- **点赞** — 任何人可查看；已认证用户可以添加/取消点赞
- **评论** — 已发布的心声可查看；允许回复时可添加
- **HR 回复** — 仅心声作者和管理员可见
- **通知** — 用户只能查看和更新自己的通知

---

## 📡 API 参考

### 心声相关

| 方法 | 端点 | 描述 |
|------|------|------|
| `GET` | `/api/confessions` | 按状态获取心声 |
| `POST` | `/api/confessions` | 提交新心声 |
| `POST` | `/api/confessions/[id]/like?action=like\|unlike` | 切换点赞 |
| `GET` | `/api/confessions/[id]/like` | 检查当前用户是否已点赞 |
| `GET` | `/api/confessions/[id]/comments` | 获取心声的评论 |
| `POST` | `/api/confessions/[id]/comments` | 添加评论 |
| `POST` | `/api/confessions/[id]/hr-reply` | HR 私密回复（仅管理员） |

#### `GET /api/confessions` 查询参数

| 参数 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `status` | string | `published` | 逗号分隔的状态值（`published`, `pending`, `private`, `rejected`） |
| `limit` | number | `50` | 每页结果数 |
| `offset` | number | `0` | 分页偏移量 |

#### `POST /api/confessions` 请求体

```json
{
  "content": "您的心声内容...",
  "font": "sans | serif | mono | handwriting",
  "is_public": true,
  "allow_replies": true,
  "is_anonymous": true
}
```

### 审核（仅管理员）

| 方法 | 端点 | 描述 |
|------|------|------|
| `POST` | `/api/moderate` | 执行审核操作 |

#### `POST /api/moderate` 请求体

```json
// 批准单条心声
{ "action": "approve", "confession_id": "uuid" }

// 拒绝心声
{ "action": "reject", "confession_id": "uuid" }

// 删除心声
{ "action": "delete", "confession_id": "uuid" }

// 批准所有待审核的公开心声
{ "action": "approve_all" }

// 以管理员身份回复
{ "action": "reply", "confession_id": "uuid", "message": "..." }
```

### 通知

| 方法 | 端点 | 描述 |
|------|------|------|
| `GET` | `/api/notifications` | 获取用户的通知 |
| `PUT` | `/api/notifications/[id]/read` | 标记通知为已读 |

### 认证

| 方法 | 端点 | 描述 |
|------|------|------|
| `GET` | `/api/auth/check-admin` | 检查当前用户是否为管理员 |
| `GET` | `/api/user/confessions` | 获取当前用户的心声 |

### 定时任务

| 方法 | 端点 | 描述 |
|------|------|------|
| `GET` | `/api/cron/publish` | 自动发布超过 3 小时的待审核心声 |

---

## 🚢 部署

### Vercel（推荐）

1. 将代码推送到 GitHub
2. 在 [Vercel](https://vercel.com/new) 上导入仓库
3. 在 Vercel 项目设置中添加环境变量
4. 部署！

对于自动发布定时任务，请添加到 `vercel.json`：

```json
{
  "crons": [
    {
      "path": "/api/cron/publish",
      "schedule": "0 * * * *"
    }
  ]
}
```

### 其他平台

这是一个标准的 Next.js 应用——可以部署到任何支持 Node.js 的平台：

```bash
npm run build
npm start
```

---

## 🗺️ 发展路线图

未来开发的想法：

- [ ] 🌙 深色模式切换
- [ ] 🏷️ 心声标签/分类
- [ ] 📊 HR 分析面板（情感分析、趋势图表）
- [ ] 🔗 可分享的心声链接
- [ ] 📧 HR 回复的电子邮件通知
- [ ] 🎨 心声卡片的自定义颜色主题
- [ ] 📱 PWA 支持，含推送通知
- [ ] 🤖 AI 驱动的内容分类
- [ ] 🌐 i18n / 多语言支持
- [ ] 💾 图片附件支持

---

## 🤝 贡献

我们欢迎各种形式的贡献！请阅读我们的 [**贡献指南**](./CONTRIBUTING.md) 了解详细信息：

- 🍴 如何复刻和设置项目
- 🌿 分支命名规范
- 📝 提交信息格式
- 🔀 拉取请求流程
- 🏗️ 架构深入解读

---

## 📄 许可证

本项目采用 MIT 许可证发布 — 详见 [LICENSE](./LICENSE) 文件。

---

<div align="center">

**用心构建 ❤️，为了职场情感健康**

*这面墙上的每一张卡片都是某人内心的一部分，在安全的寂静中分享。*

[⬆ 返回顶部](#-confession-wall心声墙)

</div>