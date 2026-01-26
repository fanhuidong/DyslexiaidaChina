'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Article } from '@/types';
import { getStrapiMedia } from '@/lib/api';
import { Calendar, ArrowRight } from 'lucide-react';

export default function ArticleCard({ article }: { article: Article }) {
  const imageUrl = getStrapiMedia(article.Cover?.url);
  const [imageError, setImageError] = useState(false);

  return (
    <Link 
      href={`/article/${article.documentId}`} 
      // 👇 Understood.org 风格：卡片设计，圆角 16px，轻微阴影，hover 时加深
      className="group flex flex-col md:flex-row bg-surface rounded-card overflow-hidden hover:shadow-card-hover transition-all duration-300 border border-gray-100 items-stretch hover:-translate-y-1"
    >
      {/* 🖼️ 左侧图片区域 */}
      {/* 手机端 w-full (全宽) / 电脑端 w-1/3 (占三分之一宽度) */}
      <div className="relative w-full md:w-2/5 min-h-[240px] md:min-h-full shrink-0 overflow-hidden">
        {imageUrl && !imageError ? (
          <Image
            src={imageUrl}
            alt={article.Title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            onError={() => {
              console.error(`❌ 图片加载失败: ${imageUrl}`);
              setImageError(true);
            }}
            unoptimized={process.env.NODE_ENV === "development"}
          />
        ) : (
          <div className="w-full h-full bg-secondary/5 flex items-center justify-center text-secondary/30">
            {imageError ? "图片加载失败" : "No Image"}
          </div>
        )}
        
        {/* 分类标签 (悬浮在左上角) */}
        {article.Category && (
          <div className="absolute top-4 left-4 bg-white/95 backdrop-blur text-secondary text-xs font-bold px-3 py-1.5 rounded-md shadow-sm uppercase tracking-wider">
            {article.Category.Name}
          </div>
        )}
      </div>

      {/* 📄 右侧内容区域 */}
      <div className="flex-1 p-6 md:p-8 flex flex-col justify-between">
        <div>
          {/* 日期 */}
          <div className="flex items-center text-xs text-gray-400 mb-3 font-medium uppercase tracking-wide">
            <Calendar className="w-3.5 h-3.5 mr-2 text-primary" />
            {new Date(article.publishedAt).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
          
          {/* 标题 */}
          <h3 className="text-xl md:text-2xl font-black text-secondary mb-4 leading-tight group-hover:text-primary transition-colors">
            {article.Title}
          </h3>
          
          {/* 简介 (限制显示 3 行) */}
          <p className="text-gray-500 text-sm md:text-base leading-relaxed line-clamp-3 mb-6">
            {article.Description}
          </p>
        </div>
        
        {/* 底部按钮 */}
        <div className="flex items-center text-primary font-bold text-sm group-hover:translate-x-2 transition-transform duration-300">
          阅读全文 <ArrowRight className="ml-2 w-4 h-4" />
        </div>
      </div>
    </Link>
  );
}