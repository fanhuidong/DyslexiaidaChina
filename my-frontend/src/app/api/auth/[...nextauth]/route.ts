import { handlers } from '@/auth';

/**
 * NextAuth API 路由处理器
 * 这个文件处理所有 /api/auth/* 的请求
 */
export const { GET, POST } = handlers;
