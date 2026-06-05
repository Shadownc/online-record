# Online Record

一个基于 Next.js + Prisma + MySQL 的在线留言系统，使用 Bitcoin DeFi 暗色视觉风格。

## 功能

- 访客创建本地用户名后留言
- 文本和 emoji 留言
- MySQL 持久化
- 后台登录管理
- 查看用户名、IP、User-Agent、留言时间
- 隐藏/恢复/软删除留言
- IP 和留言统计
- 后台控制留言开关、开放时间段和关闭提示
- 关闭时前台展示发光轨道动画

## 开发

```bash
npm install
cp .env.example .env
# 修改 .env 中的 DATABASE_URL、ADMIN_USERNAME、ADMIN_PASSWORD、SESSION_SECRET
npm run db:push
npm run db:seed
npm run dev
```

## MySQL emoji 支持

建议数据库使用 `utf8mb4`：

```sql
CREATE DATABASE online_record CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## 生产环境

至少设置：

- `DATABASE_URL`
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`
- `SESSION_SECRET`：至少 32 位随机字符串
- `NEXT_PUBLIC_SITE_NAME`

构建：

```bash
npm run build
npm run start
```
