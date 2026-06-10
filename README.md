# Online Record

一个现代化的在线留言墙系统，采用科幻赛博风格设计，基于 Next.js + Prisma + MySQL 构建。

## ✨ 功能特性

### 前台功能
- 💬 **留言互动** - 访客创建本地用户名后留言，支持文本和 emoji
- 💖 **点赞共鸣** - 留言点赞/共鸣互动，按 IP 去重，可取消
- 🔗 **详情分享** - 独立留言详情页，支持复制链接和生成分享图
- 🖼️ **精美分享图** - 客户端 Canvas 生成科幻风格分享图，支持下载
- 👀 **投稿预览** - 发布前预览留言卡片效果，可返回编辑
- 🎲 **随机漫游** - 自动刷新随机留言，支持开启/停止
- ⏰ **倒计时显示** - 留言开放/关闭倒计时，自动刷新状态
- 📢 **滚动公告** - 首页滚动公告栏，后台可配置

### 后台管理
- 🔐 **安全认证** - 基于 Session 的登录认证与会话管理
- 📊 **数据统计** - 总留言数、可见留言、回收站、点赞数统计面板
- 👁️ **留言管理** - 查看用户名、IP、User-Agent、留言时间
- 🎛️ **批量操作** - 支持批量隐藏、恢复、删除留言
- 🔍 **高级筛选** - 关键词、IP、可见状态、日期范围、排序筛选
- 🗑️ **回收站** - 软删除留言进入回收站，支持恢复或永久删除
- 🚫 **敏感词过滤** - 自动拦截或隐藏含敏感词留言，等待审核
- 🛡️ **IP 封禁** - IP 黑名单管理，封禁恶意 IP
- ⚙️ **系统设置** - 留言开关、开放时间段、长度限制、频率限制配置

### 安全与风控
- 🔒 IP 和用户名频率限制
- 🚨 敏感词自动拦截或审核
- 🛑 防重复提交机制
- 🚷 IP 黑名单
- 📏 可配置留言长度与提交间隔

### 界面与体验
- 🎨 科幻赛博风格设计（深色主题、渐变光效、网格背景）
- 📱 响应式设计，完整支持移动端和桌面端
- 🎭 骨架屏加载状态，平滑过渡
- 🔔 Toast 提示反馈，成功/错误/警告提示
- ♿ 无障碍支持，语义化 HTML 和 ARIA 标签
- 🎯 统一设计系统（自定义表单组件、日期选择器、下拉选择）

## 🛠️ 技术栈

- **框架**: Next.js 15 (App Router)
- **数据库**: MySQL + Prisma ORM
- **样式**: Tailwind CSS
- **认证**: 基于 Session 的后台登录
- **类型**: TypeScript
- **验证**: Zod
- **Canvas**: 原生 Canvas API（分享图生成）

## 🚀 快速开始

### 环境要求

- Node.js 18+
- MySQL 5.7+ / 8.0+
- npm / yarn / pnpm

### 开发环境

```bash
# 1. 克隆项目
git clone <your-repo-url>
cd online-record

# 2. 安装依赖
npm install

# 3. 配置环境变量
cp .env.example .env
# 修改 .env 中的配置：
#   - DATABASE_URL: MySQL 数据库连接
#   - ADMIN_USERNAME: 后台管理员用户名
#   - ADMIN_PASSWORD: 后台管理员密码
#   - SESSION_SECRET: 至少 32 位随机字符串
#   - NEXT_PUBLIC_SITE_NAME: 站点名称

# 4. 初始化数据库
npm run db:push
npm run db:seed

# 5. 启动开发服务器
npm run dev
```

访问 `http://localhost:3000` 查看前台，访问 `http://localhost:3000/admin` 进入后台管理。

### MySQL emoji 支持

建议数据库使用 `utf8mb4` 字符集以支持 emoji：

```sql
CREATE DATABASE online_record CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 生产环境部署

#### 必需环境变量

```env
DATABASE_URL="mysql://user:password@host:3306/database"
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="your-secure-password"
SESSION_SECRET="your-random-32-char-secret"
NEXT_PUBLIC_SITE_NAME="Online Record"
```

#### 构建与运行

```bash
# 构建生产版本
npm run build

# 启动生产服务器
npm run start
```

#### 推荐部署平台

- Vercel / Netlify（自动构建部署）
- Docker（容器化部署）
- VPS（自定义服务器）

## 📂 项目结构

```
online-record/
├── app/                      # Next.js App Router 页面和 API
│   ├── admin/               # 后台管理页面
│   ├── api/                 # API 路由
│   ├── messages/[id]/       # 留言详情页
│   └── page.tsx             # 首页
├── components/              # React 组件
│   ├── admin/              # 后台管理组件
│   ├── message-board/      # 留言墙组件
│   └── ui/                 # 通用 UI 组件
├── lib/                     # 工具库和配置
│   ├── api.ts              # API 统一工具
│   ├── api-client.ts       # 前端请求封装
│   ├── prisma.ts           # Prisma 客户端
│   └── utils.ts            # 通用工具函数
├── prisma/                  # Prisma 数据库配置
│   ├── schema.prisma       # 数据模型
│   └── seed.ts             # 数据库种子
└── public/                  # 静态资源
```

## 📊 数据模型

### Message（留言）
- id, username, content, createdAt, updatedAt
- ip, userAgent, visible, deletedAt
- 关联：reactions（点赞记录）

### MessageReaction（点赞）
- messageId, ip, createdAt
- 复合唯一索引：messageId + ip

### BlockedWord（敏感词）
- word, action (REJECT | HIDE)
- 支持大小写和空白归一化匹配

### BannedIP（封禁 IP）
- ip, reason, createdAt

### SiteSetting（系统设置）
- 留言开关、开放时间、长度限制、频率限制
- 公告内容与开关

## 🎨 设计风格

采用科幻赛博风格设计语言：

- **配色**: 深色背景 (#02040a) + 青色高亮 (#22D3EE) + 紫色点缀 (#A78BFA)
- **字体**: 标题用 Orbitron，代码用 Courier New，正文用系统字体栈
- **效果**: 渐变边框、毛玻璃背景、发光动画、网格纹理
- **动画**: Smooth 过渡、Hover 交互、Loading 状态

## 🔧 可用命令

```bash
npm run dev          # 启动开发服务器
npm run build        # 构建生产版本
npm run start        # 启动生产服务器
npm run lint         # ESLint 检查
npm run db:push      # 同步数据库结构
npm run db:seed      # 填充种子数据
npm run db:studio    # 打开 Prisma Studio
```

## 📝 更新日志

查看 [CHANGELOG.md](./CHANGELOG.md) 了解详细的功能更新与优化记录。

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 License

MIT
