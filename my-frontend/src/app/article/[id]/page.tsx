import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchAPI, getStrapiMedia } from "@/lib/api";
import { BlocksContent } from "@strapi/blocks-react-renderer";
import BlockRenderer from "@/components/Article/BlockRenderer";

export default async function ArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const article = await fetchAPI(`/articles/${id}`, { populate: "*" });

  if (!article) {
    notFound();
  }

  const imageUrl = getStrapiMedia(article.Cover?.url);

  return (
    <article className="min-h-screen bg-white">
      {/* 顶部导航 */}
      <div className="bg-secondary text-white py-4">
        <div className="container mx-auto px-4">
          <Link href="/" className="text-sm font-bold opacity-80 hover:opacity-100 flex items-center w-fit">
            ← 返回首页
          </Link>
        </div>
      </div>

      {/* 头部信息 */}
      <header className="container mx-auto max-w-4xl px-4 py-12 md:py-16">
        {article.Category && (
          <span className="inline-block bg-primary/10 text-primary font-bold px-3 py-1 rounded-full text-sm mb-6 tracking-wide uppercase">
            {article.Category.Name}
          </span>
        )}
        
        <h1 className="text-3xl md:text-5xl font-black text-gray-900 mb-6 leading-tight">
          {article.Title}
        </h1>

        <div className="text-gray-500 font-medium">
          发布于 {new Date(article.publishedAt).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </header>

      {/* 🖼️ 封面图修改 (Target)：
          w-full md:w-1/2: 桌面端宽度减半 (50%)
          mx-auto: 居中显示
      */}
      {imageUrl && (
        <div className="container mx-auto px-4 mb-16">
          <div className="relative w-full md:w-1/2 mx-auto h-auto min-h-[300px] rounded-xl overflow-hidden shadow-xl border border-gray-100">
             {/* 使用 intrinsic 比例或者固定高度，这里保留之前的样式 */}
            <Image
              src={imageUrl}
              alt={article.Title}
              width={800} // 给一个宽高的参考值，或者继续用 fill
              height={500}
              className="w-full h-auto object-cover" // 确保图片自适应容器
              priority
            />
          </div>
        </div>
      )}

      {/* 正文内容 */}
      <div className="container mx-auto max-w-4xl pb-24 px-4 md:px-8">
        <BlockRenderer content={article.Content as BlocksContent} />
      </div>
    </article>
  );
}