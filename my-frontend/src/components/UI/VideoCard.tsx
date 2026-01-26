'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { getStrapiMedia } from '@/lib/api';
import { Play } from 'lucide-react';
import { HelpVideo } from '@/types';

interface VideoCardProps {
  video: HelpVideo;
}

export default function VideoCard({ video }: VideoCardProps) {
  const imageUrl = getStrapiMedia(video.Image?.url);
  const [imageError, setImageError] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (video.VideoUrl) {
      window.open(video.VideoUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <button
      onClick={handleClick}
      className="group relative bg-surface rounded-card overflow-hidden hover:shadow-card-hover transition-all duration-300 border border-gray-100 hover:-translate-y-1 block aspect-square w-full text-left"
    >
      {/* 图片区域 - 填充整个卡片 */}
      <div className="relative w-full h-full overflow-hidden">
        {imageUrl && !imageError ? (
          <Image
            src={imageUrl}
            alt={video.Title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            onError={() => {
              console.error(`❌ 图片加载失败: ${imageUrl}`);
              setImageError(true);
            }}
            unoptimized={process.env.NODE_ENV === "development"}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/10 via-secondary/5 to-transparent flex items-center justify-center text-secondary/30">
            {imageError ? "图片加载失败" : "No Image"}
          </div>
        )}
        
        {/* 播放按钮图标 - 居中显示 */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-all duration-300">
          <div className="bg-white/90 backdrop-blur rounded-full p-4 group-hover:scale-110 transition-transform duration-300">
            <Play className="w-8 h-8 text-primary ml-1" fill="currentColor" />
          </div>
        </div>
        
        {/* 渐变遮罩层 - 从底部向上渐变，让文字更清晰 */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        
        {/* 内容区域 - 固定在底部 */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white z-10">
          {/* 标题 */}
          <h3 className="text-xl font-black text-white mb-2 leading-tight line-clamp-2 group-hover:text-primary-light transition-colors">
            {video.Title}
          </h3>
          
          {/* 简介 (限制显示 2 行) */}
          {video.Description && (
            <p className="text-white/90 text-sm leading-relaxed line-clamp-2">
              {video.Description}
            </p>
          )}
        </div>
      </div>
    </button>
  );
}
