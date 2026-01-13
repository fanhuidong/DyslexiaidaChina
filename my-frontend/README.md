This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


frontend/
├── .env.local           # 存放敏感配置 (如 API地址: http://localhost:8888)
├── next.config.ts       # Next.js 配置文件 (用于配置图片域名白名单)
└── src/
    ├── app/             # [页面路由核心]
    │   ├── page.tsx     # 首页
    │   ├── layout.tsx   # 全局布局 (放 Navbar, Footer)
    │   ├── global.css   # 全局样式
    │   ├── article/     # 存放文章相关页面
    │   │   └── [id]/    # 动态路由 (文章详情页)
    │   │       └── page.tsx
    │   └── about/       # 关于我们页面
    │
    ├── components/      # [UI 组件库] (这一块最重要)
    │   ├── Layout/      # 布局组件
    │   │   ├── Navbar.tsx
    │   │   └── Footer.tsx
    │   ├── Home/        # 首页专用的组件
    │   │   ├── HeroSlider.tsx (轮播图)
    │   │   └── NewsGrid.tsx   (新闻列表)
    │   └── UI/          # 通用小组件 (按钮, 卡片, 标签)
    │       ├── Button.tsx
    │       └── ArticleCard.tsx
    │
    ├── lib/             # [工具函数]
    │   ├── api.ts       # 专门封装 fetch 请求 (所有跟 Strapi 交互的代码放这里)
    │   └── utils.ts     # 其他工具 (比如日期格式化)
    │
    └── types/           # [TypeScript 类型定义]
        └── index.ts     # 定义 Article, Category 等数据结构



app/: 只负责路由（URL长什么样，文件夹就怎么建）。

components/: 负责长相。如果以后你要改“导航栏”的颜色，直接去 components/Layout/Navbar.tsx，不用在几十个文件里找。

lib/: 负责逻辑。以后如果你换了后端（不用 Strapi 了），只需要改 api.ts 一个文件，其他页面都不用动。