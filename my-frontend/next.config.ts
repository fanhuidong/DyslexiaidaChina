/** @type {import('next').NextConfig} */
// 核心环境变量：isDevelopment
// true  = 开发版（本地前后端）
// false = 生产版（线上前后端）
import { API_URL, BACKEND_HOSTNAME, BACKEND_PORT, isDevelopment } from "./src/config/env";

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
    // 生产环境也禁用图片优化，因为使用相对路径通过代理加载
    // 这样可以避免 Next.js Image 优化器尝试处理相对路径时的问题
    unoptimized: true,
    // 允许加载未优化的图片
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // 2. 🔗 转发通行证 (代理)：
  // 开发环境：代理到本地后端
  // 生产环境：代理到远程服务器（解决 Mixed Content 问题）
  // 注意：Next.js 会优先匹配文件系统中的 API 路由（如 /api/auth/*），
  // 所以 /api/auth/* 不会被代理，只有不匹配的 API 路由才会走代理
  async rewrites() {
    return [
      {
        // 代理 Strapi API 请求
        // Next.js 会优先匹配自己的 API 路由，所以 /api/auth/* 不会被代理
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