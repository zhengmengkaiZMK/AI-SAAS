import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";
import * as path from "path";

config({ path: path.resolve(process.cwd(), ".env.local") });

const prisma = new PrismaClient();

async function dropViews() {
  console.log("🗑️  删除所有视图...\n");

  try {
    await prisma.$executeRawUnsafe(`DROP VIEW IF EXISTS user_stats CASCADE`);
    console.log("✅ user_stats 视图已删除");

    await prisma.$executeRawUnsafe(`
      SELECT 'DROP VIEW IF EXISTS "' || table_name || '" CASCADE;'
      FROM information_schema.views
      WHERE table_schema = 'public';
    `);

    console.log("\n✅ 所有视图已删除");
  } catch (error) {
    console.error("❌ 错误:", error);
  } finally {
    await prisma.$disconnect();
  }
}

dropViews();
