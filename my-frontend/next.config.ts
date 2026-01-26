/** @type {import('next').NextConfig} */
// 核心环境变量：isDevelopment
// true  = 开发版（本地前后端）
// false = 生产版（线上前后端）
const isDevelopment = process.env.NODE_ENV === "development";

// 后端配置
const API_URL = isDevelopment
  ? process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:8888"
  : process.env.NEXT_PUBLIC_STRAPI_URL || "http://43.135.124.98:1337";
const BACKEND_HOSTNAME = isDevelopment ? "localhost" : "43.135.124.98";
const BACKEND_PORT = isDevelopment ? "8888" : "1337";

const nextConfig = {
  // 1. 🖼️ 图片通行证：允许 Next.js 优化图片
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: BACKEND_HOSTNAME,
        port: BACKEND_PORT,
        pathname: '/uploads/**', // 只允许加载 uploads 文件夹下的图
      },
      // 允许所有路径的图片（如果 Strapi 返回完整 URL）
      {
        protocol: 'http',
        hostname: BACKEND_HOSTNAME,
        port: BACKEND_PORT,
        pathname: '/**', // 允许所有路径
      },
    ],
    // 开发环境禁用图片优化，避免问题
    unoptimized: isDevelopment,
    // 允许加载未优化的图片
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // 2. 🔗 转发通行证 (代理)：
  // 开发环境：代理到本地后端
  // 生产环境：代理到远程服务器（解决 Mixed Content 问题）
  // 注意：Next.js 会优先匹配自己的 API 路由，所以 /api/auth/* 不会被代理
  async rewrites() {
    return [
      {
        // 代理 Strapi API 请求
        // NextAuth 路由 (/api/auth/*) 由 Next.js 自己的路由处理，不会被代理
        source: '/api/:path*',
        destination: `${API_URL}/api/:path*`,
      },
      {
        source: '/uploads/:path*', // 👈 这一段专门管图片！
        destination: `${API_URL}/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;