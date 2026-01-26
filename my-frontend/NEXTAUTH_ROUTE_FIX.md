# NextAuth API 路由 404 错误修复

## 🔍 问题诊断

如果看到以下错误：
```
GET /api/auth/session (2 ms) 404
GET /api/auth/providers (1 ms) 404
GET /api/auth/error (1 ms) 404
```

这通常是因为 `next.config.ts` 中的 rewrites 规则将所有 `/api/*` 请求代理到了 Strapi，导致 NextAuth 的路由无法正常工作。

---

## ✅ 已修复

### 问题原因

在 `next.config.ts` 中，原来的 rewrites 规则是：
```javascript
{
  source: '/api/:path*',
  destination: `${API_URL}/api/:path*`,
}
```

这个规则会匹配**所有** `/api/*` 路径，包括：
- `/api/auth/*` (NextAuth 路由)
- `/api/articles` (Strapi API)
- `/api/global` (Strapi API)

结果就是 NextAuth 的路由也被代理到了 Strapi，导致 404。

### 修复方案

修改 rewrites 规则，排除 `/api/auth/*` 路径：

```javascript
{
  source: '/api/:path((?!auth).*)',
  destination: `${API_URL}/api/:path*`,
}
```

这个正则表达式 `(?!auth)` 表示"不匹配 auth"，所以：
- ✅ `/api/articles` → 代理到 Strapi
- ✅ `/api/global` → 代理到 Strapi
- ❌ `/api/auth/*` → **不代理**，由 NextAuth 处理

---

## 🔧 验证修复

修复后，请：

1. **重启开发服务器**
   ```powershell
   # 停止当前服务器 (Ctrl+C)
   # 清除缓存（可选）
   Remove-Item -Recurse -Force .next
   # 重新启动
   npm run dev
   ```

2. **测试 NextAuth API 路由**
   
   在浏览器中访问：
   ```
   http://localhost:3000/api/auth/providers
   ```
   
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

3. **测试登录功能**
   - 访问登录页面
   - 尝试登录
   - 应该不再出现 404 错误

---

## 📋 路由优先级说明

Next.js 的路由匹配优先级：

1. **文件系统路由**（最高优先级）
   - `src/app/api/auth/[...nextauth]/route.ts` → `/api/auth/*`
   - `src/app/api/register/route.ts` → `/api/register`

2. **Rewrites 规则**（次优先级）
   - 只有文件系统中不存在的路由才会走 rewrites
   - 但是原来的规则太宽泛，导致冲突

3. **404 页面**（最低优先级）

---

## 🎯 修复后的路由行为

| 路径 | 处理方式 | 说明 |
|------|---------|------|
| `/api/auth/session` | NextAuth | 由 NextAuth 处理 |
| `/api/auth/providers` | NextAuth | 由 NextAuth 处理 |
| `/api/auth/signin` | NextAuth | 由 NextAuth 处理 |
| `/api/register` | Next.js API | 自定义注册路由 |
| `/api/send-code` | Next.js API | 自定义验证码路由 |
| `/api/articles` | Strapi | 通过 rewrites 代理 |
| `/api/global` | Strapi | 通过 rewrites 代理 |

---

## ⚠️ 注意事项

1. **必须重启服务器**
   - `next.config.ts` 的更改需要重启才能生效

2. **清除缓存（如果问题持续）**
   ```powershell
   Remove-Item -Recurse -Force .next
   npm run dev
   ```

3. **检查环境变量**
   - 确保 `AUTH_SECRET` 已设置
   - 确保 `AUTH_URL` 已设置（可选）

---

## 📞 如果问题仍然存在

1. **检查路由文件是否存在**
   ```
   src/app/api/auth/[...nextauth]/route.ts
   ```

2. **检查 handlers 是否正确导出**
   ```typescript
   export const { GET, POST } = handlers;
   ```

3. **查看服务器控制台**
   - 检查是否有编译错误
   - 检查是否有运行时错误

4. **检查浏览器控制台**
   - 查看网络请求的详细信息
   - 查看是否有 CORS 错误
