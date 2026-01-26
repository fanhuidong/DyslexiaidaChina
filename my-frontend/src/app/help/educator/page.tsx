import { fetchAPI, getStrapiMedia } from "@/lib/api";
import { HelpArticle, HelpVideo } from "@/types";
import HelpArticleCard from "@/components/UI/HelpArticleCard";
import VideoCard from "@/components/UI/VideoCard";
import Image from "next/image";

export const dynamic = 'force-dynamic';

interface PageConfig {
  id: number;
  documentId: string;
  Title: string;
  Image?: {
    url: string;
    alternativeText?: string;
  };
  Description?: string;
}

export default async function HelpEducatorPage() {
  // 并行获取：页面配置 + 帮助博客列表 + 视频列表
  let pageConfig: PageConfig | null = null;
  let articles: HelpArticle[] = [];
  let videos: HelpVideo[] = [];

  // 获取页面配置
  try {
    pageConfig = await fetchAPI("/help-educator-page-config", { populate: "*" }) as PageConfig | null;
  } catch (error) {
    console.error('获取页面配置失败:', error);
  }

  // 获取帮助博客列表 - 通过 Category 筛选
  try {
    const response = await fetchAPI("/help-articles", {
      sort: 'publishedAt:desc',
      populate: '*',
      filters: {
        Category: {
          $eq: 'Educator',
        },
      },
    });

    if (response && Array.isArray(response)) {
      articles = response as HelpArticle[];
    }
  } catch (error) {
    console.error('获取帮助博客列表失败:', error);
  }

  // 获取视频列表
  try {
    const { getStrapiURL } = await import('@/lib/api');
    const queryString = new URLSearchParams({
      'sort': 'publishedAt:desc',
      'populate': '*',
      'filters[Category][$eq]': 'Educator',
    }).toString();

    const apiUrl = getStrapiURL(`/api/help-videos?${queryString}`);
    const response = await fetch(apiUrl, {
      cache: 'no-store',
      next: { revalidate: 0 },
    });

    if (response.ok) {
      const data = await response.json();
      if (data.data) {
        videos = Array.isArray(data.data) ? data.data : [];
      }
    }
  } catch (error) {
    console.error('获取视频列表失败:', error);
  }

  const pageTitle = pageConfig?.Title || "教育者";
  const pageImage = pageConfig?.Image;
  const pageDescription = pageConfig?.Description || "";

  return (
    <main className="min-h-screen bg-off-white">
      {/* 简介区域 */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-6 text-center text-secondary">
              {pageTitle}
            </h1>
            
            {pageImage && (
              <div className="relative w-full max-w-2xl mx-auto mb-8 aspect-video rounded-card overflow-hidden shadow-2xl">
                <Image
                  src={getStrapiMedia(pageImage.url) || ''}
                  alt={pageImage.alternativeText || pageTitle}
                  fill
                  className="object-cover"
                  unoptimized={process.env.NODE_ENV === "development"}
                />
              </div>
            )}
            
            {pageDescription && (
              <div className="prose prose-lg max-w-none text-center">
                <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-line">
                  {pageDescription}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 帮助博客区域 */}
      {articles.length > 0 && (
        <section className="container mx-auto px-4 py-12 md:py-16">
          <h2 className="text-3xl md:text-4xl font-black text-secondary mb-8 text-center">
            相关博客
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {articles.map((article: HelpArticle) => (
              <HelpArticleCard key={article.id} article={article} />
            ))}
          </div>
        </section>
      )}

      {/* 视频区域 */}
      {videos.length > 0 && (
        <section className="container mx-auto px-4 py-12 md:py-16">
          <h2 className="text-3xl md:text-4xl font-black text-secondary mb-8 text-center">
            相关视频
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {videos.map((video: HelpVideo) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        </section>
      )}

      {/* 空状态 */}
      {articles.length === 0 && videos.length === 0 && (
        <section className="container mx-auto px-4 py-20">
          <div className="py-20 text-center bg-surface rounded-card border border-dashed border-gray-300">
            <p className="text-gray-400 text-lg">
              暂无内容
              <br/>
              <span className="text-sm text-red-400 mt-2 inline-block">
                请检查 Strapi 后台是否已配置相关内容
              </span>
            </p>
          </div>
        </section>
      )}
    </main>
  );
}
