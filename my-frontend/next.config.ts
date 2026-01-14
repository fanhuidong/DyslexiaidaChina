/** @type {import('next').NextConfig} */
const nextConfig = {
  // 1. 🖼️ 图片通行证：允许 Next.js 优化来自香港服务器的图片
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '43.135.124.98',
        port: '1337',
        pathname: '/uploads/**', // 只允许加载 uploads 文件夹下的图
      },
    ],
  },

  // 2. 🔗 转发通行证 (代理)：
  // 当浏览器请求 /uploads/xxx.jpg 时，Vercel 把它偷偷转发给 http://43.135...
  // 这样就解决了 "混合内容(Mixed Content)" 导致图片加载失败的问题
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://43.135.124.98:1337/api/:path*',
      },
      {
        source: '/uploads/:path*', // 👈 这一段专门管图片！
        destination: 'http://43.135.124.98:1337/uploads/:path*',
      },
    ];
  },
};

export default nextConfig;