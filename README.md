# Online Record

一个基于 Next.js + Prisma + MySQL 的在线留言系统，使用 Bitcoin DeFi 暗色视觉风格。

## 功能特性

### 前台功能
- 访客创建本地用户名后留言
- 文本和 emoji 留言支持
- 留言点赞/共鸣互动
- 留言详情页与分享功能
- 投稿前预览
- 随机漫游模式
- 开放/关闭倒计时
- 滚动公告栏

### 后台管理
- 登录认证与会话管理
- 查看用户名、IP、User-Agent、留言时间
- 隐藏/恢复/软删除留言
- 回收站与永久删除
- 批量操作（隐藏、恢复、删除）
- 高级筛选（关键词、IP、状态、日期范围）
- 敏感词过滤与审核
- IP 封禁管理
- 系统设置（开关、时间段、限制配置）
- 数据统计面板

### 安全与风控
- IP 和用户名频率限制
- 敏感词自动拦截
- 防重复提交
- IP 黑名单
- 可配置留言长度与提交间隔

## 技术栈

- **框架**: Next.js 15 (App Router)
- **数据库**: MySQL + Prisma ORM
- **样式**: Tailwind CSS
- **认证**: 基于 Session 的后台登录
- **类型**: TypeScript

## 快速开始

### 开发环境

```bash
npm install
cp .env.example .env
# 修改 .env 中的 DATABASE_URL、ADMIN_USERNAME、ADMIN_PASSWORD、SESSION_SECRET
npm run db:push
npm run db:seed
npm run dev
```

访问 `http://localhost:3000` 查看前台，访问 `http://localhost:3000/admin` 进入后台管理。

### MySQL emoji 支持

建议数据库使用 `utf8mb4`：

```sql
CREATE DATABASE online_record CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 生产环境

至少设置：

- `DATABASE_URL` - MySQL 数据库连接
- `ADMIN_USERNAME` - 后台管理员用户名
- `ADMIN_PASSWORD` - 后台管理员密码
- `SESSION_SECRET` - 至少 32 位随机字符串
- `NEXT_PUBLIC_SITE_NAME` - 站点名称

构建与运行：

```bash
npm run build
npm run start
```

## 更新日志

查看 [CHANGELOG.md](./CHANGELOG.md) 了解详细的功能更新与优化记录。

## License

MIT
