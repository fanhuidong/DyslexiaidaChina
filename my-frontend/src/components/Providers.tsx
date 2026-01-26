'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider
      // 添加错误处理，避免静默失败
      refetchInterval={0} // 禁用自动刷新，减少请求
      refetchOnWindowFocus={false} // 禁用窗口聚焦时刷新
      // 注意：NextAuth v5 不需要 basePath，它会自动检测
    >
      {children}
    </SessionProvider>
  );
}
