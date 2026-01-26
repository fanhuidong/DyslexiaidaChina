# 完整部署指南

本指南将帮助您将项目部署到：
- **前端**: Vercel
- **后端**: 腾讯云 Ubuntu 服务器

---

## 📋 目录

1. [前置准备](#前置准备)
2. [后端部署（腾讯云 Ubuntu）](#后端部署腾讯云-ubuntu)
3. [前端部署（Vercel）](#前端部署vercel)
4. [环境变量配置](#环境变量配置)
5. [数据库配置](#数据库配置)
6. [域名和 SSL 配置](#域名和-ssl-配置)
7. [验证和测试](#验证和测试)
8. [故障排查](#故障排查)

---

## 前置准备

### 需要准备的内容

- ✅ 腾讯云 Ubuntu 服务器（已购买并获取 IP）
- ✅ 服务器 root 或 sudo 权限
- ✅ 域名（可选，但推荐）
- ✅ Vercel 账号
- ✅ GitHub/GitLab 账号（用于代码仓库）

### 服务器要求

- **操作系统**: Ubuntu 20.04+ 或 22.04
- **内存**: 至少 2GB（推荐 4GB+）
- **存储**: 至少 20GB
- **网络**: 公网 IP

---

## 后端部署（腾讯云 Ubuntu）

### 步骤 1: 连接到服务器

```bash
# 使用 SSH 连接到服务器
ssh root@your-server-ip
# 或使用密钥
ssh -i your-key.pem root@your-server-ip
```

### 步骤 2: 更新系统

```bash
# 更新软件包列表
sudo apt update
sudo apt upgrade -y

# 安装必要的工具
sudo apt install -y curl wget git build-essential
```

### 步骤 3: 安装 Node.js

```bash
# 使用 NodeSource 安装 Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 验证安装
node --version
npm --version
```

### 步骤 4: 安装 MySQL

```bash
# 安装 MySQL
sudo apt install -y mysql-server

# 启动 MySQL 服务
sudo systemctl start mysql
sudo systemctl enable mysql

# 安全配置（设置 root 密码）
sudo mysql_secure_installation
```

### 步骤 5: 配置 MySQL 数据库

```bash
# 登录 MySQL
sudo mysql -u root -p

# 在 MySQL 中执行以下命令
```

```sql
-- 创建数据库
CREATE DATABASE ida_cn CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 创建用户（替换 'your_password' 为强密码）
CREATE USER 'ida_user'@'localhost' IDENTIFIED BY 'your_password';

-- 授予权限
GRANT ALL PRIVILEGES ON ida_cn.* TO 'ida_user'@'localhost';
FLUSH PRIVILEGES;

-- 退出
EXIT;
```

### 步骤 6: 安装 PM2（进程管理器）

```bash
# 全局安装 PM2
sudo npm install -g pm2

# 设置 PM2 开机自启
pm2 startup
# 按照提示执行生成的命令
```

### 步骤 7: 克隆项目代码

```bash
# 创建项目目录
sudo mkdir -p /var/www
cd /var/www

# 克隆项目（替换为您的仓库地址）
sudo git clone https://github.com/your-username/IDA_CN.git
# 或使用 SSH
# sudo git clone git@github.com:your-username/IDA_CN.git

# 设置权限
sudo chown -R $USER:$USER /var/www/IDA_CN
```

### 步骤 8: 配置后端（Strapi）

```bash
cd /var/www/IDA_CN/my-backend

# 安装依赖
npm install

# 创建环境变量文件
nano .env
```

在 `.env` 文件中添加：

```env
# 应用配置
HOST=0.0.0.0
PORT=1337
NODE_ENV=production
APP_KEYS=your-app-keys-here
API_TOKEN_SALT=your-api-token-salt
ADMIN_JWT_SECRET=your-admin-jwt-secret
TRANSFER_TOKEN_SALT=your-transfer-token-salt
JWT_SECRET=your-jwt-secret

# 数据库配置
DATABASE_CLIENT=mysql
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_NAME=ida_cn
DATABASE_USERNAME=ida_user
DATABASE_PASSWORD=your_password
DATABASE_SSL=false

# 前端 URL（用于 CORS）
FRONTEND_URL=https://dyslexiaidachinav1.vercel.app/
```

**生成密钥**（在本地执行，然后复制到服务器）：

```bash
# 在本地生成随机密钥
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
# 运行 5 次，分别用于 APP_KEYS, API_TOKEN_SALT, ADMIN_JWT_SECRET, TRANSFER_TOKEN_SALT, JWT_SECRET
```

### 步骤 9: 构建和启动 Strapi

```bash
cd /var/www/IDA_CN/my-backend

# 构建项目
npm run build

# 使用 PM2 启动
pm2 start npm --name "strapi-backend" -- start

# 保存 PM2 配置
pm2 save

# 查看状态
pm2 status
pm2 logs strapi-backend
```

### 步骤 10: 配置 Nginx 反向代理

```bash
# 安装 Nginx
sudo apt install -y nginx

# 创建 Nginx 配置
sudo nano /etc/nginx/sites-available/strapi
```

添加以下配置：

```nginx
server {
    listen 80;
    server_name your-backend-domain.com;  # 替换为您的域名或 IP

    client_max_body_size 100M;

    location / {
        proxy_pass http://localhost:1337;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# 启用配置
sudo ln -s /etc/nginx/sites-available/strapi /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

### 步骤 11: 配置防火墙

```bash
# 允许 HTTP 和 HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# 允许 SSH（重要！）
sudo ufw allow 22/tcp

# 启用防火墙
sudo ufw enable

# 查看状态
sudo ufw status
```

### 步骤 12: 配置 SSL（使用 Let's Encrypt）

```bash
# 安装 Certbot
sudo apt install -y certbot python3-certbot-nginx

# 获取 SSL 证书（替换为您的域名）
sudo certbot --nginx -d your-backend-domain.com

# 自动续期测试
sudo certbot renew --dry-run
```

---

## 前端部署（Vercel）

### 步骤 1: 准备代码仓库

确保代码已推送到 GitHub/GitLab：

```bash
cd my-frontend
git add .
git commit -m "准备部署"
git push origin main
```

### 步骤 2: 连接 Vercel

1. 访问 [Vercel](https://vercel.com)
2. 使用 GitHub/GitLab 账号登录
3. 点击 "Add New Project"
4. 选择您的代码仓库
5. 选择 `my-frontend` 目录作为根目录

### 步骤 3: 配置构建设置

在 Vercel 项目设置中：

- **Framework Preset**: Next.js
- **Root Directory**: `my-frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `.next`（默认）

### 步骤 4: 配置环境变量

在 Vercel 项目设置 → Environment Variables 中添加：

```env
# 数据库连接
DATABASE_URL=mysql://ida_user:your_password@your-backend-ip:3306/ida_cn

# NextAuth 配置
AUTH_SECRET=your-production-secret-key
AUTH_URL=https://your-frontend-domain.vercel.app

# 前端 URL
NEXT_PUBLIC_FRONTEND_URL=https://your-frontend-domain.vercel.app

# 后端 Strapi URL
NEXT_PUBLIC_STRAPI_URL=https://your-backend-domain.com

# Node 环境
NODE_ENV=production
```

**生成 AUTH_SECRET**（在本地执行）：

```bash
openssl rand -base64 32
```

### 步骤 5: 部署

1. 点击 "Deploy"
2. 等待构建完成
3. 获取部署 URL（例如：`https://your-project.vercel.app`）

### 步骤 6: 配置自定义域名（可选）

1. 在 Vercel 项目设置 → Domains
2. 添加您的域名
3. 按照提示配置 DNS 记录

---

## 环境变量配置

### 后端环境变量（服务器）

位置：`/var/www/IDA_CN/my-backend/.env`

```env
# 应用配置
HOST=0.0.0.0
PORT=1337
NODE_ENV=production
APP_KEYS=your-app-keys-here
API_TOKEN_SALT=your-api-token-salt
ADMIN_JWT_SECRET=your-admin-jwt-secret
TRANSFER_TOKEN_SALT=your-transfer-token-salt
JWT_SECRET=your-jwt-secret

# 数据库配置
DATABASE_CLIENT=mysql
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_NAME=ida_cn
DATABASE_USERNAME=ida_user
DATABASE_PASSWORD=your_password
DATABASE_SSL=false

# 前端 URL（用于 CORS）
FRONTEND_URL=https://your-frontend-domain.vercel.app
```

### 前端环境变量（Vercel）

在 Vercel 控制台配置：

```env
DATABASE_URL=mysql://ida_user:password@your-backend-ip:3306/ida_cn
AUTH_SECRET=your-secret-key
AUTH_URL=https://your-frontend-domain.vercel.app
NEXT_PUBLIC_FRONTEND_URL=https://your-frontend-domain.vercel.app
NEXT_PUBLIC_STRAPI_URL=https://your-backend-domain.com
NODE_ENV=production
```

---

## 数据库配置

### 运行 Prisma 迁移

在服务器上执行（如果需要）：

```bash
cd /var/www/IDA_CN/my-frontend
npm install
npx prisma generate
npx prisma migrate deploy
```

**注意**: 留言板功能使用 Next.js API 路由，数据库连接在前端项目中配置。

### 数据库连接测试

```bash
# 在服务器上测试 MySQL 连接
mysql -u ida_user -p ida_cn
```

---

## 域名和 SSL 配置

### 后端域名配置

1. 在域名 DNS 设置中添加 A 记录：
   ```
   Type: A
   Name: @ 或 api
   Value: 您的服务器 IP
   TTL: 600
   ```

2. 配置 Nginx（已在步骤 10 完成）

3. 配置 SSL（已在步骤 12 完成）

### 前端域名配置

在 Vercel 中配置自定义域名（已在步骤 6 完成）

---

## 验证和测试

### 后端验证

```bash
# 检查 PM2 状态
pm2 status
pm2 logs strapi-backend

# 检查 Nginx 状态
sudo systemctl status nginx

# 测试后端 API
curl http://localhost:1337/api/articles
curl https://your-backend-domain.com/api/articles
```

### 前端验证

1. 访问前端 URL
2. 测试留言板功能：
   - ✅ 创建留言
   - ✅ 回复留言
   - ✅ 删除留言
   - ✅ 频率限制
   - ✅ 通知功能

### 数据库验证

```bash
# 连接数据库
mysql -u ida_user -p ida_cn

# 查看表
SHOW TABLES;

# 查看留言板相关表
SELECT * FROM MessageBoardPost LIMIT 5;
SELECT * FROM MessageBoardReply LIMIT 5;
```

---

## 故障排查

### 后端问题

**问题 1: PM2 进程崩溃**

```bash
# 查看日志
pm2 logs strapi-backend --lines 100

# 重启服务
pm2 restart strapi-backend

# 查看错误详情
pm2 describe strapi-backend
```

**问题 2: 数据库连接失败**

```bash
# 检查 MySQL 服务
sudo systemctl status mysql

# 测试连接
mysql -u ida_user -p ida_cn

# 检查防火墙
sudo ufw status
```

**问题 3: Nginx 502 错误**

```bash
# 检查 Nginx 配置
sudo nginx -t

# 查看 Nginx 日志
sudo tail -f /var/log/nginx/error.log

# 检查后端是否运行
pm2 status
curl http://localhost:1337
```

### 前端问题

**问题 1: 构建失败**

- 检查 Vercel 构建日志
- 确认所有环境变量已配置
- 检查 Node.js 版本兼容性

**问题 2: API 请求失败**

- 检查 `NEXT_PUBLIC_STRAPI_URL` 配置
- 检查后端 CORS 设置
- 查看浏览器控制台错误

**问题 3: 数据库连接失败**

- 检查 `DATABASE_URL` 格式
- 确认数据库允许远程连接（如果需要）
- 检查防火墙规则

### 常用命令

```bash
# 查看 PM2 日志
pm2 logs

# 重启服务
pm2 restart all

# 查看系统资源
htop
# 或
top

# 查看磁盘空间
df -h

# 查看内存使用
free -h

# 查看网络连接
netstat -tulpn
```

---

## 维护和更新

### 更新后端

```bash
cd /var/www/IDA_CN/my-backend
git pull origin main
npm install
npm run build
pm2 restart strapi-backend
```

### 更新前端

在 Vercel 中：
1. 推送代码到仓库
2. Vercel 自动触发部署
3. 或手动触发重新部署

### 数据库备份

```bash
# 创建备份脚本
sudo nano /root/backup-db.sh
```

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -u ida_user -p'your_password' ida_cn > /root/backups/ida_cn_$DATE.sql
find /root/backups -name "*.sql" -mtime +7 -delete
```

```bash
# 设置定时任务（每天凌晨 2 点备份）
sudo crontab -e
# 添加：
0 2 * * * /root/backup-db.sh
```

---

## 安全建议

1. **定期更新系统**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. **使用强密码**
   - 数据库密码
   - 服务器 root 密码
   - 各种密钥

3. **配置 SSH 密钥认证**
   - 禁用密码登录
   - 使用密钥对

4. **定期备份**
   - 数据库备份
   - 代码备份
   - 配置文件备份

5. **监控日志**
   - 定期查看应用日志
   - 监控系统资源
   - 设置告警

---

## 完成检查清单

- [ ] 后端服务器配置完成
- [ ] MySQL 数据库创建并配置
- [ ] Strapi 后端运行正常
- [ ] Nginx 反向代理配置
- [ ] SSL 证书配置
- [ ] 前端部署到 Vercel
- [ ] 环境变量配置正确
- [ ] 数据库迁移完成
- [ ] 功能测试通过
- [ ] 域名配置（如使用）
- [ ] 备份策略设置

---

## 获取帮助

如果遇到问题：
1. 查看日志文件
2. 检查环境变量配置
3. 验证网络连接
4. 查看本文档的故障排查部分

祝部署顺利！🎉
