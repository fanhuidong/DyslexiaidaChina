import { PrismaClient } from '@prisma/client';

// 防止在开发环境中创建多个 PrismaClient 实例
// 参考: https://www.prisma.io/docs/guides/performance-and-optimization/connection-management#prevent-hot-reloading-issues

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db;
}
