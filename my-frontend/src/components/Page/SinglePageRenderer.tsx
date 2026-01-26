import React from "react";
import Image from "next/image";
import { fetchAPI, getStrapiMedia } from "@/lib/api";
import BlockRenderer from "@/components/Article/BlockRenderer";
import { BlocksContent } from "@strapi/blocks-react-renderer";

interface SinglePageData {
  Title: string;
  Content: BlocksContent;
  Cover?: {
    url: string;
    alternativeText: string;
    width: number;
    height: number;
  };
}

interface SinglePageRendererProps {
  apiPath: string;      
  pageTitleKey?: string; 
}

export default async function SinglePageRenderer({ apiPath }: SinglePageRendererProps) {
  const data = await fetchAPI(apiPath, { populate: "*" });

  if (!data) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-400">Page Not Found</h1>
        <p className="text-gray-500">
          API 请求失败: <code className="bg-gray-100 px-2 py-1 rounded">{apiPath}</code>
        </p>
        <p className="text-sm text-red-400">请检查 Strapi 后台是否已发布该 Single Type。</p>
      </div>
    );
  }

  const pageData = data as SinglePageData;
  
  // 👇 修复点在这里：加上 || null
  // 如果 url 是 undefined，就传 null 给 getStrapiMedia，这样类型就对上了
  const imageUrl = getStrapiMedia(pageData.Cover?.url || null);

  return (
    <main className="min-h-screen bg-white">
      {/* 头部标题区域 (红底白字) */}
      <div className="bg-[#5c4ae3] text-white py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-4">
            {pageData.Title}
          </h1>
          <div className="h-1 w-20 bg-white/30 mx-auto rounded-full"></div>
        </div>
      </div>

      {/* 核心内容区域 */}
      <div className="container mx-auto max-w-4xl px-4 py-16">
        
        {/* 封面图 */}
        {imageUrl && (
          <div className="mb-16 relative w-full md:w-5/6 mx-auto">
            <div className="rounded-xl overflow-hidden shadow-2xl border border-gray-100 bg-white p-2">
              <div className="relative h-[250px] md:h-[450px] w-full rounded-lg overflow-hidden">
                <Image
                  src={imageUrl}
                  alt={pageData.Title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        )}

        {/* 正文内容 */}
        <div className="prose-lg mx-auto">
          <BlockRenderer content={pageData.Content} />
        </div>
      </div>
    </main>
  );
}