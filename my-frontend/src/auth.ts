import NextAuth from 'next-auth';
import { db } from '@/lib/db';
import { authConfig } from './auth.config';

/**
 * NextAuth 主配置文件
 * 这里导出 auth 实例和 handlers
 * 注意：使用 JWT 策略，不需要 PrismaAdapter
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  // 使用 JWT 策略，不需要 adapter
  session: {
    strategy: 'jwt', // 使用 JWT 策略（无状态）
  },
  secret: process.env.AUTH_SECRET, // 确保设置了 AUTH_SECRET
  trustHost: true, // 信任主机（用于开发环境）
});
