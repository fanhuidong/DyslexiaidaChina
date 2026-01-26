import { PrismaClient } from '@prisma/client';

// 防止在开发环境中创建多个 PrismaClient 实例
// 参考: https://www.prisma.io/docs/guides/performance-and-optimization/connection-management#prevent-hot-reloading-issues

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// 在开发环境中，检查 Prisma Client 是否包含新模型
// 如果没有，强制重新创建实例
let db: PrismaClient;
if (process.env.NODE_ENV === 'development') {
  const existingPrisma = globalForPrisma.prisma;
  
  // 检查是否包含 messageBoardPost 模型
  if (existingPrisma && !('messageBoardPost' in existingPrisma)) {
    console.warn('⚠️  [Prisma] 检测到旧的 Prisma Client 实例，正在重新创建...');
    // 断开旧连接
    existingPrisma.$disconnect().catch(() => {});
    // 清除全局缓存
    globalForPrisma.prisma = undefined;
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
