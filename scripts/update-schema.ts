/**
 * 更新数据库 Schema
 * 用法: npm run db:update
 */

import { config } from "dotenv";
import { exec } from "child_process";
import { promisify } from "util";
import * as path from "path";

// 加载环境变量
config({ path: path.resolve(process.cwd(), ".env.local") });

const execAsync = promisify(exec);

async function updateSchema() {
  console.log("🔄 开始更新数据库 Schema...\n");

  try {
    // 执行 prisma db push
    console.log("📊 执行 prisma db push...");
    const { stdout, stderr } = await execAsync("npx prisma db push --accept-data-loss");

    if (stdout) console.log(stdout);
    if (stderr) console.error(stderr);

    console.log("\n✅ Schema 更新成功!");

    // 重新生成 Prisma Client
    console.log("\n🔧 重新生成 Prisma Client...");
    const generate = await execAsync("npx prisma generate");
    if (generate.stdout) console.log(generate.stdout);

    console.log("\n🎉 数据库更新完成!");
  } catch (error) {
    console.error("\n❌ 更新失败:", error);
    process.exit(1);
  }
}

updateSchema();
