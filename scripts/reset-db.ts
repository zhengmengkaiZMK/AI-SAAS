/**
 * 重置数据库 Schema
 * 用法: npm run db:reset
 */

import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";
import * as path from "path";
import * as fs from "fs";

// 加载环境变量
config({ path: path.resolve(process.cwd(), ".env.local") });

const prisma = new PrismaClient();

async function resetDatabase() {
  console.log("🔄 开始重置数据库...\n");

  try {
    // 读取 SQL 文件
    const sqlPath = path.resolve(process.cwd(), "scripts/fix-schema.sql");
    const sql = fs.readFileSync(sqlPath, "utf-8");

    console.log("📝 执行 SQL 脚本...");
    
    // 分割并执行每条 SQL 语句
    const statements = sql
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith("--"));

    for (const statement of statements) {
      try {
        await prisma.$executeRawUnsafe(statement);
        console.log(`✅ 执行成功: ${statement.substring(0, 50)}...`);
      } catch (error) {
        // 忽略 "does not exist" 错误
        const errorMsg = String(error);
        if (!errorMsg.includes("does not exist")) {
          console.warn(`⚠️  警告: ${errorMsg}`);
        }
      }
    }

    console.log("\n✅ 数据库重置完成!");
    console.log("\n💡 下一步: 运行 'npm run db:push' 重新应用 schema");
  } catch (error) {
    console.error("\n❌ 重置失败:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

resetDatabase();
