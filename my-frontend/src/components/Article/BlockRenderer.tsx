"use client";

import React from "react";
import Link from "next/link";
import { BlocksRenderer, type BlocksContent } from "@strapi/blocks-react-renderer";
import { Quote } from "lucide-react";

const STRAPI_URL = "http://127.0.0.1:8888";

function getImageUrl(url: string) {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${STRAPI_URL}${url}`;
}

export default function BlockRenderer({ content }: { content: BlocksContent }) {
  if (!content) return null;

  return (
    <div className="text-lg md:text-xl text-gray-800 leading-relaxed tracking-wide font-normal font-serif">
      <BlocksRenderer
        content={content}
        blocks={{
          // 🖼️ 正文图片还原：改回 w-full (和文字同宽)
          image: ({ image }) => (
            <figure className="my-12 group">
              {/* w-full: 填满文字容器 */}
              <div className="relative w-full overflow-hidden rounded-xl border border-gray-100 shadow-lg bg-gray-50">
                <img
                  src={getImageUrl(image.url)}
                  alt={image.alternativeText || ""}
                  className="w-full h-auto max-h-[650px] object-cover mx-auto"
                />
              </div>
              
              {image.caption && (
                <figcaption className="mt-3 text-center">
                  <span className="inline-block text-sm text-gray-500 font-medium italic">
                    {image.caption}
                  </span>
                </figcaption>
              )}
            </figure>
          ),

          // 其他部分保持不变
          paragraph: ({ children }) => <p className="mb-8 md:mb-10 text-justify">{children}</p>,
          heading: ({ children, level }) => {
            const HeadingTag = `h${level}` as React.ElementType;
            const sizeClass = {
              1: "text-4xl md:text-5xl",
              2: "text-3xl md:text-4xl",
              3: "text-2xl md:text-3xl",
              4: "text-xl md:text-2xl",
              5: "text-lg",
              6: "text-base",
            }[level];
            return (
              <div className="mt-16 mb-6 group">
                <HeadingTag className={`${sizeClass} font-bold text-secondary tracking-tight leading-tight`}>
                  {children}
                </HeadingTag>
                {level <= 2 && <div className="h-1 w-12 bg-primary/60 rounded-full mt-4"></div>}
              </div>
            );
          },
          quote: ({ children }) => (
            <div className="relative my-16 md:mx-4">
              <Quote className="absolute -top-5 -left-4 w-10 h-10 text-primary/10 fill-current transform -scale-x-100" />
              <blockquote className="relative border-l-4 border-primary/30 pl-6 py-2 text-2xl text-secondary/80 font-serif leading-relaxed italic bg-gray-50/50 rounded-r-lg">
                {children}
              </blockquote>
            </div>
          ),
          link: ({ children, url }) => (
            <Link href={url} className="text-primary font-bold border-b border-primary/30 hover:border-primary transition-colors">
              {children}
            </Link>
          ),
          list: ({ children, format }) => {
             const Tag = format === 'ordered' ? 'ol' : 'ul';
             return <Tag className={`mb-10 pl-5 md:pl-8 space-y-2 ${format === 'ordered' ? 'list-decimal' : 'list-disc marker:text-gray-300'}`}>{children}</Tag>
          }
        }}
      />
    </div>
  );
}