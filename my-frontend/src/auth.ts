import NextAuth from 'next-auth';
import { db } from '@/lib/db';
import { authConfig } from './auth.config';

/**
 * NextAuth 主配置文件
 * 这里导出 auth 实例和 handlers
 * 注意：使用 JWT 策略，不需要 PrismaAdapter
 */
// 检查 AUTH_SECRET 是否存在
if (!process.env.AUTH_SECRET) {
  console.warn('⚠️ [NextAuth] AUTH_SECRET 环境变量未设置！请在 .env.local 文件中添加 AUTH_SECRET');
  console.warn('⚠️ [NextAuth] 生成命令: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'base64\'))"');
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  // 使用 JWT 策略，不需要 adapter
  session: {
    strategy: 'jwt', // 使用 JWT 策略（无状态）
  },
  secret: process.env.AUTH_SECRET || 'fallback-secret-key-for-development-only', // 开发环境备用密钥
  trustHost: true, // 信任主机（用于开发环境）
  // NextAuth v5 会自动处理 basePath，不需要手动设置
});
