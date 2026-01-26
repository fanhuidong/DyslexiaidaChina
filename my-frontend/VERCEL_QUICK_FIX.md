# Vercel 部署快速修复指南

## 🚨 问题：DATABASE_URL 环境变量未找到

### 快速解决步骤（5分钟）

#### 1️⃣ 登录 Vercel 控制台
访问：https://vercel.com/dashboard

#### 2️⃣ 进入环境变量设置
- 选择您的项目
- 点击 **Settings** → **Environment Variables**

#### 3️⃣ 添加必需的环境变量

点击 **Add New** 按钮，逐个添加以下变量：

| 变量名 | 变量值示例 | 说明 |
|--------|-----------|------|
| `DATABASE_URL` | `mysql://root:password@43.135.124.98:3306/ida_cn` | **必需** - 数据库连接字符串 |
| `AUTH_SECRET` | `dyjBpaNqYqcy3O0azE5NaePJoIb1336p0QuzYwTx6Po=` | **必需** - NextAuth 密钥 |
| `AUTH_URL` | `https://your-project.vercel.app` | **必需** - 您的 Vercel 部署地址 |
| `NEXT_PUBLIC_FRONTEND_URL` | `https://your-project.vercel.app` | 可选 - 前端 URL |
| `NEXT_PUBLIC_STRAPI_URL` | `http://43.135.124.98:1337` | 可选 - 后端 API 地址 |

**⚠️ 重要提示：**
- `DATABASE_URL` 格式：`mysql://用户名:密码@主机:端口/数据库名`
- **不要使用引号**包裹值
- 确保选择 **Production** 环境

#### 4️⃣ 重新部署
- 保存环境变量后
- 在 **Deployments** 页面找到最新部署
- 点击 **⋯** → **Redeploy**

---

## 🔍 检查清单

完成配置后，请确认：

- [ ] ✅ `DATABASE_URL` 已配置（无引号）
- [ ] ✅ `AUTH_SECRET` 已配置
- [ ] ✅ `AUTH_URL` 已配置（使用您的 Vercel 域名）
- [ ] ✅ 已触发重新部署
- [ ] ✅ MySQL 服务器允许远程连接
- [ ] ✅ 数据库 `ida_cn` 已创建
- [ ] ✅ 数据库用户有访问权限

---

## 🛠️ 如果仍然失败

### 检查 1: MySQL 远程连接

确保 MySQL 允许远程连接：

```sql
-- 在 MySQL 服务器上执行
GRANT ALL PRIVILEGES ON ida_cn.* TO 'root'@'%' IDENTIFIED BY 'your_password';
FLUSH PRIVILEGES;
```

检查 MySQL 配置：
```bash
# 检查 bind-address（应该允许远程连接）
# 在 my.cnf 或 my.ini 中
bind-address = 0.0.0.0  # 或注释掉这行
```

### 检查 2: 防火墙

确保服务器防火墙允许 3306 端口：
```bash
# 检查端口是否开放
telnet 43.135.124.98 3306
```

### 检查 3: 数据库连接字符串格式

**错误格式：**
```
DATABASE_URL="mysql://user:pass@host:3306/db"  ❌
```

**正确格式：**
```
DATABASE_URL=mysql://user:pass@host:3306/db  ✅
```

### 检查 4: 查看 Vercel 日志

1. 在 Vercel 项目页面
2. 点击 **Deployments**
3. 点击最新的部署
4. 查看 **Functions** 标签中的日志
5. 查找错误信息

---

## 📞 需要更多帮助？

查看详细文档：`VERCEL_ENV_SETUP.md`
