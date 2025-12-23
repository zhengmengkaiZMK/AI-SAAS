/**
 * Prisma 客户端单例
 * 在开发环境中防止热重载导致的多个实例
 */

import { PrismaClient } from '@prisma/client';

// 扩展全局类型
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// 创建Prisma客户端实例
export const prisma = global.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'error', 'warn'] 
    : ['error'],
});

// 在开发环境中，将实例保存到全局变量
// 这样热重载时不会创建新的连接
if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

/**
 * 优雅关闭数据库连接
 */
export async function disconnectPrisma() {
  await prisma.$disconnect();
}

/**
 * 测试数据库连接
 */
export async function testDatabaseConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}
