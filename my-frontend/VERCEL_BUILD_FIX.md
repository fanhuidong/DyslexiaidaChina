# Vercel 构建错误修复指南

## 问题
TypeScript 编译失败，错误信息不完整。

## 解决方案

### 方案 1: 确保 Prisma Client 生成（已自动配置）

`package.json` 中已添加 `postinstall` 脚本，确保在安装依赖后自动生成 Prisma Client。

### 方案 2: 临时跳过类型检查（不推荐）

如果急需部署，可以临时在 `next.config.ts` 中启用：

```typescript
typescript: {
  ignoreBuildErrors: true, // 临时方案，不推荐
},
```

### 方案 3: 检查具体错误

在 Vercel 构建日志中查找完整的错误信息，通常会在 "Running TypeScript ..." 之后显示。

## 常见问题

### 1. Prisma Client 未生成

**解决**：
- 确保 `package.json` 中有 `postinstall` 脚本
- 在 Vercel 环境变量中确保 `DATABASE_URL` 已配置（即使暂时无法连接）

### 2. 类型定义缺失

**解决**：
- 检查 `prisma/schema.prisma` 是否正确
- 运行 `npx prisma generate` 生成类型

### 3. 导入路径错误

**解决**：
- 检查 `tsconfig.json` 中的 `paths` 配置
- 确保所有 `@/*` 导入路径正确

## 推荐的构建流程

1. **本地测试构建**：
   ```bash
   npm run build
   ```

2. **如果本地构建成功，但 Vercel 失败**：
   - 检查环境变量是否配置
   - 检查 Prisma Client 是否生成
   - 查看 Vercel 构建日志的完整错误信息

3. **如果本地也失败**：
   - 运行 `npx prisma generate`
   - 运行 `npm run type-check` 查看具体错误
   - 修复类型错误后重新构建

## 环境变量检查清单

确保在 Vercel 中配置了：
- [ ] `DATABASE_URL` - 数据库连接字符串
- [ ] `AUTH_SECRET` - NextAuth 密钥
- [ ] `AUTH_URL` - 前端 URL
- [ ] `NEXT_PUBLIC_FRONTEND_URL` - 前端 URL
- [ ] `NEXT_PUBLIC_STRAPI_URL` - 后端 URL

## 获取详细错误信息

如果构建仍然失败，请：
1. 在 Vercel 构建日志中找到完整的错误信息
2. 复制完整的错误堆栈
3. 根据错误信息进行修复
