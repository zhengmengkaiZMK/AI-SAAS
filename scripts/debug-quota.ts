/**
 * 配额功能调试脚本
 * 用于诊断配额更新问题
 */

import { prisma } from '@/lib/db/prisma';

async function debugQuota(userId: string) {
  console.log('=== 配额调试开始 ===\n');

  // 1. 检查用户是否存在
  console.log('1. 检查用户信息...');
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      membershipType: true,
    },
  });

  if (!user) {
    console.error('❌ 用户不存在:', userId);
    return;
  }

  console.log('✓ 用户信息:', user);
  console.log('');

  // 2. 检查今日配额
  console.log('2. 检查今日配额...');
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  
  console.log('今日日期（UTC）:', today.toISOString());
  console.log('');

  let todayQuota = await prisma.userQuota.findUnique({
    where: {
      unique_user_date: {
        userId,
        date: today,
      },
    },
  });

  if (!todayQuota) {
    console.log('⚠️  今日配额不存在，创建中...');
    todayQuota = await prisma.userQuota.create({
      data: {
        userId,
        date: today,
        searchesUsed: 0,
        messagesUsed: 0,
        searchesLimit: 5,
        messagesLimit: 10,
      },
    });
    console.log('✓ 配额已创建:', todayQuota);
  } else {
    console.log('✓ 今日配额:', todayQuota);
  }
  console.log('');

  // 3. 测试配额更新
  console.log('3. 测试配额更新（增加1次）...');
  const beforeUpdate = todayQuota.searchesUsed;
  
  const updated = await prisma.userQuota.update({
    where: { id: todayQuota.id },
    data: { searchesUsed: { increment: 1 } },
  });

  console.log('更新前:', beforeUpdate);
  console.log('更新后:', updated.searchesUsed);
  console.log('');

  // 4. 查询所有历史配额
  console.log('4. 查询该用户所有配额记录...');
  const allQuotas = await prisma.userQuota.findMany({
    where: { userId },
    orderBy: { date: 'desc' },
    take: 10,
  });

  console.log(`共 ${allQuotas.length} 条记录:`);
  allQuotas.forEach((q, i) => {
    console.log(`  ${i + 1}. 日期: ${q.date.toISOString().split('T')[0]}, 已用: ${q.searchesUsed}/${q.searchesLimit}`);
  });
  console.log('');

  // 5. 检查数据库连接
  console.log('5. 检查数据库连接...');
  try {
    await prisma.$queryRaw`SELECT NOW() as current_time`;
    console.log('✓ 数据库连接正常');
  } catch (error) {
    console.error('❌ 数据库连接失败:', error);
  }
  console.log('');

  console.log('=== 调试完成 ===');
}

// 导出函数
export { debugQuota };

// 如果直接运行此脚本
if (require.main === module) {
  const userId = process.argv[2];
  
  if (!userId) {
    console.error('用法: ts-node scripts/debug-quota.ts <userId>');
    process.exit(1);
  }

  debugQuota(userId)
    .then(() => {
      console.log('\n✅ 脚本执行成功');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ 脚本执行失败:', error);
      process.exit(1);
    });
}
