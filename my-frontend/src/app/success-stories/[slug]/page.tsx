import React from "react";
import Image from "next/image";
import { notFound } from "next/navigation";
import { fetchAPI, getStrapiMedia } from "@/lib/api";
import BlockRenderer from "@/components/Article/BlockRenderer";
import { SuccessStory } from "@/types";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function SuccessStoryDetailPage({ params }: PageProps) {
  // 1. 获取 URL 中的 slug (例如 "steven-spielberg")
  const { slug } = await params;

  // 2. 根据 Slug 去 Strapi 查人 (注意 filters 写法)
  const data = await fetchAPI("/success-stories", {
    filters: {
      Slug: {
        $eq: slug, // 匹配 slug 字段
      },
    },
    populate: "*",
  });

  // 3. 如果没查到，返回 404
  if (!data || data.length === 0) {
    return notFound();
  }

  // 取出第一个匹配项 (理论上 Slug 是唯一的)
  const story = data[0] as SuccessStory;
  const photoUrl = getStrapiMedia(story.Photo?.url || null);

  return (
    <main className="min-h-screen bg-white pb-20">
      {/* ==================== 1. Header (人名标题) ==================== */}
      <div className="bg-[#b91c1c] text-white py-16 md:py-24 relative">
        <div className="container mx-auto px-4 text-center">
          {/* 返回按钮 */}
          <Link 
            href="/success-stories" 
            className="absolute top-8 left-4 md:left-8 flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm font-bold uppercase tracking-wider"
          >
            <ArrowLeft size={16} /> Back to Stories
          </Link>

          <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4">
            {story.Name}
          </h1>
          {/* 显示头衔作为副标题 */}
          <div className="text-xl md:text-2xl font-medium text-white/90">
            {story.Title}
          </div>
        </div>
      </div>

      {/* ==================== 2. 正文内容区 ==================== */}
      <div className="container mx-auto max-w-5xl px-4 py-16">
        <div className="flex flex-col md:flex-row gap-12 items-start">
          
          {/* 左侧：人物照片 (Sticky 侧边栏效果) */}
          <div className="w-full md:w-1/3 shrink-0 md:sticky md:top-24">
            <div className="bg-gray-100 rounded-2xl overflow-hidden shadow-lg border border-gray-200">
              {photoUrl ? (
                <div className="relative aspect-[3/4] w-full">
                  <Image
                    src={photoUrl}
                    alt={story.Name}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              ) : (
                <div className="aspect-[3/4] w-full flex items-center justify-center text-gray-400 bg-gray-50">
                  No Photo
                </div>
              )}
            </div>
            
            {/* 引用摘要 (显示在照片下方) */}
            <div className="mt-6 p-6 bg-red-50 rounded-xl border border-red-100">
              <p className="text-[#b91c1c] font-serif italic text-lg leading-relaxed">
                “{story.Summary}”
              </p>
            </div>
          </div>

          {/* 右侧：完整故事 */}
          <div className="w-full md:w-2/3">
            <div className="prose prose-lg md:prose-xl max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-p:text-gray-600 prose-a:text-[#b91c1c]">
              {/* 渲染富文本内容 */}
              {story.StoryContent ? (
                <BlockRenderer content={story.StoryContent} />
              ) : (
                <p className="text-gray-400 italic">暂无详细故事内容...</p>
              )}
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}