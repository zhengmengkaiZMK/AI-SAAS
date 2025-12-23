#!/usr/bin/env tsx

/**
 * 数据库连接测试脚本
 * 运行: npm run test:db
 */

// 加载环境变量
import { config } from 'dotenv';
import { resolve } from 'path';

// 优先加载 .env.local
config({ path: resolve(process.cwd(), '.env.local') });
// 然后加载 .env
config({ path: resolve(process.cwd(), '.env') });

import { prisma, testDatabaseConnection } from '../lib/db/prisma';

async function main() {
  console.log('🔍 Testing database connection...\n');
  
  // 测试连接
  const connected = await testDatabaseConnection();
  
  if (!connected) {
    console.error('❌ Failed to connect to database');
    process.exit(1);
  }
  
  console.log('');
  
  // 查询统计
  console.log('📊 Database Statistics:');
  console.log('━'.repeat(50));
  
  const userCount = await prisma.user.count();
  const quotaCount = await prisma.userQuota.count();
  const paymentCount = await prisma.payment.count();
  const searchCount = await prisma.searchHistory.count();
  const chatCount = await prisma.chatHistory.count();
  
  console.log(`   Users:          ${userCount}`);
  console.log(`   User Quotas:    ${quotaCount}`);
  console.log(`   Payments:       ${paymentCount}`);
  console.log(`   Search History: ${searchCount}`);
  console.log(`   Chat History:   ${chatCount}`);
  console.log('━'.repeat(50));
  
  // 查询测试用户
  console.log('\n👤 Test Users:');
  console.log('━'.repeat(50));
  
  const users = await prisma.user.findMany({
    include: {
      quotas: true,
      _count: {
        select: {
          payments: true,
          searchHistory: true,
          chatHistory: true,
        },
      },
    },
    take: 5,
  });
  
  for (const user of users) {
    console.log(`\n   📧 ${user.email}`);
    console.log(`      Name: ${user.name || 'N/A'}`);
    console.log(`      Membership: ${user.membershipType}`);
    console.log(`      Active: ${user.isActive ? '✅' : '❌'}`);
    console.log(`      Created: ${user.createdAt.toISOString()}`);
    console.log(`      Quotas: ${user.quotas.length}`);
    console.log(`      Payments: ${user._count.payments}`);
    console.log(`      Searches: ${user._count.searchHistory}`);
    console.log(`      Messages: ${user._count.chatHistory}`);
    
    // 显示今日配额
    if (user.quotas.length > 0) {
      const todayQuota = user.quotas[0];
      console.log(`      Today's Quota:`);
      console.log(`        - Searches: ${todayQuota.searchesUsed}/${todayQuota.searchesLimit}`);
      console.log(`        - Messages: ${todayQuota.messagesUsed}/${todayQuota.messagesLimit}`);
    }
  }
  
  console.log('\n' + '━'.repeat(50));
  console.log('✅ Database test completed successfully!');
}

main()
  .catch((error) => {
    console.error('\n❌ Error:', error.message);
    console.error('\n💡 Troubleshooting:');
    console.error('   1. Check if DATABASE_URL is set in .env.local');
    console.error('   2. Verify database password is correct');
    console.error('   3. Ensure Supabase project is running');
    console.error('   4. Check network connection\n');
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
