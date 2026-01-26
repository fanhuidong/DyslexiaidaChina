# 合作伙伴页面设置指南

## 问题
访问 `/api/partners` 或 `/api/partner-page-config` 时可能出现 403 Forbidden 错误，这是因为新创建的 content-type 默认不允许公开访问。

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

3. **为 Partner 和 Partner Page Config 添加权限**
   - 在权限列表中，找到 **Partner** 部分
   - 勾选 **find** 和 **findOne** 权限
   - 找到 **PartnerPageConfig** 部分
   - 勾选 **find** 权限
   - 点击右上角的 **Save**（保存）按钮

### 2. 配置页面信息

1. **设置页面标题和副标题**
   - 进入 **Content Manager** → **Partner Page Config**（单页类型）
   - 填写 **Title**（例如："我们的伙伴"）
   - 填写 **Subtitle**（例如："认识我们的合作伙伴"）
   - 点击右上角的 **Publish**（发布）按钮

### 3. 添加合作伙伴

1. **创建合作伙伴**
   - 进入 **Content Manager** → **Partners**（集合类型）
   - 点击右上角的 **Create new entry**（创建新条目）
   - 填写以下信息：
     - **Name**（机构名称）- 必填
     - **Logo**（机构LOGO）- 可选，上传机构LOGO图片
     - **Description**（机构简介）- 可选，简短介绍
     - **WebsiteUrl**（官网链接）- 可选，填写机构官网URL（例如：https://example.com）
     - **Order**（排序）- 数字，用于控制显示顺序（数字越小越靠前）
   - 点击右上角的 **Publish**（发布）按钮

2. **添加更多合作伙伴**
   - 重复上述步骤添加更多合作伙伴
   - 确保每个合作伙伴都已发布

### 4. 验证

- 访问 http://localhost:3000/about/partners
- 页面应该可以正常显示合作伙伴列表了

## 页面布局说明

- **标题区域**：深色背景，显示页面标题和副标题
- **合作伙伴卡片**：
  - 响应式网格布局（移动端1列，平板2列，桌面3列）
  - 每个合作伙伴卡片包含：
    - LOGO（如果有）或首字母占位符
    - 机构名称（大标题）
    - 机构简介（如果有）
    - 外部链接图标（如果有官网链接）
  - 点击卡片会跳转到合作伙伴的官网（新标签页打开）

## 注意事项

- 确保所有合作伙伴都已发布（Published 状态）
- 使用 **Order** 字段控制合作伙伴的显示顺序
- 如果没有上传LOGO，会显示机构名称的首字母作为占位符
- **WebsiteUrl** 字段应填写完整的URL（包含 http:// 或 https://）
- 点击卡片会在新标签页打开官网链接
