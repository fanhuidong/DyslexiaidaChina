import React from "react";
import { fetchAPI, getStrapiMedia } from "@/lib/api";
import BlockRenderer from "@/components/Article/BlockRenderer";
import { FileText, Download, ArrowRight } from "lucide-react";
import { FactSheet } from "@/types"; // 确保引入了之前定义的类型

// 定义页面配置的类型
interface FactSheetPageConfig {
  Title: string;
  Introduction: any; // Blocks
}

export default async function FactSheetsPage() {
  // 并行获取：页面配置 + 资源列表
  const [pageConfig, factSheets] = await Promise.all([
    fetchAPI("/fact-sheet-page-config", { populate: "*" }),
    fetchAPI("/fact-sheets", { populate: "*", sort: "publishedAt:desc" })
  ]);

  // 如果后台还没配置页面信息，给个默认值防止白屏
  const title = (pageConfig as FactSheetPageConfig)?.Title || "Fact Sheets";
  const intro = (pageConfig as FactSheetPageConfig)?.Introduction;

  return (
    <main className="min-h-screen bg-off-white">
      {/* ==================== 1. 统一风格的 Header (红底) ==================== */}
      {/* 这里的样式与 SinglePageRenderer 完全一致 */}
      <div className="bg-[#5c4ae3] text-white py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-4">
            {title}
          </h1>
          {/* 白色装饰短线 */}
          <div className="h-1 w-20 bg-white/30 mx-auto rounded-full"></div>
        </div>
      </div>

      {/* ==================== 2. 主内容区域 (白底) ==================== */}
      <div className="container mx-auto max-w-4xl px-4 py-16">
        
        {/* A. 页面说明文字 (Introduction) */}
        {intro && (
          <div className="prose-lg mx-auto mb-16 border-b border-gray-100 pb-12">
            <BlockRenderer content={intro} />
          </div>
        )}

        {/* B. 资源下载列表 (Clean List Style) */}
        <div className="space-y-4">
          {factSheets && (factSheets as FactSheet[]).length > 0 ? (
            (factSheets as FactSheet[]).map((item) => {
              const fileUrl = getStrapiMedia(item.Document?.url || null);
              const fileSize = item.Document?.size 
                ? (item.Document.size < 1024 ? `${item.Document.size.toFixed(1)} KB` : `${(item.Document.size / 1024).toFixed(1)} MB`)
                : "PDF";

              return (
                <div 
                  key={item.id} 
                  className="group flex flex-col md:flex-row md:items-center justify-between p-6 rounded-card border border-gray-100 hover:border-gray-300 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 bg-surface"
                >
                  {/* 左侧：图标 + 信息 */}
                  <div className="flex items-start gap-4 mb-4 md:mb-0">
                    <div className="w-12 h-12 rounded-full bg-purple-50 text-[#5c4ae3] flex items-center justify-center shrink-0">
                      <FileText size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#5c4ae3] transition-colors">
                        {item.Title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                        {item.Description || "点击右侧按钮下载查看详细内容"}
                      </p>
                      {/* 移动端显示的元数据 */}
                      <div className="md:hidden mt-2 text-xs text-gray-400 font-medium">
                        {fileSize}
                      </div>
                    </div>
                  </div>

                  {/* 右侧：下载按钮 */}
                  {fileUrl ? (
                    <a 
                      href={fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg border-2 border-transparent bg-gray-50 text-gray-700 font-bold hover:bg-[#5c4ae3] hover:text-white transition-all group-hover:shadow-sm text-sm whitespace-nowrap"
                    >
                      <Download size={16} />
                      <span className="hidden md:inline">Download PDF</span>
                      <span className="md:hidden">下载</span>
                      <span className="hidden md:inline text-xs font-normal opacity-70 ml-1">({fileSize})</span>
                    </a>
                  ) : (
                    <button disabled className="px-6 py-2 text-gray-300 text-sm cursor-not-allowed">
                      暂无文件
                    </button>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-20 text-gray-400 bg-surface rounded-card border border-dashed border-gray-200">
              暂无资源文件
            </div>
          )}
        </div>

      </div>
    </main>
  );
}