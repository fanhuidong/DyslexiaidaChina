# 环境配置使用指南

## 📦 核心变量

**`isDevelopment`** - 唯一的环境控制变量
- **`true`** = 开发版（使用本地前后端）
- **`false`** = 生产版（使用线上前后端）

## 🎯 自动切换

- **开发版** (`isDevelopment = true`)：
  - 后端：`http://localhost:8888`
  - 前端：`http://localhost:3000`

- **生产版** (`isDevelopment = false`)：
  - 后端：`http://43.135.124.98:1337`
  - 前端：通过环境变量配置

## 📝 使用方法

### 1. 导入配置

```typescript
import { 
  isDevelopment,  // 核心变量：true=开发版, false=生产版
  API_URL,        // 后端 API 地址（自动切换）
  FRONTEND_URL,   // 前端地址（自动切换）
} from "@/config/env";
```

### 2. 在代码中使用

#### 环境判断（最常用）

```typescript
import { isDevelopment } from "@/config/env";

if (isDevelopment) {
  console.log("开发版 - 使用本地前后端");
} else {
  console.log("生产版 - 使用线上前后端");
}
```

#### API 请求示例

```typescript
import { API_URL } from "@/config/env";

// 自动使用正确的后端地址
const response = await fetch(`${API_URL}/api/articles`);
```

## 🔧 环境变量配置

在 `.env.local` 文件中可以覆盖默认配置：

```env
# 后端地址（可选）
NEXT_PUBLIC_STRAPI_URL=http://localhost:8888

# 前端地址（可选）
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000

# 数据库连接
DATABASE_URL=mysql://root:password@localhost:3306/ida_cn

# NextAuth 配置
AUTH_SECRET=your-secret-key
AUTH_URL=http://localhost:3000
```

## ✅ 已更新的文件

以下文件已更新为使用全局配置：

1. ✅ `src/lib/api.ts` - API 请求函数
2. ✅ `next.config.ts` - Next.js 配置（图片和代理）
3. ✅ `src/config/env.ts` - 新建的全局配置文件

## 🚀 优势

1. **统一管理**：所有环境配置集中在一个文件
2. **自动切换**：根据 `NODE_ENV` 自动选择配置
3. **类型安全**：完整的 TypeScript 类型定义
4. **易于维护**：修改配置只需改一个地方
5. **灵活配置**：支持环境变量覆盖

## 📚 更多信息

查看 `src/config/README.md` 获取详细的使用说明和 API 文档。
