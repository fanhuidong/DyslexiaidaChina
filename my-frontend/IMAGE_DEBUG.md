# 图片加载问题排查指南

## 🔍 问题诊断

如果图片无法显示，请按以下步骤排查：

### 1. 检查浏览器控制台

打开浏览器开发者工具（F12），查看：
- **Console 标签**：查看是否有图片 URL 的日志输出
- **Network 标签**：查看图片请求是否失败（红色标记）

### 2. 检查图片 URL 格式

在控制台中，你应该看到类似这样的日志：
```
🖼️ [getStrapiMedia] 原始URL: /uploads/image.jpg -> 最终URL: http://localhost:8888/uploads/image.jpg
```

**常见问题**：
- ❌ 如果原始 URL 是 `null` 或 `undefined`：说明 Strapi 后台没有上传图片
- ❌ 如果最终 URL 不正确：检查环境变量配置

### 3. 检查 Strapi 后台配置

1. **确认图片已上传**：
   - 进入 Strapi 后台
   - 检查对应内容类型的图片字段
   - 确认图片已成功上传

2. **检查 API 响应**：
   - 打开浏览器 Network 标签
   - 找到 API 请求（如 `/api/articles?populate=*`）
   - 查看响应中的图片 URL 格式

### 4. 检查 Next.js 配置

确认 `next.config.ts` 中的配置：

```typescript
images: {
  remotePatterns: [
    {
      protocol: 'http',
      hostname: 'localhost',  // 开发环境
      port: '8888',
      pathname: '/uploads/**',
    },
  ],
}
```

### 5. 检查环境变量

确认 `.env.local` 或环境变量：
```env
NEXT_PUBLIC_STRAPI_URL=http://localhost:8888
```

## 🛠️ 常见问题修复

### 问题 1：图片显示为空白

**原因**：图片 URL 格式不正确

**解决**：
1. 检查 `getStrapiMedia` 函数的日志输出
2. 确认 URL 是否正确拼接

### 问题 2：403 Forbidden 错误

**原因**：Next.js Image 组件不允许该域名

**解决**：
1. 在 `next.config.ts` 的 `remotePatterns` 中添加对应的域名
2. 重启开发服务器

### 问题 3：图片路径包含完整 URL 但域名不对

**原因**：Strapi 返回的图片 URL 包含错误的域名

**解决**：
1. 检查 Strapi 的 `config/server.ts` 中的 `url` 配置
2. 或者在 `getStrapiMedia` 中替换域名

### 问题 4：开发环境可以，生产环境不行

**原因**：生产环境的 URL 配置不正确

**解决**：
1. 检查生产环境的 `REMOTE_API_URL` 配置
2. 确认 Next.js 的 rewrites 配置正确
3. 检查生产服务器的防火墙设置

## 📝 调试代码

在组件中添加调试代码：

```typescript
const imageUrl = getStrapiMedia(article.Cover?.url);
console.log('图片 URL:', {
  原始: article.Cover?.url,
  处理后: imageUrl,
  是否存在: !!imageUrl
});
```

## ✅ 验证清单

- [ ] Strapi 后台已上传图片
- [ ] API 响应中包含图片 URL
- [ ] 图片 URL 格式正确（相对路径或完整 URL）
- [ ] Next.js `remotePatterns` 配置正确
- [ ] 环境变量配置正确
- [ ] 浏览器控制台无错误
- [ ] Network 标签中图片请求成功（状态码 200）

## 🆘 仍然无法解决？

1. **检查 Strapi 日志**：查看后端是否有错误
2. **检查网络连接**：确认可以访问 Strapi 服务器
3. **检查 CORS 设置**：确认 Strapi 允许跨域请求
4. **查看完整错误信息**：复制浏览器控制台的完整错误信息
