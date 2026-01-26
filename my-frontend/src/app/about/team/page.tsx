import React from "react";
import Image from "next/image";
import Link from "next/link";
import { fetchAPI, getStrapiMedia } from "@/lib/api";

export const dynamic = 'force-dynamic';

// 定义团队成员数据接口
interface TeamMember {
  id: number;
  documentId: string;
  Name: string;
  Position: string;
  Bio: string;
  Photo: {
    url: string;
    alternativeText: string;
    width: number;
    height: number;
  } | null;
  Order: number;
}

// 定义页面配置数据接口
interface TeamPageConfig {
  id: number;
  documentId: string;
  Title: string;
  Subtitle: string;
}

export default async function TeamPage() {
  // 获取页面配置
  const configData = await fetchAPI("/team-page-config", { populate: "*" });
  
  // 获取团队成员列表，按 Order 排序
  const membersData = await fetchAPI("/team-members", { 
    populate: "*",
    sort: "Order:asc"
  });

  // 调试：打印返回的数据
  if (process.env.NODE_ENV === "development") {
    console.log("🔍 [TeamPage] 配置数据:", JSON.stringify(configData, null, 2));
    console.log("🔍 [TeamPage] 成员数据:", JSON.stringify(membersData, null, 2));
  }

  const pageConfig = configData as TeamPageConfig | null;
  // 确保 membersData 是数组
  const members = (Array.isArray(membersData) ? membersData : (membersData ? [membersData] : [])) as TeamMember[];

  // 确保标题有值
  const pageTitle = pageConfig?.Title || "我们的团队";
  const pageSubtitle = pageConfig?.Subtitle || "认识我们的团队成员";

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

      {/* 团队成员列表 */}
      <div className="container mx-auto max-w-6xl px-4 py-16 md:py-24">
        {members.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">暂无团队成员信息</p>
            <p className="text-gray-400 text-sm mt-2">请在 Strapi 后台添加团队成员</p>
          </div>
        ) : (
          <div className="flex flex-wrap justify-center gap-8 max-w-5xl mx-auto">
            {members.map((member) => {
              const photoUrl = getStrapiMedia(member.Photo?.url || null);
              
              return (
                <Link
                  key={member.id}
                  href={`/about/team/${member.documentId}`}
                  className="bg-surface rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 w-full max-w-sm md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.5rem)] cursor-pointer block"
                >
                  {/* 成员照片 - 圆形显示 */}
                  {photoUrl ? (
                    <div className="relative w-48 h-48 mx-auto mb-6 rounded-full overflow-hidden bg-gray-100">
                      <Image
                        src={photoUrl}
                        alt={member.Photo?.alternativeText || member.Name}
                        fill
                        className="object-cover"
                        unoptimized={process.env.NODE_ENV === "development"}
                      />
                    </div>
                  ) : (
                    <div className="w-48 h-48 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/20 to-mint/20 flex items-center justify-center">
                      <div className="text-5xl font-bold text-primary/30">
                        {member.Name.charAt(0)}
                      </div>
                    </div>
                  )}

                  {/* 成员信息 */}
                  <div>
                    <h3 className="text-2xl font-bold text-navy mb-2">
                      {member.Name}
                    </h3>
                    <p className="text-lg text-primary font-semibold mb-4">
                      {member.Position}
                    </p>
                    {member.Bio && (
                      <p className="text-text-secondary leading-relaxed line-clamp-3">
                        {member.Bio}
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
