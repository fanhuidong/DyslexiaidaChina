# 404 错误调试指南

## 🔍 错误信息

如果你看到这样的错误：
```json
{
  "data": null,
  "error": {
    "status": 404,
    "name": "NotFoundError",
    "message": "Not Found",
    "details": {}
  }
}
```

这是 **Strapi 后端 API** 返回的 404 错误，表示请求的资源不存在。

---

## 🎯 可能的原因

### 1. Strapi 内容未发布

**最常见原因**：Strapi 后台的内容是 "草稿" 状态，未发布。

**解决方法：**
1. 登录 Strapi 后台管理界面
2. 找到对应的内容（如 Global、About 等）
3. 点击 "发布" 按钮
4. 刷新前端页面

### 2. API 路径错误

**检查清单：**
- [ ] 检查浏览器控制台的网络请求
- [ ] 查看请求的 URL 是否正确
- [ ] 确认 Strapi 中是否存在对应的 Content Type

### 3. Strapi 服务未运行

**检查方法：**
```powershell
# 检查后端服务是否运行
cd my-backend
npm run develop
```

### 4. 环境配置错误

**检查 `.env.local` 文件：**
```env
# 确保 API_URL 配置正确
NEXT_PUBLIC_STRAPI_URL=http://localhost:8888
```

---

## 🔧 调试步骤

### 步骤 1: 查看浏览器控制台

1. 打开浏览器开发者工具（F12）
2. 切换到 "Network"（网络）标签
3. 刷新页面
4. 查找返回 404 的请求
5. 查看请求的 URL 和响应内容

### 步骤 2: 检查服务器控制台

查看运行 `npm run dev` 的终端窗口，应该会看到：
```
❌ API 错误: 404 Not Found | URL: http://localhost:8888/api/xxx
❌ Strapi API 错误: { status: 404, name: 'NotFoundError', ... }
```

### 步骤 3: 验证 Strapi 内容

1. 访问 Strapi 后台：`http://localhost:8888/admin`
2. 检查对应的 Content Type 是否有数据
3. 确认内容已发布（不是草稿状态）

### 步骤 4: 测试 API 端点

直接在浏览器中访问 API URL，例如：
```
http://localhost:8888/api/global
```

如果返回 404，说明：
- 内容不存在
- 内容未发布
- API 路径错误

---

## 📋 常见问题

### Q1: 首页加载正常，但某些页面显示 404

**可能原因：**
- 该页面对应的 Strapi 内容未创建或未发布

**解决方法：**
1. 在 Strapi 后台创建对应的内容
2. 确保内容已发布
3. 检查 Content Type 的 API 路径是否正确

### Q2: 所有页面都显示 404

**可能原因：**
- Strapi 服务未运行
- API_URL 配置错误
- 网络连接问题

**解决方法：**
1. 检查 Strapi 服务是否运行
2. 检查 `.env.local` 中的 `NEXT_PUBLIC_STRAPI_URL`
3. 尝试直接访问 Strapi API

### Q3: 开发环境正常，生产环境 404

**可能原因：**
- 生产环境的 Strapi 内容未发布
- 生产环境的 API_URL 配置错误

**解决方法：**
1. 检查生产环境的 Strapi 后台
2. 确保所有内容已发布
3. 检查生产环境的环境变量配置

---

## 🛠️ 改进的错误处理

我已经改进了 `fetchAPI` 函数的错误处理，现在会：
- 在控制台显示详细的错误信息
- 显示请求的 URL
- 显示 Strapi 返回的错误详情

这样可以帮助你更快地定位问题。

---

## 📞 需要帮助？

如果问题仍然存在：

1. **查看详细日志**
   - 浏览器控制台（F12 → Console）
   - 服务器控制台（运行 `npm run dev` 的终端）

2. **检查 Strapi 后台**
   - 确认内容已创建
   - 确认内容已发布
   - 确认 API 路径正确

3. **测试 API 端点**
   - 直接在浏览器访问 API URL
   - 使用 Postman 或 curl 测试

4. **检查网络请求**
   - 查看浏览器 Network 标签
   - 确认请求的 URL 和响应
