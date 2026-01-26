import Link from 'next/link';
import { fetchAPI, getStrapiMedia } from '@/lib/api';
import { isDevelopment } from '@/config/env';
import FooterDebug from './FooterDebug';
import FooterQRCode from './FooterQRCode';

// 强制动态渲染，避免缓存问题
export const dynamic = 'force-dynamic';

interface FooterConfig {
  FooterText?: string | null;
  WechatQRCode?: {
    url: string;
    alternativeText?: string;
    width?: number;
    height?: number;
  } | null;
}

export default async function Footer() {
  // 从 Strapi 后台获取页脚配置（包括微信二维码）
  // 使用 try-catch 处理 API 错误，避免页面崩溃
  let footerConfig: FooterConfig | null = null;
  try {
    footerConfig = await fetchAPI("/global", { 
      populate: "*"
    }) as FooterConfig | null;
  } catch (error) {
    console.error('获取 Footer 配置失败:', error);
    // 如果 API 失败，footerConfig 保持为 null，使用默认值
  }
  
  // 获取原始 URL
  const rawUrl = footerConfig?.WechatQRCode?.url || null;
  const qrCodeUrl = getStrapiMedia(rawUrl);

  // 调试信息（服务器端和客户端都输出）
  // 服务器端日志（在 Vercel 日志中可见）
  // console.log("🔍 [Footer Server] 原始 URL:", rawUrl);
  // console.log("🔍 [Footer Server] 处理后的 URL:", qrCodeUrl);
  // console.log("🔍 [Footer Server] 完整配置:", JSON.stringify(footerConfig?.WechatQRCode, null, 2));
  // console.log("🔍 [Footer Server] 环境:", process.env.NODE_ENV);

  return (
    <footer className="relative text-white overflow-hidden" style={{ backgroundColor: '#002938' }}>
      {/* 背景装饰渐变 */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      
      {/* 客户端调试组件（在浏览器控制台输出） */}
      <FooterDebug 
        rawUrl={rawUrl} 
        qrCodeUrl={qrCodeUrl} 
        config={footerConfig?.WechatQRCode} 
      />
      
      <div className="relative container mx-auto px-6 py-16 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 mb-16">
          {/* Logo 与描述 - 占据更多空间 */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <h2 className="text-4xl font-black tracking-tight text-white mb-4 bg-gradient-to-r from-white to-white/90 bg-clip-text">
                DyslexiaidaChina
              </h2>
              <div className="w-16 h-1 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full mb-6" />
            </div>
            <p className="text-gray-300 text-base leading-relaxed max-w-md">
              {footerConfig?.FooterText || "致力于为思维和学习方式不同的人，创造更美好的世界。加入我们的社区。"}
            </p>
          </div>

          {/* 关于我们链接 - 两列布局 */}
          <div className="lg:col-span-4">
            <h3 className="text-sm font-semibold text-white/90 uppercase tracking-wider mb-8 pb-2 border-b border-white/10">
            关于我们
            </h3>
            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
              <Link 
                href="/about/vision" 
                className="group text-gray-400 hover:text-white transition-all duration-300 text-sm font-medium flex items-center"
              >
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="group-hover:translate-x-1 transition-transform duration-300">我们的愿景</span>
              </Link>
              <Link 
                href="/about/story" 
                className="group text-gray-400 hover:text-white transition-all duration-300 text-sm font-medium flex items-center"
              >
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="group-hover:translate-x-1 transition-transform duration-300">我们的故事</span>
              </Link>
              <Link 
                href="/about/team" 
                className="group text-gray-400 hover:text-white transition-all duration-300 text-sm font-medium flex items-center"
              >
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="group-hover:translate-x-1 transition-transform duration-300">我们的团队</span>
              </Link>
              <Link 
                href="/about/contact" 
                className="group text-gray-400 hover:text-white transition-all duration-300 text-sm font-medium flex items-center"
              >
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="group-hover:translate-x-1 transition-transform duration-300">联系我们</span>
              </Link>
              <Link 
                href="/about/partners" 
                className="group text-gray-400 hover:text-white transition-all duration-300 text-sm font-medium flex items-center"
              >
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="group-hover:translate-x-1 transition-transform duration-300">我们的伙伴</span>
              </Link>
            </div>
          </div>

          {/* 二维码区域 - 突出展示 */}
          <div className="lg:col-span-3">
            <h3 className="text-sm font-semibold text-white/90 uppercase tracking-wider mb-6 pb-2 border-b border-white/10">
              加入我们
            </h3>
            <div className="space-y-4">
              <p className="text-gray-400 text-sm">扫描二维码加入微信群</p>
              <div className="relative group">
                <div className="relative w-56 h-56 bg-white rounded-2xl p-4 flex items-center justify-center shadow-2xl transform group-hover:scale-[1.02] transition-all duration-500">
                  <FooterQRCode 
                    qrCodeUrl={qrCodeUrl}
                    alt={footerConfig?.WechatQRCode?.alternativeText || "微信群二维码"}
                    rawUrl={rawUrl}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 底部版权栏 - 更精致的设计 */}
        <div className="pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <Link 
                href="#" 
                className="text-gray-500 hover:text-white transition-colors duration-300 relative group"
              >
                隐私政策
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white group-hover:w-full transition-all duration-300" />
              </Link>
              <span className="text-gray-600">·</span>
              <Link 
                href="#" 
                className="text-gray-500 hover:text-white transition-colors duration-300 relative group"
              >
                使用条款
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white group-hover:w-full transition-all duration-300" />
              </Link>
              <span className="text-gray-600">·</span>
              <Link 
                href="#" 
                className="text-gray-500 hover:text-white transition-colors duration-300 relative group"
              >
                无障碍声明
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white group-hover:w-full transition-all duration-300" />
              </Link>
            </div>
            <div className="text-sm text-gray-500">
              <span>&copy; 2026 </span>
              <span className="text-white/80 font-medium">DyslexiaidaChina</span>
              <span>. All rights reserved.</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}