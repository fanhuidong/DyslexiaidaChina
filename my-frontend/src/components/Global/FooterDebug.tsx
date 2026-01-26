'use client';

import { useEffect } from 'react';

interface FooterDebugProps {
  rawUrl: string | null;
  qrCodeUrl: string | null;
  config: any;
}

export default function FooterDebug({ rawUrl, qrCodeUrl, config }: FooterDebugProps) {
  useEffect(() => {
    // 客户端调试信息（在浏览器控制台可见）
    console.log("🔍 [Footer Client] 原始 URL:", rawUrl);
    console.log("🔍 [Footer Client] 处理后的 URL:", qrCodeUrl);
    console.log("🔍 [Footer Client] 完整配置:", JSON.stringify(config, null, 2));
    console.log("🔍 [Footer Client] 环境:", process.env.NODE_ENV);
  }, [rawUrl, qrCodeUrl, config]);

  return null; // 不渲染任何内容
}
