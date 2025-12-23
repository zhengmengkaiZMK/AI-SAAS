#!/usr/bin/env tsx

import { config } from 'dotenv';
import { resolve } from 'path';
import { Client } from 'pg';

config({ path: resolve(process.cwd(), '.env.local') });

console.log('🔍 使用 pg 库直接测试连接...\n');

const connectionString = process.env.DATABASE_URL;
console.log(`连接字符串: ${connectionString?.substring(0, 50)}...\n`);

const client = new Client({
  connectionString,
  ssl: {
    rejectUnauthorized: false, // Supabase 需要这个
  },
  connectionTimeoutMillis: 10000,
});

async function test() {
  try {
    console.log('正在连接...');
    await client.connect();
    console.log('✅ 连接成功！\n');
    
    console.log('执行测试查询...');
    const result = await client.query('SELECT version()');
    console.log('✅ 查询成功！');
    console.log(`PostgreSQL 版本: ${result.rows[0].version}\n`);
    
    // 测试表是否存在
    const tableCheck = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log('📋 数据库中的表:');
    if (tableCheck.rows.length === 0) {
      console.log('   ⚠️  没有找到表！请执行 SQL 脚本创建表。\n');
    } else {
      tableCheck.rows.forEach(row => {
        console.log(`   - ${row.table_name}`);
      });
    }
    
  } catch (error: any) {
    console.error('\n❌ 连接失败:');
    console.error(`   错误: ${error.message}`);
    console.error(`   代码: ${error.code || 'N/A'}`);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 连接被拒绝。可能的原因:');
      console.log('   - Supabase 项目已暂停');
      console.log('   - 网络问题');
    } else if (error.code === 'ENOTFOUND') {
      console.log('\n💡 无法找到主机。可能的原因:');
      console.log('   - DNS 解析失败');
      console.log('   - 项目 ID 错误');
      console.log('   - 需要 VPN');
    } else if (error.message.includes('password')) {
      console.log('\n💡 密码认证失败。请检查:');
      console.log('   - 密码是否正确');
      console.log('   - 连接字符串格式');
    }
  } finally {
    await client.end();
  }
}

test();
