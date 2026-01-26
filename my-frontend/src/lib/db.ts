import { PrismaClient } from '@prisma/client';

// 防止在开发环境中创建多个 PrismaClient 实例
// 参考: https://www.prisma.io/docs/guides/performance-and-optimization/connection-management#prevent-hot-reloading-issues

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// 检查 DATABASE_URL 环境变量
if (!process.env.DATABASE_URL) {
  const isVercel = process.env.VERCEL === '1';
  const errorMessage = isVercel
    ? 'DATABASE_URL 环境变量未配置。请在 Vercel 控制台的 Settings → Environment Variables 中添加 DATABASE_URL。详细说明请查看 VERCEL_ENV_SETUP.md'
    : 'DATABASE_URL 环境变量未找到。请检查 .env.local 文件是否包含 DATABASE_URL 配置。';
  
  console.error('❌ [Prisma]', errorMessage);
  
  // 在生产环境中，抛出错误以快速发现问题
  if (process.env.NODE_ENV === 'production') {
    throw new Error(errorMessage);
  }
}

// 在开发环境中，检查 Prisma Client 是否包含新模型
// 如果没有，强制重新创建实例
let db: PrismaClient;
if (process.env.NODE_ENV === 'development') {
  const existingPrisma = globalForPrisma.prisma;
  
  // 检查是否包含 messageBoardPost 模型
  if (existingPrisma) {
    const hasMessageBoardPost = 'messageBoardPost' in existingPrisma;
    if (!hasMessageBoardPost) {
      console.warn('⚠️  [Prisma] 检测到旧的 Prisma Client 实例，正在重新创建...');
      // 断开旧连接（异步执行，不阻塞）
      // 使用类型断言，因为我们已经知道 existingPrisma 是 PrismaClient
      (existingPrisma as PrismaClient).$disconnect().catch(() => {
        // 忽略断开连接错误
      });
      // 清除全局缓存
      globalForPrisma.prisma = undefined;
    }
  }
  
  db = globalForPrisma.prisma ?? new PrismaClient({
    log: ['query', 'error', 'warn'],
  });
  
  globalForPrisma.prisma = db;
} else {
  db = globalForPrisma.prisma ?? new PrismaClient({
    log: ['error'],
  });
  
  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = db;
  }
}

export { db };
