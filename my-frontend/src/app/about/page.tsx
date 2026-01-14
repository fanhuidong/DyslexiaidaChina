import React from "react";
import Image from "next/image";
import { notFound } from "next/navigation";
import { fetchAPI, getStrapiMedia } from "@/lib/api";
import BlockRenderer from "@/components/Article/BlockRenderer";
import { BlocksContent } from "@strapi/blocks-react-renderer";

export const dynamic = 'force-dynamic'; //

// 定义 About 页面的数据接口
interface AboutPageData {
  id: number;
  documentId: string;
  Title: string;
  Content: BlocksContent;
  Cover: {
    url: string;
    alternativeText: string;
    width: number;
    height: number;
  } | null;
}

export default async function AboutPage() {
  // 1. 获取 "About" 单页数据
  // 注意：单页类型的 API 路径通常是 "/about"
  const data = await fetchAPI("/about", { populate: "*" });

  // 如果后台没填数据或者没发布，API可能会返回 null
  if (!data) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">暂无内容</h1>
          <p className="text-gray-500">请确保 Strapi 后台 "About" 单页已发布。</p>
        </div>
      </div>
    );
  }

  // 强转类型 (或者你可以在 api.ts 里泛型处理)
  const aboutData = data as AboutPageData;
  const imageUrl = getStrapiMedia(aboutData.Cover?.url || null);

  return (
    <main className="min-h-screen bg-white">
      {/* 头部标题区域 */}
      <div className="bg-secondary text-white py-20 md:py-28">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6">
            {aboutData.Title}
          </h1>
          <div className="h-1.5 w-24 bg-primary mx-auto rounded-full"></div>
        </div>
      </div>

      {/* 核心内容区域 */}
      <div className="container mx-auto max-w-4xl px-4 py-16 md:py-24">
        
        {/* 如果有封面图，显示在正文上方，样式保持画廊风格但稍微大一点 */}
        {imageUrl && (
          <div className="mb-20 relative w-full md:w-3/4 mx-auto">
            <div className="rounded-2xl overflow-hidden shadow-2xl border border-gray-100 bg-white p-3">
              <div className="relative h-[300px] md:h-[500px] w-full rounded-xl overflow-hidden">
                <Image
                  src={imageUrl}
                  alt={aboutData.Title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        )}

        {/* 正文内容 - 复用之前做好的高级感 BlockRenderer */}
        <div className="prose-lg">
          <BlockRenderer content={aboutData.Content} />
        </div>
      </div>
    </main>
  );
}