# Vision API 权限设置指南

## 问题
访问 `/api/vision` 时出现 403 Forbidden 错误，这是因为新创建的 content-type 默认不允许公开访问。

## 解决方法

在 Strapi 后台设置权限：

1. **登录 Strapi 管理后台**
   - 访问：http://localhost:8888/admin
   - 使用管理员账号登录

2. **进入权限设置**
   - 点击左侧菜单的 **Settings**（设置）
   - 点击 **Users & Permissions Plugin**（用户和权限插件）
   - 点击 **Roles**（角色）
   - 点击 **Public**（公开角色）

3. **为 Vision 添加权限**
   - 在权限列表中，找到 **Vision** 部分
   - 勾选 **find**（查找）权限
   - 点击右上角的 **Save**（保存）按钮

4. **验证**
   - 访问 http://localhost:3000/about/vision
   - 页面应该可以正常显示内容了

## 注意事项

- 如果 Vision 内容还没有发布，请先在 **Content Manager** 中创建并发布内容
- 确保 Vision 单页类型的内容状态为 **Published**（已发布）
