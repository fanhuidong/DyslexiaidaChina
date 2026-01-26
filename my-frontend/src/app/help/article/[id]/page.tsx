import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchAPI, getStrapiMedia } from "@/lib/api";
import { BlocksContent } from "@strapi/blocks-react-renderer";
import BlockRenderer from "@/components/Article/BlockRenderer";
import { HelpArticle } from "@/types";

export default async function HelpArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const article = await fetchAPI(`/help-articles/${id}`, { populate: "*" }) as HelpArticle | null;

  if (!article) {
    notFound();
  }

  const imageUrl = getStrapiMedia(article.Cover?.url);
  
  // 根据 Category 确定返回链接
  const backUrl = article.Category === 'Adult' ? '/help/adult' : 
                  article.Category === 'Teenager' ? '/help/teenager' : 
                  '/help/educator';
  const backLabel = article.Category === 'Adult' ? '成年人' : 
                    article.Category === 'Teenager' ? '青少年' : 
                    '教育者';

  return (
    <article className="min-h-screen bg-off-white">
      {/* 顶部导航 */}
      <div className="bg-secondary text-white py-4">
        <div className="container mx-auto px-4">
          <Link href={backUrl} className="text-sm font-bold opacity-80 hover:opacity-100 flex items-center w-fit">
            ← 返回{backLabel}页面
          </Link>
        </div>
      </div>

      {/* 头部信息 */}
      <header className="container mx-auto max-w-4xl px-4 py-12 md:py-16">
        <span className="inline-block bg-primary/10 text-primary font-bold px-3 py-1 rounded-full text-sm mb-6 tracking-wide uppercase">
          {backLabel}
        </span>
        
        <h1 className="text-3xl md:text-5xl font-black text-gray-900 mb-6 leading-tight">
          {article.Title}
        </h1>

        <div className="text-gray-500 font-medium">
          发布于 {new Date(article.publishedAt).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </header>

      {/* 封面图 */}
      {imageUrl && (
        <div className="container mx-auto px-4 mb-16">
          <div className="relative w-full md:w-1/2 mx-auto h-auto min-h-[300px] rounded-xl overflow-hidden shadow-xl border border-gray-100">
            <Image
              src={imageUrl}
              alt={article.Title}
              width={800}
              height={500}
              className="w-full h-auto object-cover"
              priority
            />
          </div>
        </div>
      )}

      {/* 正文内容 */}
      <div className="container mx-auto max-w-4xl pb-24 px-4 md:px-8">
        {article.Content ? (
          <BlockRenderer content={article.Content as BlocksContent} />
        ) : article.Description ? (
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {article.Description}
            </p>
          </div>
        ) : null}
      </div>
    </article>
  );
}
