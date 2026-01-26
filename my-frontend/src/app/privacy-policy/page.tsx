import React from "react";
import { notFound } from "next/navigation";
import { fetchAPI } from "@/lib/api";
import BlockRenderer from "@/components/Article/BlockRenderer";
import { BlocksContent } from "@strapi/blocks-react-renderer";

export const dynamic = 'force-dynamic';

// 定义隐私政策页面的数据接口
interface PrivacyPolicyData {
  id: number;
  documentId: string;
  Content: BlocksContent;
}

export default async function PrivacyPolicyPage() {
  // 从 Strapi 后台获取隐私政策数据
  const data = await fetchAPI("/privacy-policy", { populate: "*" });

  // 如果后台没填数据或者没发布，API可能会返回 null
  if (!data) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">暂无内容</h1>
          <p className="text-gray-500">请确保 Strapi 后台 "Privacy Policy" 单页已发布。</p>
        </div>
      </div>
    );
  }

  // 强转类型
  const privacyPolicyData = data as PrivacyPolicyData;

  return (
    <main className="min-h-screen bg-off-white">
      {/* 头部标题区域 */}
      <div className="text-white py-20 md:py-28" style={{ backgroundColor: '#002938' }}>
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6 text-white">
            隐私政策
          </h1>
          <div className="h-1.5 w-24 bg-primary mx-auto rounded-full"></div>
        </div>
      </div>

      {/* 核心内容区域 */}
      <div className="container mx-auto max-w-4xl px-4 py-16 md:py-24">
        {/* 正文内容 - 使用 BlockRenderer 渲染富文本 */}
        <div className="prose-lg">
          <BlockRenderer content={privacyPolicyData.Content} />
        </div>
      </div>
    </main>
  );
}
