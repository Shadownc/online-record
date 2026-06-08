# Docker 部署指南

本指南适用于 **Next.js 14 + Prisma + MySQL** 的 Docker 部署。适合低内存服务器：依赖安装和项目构建放到 GitHub Actions 或本地 Docker 构建阶段完成，服务器只需要拉取镜像并运行容器。

## 1. 部署方式概览

推荐流程：

1. GitHub Actions 在 `main` 分支推送时自动构建 Docker 镜像。
2. 镜像推送到 Docker Hub。
3. 宝塔服务器安装 Docker。
4. 服务器通过 `docker compose` 启动 MySQL 和应用。
5. 首次部署时执行一次数据库初始化。
6. 宝塔 Nginx 反向代理到 `http://127.0.0.1:3000`。

## 2. 环境变量

| 变量 | 必填 | 示例 | 说明 |
| --- | --- | --- | --- |
| `DATABASE_URL` | 是 | `mysql://online_record:password@mysql:3306/online_record` | Docker Compose 内 MySQL 主机名用 `mysql`，不要用 `localhost` |
| `ADMIN_USERNAME` | 是 | `admin` | 后台管理员用户名 |
| `ADMIN_PASSWORD` | 是 | `your-strong-password` | 后台管理员密码，不能使用默认值 `change-me-before-deploy` |
| `SESSION_SECRET` | 是 | `replace-with-at-least-32-random-characters` | 登录会话密钥，至少 32 位 |
| `NEXT_PUBLIC_SITE_NAME` | 否 | `Online Record` | 网站名称，建议构建镜像时设置 |

生成 `SESSION_SECRET`：

```bash
openssl rand -base64 32
```

## 3. GitHub Actions 推送 Docker Hub

项目已提供 [.github/workflows/docker.yml](.github/workflows/docker.yml)。每次 push 到 `main` 分支时，会自动构建并推送镜像：

```text
DOCKERHUB_USERNAME/online-record:latest
DOCKERHUB_USERNAME/online-record:<commit-sha>
```

### 3.1 配置 Docker Hub Token

进入 Docker Hub：

1. 头像 → **Account settings**
2. **Security** → **Personal access tokens**
3. 创建 token，例如 `github-actions-online-record`
4. 权限至少需要 Read & Write

### 3.2 配置 GitHub Secrets

进入 GitHub 仓库：

**Settings** → **Secrets and variables** → **Actions** → **New repository secret**

添加：

| Secret | 值 |
| --- | --- |
| `DOCKERHUB_USERNAME` | 你的 Docker Hub 用户名 |
| `DOCKERHUB_TOKEN` | Docker Hub Personal Access Token |

可选：如果想在构建时设置网站名称，进入 **Variables** 添加：

| Variable | 值 |
| --- | --- |
| `NEXT_PUBLIC_SITE_NAME` | 你的网站名称 |

## 4. 本地测试构建镜像

如果本地安装了 Docker，可以测试：

```bash
docker build \
  --build-arg NEXT_PUBLIC_SITE_NAME="Online Record" \
  -t online-record:local .
```

运行：

```bash
docker run --rm -p 3000:3000 \
  -e DATABASE_URL="mysql://online_record:password@你的MySQL地址:3306/online_record" \
  -e ADMIN_USERNAME="admin" \
  -e ADMIN_PASSWORD="your-strong-password" \
  -e SESSION_SECRET="replace-with-at-least-32-random-characters" \
  online-record:local
```

> Linux 服务器上的容器内通常不能直接用 `localhost` 连接宿主机 MySQL。推荐使用 Docker Compose 的 `mysql` 服务名，或者使用服务器内网 IP / Docker 网络。

## 5. 使用 Docker Compose 部署

项目已提供 [docker-compose.yml](docker-compose.yml)，包含：

- `mysql`：MySQL 8.0 数据库
- `app`：Next.js 应用
- `app-init`：一次性数据库初始化任务

### 5.1 修改配置

部署前请修改 [docker-compose.yml](docker-compose.yml) 中这些占位值：

```yaml
MYSQL_PASSWORD: change-this-db-password
MYSQL_ROOT_PASSWORD: change-this-root-password
DATABASE_URL: mysql://online_record:change-this-db-password@mysql:3306/online_record
ADMIN_PASSWORD: change-me-before-deploy
SESSION_SECRET: replace-with-at-least-32-random-characters
NEXT_PUBLIC_SITE_NAME: Online Record
```

必须修改：

- `change-this-db-password`
- `change-this-root-password`
- `change-me-before-deploy`
- `replace-with-at-least-32-random-characters`

如果要直接使用 Docker Hub 镜像，可以设置镜像名：

```bash
export DOCKER_IMAGE=你的DockerHub用户名/online-record:latest
```

或者直接把 [docker-compose.yml](docker-compose.yml) 里的：

```yaml
image: ${DOCKER_IMAGE:-online-record:latest}
```

改成：

```yaml
image: 你的DockerHub用户名/online-record:latest
```

### 5.2 启动 MySQL

```bash
docker compose up -d mysql
```

查看状态：

```bash
docker compose ps
```

### 5.3 初始化数据库

首次部署执行一次：

```bash
docker compose --profile init run --rm app-init
```

该命令会执行：

```bash
npm run db:push && npm run db:seed
```

说明：

- `db:push` 会把 Prisma schema 同步到 MySQL。
- `db:seed` 会创建默认站点配置。
- 只有当 `ADMIN_PASSWORD` 不是 `change-me-before-deploy` 时，才会创建/更新后台管理员账号。

### 5.4 启动应用

```bash
docker compose up -d app
```

查看日志：

```bash
docker compose logs -f app
```

访问：

```text
http://服务器IP:3000
http://服务器IP:3000/admin
```

## 6. 宝塔服务器部署步骤

### 6.1 安装 Docker

在宝塔面板的软件商店中安装 Docker 管理器，或者在服务器终端安装 Docker / Docker Compose。

确认命令可用：

```bash
docker --version
docker compose version
```

### 6.2 上传部署文件

在服务器创建目录：

```bash
mkdir -p /www/wwwroot/online-record-docker
cd /www/wwwroot/online-record-docker
```

上传或创建：

- [docker-compose.yml](docker-compose.yml)

如果用服务器本机构建，还需要完整项目源码和 [Dockerfile](Dockerfile)。如果使用 Docker Hub 镜像，只需要 compose 文件即可。

### 6.3 拉取镜像

```bash
docker pull 你的DockerHub用户名/online-record:latest
```

如果 compose 中使用环境变量：

```bash
export DOCKER_IMAGE=你的DockerHub用户名/online-record:latest
```

### 6.4 启动和初始化

```bash
docker compose up -d mysql
docker compose --profile init run --rm app-init
docker compose up -d app
```

### 6.5 宝塔反向代理

宝塔面板：

1. 「网站」→ 添加站点，填写你的域名。
2. 进入站点设置 →「反向代理」→「添加反向代理」。
3. 配置：

| 配置项 | 值 |
| --- | --- |
| 代理名称 | `online-record` |
| 目标 URL | `http://127.0.0.1:3000` |
| 发送域名 | `$host` |

保存后访问域名。

### 6.6 HTTPS

进入站点设置 →「SSL」→「Let's Encrypt」申请证书。

建议开启：

- 强制 HTTPS
- HTTP/2

## 7. 更新部署

### 7.1 GitHub Actions 自动构建后更新服务器

当你 push 到 `main` 后，GitHub Actions 会推送新镜像。

服务器执行：

```bash
cd /www/wwwroot/online-record-docker
docker compose pull app
docker compose --profile init run --rm app-init
docker compose up -d app
```

如果没有数据库结构变化，也可以跳过 init：

```bash
docker compose pull app
docker compose up -d app
```

### 7.2 服务器本机构建更新

如果服务器资源足够，也可以：

```bash
git pull
docker compose build app
docker compose --profile init run --rm app-init
docker compose up -d app
```

低内存服务器不推荐本机构建，建议使用 GitHub Actions 构建好的镜像。

## 8. 常见问题

### 8.1 数据库连接失败

检查 `DATABASE_URL`。

Docker Compose 内应该使用：

```env
DATABASE_URL="mysql://online_record:密码@mysql:3306/online_record"
```

不要写：

```env
DATABASE_URL="mysql://online_record:密码@localhost:3306/online_record"
```

因为 `localhost` 在容器内指的是应用容器自己，不是 MySQL 容器。

### 8.2 后台账号无法登录

检查：

1. 是否执行过：

   ```bash
   docker compose --profile init run --rm app-init
   ```

2. `ADMIN_PASSWORD` 是否仍然是默认值：

   ```text
   change-me-before-deploy
   ```

   如果是默认值，seed 脚本不会创建管理员账号。

3. `SESSION_SECRET` 是否至少 32 位。

### 8.3 `SESSION_SECRET must be at least 32 characters long`

说明 `SESSION_SECRET` 太短或没有设置。重新设置至少 32 位随机字符串后重启：

```bash
docker compose up -d app
```

### 8.4 网站名称不更新

`NEXT_PUBLIC_SITE_NAME` 可能在构建时写入 Next.js 产物。修改后建议重新构建并推送镜像。

GitHub Actions 中可以设置仓库变量：

```text
NEXT_PUBLIC_SITE_NAME
```

### 8.5 emoji 显示乱码

确认 MySQL 使用 `utf8mb4`。Compose 已配置：

```yaml
command:
  - --character-set-server=utf8mb4
  - --collation-server=utf8mb4_unicode_ci
```

如果使用外部 MySQL，需要手动确认数据库字符集。

### 8.6 3000 端口是否需要开放公网

不建议开放。推荐只开放：

- 80
- 443
- 22
- 宝塔面板端口

应用的 3000 端口让宝塔/Nginx 在本机反向代理访问即可。

## 9. 常用命令汇总

```bash
# 拉取镜像
docker pull 你的DockerHub用户名/online-record:latest

# 启动 MySQL
docker compose up -d mysql

# 初始化数据库
docker compose --profile init run --rm app-init

# 启动应用
docker compose up -d app

# 查看日志
docker compose logs -f app

# 更新应用
docker compose pull app
docker compose up -d app
```

```
DATABASE_URL="mysql://online_record:数据库密码@host.docker.internal:3306/online_record"
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="你的后台强密码"
SESSION_SECRET="至少32位随机字符串"
NEXT_PUBLIC_SITE_NAME="Online Record"
```

```
docker run -d --name online-record --restart unless-stopped --add-host=host.docker.internal:host-gateway --env-file /www/wwwroot/online-record/.env -p 3000:3000 你的DockerHub用户名/online-record:latest
```

## 首次部署还要初始化数据库
先同步数据库结构：
```
docker run --rm --network=host --env-file /www/wwwroot/heartwall.lmyself.top/.env lmyself/online-record:latest npm run db:push
```
再创建默认配置和管理员账号：
```
docker run --rm --network=host --env-file /www/wwwroot/heartwall.lmyself.top/.env lmyself/online-record:latest npm run db:seed
```
然后启动应用：
```
docker run -d --network=host --name online-record --restart unless-stopped --env-file /www/wwwroot/heartwall.lmyself.top/.env lmyself/online-record:latest
```


```
docker run -d -p 7005:7005 --network="host" --name online-record --env-file /www/wwwroot/heartwall.lmyself.top/.env lmyself/online-record:latest
```