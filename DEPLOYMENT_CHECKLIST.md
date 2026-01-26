# 部署检查清单

## 🖥️ 后端部署（腾讯云 Ubuntu）

### 服务器准备
- [ ] SSH 连接到服务器
- [ ] 运行 `server-setup.sh` 或手动安装：
  - [ ] Node.js 20.x
  - [ ] MySQL
  - [ ] PM2
  - [ ] Nginx

### 数据库配置
- [ ] 创建数据库 `ida_cn`
- [ ] 创建用户 `ida_user`
- [ ] 授予权限
- [ ] 测试连接

### 项目部署
- [ ] 克隆代码到 `/var/www/IDA_CN`
- [ ] 进入 `my-backend` 目录
- [ ] 运行 `npm install`
- [ ] 创建 `.env` 文件并配置：
  - [ ] APP_KEYS
  - [ ] API_TOKEN_SALT
  - [ ] ADMIN_JWT_SECRET
  - [ ] TRANSFER_TOKEN_SALT
  - [ ] JWT_SECRET
  - [ ] 数据库连接信息
  - [ ] FRONTEND_URL
- [ ] 运行 `npm run build`
- [ ] 使用 PM2 启动：`pm2 start npm --name "strapi-backend" -- start`
- [ ] 运行 `pm2 save`

### Nginx 配置
- [ ] 创建配置文件 `/etc/nginx/sites-available/strapi`
- [ ] 启用配置
- [ ] 测试配置：`sudo nginx -t`
- [ ] 重启 Nginx

### SSL 配置
- [ ] 安装 Certbot
- [ ] 获取 SSL 证书
- [ ] 配置自动续期

### 防火墙
- [ ] 开放端口 80, 443, 22
- [ ] 启用防火墙

### 验证
- [ ] 访问 `http://your-backend-ip/api/articles`
- [ ] 检查 PM2 状态：`pm2 status`
- [ ] 查看日志：`pm2 logs strapi-backend`

---

## 🌐 前端部署（Vercel）

### 代码准备
- [ ] 代码已推送到 GitHub/GitLab
- [ ] 运行 `vercel-deploy.sh` 检查（可选）

### Vercel 配置
- [ ] 登录 Vercel
- [ ] 创建新项目
- [ ] 连接代码仓库
- [ ] 设置根目录为 `my-frontend`
- [ ] 配置构建设置

### 环境变量
在 Vercel 控制台添加：
- [ ] `DATABASE_URL` - MySQL 连接字符串
- [ ] `AUTH_SECRET` - NextAuth 密钥
- [ ] `AUTH_URL` - 前端 URL
- [ ] `NEXT_PUBLIC_FRONTEND_URL` - 前端 URL
- [ ] `NEXT_PUBLIC_STRAPI_URL` - 后端 URL
- [ ] `NODE_ENV=production`

### 部署
- [ ] 点击部署
- [ ] 等待构建完成
- [ ] 获取部署 URL

### 域名（可选）
- [ ] 添加自定义域名
- [ ] 配置 DNS 记录

### 验证
- [ ] 访问前端 URL
- [ ] 测试留言板功能
- [ ] 检查 API 连接

---

## 🔗 连接配置

### 后端 CORS
确保后端 `.env` 中：
```
FRONTEND_URL=https://your-frontend-domain.vercel.app
```

### 前端 API
确保 Vercel 环境变量中：
```
NEXT_PUBLIC_STRAPI_URL=https://your-backend-domain.com
```

### 数据库连接
确保 Vercel 环境变量中：
```
DATABASE_URL=mysql://ida_user:password@your-backend-ip:3306/ida_cn
```

---

## ✅ 最终验证

### 功能测试
- [ ] 可以访问前端页面
- [ ] 可以登录/注册
- [ ] 可以创建留言
- [ ] 可以回复留言
- [ ] 可以删除留言
- [ ] 频率限制生效
- [ ] 通知功能正常

### 性能检查
- [ ] 页面加载速度正常
- [ ] API 响应时间正常
- [ ] 数据库查询正常

### 安全检查
- [ ] HTTPS 已启用
- [ ] 环境变量已配置
- [ ] 数据库密码强度足够
- [ ] 防火墙已配置

---

## 📝 重要信息记录

### 后端信息
- 服务器 IP: `_________________`
- 后端域名: `_________________`
- 数据库用户: `ida_user`
- 数据库密码: `_________________`

### 前端信息
- Vercel 项目名: `_________________`
- 前端 URL: `_________________`
- 自定义域名: `_________________`

### 密钥信息
- AUTH_SECRET: `_________________`
- APP_KEYS: `_________________`
- JWT_SECRET: `_________________`

---

完成所有项目后，您的应用应该可以正常运行了！🎉
