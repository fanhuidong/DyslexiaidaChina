# Copilot 指南 — 快速上手（简明版）

针对 AI 编码代理：本文件提供足够可执行的知识，使你能在本仓库中安全、可复现地修改后端 schema、前端数据消费和 UI。

核心结构
- 单仓多项目：`my-backend`（Strapi）与 `my-frontend`（Next.js app-router）。
- 前端的数据层集中在 `my-frontend/src/lib/api.ts`；UI 在 `my-frontend/src/components/`，页面路由在 `my-frontend/src/app/`（示例：`app/page.tsx`）。
- 后端遵循 Strapi 约定：content-types 在 `my-backend/src/api/<name>/content-types/.../schema.json`，控制器/服务/路由分别在 `controllers/`、`services/`、`routes/`。

常用命令（在相应子目录中运行）
- 后端（开发）：
  - cd my-backend
  - npm run develop
- 后端（构建 admin）：
  - cd my-backend
  - npm run build
- 前端（开发）：
  - cd my-frontend
  - npm run dev

快速示例（修改文章 schema）
1. 编辑 `my-backend/src/api/article/content-types/article/schema.json` 增加/修改字段。
2. 如需自定义行为，修改 `my-backend/src/api/article/controllers/article.ts` 或 `services/article.ts`。
3. 重启 Strapi：`cd my-backend && npm run develop`。若更改影响 admin，运行 `npm run build`。
4. 在前端更新 `my-frontend/src/lib/api.ts` 和 `my-frontend/src/types`，并调整使用该数据的组件（例如 `my-frontend/src/components/UI/ArticleCard.tsx`）。

项目约定（可被程序化执行）
- 所有对后端的请求必须经由 `my-frontend/src/lib/api.ts` 发出；不要在页面或组件中直接写 fetch URL。
- 页面层只负责路由与布局；可复用组件放 `src/components/`（例：`Layout/Navbar.tsx`、`Home/Hero.tsx`）。
- 类型生成：项目包含 `types/generated/`，在修改 content-type 后，若有生成脚本请同步运行（若无，请手动更新 `my-frontend/src/types`）。

注意事项与集成点
- 默认前端地址：`http://localhost:3000`。Strapi 常见端口为 `1337`，README 中提到示例 `8888`，以实际 `.env` 为准（前端 `.env.local` 中设置 `API_URL`）。
- 更改 schema 会影响 API 返回，务必同时修改前端类型与调用处。

AI 操作规范（必遵守）
- 变更前：搜索 `my-backend/src/api` 与 `my-frontend/src` 定位影响文件，列出受影响路径。
- 变更产出：提交包含后端 `schema.json` 改动补丁、示例 `api.ts` 调用片段、被修改的前端组件路径与测试说明。
- 编辑仓库时优先使用 `apply_patch`（或相应编辑工具），并保持最小改动集。
- 提供可复制的运行命令（如 `cd my-backend && npm run develop`），并在必要时说明需要人工重启服务。

审阅与下一步
- 已完成简明版说明。如需把本文扩展为“操作清单”或加入 CI/类型生成脚本示例，请指明要点（例如：添加 GitHub Actions 名称或类型生成命令）。

