# NextAuth ClientFetchError 修复指南

## 🔍 错误信息

```
ClientFetchError
Read more at https://errors.authjs.dev#autherror
```

这个错误通常表示客户端无法连接到 NextAuth API 端点。

---

## 🛠️ 常见原因和解决方法

### 1. 环境变量未设置

**问题：** `AUTH_SECRET` 环境变量未设置或配置错误。

**解决方法：**

1. 检查 `.env.local` 文件是否存在
2. 确保包含 `AUTH_SECRET`：

```env
AUTH_SECRET=your-secret-key-here
AUTH_URL=http://localhost:3000
```

3. 生成新的 AUTH_SECRET：

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

4. 重启开发服务器：

```powershell
# 停止当前服务器 (Ctrl+C)
# 然后重新启动
npm run dev
```

---

### 2. API 路由配置问题

**问题：** NextAuth API 路由无法访问。

**检查步骤：**

1. 确认 API 路由文件存在：
   - `src/app/api/auth/[...nextauth]/route.ts`

2. 测试 API 端点：
   在浏览器中访问：
   ```
   http://localhost:3000/api/auth/providers
   ```
   
   如果返回 JSON 数据，说明 API 路由正常。

3. 检查路由文件内容：

```typescript
import { handlers } from '@/auth';

export const { GET, POST } = handlers;
```

---

### 3. SessionProvider 配置问题

**问题：** `SessionProvider` 的 `basePath` 配置错误。

**解决方法：**

NextAuth v5 不需要手动设置 `basePath`，它会自动检测。确保 `Providers.tsx` 中：

```typescript
<SessionProvider
  refetchInterval={0}
  refetchOnWindowFocus={false}
  // 不要设置 basePath，NextAuth v5 会自动处理
>
```

---

### 4. 服务器未运行

**问题：** 开发服务器未运行或端口被占用。

**解决方法：**

1. 确认服务器正在运行：
   ```powershell
   npm run dev
   ```

2. 检查端口是否被占用：
   ```powershell
   netstat -ano | findstr :3000
   ```

3. 如果端口被占用，停止占用进程或更改端口。

---

### 5. 网络/CORS 问题

**问题：** 浏览器阻止了 API 请求。

**解决方法：**

1. 检查浏览器控制台的网络请求
2. 查看是否有 CORS 错误
3. 确认 `AUTH_URL` 配置正确

---

## 🔧 完整修复步骤

### 步骤 1: 检查环境变量

```powershell
# 检查 .env.local 文件
cd my-frontend
Get-Content .env.local | Select-String "AUTH"
```

应该看到：
```
AUTH_SECRET=...
AUTH_URL=http://localhost:3000
```

### 步骤 2: 验证 API 路由

访问：`http://localhost:3000/api/auth/providers`

应该返回 JSON 数据，例如：
```json
{
  "credentials": {
    "id": "credentials",
    "name": "Credentials",
    "type": "credentials"
  },
  "verification-code": {
    "id": "verification-code",
    "name": "VerificationCode",
    "type": "credentials"
  }
}
```

### 步骤 3: 清除缓存并重启

```powershell
# 停止服务器
# 清除 Next.js 缓存
Remove-Item -Recurse -Force .next

# 重新启动
npm run dev
```

### 步骤 4: 检查浏览器控制台

1. 打开浏览器开发者工具（F12）
2. 切换到 Console 标签
3. 查看是否有更详细的错误信息
4. 切换到 Network 标签
5. 查看 `/api/auth/session` 请求的状态

---

## ✅ 验证修复

修复后，应该能够：

1. ✅ 正常加载页面，没有控制台错误
2. ✅ 可以访问登录页面
3. ✅ 可以正常登录
4. ✅ Header 中正确显示用户信息（登录后）

---

## 📞 如果问题仍然存在

1. **查看详细错误日志**
   - 浏览器控制台（F12 → Console）
   - 服务器控制台（运行 `npm run dev` 的终端）

2. **检查 NextAuth 版本**
   ```powershell
   npm list next-auth
   ```
   确保使用的是 NextAuth v5 (beta)

3. **查看 NextAuth 文档**
   - https://authjs.dev/
   - https://errors.authjs.dev

4. **检查数据库连接**
   - 确保 MySQL 服务正在运行
   - 确保 `DATABASE_URL` 配置正确

---

## 🎯 快速检查清单

- [ ] `.env.local` 文件存在
- [ ] `AUTH_SECRET` 已设置
- [ ] `AUTH_URL` 已设置
- [ ] API 路由文件存在 (`src/app/api/auth/[...nextauth]/route.ts`)
- [ ] 可以访问 `/api/auth/providers`
- [ ] 开发服务器正在运行
- [ ] 已清除 `.next` 缓存并重启
