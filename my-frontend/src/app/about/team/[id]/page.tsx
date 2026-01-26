import React from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchAPI, getStrapiMedia } from "@/lib/api";
import BlockRenderer from "@/components/Article/BlockRenderer";
import { BlocksContent } from "@strapi/blocks-react-renderer";
import { ArrowLeft } from "lucide-react";

export const dynamic = 'force-dynamic';

// 定义团队成员数据接口
interface TeamMember {
  id: number;
  documentId: string;
  Name: string;
  Position: string;
  Bio: string;
  DetailContent: BlocksContent;
  Photo: {
    url: string;
    alternativeText: string;
    width: number;
    height: number;
  } | null;
  Order: number;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TeamMemberDetailPage({ params }: PageProps) {
  // 获取 URL 中的 id
  const { id } = await params;

  // 根据 id 查询团队成员（使用 documentId）
  const data = await fetchAPI(`/team-members/${id}`, { populate: "*" });

  // 如果没查到，返回 404
  if (!data) {
    return notFound();
  }

  // 获取成员数据
  const member = data as TeamMember;
  const photoUrl = getStrapiMedia(member.Photo?.url || null);

  return (
    <main className="min-h-screen bg-off-white pb-20">
      {/* 返回按钮 - 左上角 */}
      <div className="container mx-auto px-4 pt-8">
        <Link 
          href="/about/team" 
          className="inline-flex items-center gap-2 text-text-secondary hover:text-primary transition-colors text-sm font-bold uppercase tracking-wider"
        >
          <ArrowLeft size={16} />
          返回团队页面
        </Link>
      </div>

      {/* 成员信息区域 */}
      <div className="container mx-auto max-w-4xl px-4 py-12">
        {/* 头像 - 顶部居中 */}
        <div className="flex justify-center mb-8">
          {photoUrl ? (
            <div className="relative w-48 h-48 rounded-full overflow-hidden bg-gray-100 shadow-lg">
              <Image
                src={photoUrl}
                alt={member.Photo?.alternativeText || member.Name}
                fill
                className="object-cover"
                priority
                unoptimized={process.env.NODE_ENV === "development"}
              />
            </div>
          ) : (
            <div className="w-48 h-48 rounded-full bg-gradient-to-br from-primary/20 to-mint/20 flex items-center justify-center shadow-lg">
              <div className="text-6xl font-bold text-primary/30">
                {member.Name.charAt(0)}
              </div>
            </div>
          )}
        </div>

        {/* 名字 - 居中 */}
        <div className="text-center mb-4">
          <h1 className="text-4xl md:text-5xl font-black text-navy tracking-tight">
            {member.Name}
          </h1>
        </div>

        {/* 职位 - 居中 */}
        <div className="text-center mb-8">
          <p className="text-2xl text-primary font-semibold">
            {member.Position}
          </p>
        </div>

        {/* 详细介绍正文 - 使用 DetailContent 字段 */}
        {member.DetailContent && (
          <div className="prose prose-lg max-w-none mx-auto">
            <div className="bg-surface rounded-2xl p-8 md:p-12 shadow-md border border-gray-100">
              <BlockRenderer content={member.DetailContent} />
            </div>
          </div>
        )}

        {!member.DetailContent && (
          <div className="text-center py-12">
            <p className="text-gray-400">暂无详细介绍</p>
          </div>
        )}
      </div>
    </main>
  );
}
