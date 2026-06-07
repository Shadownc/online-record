# 宝塔面板部署指南

本项目是一个基于 **Next.js 14 + Prisma + MySQL** 的在线留言系统，适合在宝塔面板中使用 **Node.js 项目 / PM2** 方式部署。

> 如果服务器内存较小，执行 `npm install` 或 `npm run build` 时被系统 `Killed`，推荐改用 Docker 镜像部署，参考 [Docker 部署指南](DOCKER_DEPLOY.md)。

## 1. 服务器环境要求

建议配置：

- Linux 服务器（CentOS / Ubuntu / Debian 均可）
- 宝塔面板
- Node.js 18.17+，推荐 Node.js 20 LTS
- MySQL 5.7+ 或 MySQL 8.0+
- Nginx
- PM2 或宝塔自带的「Node项目」管理功能

## 2. 宝塔安装基础软件

在宝塔面板左侧进入「软件商店」，安装：

1. **Nginx**
2. **MySQL**
3. **Node.js版本管理器** 或 **PM2管理器**
4. 可选：**Git**

如果使用 Node.js 版本管理器，安装 Node.js 20 LTS。

## 3. 创建 MySQL 数据库

进入宝塔面板：

「数据库」→「添加数据库」

示例：

- 数据库名：`online_record`
- 用户名：`online_record`
- 密码：设置一个强密码
- 访问权限：本地服务器可选 `localhost`

为了支持 emoji，建议数据库字符集使用 `utf8mb4`。

如果宝塔创建数据库时没有选择字符集，可以在 MySQL 中执行：

```sql
CREATE DATABASE online_record CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

如果数据库已存在，可以执行：

```sql
ALTER DATABASE online_record CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## 4. 上传项目代码

推荐将项目放到：

```bash
/www/wwwroot/online-record
```

### 方式一：使用 Git 拉取

在宝塔终端中执行：

```bash
cd /www/wwwroot
git clone <你的仓库地址> online-record
cd online-record
```

### 方式二：手动上传

将项目压缩包上传到：

```bash
/www/wwwroot/online-record
```

然后在宝塔文件管理中解压。

> 注意：不要把本地的 `node_modules` 上传到服务器，服务器上重新安装依赖即可。

## 5. 配置环境变量

在项目根目录创建 `.env` 文件：

```bash
cd /www/wwwroot/online-record
cp .env.example .env
```

编辑 `.env`：

```env
DATABASE_URL="mysql://online_record:你的数据库密码@127.0.0.1:3306/online_record"
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="请改成强密码"
SESSION_SECRET="请改成至少32位随机字符串"
NEXT_PUBLIC_SITE_NAME="Online Record"
```

字段说明：

| 变量 | 说明 |
| --- | --- |
| `DATABASE_URL` | MySQL 连接地址 |
| `ADMIN_USERNAME` | 后台管理员用户名 |
| `ADMIN_PASSWORD` | 后台管理员初始密码 |
| `SESSION_SECRET` | 登录会话密钥，必须使用强随机字符串 |
| `NEXT_PUBLIC_SITE_NAME` | 网站名称 |

生成 `SESSION_SECRET` 的方式示例：

```bash
openssl rand -base64 32
```

## 6. 安装依赖

在项目根目录执行：

```bash
cd /www/wwwroot/online-record
npm install
```

如果服务器网络访问 npm 较慢，可以使用国内镜像：

```bash
npm install --registry=https://registry.npmmirror.com
```

## 7. 初始化数据库

执行 Prisma 数据库同步：

```bash
npm run db:push
```

创建管理员账号和默认配置：

```bash
npm run db:seed
```

如果后续修改了 `.env` 中的 `ADMIN_USERNAME` 或 `ADMIN_PASSWORD`，可以再次执行：

```bash
npm run db:seed
```

## 8. 构建项目

执行生产构建：

```bash
npm run build
```

构建成功后，会生成 `.next` 目录。

## 9. 使用宝塔 Node 项目运行

进入宝塔面板：

「网站」→「Node项目」→「添加 Node 项目」

推荐配置：

| 配置项 | 值 |
| --- | --- |
| 项目目录 | `/www/wwwroot/online-record` |
| 项目名称 | `online-record` |
| 启动命令 | `npm run start` |
| 端口 | `3000` |
| Node 版本 | Node.js 20 LTS |
| 包管理器 | npm |

保存后启动项目。

如果宝塔要求填写入口文件，可以优先使用「启动命令」模式；如果只能填写命令，填写：

```bash
npm run start
```

## 10. 绑定域名和反向代理

### 10.1 添加站点

进入宝塔面板：

「网站」→「添加站点」

填写你的域名，例如：

```text
example.com
```

站点目录可以先选择：

```bash
/www/wwwroot/online-record
```

### 10.2 配置反向代理

进入该站点设置：

「反向代理」→「添加反向代理」

配置：

| 配置项 | 值 |
| --- | --- |
| 代理名称 | `online-record` |
| 目标 URL | `http://127.0.0.1:3000` |
| 发送域名 | `$host` |

保存后访问域名即可。

## 11. 配置 HTTPS

进入站点设置：

「SSL」→「Let's Encrypt」

申请证书后，建议开启：

- 强制 HTTPS
- HTTP/2

## 12. 防火墙和安全建议

建议：

1. 宝塔安全组只放行 `80`、`443`、`22`、宝塔面板端口。
2. 不要对外开放 Node.js 端口 `3000`。
3. MySQL 只允许本机访问，不要开放 `3306` 到公网。
4. 后台密码使用强密码。
5. `SESSION_SECRET` 不要使用默认值。
6. `.env` 不要上传到公开仓库。

## 13. 后台访问

部署完成后，前台地址：

```text
https://你的域名
```

后台地址通常为：

```text
https://你的域名/admin
```

使用 `.env` 中配置的：

```env
ADMIN_USERNAME
ADMIN_PASSWORD
```

登录后台。

## 14. 更新项目

如果代码有更新，进入项目目录执行：

```bash
cd /www/wwwroot/online-record
git pull
npm install
npm run db:push
npm run build
```

然后在宝塔 Node 项目中重启项目。

如果使用 PM2，也可以执行：

```bash
pm2 restart online-record
```

## 15. 常见问题

### 15.1 页面打不开

检查：

```bash
npm run start
```

是否能正常启动。

也可以检查宝塔 Node 项目的运行日志。

### 15.2 端口被占用

如果 `3000` 被占用，可以换成其他端口，例如 `3001`。

启动命令可改为：

```bash
PORT=3001 npm run start
```

反向代理目标 URL 同步改为：

```text
http://127.0.0.1:3001
```

### 15.3 数据库连接失败

检查 `.env` 中的 `DATABASE_URL` 是否正确：

```env
DATABASE_URL="mysql://用户名:密码@127.0.0.1:3306/数据库名"
```

常见原因：

- 数据库用户名或密码错误
- 数据库名错误
- MySQL 没有启动
- 密码中包含特殊字符但没有正确转义

### 15.4 构建时报 Prisma 错误

先执行：

```bash
npx prisma generate
npm run db:push
npm run build
```

### 15.5 emoji 显示异常

确认数据库字符集为 `utf8mb4`，推荐排序规则：

```text
utf8mb4_unicode_ci
```

## 16. 推荐的一键部署命令汇总

首次部署可以按顺序执行：

```bash
cd /www/wwwroot/online-record
npm install
cp .env.example .env
# 编辑 .env 后继续
npm run db:push
npm run db:seed
npm run build
npm run start
```

确认能启动后，再到宝塔中添加 Node 项目和反向代理。
