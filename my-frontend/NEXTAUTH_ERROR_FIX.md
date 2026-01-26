# NextAuth 错误修复指南

## 错误：ClientFetchError / AuthError

这个错误通常由以下原因引起：

### 1. 缺少 AUTH_SECRET 环境变量（最常见）

**解决方法：**

在 `my-frontend` 目录下创建或更新 `.env.local` 文件：

```env
# 数据库连接
DATABASE_URL="mysql://用户名:密码@主机:端口/数据库名"

# NextAuth 配置（必需！）
AUTH_SECRET="f09mMDj2fqTYJyngxr3BsK36nDRfLfGEoGURfAfRzJ0="
AUTH_URL="http://localhost:3000"
```

**生成新的 AUTH_SECRET：**
```bash
# Windows PowerShell
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# 或使用 OpenSSL（如果已安装）
openssl rand -base64 32
```

### 2. API 路由配置问题

确保 `src/app/api/auth/[...nextauth]/route.ts` 文件存在且正确：

```typescript
import { handlers } from '@/auth';

export const { GET, POST } = handlers;
```

### 3. 数据库连接问题

确保：
- `DATABASE_URL` 环境变量已设置
- 数据库服务正在运行
- 数据库表已创建（运行 `npx prisma migrate dev`）

### 4. NextAuth 版本兼容性

当前使用的版本：
- `next-auth@5.0.0-beta.30`
- `@auth/prisma-adapter@2.11.1`

如果遇到兼容性问题，可以尝试：
```bash
npm install next-auth@beta @auth/prisma-adapter@latest
```

### 5. 检查步骤

1. **检查环境变量**
   ```bash
   # 在 my-frontend 目录下
   cat .env.local
   # 或 Windows
   type .env.local
   ```

2. **验证 API 路由**
   - 访问：http://localhost:3000/api/auth/providers
   - 应该返回可用的认证提供者列表

3. **检查控制台错误**
   - 打开浏览器开发者工具
   - 查看 Console 和 Network 标签
   - 查找具体的错误信息

4. **重启开发服务器**
   ```bash
   # 停止服务器（Ctrl+C）
   # 重新启动
   npm run dev
   ```

### 6. 常见错误消息

- **"AUTH_SECRET is missing"** → 设置 AUTH_SECRET 环境变量
- **"Invalid credentials"** → 检查数据库连接和用户数据
- **"Adapter error"** → 检查 Prisma 配置和数据库迁移
- **"Network error"** → 检查 API 路由是否正确配置

### 7. 测试 API 端点

```bash
# 测试 NextAuth 配置
curl http://localhost:3000/api/auth/providers

# 应该返回 JSON 格式的提供者列表
```

## 快速修复清单

- [ ] 创建 `.env.local` 文件
- [ ] 添加 `AUTH_SECRET`（使用上面的值或生成新的）
- [ ] 添加 `AUTH_URL="http://localhost:3000"`
- [ ] 添加 `DATABASE_URL`
- [ ] 重启开发服务器
- [ ] 检查浏览器控制台是否有其他错误
- [ ] 验证 API 路由：http://localhost:3000/api/auth/providers
