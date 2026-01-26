import React from "react";
import Image from "next/image";
import { notFound } from "next/navigation";
import { fetchAPI, getStrapiMedia } from "@/lib/api";
import BlockRenderer from "@/components/Article/BlockRenderer";
import AssessmentQuiz from "@/components/Page/AssessmentQuiz";
import { BlocksContent } from "@strapi/blocks-react-renderer";

export const dynamic = 'force-dynamic'; 

// 定义这个页面特有的数据结构
interface DoIHaveDyslexiaData {
  Title: string;
  Content: BlocksContent; // 介绍文案
  Cover?: {
    url: string;
    alternativeText: string;
    width: number;
    height: number;
  };
  // 👇 新增的测试相关字段
  AssessmentTitle: string;
  PassingScore: number;
  ResultTitle: string;
  ResultContent: BlocksContent;
  Questions: {
    id: number;
    QuestionText: string;
  }[];
}

export default async function DoIHaveDyslexiaPage() {
  // 注意：这里要在 populate 里加上 Questions，否则拿不到里面的题
  const data = await fetchAPI("/do-i-have-dyslexia", { 
    populate: {
      Cover: true,
      Questions: true, // 👈 关键：获取 Questions 组件数据
    } 
  });

  if (!data) return notFound();

  const pageData = data as DoIHaveDyslexiaData;
  const imageUrl = getStrapiMedia(pageData.Cover?.url || null);

  return (
    <main className="min-h-screen bg-off-white pb-20">
      {/* 头部 */}
      <div className="bg-[#5c4ae3] text-white py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-4">
            {pageData.Title}
          </h1>
          <div className="h-1 w-20 bg-white/30 mx-auto rounded-full"></div>
        </div>
      </div>

      <div className="container mx-auto max-w-4xl px-4 py-16">
        {/* 封面图 */}
        {imageUrl && (
          <div className="mb-12 relative w-full h-[300px] md:h-[400px] rounded-xl overflow-hidden shadow-lg">
            <Image 
              src={imageUrl} 
              alt={pageData.Title} 
              fill 
              className="object-cover" 
              priority 
              unoptimized={process.env.NODE_ENV === "development"}
            />
          </div>
        )}

        {/* 上部分：介绍文案 */}
        <div className="prose-lg mb-16">
          <BlockRenderer content={pageData.Content} />
        </div>

        {/* 下部分：交互式测试表 */}
        {/* 只有当后台配置了问题时才显示 */}
        {pageData.Questions && pageData.Questions.length > 0 && (
          <AssessmentQuiz 
            title={pageData.AssessmentTitle}
            questions={pageData.Questions}
            passingScore={pageData.PassingScore || 7} // 默认 7 分
            resultTitle={pageData.ResultTitle}
            resultContent={pageData.ResultContent}
          />
        )}
      </div>
    </main>
  );
}