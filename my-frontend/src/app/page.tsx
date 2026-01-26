import { fetchAPI } from "@/lib/api";
import { Article } from "@/types";
import Link from "next/link";
// import Hero from "@/components/Home/Hero"; // 轮播图已屏蔽
import Features from "@/components/Home/Features";
import ArticleCard from "@/components/UI/ArticleCard";

export default async function Home() {
  // 1. 获取文章列表（轮播图已屏蔽）
  // 使用 try-catch 处理 API 错误，避免页面崩溃
  let articles = null;
  try {
    const allArticles = await fetchAPI("/articles?sort=publishedAt:desc&pagination[limit]=3&populate=*");
    // 确保只显示最新的3条
    articles = allArticles ? allArticles.slice(0, 3) : null;
  } catch (error) {
    console.error('获取文章列表失败:', error);
    // 如果 API 失败，articles 保持为 null，页面会显示空状态
  }

  return (
    <main className="min-h-screen bg-off-white">
      {/* ==================== 1. 轮播图区域 (Hero) - 已屏蔽 ==================== */}
      {/* {slides && slides.length > 0 ? (
        <Hero slides={slides} />
      ) : (
        <div className="h-[400px] bg-secondary flex items-center justify-center text-white">
          <p>请在 Strapi 后台配置 HeroSlide 数据</p>
        </div>
      )} */}

      {/* ==================== 2. 功能入口区域 (Features) ==================== */}
      <Features />

      {/* ==================== 3. 我们的动态区域 (Our Updates) ==================== */}
      <section className="container mx-auto px-4 py-section">
        
        {/* 标题栏 */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4 border-b border-gray-200 pb-4 max-w-5xl mx-auto">
          <div className="text-center md:text-left w-full md:w-auto">
            <h2 className="text-3xl md:text-4xl font-black text-secondary tracking-tight">
              我们的动态
            </h2>
            <div className="h-1.5 w-24 bg-primary mx-auto md:mx-0 mt-3 rounded-full"></div>
          </div>
          
          <Link 
            href="/news"
            className="hidden md:block text-sm font-bold text-secondary hover:text-primary uppercase tracking-widest transition-colors mb-2"
          >
            全部  →
          </Link>
        </div>

        {/* 新闻列表  列表容器：这里改成了竖向排列 (flex-col)，增加间距 */}
        <div className="flex flex-col gap-8 max-w-5xl mx-auto">
          {articles && articles.length > 0 ? (
            articles.map((article: Article) => (
              <ArticleCard key={article.id} article={article} />
            ))
          ) : (
            // 空状态提示
            <div className="py-20 text-center bg-surface rounded-card border border-dashed border-gray-300">
              <p className="text-gray-400 text-lg">
                暂无文章数据
                <br/>
                <span className="text-sm text-red-400 mt-2 inline-block">
                  请检查 Strapi 后台文章是否已发布 (Published)
                </span>
              </p>
            </div>
          )}
        </div>

        {/* 移动端显示的"查看更多"按钮 */}
        <div className="mt-12 text-center md:hidden max-w-5xl mx-auto">
            <Link 
              href="/news"
              className="block px-8 py-3 border-2 border-navy text-navy font-bold rounded-full hover:bg-navy hover:text-white hover:-translate-y-0.5 transition-all w-full focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 text-center"
            >
                VIEW ALL STORIES
            </Link>
        </div>
      </section>
    </main>
  );
}