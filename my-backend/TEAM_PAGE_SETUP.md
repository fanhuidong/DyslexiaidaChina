# 团队页面设置指南

## 问题
访问 `/api/team-members` 或 `/api/team-page-config` 时可能出现 403 Forbidden 错误，这是因为新创建的 content-type 默认不允许公开访问。

## 解决方法

### 1. 在 Strapi 后台设置权限

1. **登录 Strapi 管理后台**
   - 访问：http://localhost:8888/admin
   - 使用管理员账号登录

2. **进入权限设置**
   - 点击左侧菜单的 **Settings**（设置）
   - 点击 **Users & Permissions Plugin**（用户和权限插件）
   - 点击 **Roles**（角色）
   - 点击 **Public**（公开角色）

3. **为 Team Member 和 Team Page Config 添加权限**
   - 在权限列表中，找到 **TeamMember** 部分
   - 勾选 **find** 和 **findOne** 权限
   - 找到 **TeamPageConfig** 部分
   - 勾选 **find** 权限
   - 点击右上角的 **Save**（保存）按钮

### 2. 配置页面信息

1. **设置页面标题和副标题**
   - 进入 **Content Manager** → **Team Page Config**（单页类型）
   - 填写 **Title**（例如："我们的团队"）
   - 填写 **Subtitle**（例如："认识我们的团队成员"）
   - 点击右上角的 **Publish**（发布）按钮

### 3. 添加团队成员

1. **创建团队成员**
   - 进入 **Content Manager** → **Team Members**（集合类型）
   - 点击右上角的 **Create new entry**（创建新条目）
   - 填写以下信息：
     - **Name**（姓名）- 必填
     - **Position**（职位）- 必填
     - **Bio**（简介）- 可选，简短介绍
     - **Photo**（照片）- 可选，上传成员照片
     - **Order**（排序）- 数字，用于控制显示顺序（数字越小越靠前）
   - 点击右上角的 **Publish**（发布）按钮

2. **添加更多成员**
   - 重复上述步骤添加更多团队成员
   - 确保每个成员都已发布

### 4. 验证

- 访问 http://localhost:3000/about/team
- 页面应该可以正常显示团队成员列表了

## 页面布局说明

- **标题区域**：深色背景，显示页面标题和副标题
- **团队成员卡片**：
  - 响应式网格布局（移动端1列，平板2列，桌面3列）
  - 每个成员卡片包含：
    - 照片（如果有）或首字母占位符
    - 姓名（大标题）
    - 职位（副标题，紫色）
    - 简介（如果有）

## 注意事项

- 确保所有团队成员都已发布（Published 状态）
- 使用 **Order** 字段控制成员的显示顺序
- 如果没有上传照片，会显示成员姓名的首字母作为占位符
