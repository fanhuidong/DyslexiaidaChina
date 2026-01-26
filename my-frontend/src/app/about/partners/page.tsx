import React from "react";
import Image from "next/image";
import Link from "next/link";
import { fetchAPI, getStrapiMedia } from "@/lib/api";
import { ExternalLink } from "lucide-react";

export const dynamic = 'force-dynamic';

// 定义合作伙伴数据接口
interface Partner {
  id: number;
  documentId: string;
  Name: string;
  Description: string;
  WebsiteUrl: string;
  Logo: {
    url: string;
    alternativeText: string;
    width: number;
    height: number;
  } | null;
  Order: number;
}

// 定义页面配置数据接口
interface PartnerPageConfig {
  id: number;
  documentId: string;
  Title: string;
  Subtitle: string;
}

export default async function PartnersPage() {
  // 获取页面配置
  const configData = await fetchAPI("/partner-page-config", { populate: "*" });
  
  // 获取合作伙伴列表，按 Order 排序
  const partnersData = await fetchAPI("/partners", { 
    populate: "*",
    sort: "Order:asc"
  });

  // 调试：打印返回的数据
  if (process.env.NODE_ENV === "development") {
    console.log("🔍 [PartnersPage] 配置数据:", JSON.stringify(configData, null, 2));
    console.log("🔍 [PartnersPage] 合作伙伴数据:", JSON.stringify(partnersData, null, 2));
  }

  const pageConfig = configData as PartnerPageConfig | null;
  // 确保 partnersData 是数组
  const partners = (Array.isArray(partnersData) ? partnersData : (partnersData ? [partnersData] : [])) as Partner[];

  // 确保标题有值
  const pageTitle = pageConfig?.Title || "我们的伙伴";
  const pageSubtitle = pageConfig?.Subtitle || "认识我们的合作伙伴";

  return (
    <main className="min-h-screen bg-off-white">
      {/* 头部标题区域 */}
      <div className="bg-secondary text-white py-20 md:py-28">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6 text-black">
            {pageTitle}
          </h1>
          <div className="h-1.5 w-24 bg-primary mx-auto rounded-full mb-4"></div>
          <p className="text-xl md:text-2xl text-gray-700 font-medium">
            {pageSubtitle}
          </p>
        </div>
      </div>

      {/* 合作伙伴列表 */}
      <div className="container mx-auto max-w-6xl px-4 py-16 md:py-24">
        {partners.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">暂无合作伙伴信息</p>
            <p className="text-gray-400 text-sm mt-2">请在 Strapi 后台添加合作伙伴</p>
          </div>
        ) : (
          <div className="flex flex-wrap justify-center gap-8 max-w-5xl mx-auto">
            {partners.map((partner) => {
              const logoUrl = getStrapiMedia(partner.Logo?.url || null);
              
              return (
                <Link
                  key={partner.id}
                  href={partner.WebsiteUrl || "#"}
                  target={partner.WebsiteUrl ? "_blank" : undefined}
                  rel={partner.WebsiteUrl ? "noopener noreferrer" : undefined}
                  className="bg-surface rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 w-full max-w-sm md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.5rem)] cursor-pointer block group"
                >
                  {/* 机构LOGO */}
                  {logoUrl ? (
                    <div className="relative w-full h-48 mb-6 rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center p-4">
                      <Image
                        src={logoUrl}
                        alt={partner.Logo?.alternativeText || partner.Name}
                        fill
                        className="object-contain"
                        unoptimized={process.env.NODE_ENV === "development"}
                      />
                    </div>
                  ) : (
                    <div className="w-full h-48 mb-6 rounded-xl bg-gradient-to-br from-primary/10 to-mint/10 flex items-center justify-center">
                      <div className="text-4xl font-bold text-primary/30">
                        {partner.Name.charAt(0)}
                      </div>
                    </div>
                  )}

                  {/* 机构信息 */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-2xl font-bold text-navy group-hover:text-primary transition-colors">
                        {partner.Name}
                      </h3>
                      {partner.WebsiteUrl && (
                        <ExternalLink className="w-5 h-5 text-text-muted group-hover:text-primary transition-colors" />
                      )}
                    </div>
                    {partner.Description && (
                      <p className="text-text-secondary leading-relaxed line-clamp-3">
                        {partner.Description}
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
