import { fetchAPI } from "@/lib/api";
import { Article } from "@/types";
import SquareArticleCard from "@/components/UI/SquareArticleCard";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

// 定义页面配置的类型
interface NewsPageConfig {
  id: number;
  documentId: string;
  Title: string;
  Subtitle: string;
}

export default async function NewsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const currentPage = parseInt(params.page || '1', 10);
  const pageSize = 12; // 每页显示12个正方形卡片

  // 并行获取：页面配置 + 文章列表
  let pageConfig: NewsPageConfig | null = null;
  let articles: Article[] = [];
  let totalPages = 1;
  let total = 0;

  // 获取页面配置
  try {
    pageConfig = await fetchAPI("/news-page-config", { populate: "*" }) as NewsPageConfig | null;
  } catch (error) {
    console.error('获取页面配置失败:', error);
  }

  // 使用配置或默认值
  const pageTitle = pageConfig?.Title || "我们的动态";
  const pageSubtitle = pageConfig?.Subtitle || "了解我们的最新动态和重要资讯";

  try {
    // 直接调用 API 获取完整响应（包括分页信息）
    const { getStrapiURL } = await import('@/lib/api');
    const { API_URL, isDevelopment } = await import('@/config/env');
    
    const queryString = new URLSearchParams({
      'sort': 'publishedAt:desc',
      'populate': '*',
      'pagination[page]': currentPage.toString(),
      'pagination[pageSize]': pageSize.toString(),
    }).toString();

    const apiUrl = getStrapiURL(`/api/articles?${queryString}`);

    const response = await fetch(apiUrl, {
      cache: 'no-store',
      next: { revalidate: 0 },
    });

    if (response.ok) {
      const data = await response.json();
      
      // Strapi v4 返回格式：{ data: [...], meta: { pagination: {...} } }
      if (data.data) {
        articles = Array.isArray(data.data) ? data.data : [];
        
        if (data.meta?.pagination) {
          totalPages = data.meta.pagination.pageCount || 1;
          total = data.meta.pagination.total || 0;
        } else {
          // 如果没有分页信息，根据当前页数据估算
          if (articles.length === pageSize) {
            // 如果返回的数据等于 pageSize，可能还有更多页面
            totalPages = currentPage + 1; // 至少还有一页
            total = articles.length * totalPages;
          } else {
            totalPages = currentPage;
            total = articles.length;
          }
        }
      }
    } else {
      console.error('获取文章列表失败:', response.status, response.statusText);
    }
  } catch (error) {
    console.error('获取文章列表失败:', error);
    // 如果直接调用失败，尝试使用 fetchAPI
    try {
      const response = await fetchAPI("/articles", {
        sort: 'publishedAt:desc',
        populate: '*',
        'pagination[page]': currentPage,
        'pagination[pageSize]': pageSize,
      });
      
      if (response && Array.isArray(response)) {
        articles = response;
        // 根据返回数量估算分页
        if (articles.length === pageSize) {
          totalPages = currentPage + 1;
          total = articles.length * totalPages;
        } else {
          totalPages = currentPage;
          total = articles.length;
        }
      }
    } catch (e) {
      console.error('使用 fetchAPI 也失败:', e);
    }
  }

  return (
    <main className="min-h-screen bg-off-white">
      {/* 头部区域 */}
      <div className="bg-gradient-to-br from-primary via-primary-dark to-primary/90 text-white py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
              {pageTitle}
            </h1>
            <div className="h-1.5 w-24 bg-white/30 mx-auto rounded-full mb-6"></div>
            <p className="text-white/90 text-lg">
              {pageSubtitle}
            </p>
          </div>
        </div>
      </div>

      {/* 内容区域 */}
      <section className="container mx-auto px-4 py-12 md:py-16">
        {articles.length > 0 ? (
          <>
            {/* 文章网格 - 响应式布局 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
              {articles.map((article: Article) => (
                <SquareArticleCard key={article.id} article={article} />
              ))}
            </div>

            {/* 分页控件 */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                {/* 上一页按钮 */}
                <Link
                  href={currentPage > 1 ? `/news?page=${currentPage - 1}` : '#'}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                    currentPage > 1
                      ? 'bg-surface text-secondary hover:bg-primary hover:text-white border-2 border-gray-200 hover:border-primary'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed border-2 border-gray-200'
                  }`}
                  aria-disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                  上一页
                </Link>

                {/* 页码显示 */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                    let pageNum: number;
                    
                    // 智能显示页码
                    if (totalPages <= 7) {
                      pageNum = i + 1;
                    } else if (currentPage <= 4) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 3) {
                      pageNum = totalPages - 6 + i;
                    } else {
                      pageNum = currentPage - 3 + i;
                    }

                    return (
                      <Link
                        key={pageNum}
                        href={`/news?page=${pageNum}`}
                        className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                          pageNum === currentPage
                            ? 'bg-primary text-white'
                            : 'bg-surface text-secondary hover:bg-primary/10 border-2 border-gray-200 hover:border-primary'
                        }`}
                      >
                        {pageNum}
                      </Link>
                    );
                  })}
                </div>

                {/* 下一页按钮 */}
                <Link
                  href={currentPage < totalPages ? `/news?page=${currentPage + 1}` : '#'}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                    currentPage < totalPages
                      ? 'bg-surface text-secondary hover:bg-primary hover:text-white border-2 border-gray-200 hover:border-primary'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed border-2 border-gray-200'
                  }`}
                  aria-disabled={currentPage === totalPages}
                >
                  下一页
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            )}

            {/* 分页信息 */}
            <div className="text-center mt-6 text-gray-500 text-sm">
              第 {currentPage} 页，共 {totalPages} 页
              {total > 0 && `（共 ${total} 条动态）`}
            </div>
          </>
        ) : (
          // 空状态
          <div className="py-20 text-center bg-surface rounded-card border border-dashed border-gray-300">
            <p className="text-gray-400 text-lg">
              暂无动态数据
              <br/>
              <span className="text-sm text-red-400 mt-2 inline-block">
                请检查 Strapi 后台文章是否已发布 (Published)
              </span>
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
