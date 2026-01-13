// src/types/index.ts

// 1. 新增：定义 Category (分类) 的结构
export interface Category {
  id: number;
  documentId: string;
  Name: string;
  Slug: string;
  Description?: string;
}

// 2. 新增：定义 HeroSlide (轮播图) 的结构
export interface HeroSlide {
  id: number;
  documentId: string;
  Headline: string;
  SubHeadline: string;
  LinkUrl: string;
  Image: {
    url: string;
    alternativeText: string;
  };
}

// 3. 修改：Article 结构，补上 Category 字段
export interface Article {
  id: number;
  documentId: string;
  Title: string;
  Description: string;
  Content: any; // 如果你用了 Blocks，这里可以是 BlocksContent
  Slug: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  
  // 图片对象 (Strapi 返回的结构)
  Cover: {
    url: string;
    alternativeText: string;
    width: number;
    height: number;
  };

  // 👇 关键修改：加上这个字段！
  // 这里的 ? 表示这个字段可能是空的 (比如有的文章没选分类)
  Category?: Category; 
}

// 1. 通用图片/文件接口 (Strapi 返回的标准格式)
export interface StrapiMedia {
  id: number;
  url: string;
  alternativeText?: string;
  width?: number;
  height?: number;
  size: number; // 文件大小 (KB)
  ext: string;  // 后缀名 (如 .pdf)
}

// 2. Fact Sheet (情况说明书) 类型定义
export interface FactSheet {
  id: number;
  documentId: string;
  Title: string;
  Description: string;
  Category?: string; // 可选字段
  // 关联的缩略图 (可选)
  Thumbnail: StrapiMedia | null;
  // 关联的 PDF 文件 (必须有)
  Document: StrapiMedia | null;
  publishedAt: string;
}

// 3. Success Story (成功案例) 类型定义
export interface SuccessStory {
  id: number;
  Name: string;   // 姓名
  Title: string;  // 头衔
  Summary: string; // 摘要
  Slug: string;    // URL 标识
  Photo: StrapiMedia | null; // 头像
  StoryContent?: any; // 富文本内容 (可选，列表页可能不返回)
}