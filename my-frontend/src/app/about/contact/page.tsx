import React from "react";
import Image from "next/image";
import { notFound } from "next/navigation";
import { fetchAPI, getStrapiMedia } from "@/lib/api";
import BlockRenderer from "@/components/Article/BlockRenderer";
import { BlocksContent } from "@strapi/blocks-react-renderer";

export const dynamic = 'force-dynamic';

// 定义 Contact 页面的数据接口
interface ContactPageData {
  id: number;
  documentId: string;
  Title: string;
  Content: BlocksContent;
}

// 定义 Global 配置接口
interface FooterConfig {
  WechatQRCode: {
    url: string;
    alternativeText: string;
    width: number;
    height: number;
  } | null;
}

export default async function ContactPage() {
  // 获取 "Contact" 单页数据和 Global 配置
  const [contactData, globalConfig] = await Promise.all([
    fetchAPI("/contact", { populate: "*" }),
    fetchAPI("/global", { populate: "*" })
  ]);

  // 调试：打印返回的数据
  if (process.env.NODE_ENV === "development") {
    console.log("🔍 [ContactPage] Contact 数据:", JSON.stringify(contactData, null, 2));
    console.log("🔍 [ContactPage] Global 数据:", JSON.stringify(globalConfig, null, 2));
  }

  // 如果后台没填数据或者没发布，API可能会返回 null
  if (!contactData) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">暂无内容</h1>
          <p className="text-gray-500">请确保 Strapi 后台 "Contact" 单页已发布。</p>
        </div>
      </div>
    );
  }

  // 强转类型
  const contact = contactData as ContactPageData;
  const global = globalConfig as FooterConfig | null;
  
  // 确保 Title 有值，如果没有则使用默认值
  const pageTitle = contact?.Title || "联系我们";
  // 使用 Global 配置中的 WechatQRCode
  const qrCodeUrl = getStrapiMedia(global?.WechatQRCode?.url || null);

  return (
    <main className="min-h-screen bg-off-white">
      {/* 头部标题区域 */}
      <div className="bg-secondary text-white py-20 md:py-28">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6 text-black">
            {pageTitle}
          </h1>
          <div className="h-1.5 w-24 bg-primary mx-auto rounded-full"></div>
        </div>
      </div>

      {/* 核心内容区域 */}
      <div className="container mx-auto max-w-4xl px-4 py-16 md:py-24">
        {/* 二维码图片 - 标题下方 */}
        {qrCodeUrl && (
          <div className="mb-12 flex justify-center">
            <div className="relative w-64 h-64 md:w-80 md:h-80 bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
              <Image
                src={qrCodeUrl}
                alt={global?.WechatQRCode?.alternativeText || "微信群二维码"}
                fill
                className="object-contain rounded-lg"
                priority
                unoptimized={process.env.NODE_ENV === "development"}
              />
            </div>
          </div>
        )}

        {/* 正文内容 - 复用之前做好的高级感 BlockRenderer */}
        <div className="prose-lg">
          <BlockRenderer content={contact.Content} />
        </div>
      </div>
    </main>
  );
}
