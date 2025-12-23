#!/usr/bin/env tsx

/**
 * 数据库连接诊断脚本
 * 测试不同的连接参数组合
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { PrismaClient } from '@prisma/client';

config({ path: resolve(process.cwd(), '.env.local') });

console.log('🔍 数据库连接诊断工具\n');
console.log('━'.repeat(60));

const baseUrl = process.env.DATABASE_URL?.split('?')[0] || '';
console.log(`\n基础 URL: ${baseUrl}\n`);

const testConfigs = [
  {
    name: '无参数',
    url: baseUrl,
  },
  {
    name: 'SSL 必需',
    url: `${baseUrl}?sslmode=require`,
  },
  {
    name: 'SSL + 超时',
    url: `${baseUrl}?sslmode=require&connect_timeout=30`,
  },
  {
    name: 'SSL Prefer',
    url: `${baseUrl}?sslmode=prefer`,
  },
  {
    name: 'SSL Disable',
    url: `${baseUrl}?sslmode=disable`,
  },
  {
    name: 'PostgreSQL SSL',
    url: `${baseUrl}?sslmode=require&sslcert=&sslkey=&sslrootcert=`,
  },
];

async function testConnection(name: string, url: string) {
  console.log(`\n🧪 测试: ${name}`);
  console.log(`   URL: ${url.substring(0, 50)}...`);
  
  const prisma = new PrismaClient({
    datasources: {
      db: { url },
    },
    log: ['error'],
  });
  
  try {
    await prisma.$connect();
    await prisma.$queryRaw`SELECT 1 as test`;
    console.log(`   ✅ 连接成功！`);
    await prisma.$disconnect();
    return true;
  } catch (error: any) {
    console.log(`   ❌ 失败: ${error.message?.substring(0, 80) || error}`);
    await prisma.$disconnect();
    return false;
  }
}

async function main() {
  let successCount = 0;
  
  for (const config of testConfigs) {
    const success = await testConnection(config.name, config.url);
    if (success) successCount++;
    await new Promise(resolve => setTimeout(resolve, 1000)); // 等待1秒
  }
  
  console.log('\n' + '━'.repeat(60));
  console.log(`\n📊 测试结果: ${successCount}/${testConfigs.length} 成功\n`);
  
  if (successCount === 0) {
    console.log('⚠️  所有连接方式都失败了\n');
    console.log('🔍 可能的原因:');
    console.log('   1. Supabase 项目未激活或已暂停');
    console.log('   2. 密码错误');
    console.log('   3. 网络问题（防火墙/VPN）');
    console.log('   4. 项目 ID 错误\n');
    console.log('💡 建议:');
    console.log('   1. 访问 Supabase Dashboard 确认项目状态');
    console.log('   2. 在 Settings > Database 获取新的连接字符串');
    console.log('   3. 尝试使用 Session Pooler 连接（端口 6543）\n');
  }
}

main()
  .catch(console.error)
  .finally(() => process.exit(0));
