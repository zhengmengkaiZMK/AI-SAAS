#!/usr/bin/env tsx

/**
 * 环境验证脚本
 * 检查所有配置是否正确
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// 加载环境变量
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

console.log('🔍 验证 Supabase 集成设置...\n');
console.log('━'.repeat(60));

// 1. 检查环境变量
console.log('\n📋 1. 环境变量检查:');
console.log('━'.repeat(60));

const requiredEnvVars = [
  'DATABASE_URL',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
];

let hasAllEnvVars = true;

for (const varName of requiredEnvVars) {
  const value = process.env[varName];
  if (value) {
    console.log(`   ✅ ${varName}: ${value.substring(0, 30)}...`);
  } else {
    console.log(`   ❌ ${varName}: 未设置`);
    hasAllEnvVars = false;
  }
}

if (!hasAllEnvVars) {
  console.log('\n⚠️  部分环境变量未设置，请检查 .env.local 文件');
}

// 2. 解析数据库 URL
console.log('\n🗄️  2. 数据库连接信息:');
console.log('━'.repeat(60));

const dbUrl = process.env.DATABASE_URL;
if (dbUrl) {
  try {
    const url = new URL(dbUrl);
    console.log(`   协议: ${url.protocol}`);
    console.log(`   主机: ${url.hostname}`);
    console.log(`   端口: ${url.port}`);
    console.log(`   数据库: ${url.pathname.substring(1)}`);
    console.log(`   用户名: ${url.username}`);
    console.log(`   密码: ${'*'.repeat(url.password.length)}`);
    
    // 提取项目 ID
    const projectIdMatch = url.hostname.match(/db\.([^.]+)\.supabase\.co/);
    if (projectIdMatch) {
      console.log(`   \n   📍 Supabase 项目 ID: ${projectIdMatch[1]}`);
      console.log(`   📍 Dashboard URL: https://supabase.com/dashboard/project/${projectIdMatch[1]}`);
    }
  } catch (error) {
    console.log(`   ❌ 无法解析 DATABASE_URL: ${error}`);
  }
} else {
  console.log('   ❌ DATABASE_URL 未设置');
}

// 3. 检查文件
console.log('\n📁 3. 项目文件检查:');
console.log('━'.repeat(60));

import { existsSync } from 'fs';

const requiredFiles = [
  { path: 'prisma/schema.prisma', name: 'Prisma Schema' },
  { path: 'lib/db/prisma.ts', name: 'Prisma 客户端' },
  { path: 'docs/supabase-schema.sql', name: 'SQL 脚本' },
  { path: '.env.local', name: '环境变量文件' },
];

let hasAllFiles = true;

for (const file of requiredFiles) {
  if (existsSync(file.path)) {
    console.log(`   ✅ ${file.name}: ${file.path}`);
  } else {
    console.log(`   ❌ ${file.name}: ${file.path} (不存在)`);
    hasAllFiles = false;
  }
}

// 4. 检查依赖
console.log('\n📦 4. 依赖包检查:');
console.log('━'.repeat(60));

const requiredPackages = [
  '@prisma/client',
  'prisma',
  'tsx',
  'dotenv',
  'bcrypt',
];

for (const pkg of requiredPackages) {
  try {
    require.resolve(pkg);
    console.log(`   ✅ ${pkg}`);
  } catch {
    console.log(`   ❌ ${pkg} (未安装)`);
  }
}

// 5. 总结
console.log('\n' + '━'.repeat(60));
console.log('\n📊 验证总结:\n');

if (hasAllEnvVars && hasAllFiles) {
  console.log('✅ 所有配置文件和环境变量已就绪！\n');
  console.log('🔴 下一步关键操作:\n');
  console.log('   1️⃣  访问 Supabase Dashboard');
  console.log('   2️⃣  在 SQL Editor 中执行 docs/supabase-schema.sql');
  console.log('   3️⃣  确认项目状态为 Active');
  console.log('   4️⃣  运行: npm run test:db\n');
  console.log('📚 详细指南: docs/INTEGRATION_RESULT.md\n');
} else {
  console.log('⚠️  部分配置缺失，请检查上述错误信息\n');
}

console.log('━'.repeat(60));
