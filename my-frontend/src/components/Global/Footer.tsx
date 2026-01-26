import Link from 'next/link';
import Image from 'next/image';
import { fetchAPI, getStrapiMedia } from '@/lib/api';
import { isDevelopment } from '@/config/env';

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
  const footerConfig = await fetchAPI("/global", { 
    populate: "*"
  }) as FooterConfig | null;
  const qrCodeUrl = getStrapiMedia(footerConfig?.WechatQRCode?.url || null);

  // 调试信息（生产环境也输出，方便排查）
  if (process.env.NODE_ENV === "development") {
    console.log("🔍 [Footer] 二维码 URL:", qrCodeUrl);
    console.log("🔍 [Footer] 原始数据:", footerConfig?.WechatQRCode);
  }

  return (
    <footer className="text-white pt-16 pb-10 mt-12" style={{ backgroundColor: '#002938' }}>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Logo 与描述 */}
          <div className="md:col-span-1">
            <h2 className="text-3xl font-black tracking-tight text-white mb-4">
              DyslexiaidaChina
            </h2>
            <p className="text-gray-300 text-sm leading-relaxed">
              {footerConfig?.FooterText || "致力于为思维和学习方式不同的人，创造更美好的世界。加入我们的社区。"}
            </p>
          </div>

          {/* 关于我们链接 */}
          <div className="md:col-span-1">
            <h3 className="text-lg font-bold mb-5 text-white">关于我们</h3>
            <ul className="space-y-3">
              <li>
                <Link 
                  href="/about/vision" 
                  className="text-gray-300 hover:text-primary transition-colors text-sm font-medium block"
                >
                  我们的愿景
                </Link>
              </li>
              <li>
                <Link 
                  href="/about/story" 
                  className="text-gray-300 hover:text-primary transition-colors text-sm font-medium block"
                >
                  我们的故事
                </Link>
              </li>
              <li>
                <Link 
                  href="/about/team" 
                  className="text-gray-300 hover:text-primary transition-colors text-sm font-medium block"
                >
                  我们的团队
                </Link>
              </li>
              <li>
                <Link 
                  href="/about/contact" 
                  className="text-gray-300 hover:text-primary transition-colors text-sm font-medium block"
                >
                  联系我们
                </Link>
              </li>
              <li>
                <Link 
                  href="/about/partners" 
                  className="text-gray-300 hover:text-primary transition-colors text-sm font-medium block"
                >
                  我们的伙伴
                </Link>
              </li>
            </ul>
          </div>

          {/* 二维码区域 */}
          <div className="md:col-span-1">
            <h3 className="text-lg font-bold mb-5 text-white">联系我们</h3>
            <p className="text-gray-300 text-sm mb-4">微信群二维码</p>
            <div className="relative w-28 h-28 bg-white rounded-lg p-2 flex items-center justify-center shadow-md">
              {qrCodeUrl ? (
                <Image
                  src={qrCodeUrl}
                  alt={footerConfig?.WechatQRCode?.alternativeText || "微信群二维码"}
                  width={100}
                  height={100}
                  className="object-contain"
                  unoptimized={isDevelopment}
                  priority
                  onError={(e) => {
                    // 图片加载失败时的处理
                    console.error("❌ [Footer] 二维码图片加载失败:", qrCodeUrl);
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              ) : (
                <div className="text-gray-400 text-xs text-center p-2 leading-relaxed">
                  请在 Strapi 后台<br/>上传二维码
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 底部版权栏 */}
        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-400">
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="#" className="hover:text-white transition-colors">
                隐私政策
              </Link>
              <span className="text-gray-500">|</span>
              <Link href="#" className="hover:text-white transition-colors">
                使用条款
              </Link>
              <span className="text-gray-500">|</span>
              <Link href="#" className="hover:text-white transition-colors">
                无障碍声明
              </Link>
            </div>
            <span>&copy; 2026 DyslexiaidaChina.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}