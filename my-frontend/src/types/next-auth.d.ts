import 'next-auth';
import 'next-auth/jwt';

/**
 * 扩展 NextAuth 类型定义
 * 添加自定义字段到 User 和 Session
 */
declare module 'next-auth' {
  interface User {
    id: string;
    phone: string;
    role: string;
  }

  interface Session {
    user: {
      id: string;
      phone?: string | null;
      name?: string | null;
      image?: string | null;
      role: string;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    phone: string;
    role: string;
  }
}
