# 环境配置说明

## 📋 概述

`src/config/env.ts` 文件统一管理所有环境相关的配置。

## 🎯 核心变量

### `isDevelopment`
- **true** = 开发版（使用本地前后端）
- **false** = 生产版（使用线上前后端）

## 🎯 使用方式

### 导入配置

```typescript
import { 
  isDevelopment,  // 核心变量：true=开发版, false=生产版
  API_URL,        // 后端 API 地址（自动切换）
  FRONTEND_URL,   // 前端地址（自动切换）
} from "@/config/env";
```

### 示例

```typescript
// 在 API 请求中使用
import { API_URL } from "@/config/env";

const response = await fetch(`${API_URL}/api/articles`);
```

```typescript
// 判断环境（核心用法）
import { isDevelopment } from "@/config/env";

if (isDevelopment) {
  console.log("开发版 - 使用本地前后端");
} else {
  console.log("生产版 - 使用线上前后端");
}
```

## 🔧 配置说明

### 后端配置

- **开发版** (`isDevelopment = true`): `http://localhost:8888`
- **生产版** (`isDevelopment = false`): `http://43.135.124.98:1337`

### 前端配置

- **开发版** (`isDevelopment = true`): `http://localhost:3000`
- **生产版** (`isDevelopment = false`): 通过环境变量 `NEXT_PUBLIC_FRONTEND_URL` 配置

### 环境变量优先级

配置会按以下优先级读取：

1. 环境变量（`.env.local` 或系统环境变量）
2. 默认值（代码中硬编码的值）

## 📝 环境变量

在 `.env.local` 文件中可以覆盖默认配置：

```env
# 后端地址（可选，不设置则使用默认值）
NEXT_PUBLIC_STRAPI_URL=http://localhost:8888

# 前端地址（可选，不设置则使用默认值）
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000

# 数据库连接
DATABASE_URL=mysql://root:password@localhost:3306/ida_cn

# NextAuth 配置
AUTH_SECRET=your-secret-key
AUTH_URL=http://localhost:3000
```

## 🚀 自动切换

配置会根据 `isDevelopment` 自动切换：

- `isDevelopment = true` → 开发版（本地前后端）
- `isDevelopment = false` → 生产版（线上前后端）

`isDevelopment` 的值由 `NODE_ENV` 决定：
- `NODE_ENV=development` → `isDevelopment = true`
- `NODE_ENV=production` → `isDevelopment = false`

## ✅ 优势

1. **简单明了**: 只需一个 `isDevelopment` 变量控制所有配置
2. **自动切换**: `true`=开发版，`false`=生产版，自动切换前后端地址
3. **统一管理**: 所有环境配置集中在一个文件
4. **易于维护**: 修改配置只需改一个地方
5. **灵活配置**: 支持环境变量覆盖
