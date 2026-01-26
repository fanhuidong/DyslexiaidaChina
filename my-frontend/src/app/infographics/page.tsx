import React from "react";
import Image from "next/image";
import { fetchAPI, getStrapiMedia } from "@/lib/api";
import BlockRenderer from "@/components/Article/BlockRenderer";
import { Eye, Download } from "lucide-react";

// 定义类型
interface InfographicPageConfig {
  Title: string;
  Introduction: any;
}

interface Infographic {
  id: number;
  Title: string;
  Description: string;
  Image: {
    url: string;
    width: number;
    height: number;
  } | null;
}

export default async function InfographicsPage() {
  // 1. 获取数据
  const [pageConfig, infographics] = await Promise.all([
    fetchAPI("/infographic-page-config", { populate: "*" }),
    fetchAPI("/infographics", { populate: "*", sort: "publishedAt:desc" })
  ]);

  const config = pageConfig as InfographicPageConfig;
  const title = config?.Title || "Infographics";
  const intro = config?.Introduction;

  return (
    <main className="min-h-screen bg-off-white pb-20">
      {/* ==================== Header (统一风格) ==================== */}
      <div className="bg-[#5c4ae3] text-white py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-4">
            {title}
          </h1>
          <div className="h-1 w-20 bg-white/30 mx-auto rounded-full"></div>
        </div>
      </div>

      {/* ==================== 主体内容 ==================== */}
      <div className="container mx-auto max-w-6xl px-4 py-16">
        
        {/* 页面说明 */}
        {intro && (
          <div className="prose-lg mx-auto mb-16 border-b border-gray-100 pb-12 text-center text-gray-600">
            <BlockRenderer content={intro} />
          </div>
        )}

        {/* 图表画廊 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {infographics && (infographics as Infographic[]).length > 0 ? (
            (infographics as Infographic[]).map((item) => {
              const imageUrl = getStrapiMedia(item.Image?.url || null);

              return (
                <div key={item.id} className="group flex flex-col bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300">
                  
                  {/* 图片预览区域 (点击打开原图) */}
                  <a 
                    href={imageUrl || "#"} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="relative block aspect-[3/4] bg-gray-50 overflow-hidden cursor-zoom-in"
                  >
                    {imageUrl ? (
                      <>
                        <Image 
                          src={imageUrl} 
                          alt={item.Title} 
                          fill 
                          className="object-contain p-4 group-hover:scale-105 transition-transform duration-500" 
                        />
                        {/* 悬停时的遮罩层 */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                           <div className="bg-white/90 text-gray-900 px-4 py-2 rounded-full font-bold text-sm shadow-lg flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform">
                             <Eye size={16} /> 查看大图
                           </div>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        No Image
                      </div>
                    )}
                  </a>

                  {/* 信息区域 */}
                  <div className="p-6 border-t border-gray-50">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 min-h-[3.5rem]">
                      {item.Title}
                    </h3>
                    
                    {item.Description && (
                      <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                        {item.Description}
                      </p>
                    )}

                    {/* 下载按钮 */}
                    {imageUrl && (
                      <a 
                        href={imageUrl} 
                        download
                        target="_blank"
                        className="flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-gray-50 text-gray-700 text-sm font-bold hover:bg-[#5c4ae3] hover:text-white transition-colors"
                      >
                        <Download size={16} /> 保存图片
                      </a>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
             <div className="col-span-full text-center py-20 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              暂无信息图表数据
            </div>
          )}
        </div>

      </div>
    </main>
  );
}