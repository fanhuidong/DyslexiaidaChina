# Schema 迁移指南

## 概述

已根据新的 schema.prisma 更新了所有相关代码，主要变化：

1. **用户认证方式**：从邮箱改为手机号
2. **用户模型**：使用 `phone` 作为唯一标识，`nickname` 替代 `name`
3. **验证码模型**：添加 `type` 字段（REGISTER, LOGIN, RESET_PWD），ID 改为 String
4. **角色系统**：使用 `Role` enum（USER, ADMIN）
5. **移除 OAuth**：不再需要 Account 和 Session 表（使用 JWT 策略）

## 数据库迁移步骤

### 1. 备份现有数据（如果已有数据）

```bash
# 导出现有数据（如果使用 MySQL）
mysqldump -u 用户名 -p 数据库名 > backup.sql
```

### 2. 重置数据库（开发环境）

```bash
cd my-frontend
npx prisma migrate reset
```

### 3. 创建新的迁移

```bash
npx prisma migrate dev --name migrate_to_phone_auth
```

### 4. 生成 Prisma Client

```bash
npx prisma generate
```

## 主要代码变更

### 认证相关

- **登录**：使用手机号 + 密码
- **注册**：使用手机号 + 验证码 + 密码
- **验证码**：支持多种类型（注册、登录、重置密码）

### API 路由

- `/api/auth/send-code`：发送验证码（支持 type 参数）
- `/api/auth/register`：用户注册（需要验证码）
- `/api/auth/[...nextauth]`：NextAuth 登录处理

### 前端组件

- `LoginForm`：手机号登录表单
- `RegisterForm`：手机号注册表单（包含验证码输入）

## 环境变量

确保 `.env.local` 包含：

```env
DATABASE_URL=mysql://用户名:密码@主机:端口/数据库名
AUTH_SECRET=你的密钥
AUTH_URL=http://localhost:3000
```

## 注意事项

1. **验证码**：开发模式下验证码会输出到控制台，生产环境需要集成短信服务
2. **默认昵称**：注册时自动生成昵称（用户+手机号后4位）
3. **JWT 策略**：使用无状态 JWT，不需要数据库 session 表
4. **角色系统**：默认角色为 USER，可通过数据库手动设置为 ADMIN

## 测试步骤

1. 启动开发服务器
2. 访问 `/register` 页面
3. 输入手机号，点击"发送验证码"
4. 查看控制台获取验证码
5. 输入验证码和密码完成注册
6. 使用手机号和密码登录
