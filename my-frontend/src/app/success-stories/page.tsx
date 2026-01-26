import React from "react";
import Image from "next/image";
import Link from "next/link";
import { fetchAPI, getStrapiMedia } from "@/lib/api";
import BlockRenderer from "@/components/Article/BlockRenderer";
import { ChevronRight } from "lucide-react";
import { SuccessStory } from "@/types";

interface SuccessStoryPageConfig {
  Title: string;
  Introduction: any;
  FeaturedImage: {
    url: string;
    alternativeText: string;
    width: number; // ✅ 我们需要用到这个宽度
    height: number; // ✅ 还有这个高度
  } | null;
}

export default async function SuccessStoriesPage() {
  const [pageConfig, stories] = await Promise.all([
    fetchAPI("/success-story-page-config", { populate: "*" }),
    fetchAPI("/success-stories", { populate: "*", sort: "publishedAt:desc" })
  ]);

  const config = pageConfig as SuccessStoryPageConfig;
  const title = config?.Title || "Success Stories";
  const intro = config?.Introduction;
  
  // ✅ 获取完整的图片对象，而不仅仅是 URL
  const featuredImage = config?.FeaturedImage;
  const featuredImageUrl = getStrapiMedia(featuredImage?.url || null);

  return (
    <main className="min-h-screen bg-off-white pb-20">
      {/* Header */}
      <div className="bg-[#5c4ae3] text-white py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-4">
            {title}
          </h1>
          <div className="h-1 w-20 bg-white/30 mx-auto rounded-full"></div>
        </div>
      </div>

      <div className="container mx-auto max-w-5xl px-4 py-16">
        
        {/* 👇👇👇 修改后的特色图片区域 👇👇👇 */}
        {featuredImageUrl && featuredImage && (
          // 1. 去掉了 h-[...px] 的固定高度限制
          <div className="w-full rounded-2xl overflow-hidden shadow-lg mb-12 border border-gray-100">
            <Image
              src={featuredImageUrl}
              alt={featuredImage.alternativeText || title}
              // 2. 使用图片原始宽高，配合 w-full h-auto 实现"完整显示且自适应"
              width={featuredImage.width}
              height={featuredImage.height}
              className="w-full h-auto" 
              priority
            />
          </div>
        )}

        {/* 页面说明 */}
        {intro && (
          <div className="prose-lg mx-auto mb-16 border-b border-gray-100 pb-12 text-center text-gray-600">
            <BlockRenderer content={intro} />
          </div>
        )}

        {/* 列表区域 (保持之前的纵向排列 + 无遮罩) */}
        <div className="flex flex-col gap-6">
          {stories && (stories as SuccessStory[]).length > 0 ? (
            (stories as SuccessStory[]).map((story) => {
              const photoUrl = getStrapiMedia(story.Photo?.url || null);

              return (
                <Link 
                  key={story.id} 
                  href={`/success-stories/${story.Slug}`}
                  className="group flex flex-col md:flex-row bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300"
                >
                  <div className="relative w-full md:w-72 h-64 md:h-auto shrink-0 bg-gray-50 overflow-hidden border-b md:border-b-0 md:border-r border-gray-100">
                    {photoUrl ? (
                      <Image 
                        src={photoUrl} 
                        alt={story.Name} 
                        fill 
                        className="object-contain p-2" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        No Photo
                      </div>
                    )}
                  </div>

                  <div className="p-6 md:p-8 flex-1 flex flex-col justify-center">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                      <h3 className="text-2xl font-bold text-gray-900 group-hover:text-[#5c4ae3] transition-colors">
                        {story.Name}
                      </h3>
                      {story.Title && (
                        <span className="text-xs font-bold text-[#5c4ae3] uppercase tracking-wider bg-purple-50 px-2 py-1 rounded w-fit">
                          {story.Title}
                        </span>
                      )}
                    </div>

                    <p className="text-gray-500 text-base line-clamp-2 md:line-clamp-3 mb-6 leading-relaxed">
                      {story.Summary}
                    </p>
                    
                    <div className="flex items-center text-sm font-bold text-gray-900 group-hover:text-[#5c4ae3] mt-auto">
                      阅读完整故事 <ChevronRight size={16} className="ml-1 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              );
            })
          ) : (
            <div className="text-center py-20 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              暂无成功案例数据
            </div>
          )}
        </div>

      </div>
    </main>
  );
}