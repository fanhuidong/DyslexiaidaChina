import React from "react";
import { notFound } from "next/navigation";
import { fetchAPI } from "@/lib/api";
import BlockRenderer from "@/components/Article/BlockRenderer";
import { BlocksContent } from "@strapi/blocks-react-renderer";

export const dynamic = 'force-dynamic';

// 定义 Forum 页面的数据接口
interface ForumPageData {
  id: number;
  documentId: string;
  Title: string;
  Subtitle: string;
  Content: BlocksContent;
}

export default async function ForumPage() {
  // 获取 "Forum" 单页数据
  const data = await fetchAPI("/forum", { populate: "*" });

  // 调试：打印返回的数据
  if (process.env.NODE_ENV === "development") {
    console.log("🔍 [ForumPage] API 返回的数据:", JSON.stringify(data, null, 2));
  }

  // 如果后台没填数据或者没发布，API可能会返回 null
  if (!data) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">暂无内容</h1>
          <p className="text-gray-500">请确保 Strapi 后台 "Forum" 单页已发布。</p>
        </div>
      </div>
    );
  }

  // 强转类型
  const forumData = data as ForumPageData;
  
  // 确保 Title 和 Subtitle 有值，如果没有则使用默认值
  const pageTitle = forumData?.Title || "国际论坛";
  const pageSubtitle = forumData?.Subtitle || "参与全球阅读障碍领域的讨论与交流";

  return (
    <main className="min-h-screen bg-off-white">
      {/* 头部标题区域 */}
      <div className="bg-gradient-to-br from-primary via-primary-dark to-primary/90 text-white py-20 md:py-28">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6">
            {pageTitle}
          </h1>
          <div className="h-1.5 w-24 bg-white/30 mx-auto rounded-full mb-6"></div>
          {pageSubtitle && (
            <p className="text-white/90 text-lg md:text-xl max-w-3xl mx-auto">
              {pageSubtitle}
            </p>
          )}
        </div>
      </div>

      {/* 核心内容区域 */}
      <div className="container mx-auto max-w-4xl px-4 py-16 md:py-24">
        {/* 正文内容 - 复用之前做好的高级感 BlockRenderer */}
        <div className="prose-lg">
          <BlockRenderer content={forumData.Content} />
        </div>
      </div>
    </main>
  );
}
