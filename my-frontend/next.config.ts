import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // 关键配置：允许从私有 IP 地址加载图片
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '8888',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8888',
        pathname: '/uploads/**',
      },
    ],
    // 告诉 Next.js 不要担心本地私有 IP 的安全限制
    unoptimized: true, 
  },
};

export default nextConfig;