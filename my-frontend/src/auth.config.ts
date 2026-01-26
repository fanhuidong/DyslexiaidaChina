import type { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

/**
 * NextAuth 配置
 * 这里定义认证提供者和基本配置
 */
export const authConfig = {
  pages: {
    signIn: '/login', // 自定义登录页面路径
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      
      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // 重定向到登录页
      } else if (isLoggedIn && (nextUrl.pathname.startsWith('/login') || nextUrl.pathname.startsWith('/register'))) {
        return Response.redirect(new URL('/', nextUrl));
      }
      return true;
    },
    async jwt({ token, user }) {
      // 将用户信息添加到 token
      if (user) {
        token.id = user.id;
        token.phone = (user as any).phone;
        token.role = (user as any).role || 'USER';
      }
      return token;
    },
    async session({ session, token }) {
      // 将 token 中的信息添加到 session
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.phone = token.phone as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        phone: { label: 'Phone', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.password) {
          return null;
        }

        try {
          // 从数据库查找用户（使用手机号）
          const user = await db.user.findUnique({
            where: {
              phone: credentials.phone as string,
            },
          });

          if (!user || !user.password) {
            return null;
          }

          // 使用 bcrypt 比对密码
          const isPasswordValid = await bcrypt.compare(
            credentials.password as string,
            user.password
          );

          if (!isPasswordValid) {
            return null;
          }

          // 返回用户信息（这些信息会被添加到 session）
          return {
            id: user.id,
            phone: user.phone,
            name: user.nickname,
            image: user.avatar,
            role: user.role,
          };
        } catch (error) {
          console.error('❌ [Auth] 登录错误:', error);
          return null;
        }
      },
    }),
  ],
} satisfies NextAuthConfig;
