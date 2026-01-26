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
  // useEffect(() => {
  //   if (qrCodeUrl) {
  //     console.log("🔍 [FooterQRCode Client] 图片 URL:", qrCodeUrl);
  //     console.log("🔍 [FooterQRCode Client] 原始 URL:", rawUrl);
  //   }
  // }, [qrCodeUrl, rawUrl]);

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
      <div className="flex flex-col items-center justify-center h-full text-gray-400 text-sm text-center p-4">
        <div className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-lg mb-3 flex items-center justify-center">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </div>
        <p className="text-xs leading-relaxed">请在 Strapi 后台<br/>上传二维码</p>
      </div>
    );
  }

  if (imageError) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400 text-sm text-center p-4">
        <div className="w-16 h-16 border-2 border-red-300 rounded-lg mb-3 flex items-center justify-center">
          <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <p className="text-xs leading-relaxed">图片加载失败</p>
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
        sizes="224px"
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
