# Vercel 环境变量配置指南

## 问题描述

在 Vercel 上部署后，注册时发送验证码出现错误：
```
Invalid `prisma.user.findUnique()` invocation: 
error: Environment variable not found: DATABASE_URL
```

## 原因

Vercel 部署环境无法访问本地的 `.env.local` 文件，需要在 Vercel 控制台中手动配置环境变量。

## 解决方案

### 步骤 1: 登录 Vercel 控制台

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 选择您的项目

### 步骤 2: 进入环境变量设置

1. 点击项目名称进入项目详情
2. 点击顶部菜单 **Settings**（设置）
3. 在左侧菜单中找到 **Environment Variables**（环境变量）
4. 点击进入环境变量配置页面

### 步骤 3: 配置必需的环境变量

在 Vercel 环境变量页面，添加以下环境变量：

#### 1. DATABASE_URL（必需）

**变量名：** `DATABASE_URL`

**变量值：** `mysql://用户名:密码@数据库主机:端口/数据库名`

**示例：**
```
mysql://ida_user:your_password@43.135.124.98:3306/ida_cn
```

**重要提示：**
- 如果数据库在远程服务器上，使用服务器的公网 IP 或域名
- 确保 MySQL 允许远程连接（需要配置 MySQL 的 `bind-address` 和用户权限）
- 如果使用云数据库（如阿里云 RDS），使用云数据库提供的连接地址

**配置 MySQL 允许远程连接：**
```sql
-- 在 MySQL 服务器上执行
GRANT ALL PRIVILEGES ON ida_cn.* TO 'ida_user'@'%' IDENTIFIED BY 'your_password';
FLUSH PRIVILEGES;
```

#### 2. AUTH_SECRET（必需）

**变量名：** `AUTH_SECRET`

**变量值：** 生成一个随机密钥

**生成方法（在本地执行）：**
```bash
# Windows PowerShell
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# 或使用 OpenSSL
openssl rand -base64 32
```

**示例值：**
```
dyjBpaNqYqcy3O0azE5NaePJoIb1336p0QuzYwTx6Po=
```

#### 3. AUTH_URL（必需）

**变量名：** `AUTH_URL`

**变量值：** 您的 Vercel 部署地址

**示例：**
```
https://your-project.vercel.app
```

#### 4. NEXT_PUBLIC_FRONTEND_URL（可选）

**变量名：** `NEXT_PUBLIC_FRONTEND_URL`

**变量值：** 前端 URL（与 AUTH_URL 相同）

**示例：**
```
https://your-project.vercel.app
```

#### 5. NEXT_PUBLIC_STRAPI_URL（可选）

**变量名：** `NEXT_PUBLIC_STRAPI_URL`

**变量值：** 后端 Strapi API 地址

**示例：**
```
http://43.135.124.98:1337
```

或如果后端有 HTTPS：
```
https://your-backend-domain.com
```

#### 6. NODE_ENV（可选，通常自动设置）

**变量名：** `NODE_ENV`

**变量值：** `production`

> 注意：Vercel 通常会自动设置此变量，无需手动配置

### 步骤 4: 设置环境变量作用域

对于每个环境变量，选择适用的环境：

- ✅ **Production**（生产环境）
- ✅ **Preview**（预览环境，可选）
- ✅ **Development**（开发环境，通常不需要）

### 步骤 5: 保存并重新部署

1. 点击 **Save**（保存）按钮
2. 返回项目页面
3. 点击 **Deployments**（部署）标签
4. 找到最新的部署，点击右侧的 **⋯** 菜单
5. 选择 **Redeploy**（重新部署）

或者触发新的部署：
```bash
git commit --allow-empty -m "Trigger redeploy"
git push
```

## 完整的环境变量列表

在 Vercel 控制台中配置以下所有变量：

```env
# 数据库连接（必需）
DATABASE_URL=mysql://ida_user:your_password@43.135.124.98:3306/ida_cn

# NextAuth 配置（必需）
AUTH_SECRET=your-generated-secret-key-here
AUTH_URL=https://your-project.vercel.app

# 前端 URL（可选）
NEXT_PUBLIC_FRONTEND_URL=https://your-project.vercel.app

# 后端 Strapi URL（可选）
NEXT_PUBLIC_STRAPI_URL=http://43.135.124.98:1337

# Node 环境（通常自动设置）
NODE_ENV=production
```

## 验证配置

### 方法 1: 检查 Vercel 构建日志

1. 在 Vercel 项目页面，点击 **Deployments**
2. 点击最新的部署记录
3. 查看构建日志，确认没有环境变量相关的错误

### 方法 2: 检查运行时环境变量

在代码中添加临时调试（仅用于验证）：

```typescript
// 在 API 路由中临时添加
console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
console.log('AUTH_SECRET exists:', !!process.env.AUTH_SECRET);
```

**⚠️ 注意：验证后请删除调试代码，不要在生产环境中暴露敏感信息！**

### 方法 3: 测试 API 端点

部署后，测试发送验证码 API：

```bash
curl -X POST https://your-project.vercel.app/api/auth/send-code \
  -H "Content-Type: application/json" \
  -d '{"phone":"13800138000","type":"REGISTER"}'
```

## 常见问题

### 问题 1: 数据库连接被拒绝

**原因：** MySQL 服务器不允许远程连接

**解决方案：**
1. 检查 MySQL 的 `bind-address` 配置
2. 确保防火墙允许 3306 端口
3. 检查用户权限（见步骤 3）

### 问题 2: 环境变量未生效

**原因：** 需要重新部署才能应用新的环境变量

**解决方案：**
1. 保存环境变量后，触发新的部署
2. 等待部署完成后再测试

### 问题 3: DATABASE_URL 格式错误

**错误示例：**
```
DATABASE_URL="mysql://user:pass@host:3306/db"  # 包含引号
```

**正确格式：**
```
DATABASE_URL=mysql://user:pass@host:3306/db  # 无引号
```

### 问题 4: 数据库表不存在

**原因：** 数据库迁移未执行

**解决方案：**
在本地或服务器上运行数据库迁移：
```bash
npx prisma migrate deploy
```

## 安全建议

1. **不要提交 `.env.local` 到 Git**
   - 确保 `.gitignore` 包含 `.env*`

2. **使用强密码**
   - 数据库密码应该足够复杂
   - AUTH_SECRET 应该使用随机生成的密钥

3. **限制数据库访问**
   - 只允许必要的 IP 地址访问数据库
   - 使用最小权限原则配置数据库用户

4. **定期轮换密钥**
   - 定期更新 AUTH_SECRET
   - 定期更新数据库密码

## 需要帮助？

如果问题仍然存在：

1. 检查 Vercel 部署日志中的详细错误信息
2. 确认所有环境变量都已正确配置
3. 验证数据库连接是否正常
4. 检查 MySQL 服务器日志
