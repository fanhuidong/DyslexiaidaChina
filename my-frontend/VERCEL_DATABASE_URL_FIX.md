# Vercel 部署 DATABASE_URL 错误修复指南

## 🚨 错误信息

```
Invalid `prisma.user.findUnique()` invocation: 
error: Environment variable not found: DATABASE_URL
```

## 问题原因

在 Vercel 构建时，`prisma generate` 命令需要 `DATABASE_URL` 环境变量来验证 schema。即使 Prisma 生成客户端时不需要真实的数据库连接，schema 文件中的 `env("DATABASE_URL")` 也会在验证时检查环境变量是否存在。

## ✅ 解决方案

### 步骤 1: 在 Vercel 控制台配置环境变量

1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 选择您的项目
3. 进入 **Settings** → **Environment Variables**
4. 添加以下环境变量：

#### 必需的环境变量

| 变量名 | 变量值示例 | 说明 |
|--------|-----------|------|
| `DATABASE_URL` | `mysql://root:password@43.135.124.98:3306/ida_cn` | **必需** - 数据库连接字符串 |

**重要提示：**
- 格式：`mysql://用户名:密码@主机:端口/数据库名`
- **不要使用引号**包裹值
- 确保选择 **Production**、**Preview** 和 **Development** 环境

#### 其他必需的环境变量

| 变量名 | 变量值示例 | 说明 |
|--------|-----------|------|
| `AUTH_SECRET` | 随机生成的密钥 | **必需** - NextAuth 密钥 |
| `AUTH_URL` | `https://your-project.vercel.app` | **必需** - 前端 URL |

### 步骤 2: 验证环境变量配置

在 Vercel 环境变量页面，确认：

- [ ] ✅ `DATABASE_URL` 已配置（无引号）
- [ ] ✅ `AUTH_SECRET` 已配置
- [ ] ✅ `AUTH_URL` 已配置
- [ ] ✅ 所有变量都选择了正确的环境（Production/Preview/Development）

### 步骤 3: 重新部署

1. 保存所有环境变量
2. 在 **Deployments** 页面找到最新部署
3. 点击 **⋯** → **Redeploy**
4. 或者推送新的提交触发部署

### 步骤 4: 检查构建日志

在 Vercel 部署页面查看构建日志，确认：

1. ✅ `prisma generate` 成功执行
2. ✅ `next build` 成功完成
3. ✅ 没有 DATABASE_URL 相关的错误

## 🔧 代码改进

已更新 `package.json` 中的构建脚本，确保在 `DATABASE_URL` 不存在时也能生成 Prisma Client（使用占位符）。

## 🛠️ 常见问题

### 问题 1: 构建时仍然报错

**原因：** 环境变量未正确配置或未选择正确的环境

**解决方案：**
1. 确认 `DATABASE_URL` 在 Vercel 控制台中已配置
2. 确认选择了 **Production** 环境（构建时使用）
3. 重新部署项目

### 问题 2: 运行时仍然报错

**原因：** 环境变量未在运行时环境中配置

**解决方案：**
1. 确认 `DATABASE_URL` 已配置
2. 确认选择了 **Production** 环境（运行时使用）
3. 检查 Vercel 函数日志中的详细错误信息

### 问题 3: MySQL 连接被拒绝

**原因：** MySQL 服务器不允许远程连接

**解决方案：**

1. **检查 MySQL 配置**（在 MySQL 服务器上）：
   ```sql
   -- 允许远程连接
   GRANT ALL PRIVILEGES ON ida_cn.* TO 'root'@'%' IDENTIFIED BY 'your_password';
   FLUSH PRIVILEGES;
   ```

2. **检查 MySQL 配置文件**：
   ```ini
   # 在 my.cnf 或 my.ini 中
   bind-address = 0.0.0.0  # 允许所有 IP 连接
   # 或注释掉 bind-address 行
   ```

3. **检查防火墙**：
   ```bash
   # 确保 3306 端口开放
   # 在服务器上执行
   sudo ufw allow 3306
   # 或
   sudo firewall-cmd --permanent --add-port=3306/tcp
   ```

### 问题 4: DATABASE_URL 格式错误

**错误格式：**
```
DATABASE_URL="mysql://user:pass@host:3306/db"  ❌ 包含引号
```

**正确格式：**
```
DATABASE_URL=mysql://user:pass@host:3306/db  ✅ 无引号
```

## 📋 完整的环境变量清单

在 Vercel 控制台中配置以下所有变量：

```env
# 数据库连接（必需）
DATABASE_URL=mysql://root:password@43.135.124.98:3306/ida_cn

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

## 🔍 验证步骤

### 1. 检查环境变量

在 Vercel 控制台 → Settings → Environment Variables，确认所有变量都已配置。

### 2. 检查构建日志

在部署页面查看构建日志，确认：
- ✅ `prisma generate` 成功
- ✅ `next build` 成功
- ✅ 没有环境变量相关的错误

### 3. 测试 API

部署后，测试发送验证码 API：

```bash
curl -X POST https://your-project.vercel.app/api/auth/send-code \
  -H "Content-Type: application/json" \
  -d '{"phone":"13800138000","type":"REGISTER"}'
```

如果成功，说明配置正确。

## 📞 需要更多帮助？

如果问题仍然存在：

1. 查看 Vercel 部署日志中的详细错误信息
2. 检查 Vercel 函数日志（Runtime Logs）
3. 确认 MySQL 服务器允许远程连接
4. 验证数据库用户权限

查看详细文档：
- `VERCEL_ENV_SETUP.md` - 完整的环境变量配置指南
- `VERCEL_QUICK_FIX.md` - 快速修复清单
