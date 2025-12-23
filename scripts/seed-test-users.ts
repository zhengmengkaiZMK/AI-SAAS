/**
 * 创建测试用户
 * 用法: npm run db:seed
 */

import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import * as path from "path";

config({ path: path.resolve(process.cwd(), ".env.local") });

const prisma = new PrismaClient();

async function seedTestUsers() {
  console.log("🌱 开始创建测试用户...\n");

  try {
    // 测试用户数据
    const testUsers = [
      {
        name: "测试用户",
        email: "test@example.com",
        password: "password123",
        membershipType: "FREE" as const,
      },
      {
        name: "高级会员",
        email: "premium@example.com",
        password: "password123",
        membershipType: "PREMIUM" as const,
      },
    ];

    for (const userData of testUsers) {
      // 检查用户是否已存在
      const existing = await prisma.user.findUnique({
        where: { email: userData.email },
      });

      if (existing) {
        console.log(`⏭️  ${userData.email} 已存在，跳过`);
        continue;
      }

      // 加密密码
      const passwordHash = await bcrypt.hash(userData.password, 10);

      // 创建用户
      const user = await prisma.user.create({
        data: {
          name: userData.name,
          email: userData.email,
          passwordHash,
          membershipType: userData.membershipType,
          isActive: true,
        },
      });

      console.log(`✅ 创建用户: ${user.email} (${user.membershipType})`);

      // 创建配额
      const quotaLimits =
        userData.membershipType === "PREMIUM"
          ? { searchesLimit: 100, messagesLimit: 500 }
          : { searchesLimit: 3, messagesLimit: 10 };

      await prisma.userQuota.create({
        data: {
          userId: user.id,
          searchesUsed: 0,
          messagesUsed: 0,
          ...quotaLimits,
        },
      });

      console.log(`  └─ 配额已创建\n`);
    }

    console.log("🎉 测试用户创建完成!");
  } catch (error) {
    console.error("❌ 错误:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedTestUsers();
