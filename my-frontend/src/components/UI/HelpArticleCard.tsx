'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { HelpArticle } from '@/types';
import { getStrapiMedia } from '@/lib/api';
import { Calendar } from 'lucide-react';

export default function HelpArticleCard({ article }: { article: HelpArticle }) {
  const imageUrl = getStrapiMedia(article.Cover?.url);
  const [imageError, setImageError] = useState(false);

  return (
    <Link 
      href={`/help/article/${article.documentId}`} 
      className="group relative bg-surface rounded-card overflow-hidden hover:shadow-card-hover transition-all duration-300 border border-gray-100 hover:-translate-y-1 block aspect-square"
    >
      {/* 图片区域 - 填充整个卡片 */}
      <div className="relative w-full h-full overflow-hidden">
        {imageUrl && !imageError ? (
          <Image
            src={imageUrl}
            alt={article.Title}
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
        
        {/* 渐变遮罩层 - 从底部向上渐变，让文字更清晰 */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        
        {/* 内容区域 - 固定在底部 */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white z-10">
          {/* 日期 */}
          <div className="flex items-center text-xs text-white/80 mb-3 font-medium uppercase tracking-wide">
            <Calendar className="w-3.5 h-3.5 mr-2" />
            {new Date(article.publishedAt).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
          
          {/* 标题 */}
          <h3 className="text-xl font-black text-white mb-2 leading-tight line-clamp-2 group-hover:text-primary-light transition-colors">
            {article.Title}
          </h3>
          
          {/* 简介 (限制显示 2 行) */}
          {article.Description && (
            <p className="text-white/90 text-sm leading-relaxed line-clamp-2">
              {article.Description}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
