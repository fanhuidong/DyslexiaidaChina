/**
 * 全局环境配置
 * 统一管理开发环境和生产环境的前后端地址
 * 
 * 核心变量：isDevelopment
 * - true  = 开发版（使用本地前后端）
 * - false = 生产版（使用线上前后端）
 */

// ==================== 核心环境变量 ====================
/**
 * 是否为开发环境
 * true  = 开发版（本地前后端）
 * false = 生产版（线上前后端）
 */
export const isDevelopment = process.env.NODE_ENV === "development";

// ==================== 后端配置 ====================
// 开发版：本地后端 http://localhost:8888
// 生产版：线上后端 http://43.135.124.98:1337
export const API_URL = isDevelopment
  ? process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:8888"
  : process.env.NEXT_PUBLIC_STRAPI_URL || "http://43.135.124.98:1337";

export const BACKEND_HOSTNAME = isDevelopment ? "localhost" : "43.135.124.98";
export const BACKEND_PORT = isDevelopment ? "8888" : "1337";

// ==================== 前端配置 ====================
// 开发版：本地前端 http://localhost:3000
// 生产版：线上前端（通过环境变量配置）
export const FRONTEND_URL = isDevelopment
  ? process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000"
  : process.env.NEXT_PUBLIC_FRONTEND_URL || "https://dyslexiaidachinav1.vercel.app/";

// ==================== 其他配置 ====================
export const DATABASE_URL = process.env.DATABASE_URL || "";
export const AUTH_SECRET = process.env.AUTH_SECRET || "";
export const AUTH_URL = process.env.AUTH_URL || FRONTEND_URL;
