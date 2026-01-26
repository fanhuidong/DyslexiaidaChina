import { handlers } from '@/auth';

/**
 * NextAuth API 路由处理器
 * 这个文件处理所有 /api/auth/* 的请求
 * 
 * NextAuth v5 在 App Router 中的标准配置
 */
export const { GET, POST } = handlers;

// 确保路由是动态的
export const dynamic = 'force-dynamic';
