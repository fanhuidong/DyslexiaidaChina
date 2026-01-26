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
    error: '/login', // 错误页面也重定向到登录页
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
        token.name = (user as any).name; // 用户名（nickname）
        token.role = (user as any).role || 'USER';
      }
      return token;
    },
    async session({ session, token }) {
      // 将 token 中的信息添加到 session
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.phone = token.phone as string;
        session.user.name = token.name as string; // 用户名（nickname）
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  providers: [
    // 账号密码登录
    Credentials({
      id: 'credentials',
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
    // 手机验证码登录
    Credentials({
      id: 'verification-code',
      name: 'VerificationCode',
      credentials: {
        phone: { label: 'Phone', type: 'text' },
        code: { label: 'Code', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.code) {
          return null;
        }

        try {
          // 验证手机号格式
          const phoneRegex = /^1[3-9]\d{9}$/;
          if (!phoneRegex.test(credentials.phone as string)) {
            return null;
          }

          // 验证验证码格式（6位数字）
          const codeRegex = /^\d{6}$/;
          if (!codeRegex.test(credentials.code as string)) {
            return null;
          }

          // 查找验证码记录
          const codeRecord = await db.verificationCode.findFirst({
            where: {
              phone: credentials.phone as string,
              code: credentials.code as string,
              type: 'LOGIN',
              expiresAt: {
                gt: new Date(), // 未过期
              },
            },
            orderBy: {
              createdAt: 'desc',
            },
          });

          if (!codeRecord) {
            return null;
          }

          // 查找用户
          const user = await db.user.findUnique({
            where: {
              phone: credentials.phone as string,
            },
          });

          if (!user) {
            return null;
          }

          // 验证码验证成功后，删除已使用的验证码（可选，也可以保留用于审计）
          // await db.verificationCode.delete({
          //   where: { id: codeRecord.id },
          // });

          // 返回用户信息
          return {
            id: user.id,
            phone: user.phone,
            name: user.nickname,
            image: user.avatar,
            role: user.role,
          };
        } catch (error) {
          console.error('❌ [Auth] 验证码登录错误:', error);
          return null;
        }
      },
    }),
  ],
} satisfies NextAuthConfig;
