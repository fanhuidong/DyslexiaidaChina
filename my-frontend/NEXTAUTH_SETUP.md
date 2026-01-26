# NextAuth 设置指南

## 已完成的工作

### 1. 安装依赖
- ✅ `next-auth@beta` - NextAuth v5
- ✅ `bcryptjs` - 密码加密库
- ✅ `@auth/prisma-adapter` - Prisma 适配器
- ✅ `@types/bcryptjs` - TypeScript 类型定义

### 2. 数据库模型
- ✅ `User` 表 - 用户信息（包含 email, password, role 等）
- ✅ `Account` 表 - OAuth 账户关联
- ✅ `Session` 表 - NextAuth session（如果使用 database 策略）
- ✅ `VerificationToken` 表 - 验证令牌

### 3. 配置文件
- ✅ `src/auth.config.ts` - NextAuth 配置（包含 CredentialsProvider）
- ✅ `src/auth.ts` - NextAuth 主文件（导出 handlers, auth, signIn, signOut）
- ✅ `src/lib/db.ts` - PrismaClient 实例
- ✅ `src/lib/auth-utils.ts` - 密码加密工具函数
- ✅ `src/types/next-auth.d.ts` - TypeScript 类型扩展

### 4. API 路由
- ✅ `src/app/api/auth/[...nextauth]/route.ts` - NextAuth API 处理器

## 环境变量配置

在 `.env` 或 `.env.local` 文件中添加：

```env
# 数据库连接
DATABASE_URL="mysql://用户名:密码@主机:端口/数据库名"

# NextAuth 配置
AUTH_SECRET="your-secret-key-here"  # 生成命令: openssl rand -base64 32
AUTH_URL="http://localhost:3000"    # 开发环境
# AUTH_URL="https://yourdomain.com"  # 生产环境
```

## 使用说明

### 1. 运行数据库迁移

```bash
cd my-frontend
npx prisma migrate dev --name add-auth-tables
```

### 2. 创建用户（示例）

```typescript
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/auth-utils';

// 创建用户
const hashedPassword = await hashPassword('user123456');
const user = await db.user.create({
  data: {
    email: 'user@example.com',
    password: hashedPassword,
    name: 'Test User',
    role: 'USER',
  },
});
```

### 3. 登录示例

```typescript
import { signIn } from '@/auth';

// 在登录页面或 API 路由中
await signIn('credentials', {
  email: 'user@example.com',
  password: 'user123456',
  redirect: true,
  redirectTo: '/dashboard',
});
```

### 4. 获取当前用户

```typescript
import { auth } from '@/auth';

// 在服务器组件或 API 路由中
const session = await auth();
if (session?.user) {
  console.log('当前用户:', session.user);
  console.log('用户ID:', session.user.id);
  console.log('用户角色:', session.user.role);
}
```

### 5. 登出

```typescript
import { signOut } from '@/auth';

await signOut({ redirect: true, redirectTo: '/' });
```

## 功能特性

### CredentialsProvider 配置
- ✅ 支持邮箱和密码登录
- ✅ 使用 bcrypt 比对密码
- ✅ 自动将用户信息添加到 session
- ✅ 支持角色（role）管理

### 安全特性
- ✅ 密码使用 bcrypt 加密存储
- ✅ JWT token 策略（无状态）
- ✅ 支持 OAuth（通过 Account 表）
- ✅ 类型安全的 TypeScript 支持

## 下一步

1. **创建登录页面** (`/login`)
2. **创建注册页面** (`/register`)
3. **创建受保护的路由** (使用 `auth()` 检查)
4. **添加 OAuth 提供者** (GitHub, Google 等)

## 注意事项

- 确保 `AUTH_SECRET` 环境变量已设置
- 生产环境使用强密码和 HTTPS
- 定期更新依赖包
- 考虑添加速率限制防止暴力破解
