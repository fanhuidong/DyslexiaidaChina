'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface FooterQRCodeProps {
  qrCodeUrl: string | null;
  alt: string;
  rawUrl: string | null;
}

export default function FooterQRCode({ qrCodeUrl, alt, rawUrl }: FooterQRCodeProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // 客户端调试信息
  useEffect(() => {
    if (qrCodeUrl) {
      console.log("🔍 [FooterQRCode Client] 图片 URL:", qrCodeUrl);
      console.log("🔍 [FooterQRCode Client] 原始 URL:", rawUrl);
    }
  }, [qrCodeUrl, rawUrl]);

  // 图片加载成功
  useEffect(() => {
    if (imageLoaded && qrCodeUrl) {
      console.log("✅ [Footer] 二维码图片加载成功:", qrCodeUrl);
    }
  }, [imageLoaded, qrCodeUrl]);

  // 图片加载失败
  useEffect(() => {
    if (imageError) {
      console.error("❌ [Footer] 二维码图片加载失败");
      console.error("❌ [Footer] 图片 URL:", qrCodeUrl);
      console.error("❌ [Footer] 原始 URL:", rawUrl);
    }
  }, [imageError, qrCodeUrl, rawUrl]);

  if (!qrCodeUrl) {
    return (
      <div className="text-gray-400 text-xs text-center p-2 leading-relaxed">
        请在 Strapi 后台<br/>上传二维码
      </div>
    );
  }

  if (imageError) {
    return (
      <div className="text-gray-400 text-xs text-center p-2 leading-relaxed">
        图片加载失败
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <Image
        src={qrCodeUrl}
        alt={alt}
        fill
        className="object-contain"
        unoptimized={process.env.NODE_ENV === "development"}
        priority
        sizes="112px"
        onError={() => {
          setImageError(true);
        }}
        onLoad={() => {
          setImageLoaded(true);
        }}
      />
    </div>
  );
}
