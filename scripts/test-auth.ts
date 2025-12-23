/**
 * 测试认证功能
 * 用法: npx tsx scripts/test-auth.ts
 */

import "dotenv/config";

const BASE_URL = "http://localhost:3001";

// 生成随机测试用户
const testUser = {
  name: "测试用户" + Date.now(),
  email: `test${Date.now()}@example.com`,
  password: "test123456",
};

async function testSignup() {
  console.log("\n🔍 测试注册功能...");
  console.log("测试用户:", {
    name: testUser.name,
    email: testUser.email,
  });

  try {
    const response = await fetch(`${BASE_URL}/api/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testUser),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ 注册失败:", data.error);
      return false;
    }

    console.log("✅ 注册成功!");
    console.log("用户信息:", data.user);
    return true;
  } catch (error) {
    console.error("❌ 注册请求失败:", error);
    return false;
  }
}

async function testLogin() {
  console.log("\n🔍 测试登录功能...");
  console.log("登录凭证:", {
    email: testUser.email,
    password: "******",
  });

  try {
    const response = await fetch(`${BASE_URL}/api/auth/callback/credentials`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password,
        callbackUrl: "/",
        json: true,
      }),
    });

    const data = await response.json();

    if (response.ok && data.url) {
      console.log("✅ 登录成功!");
      return true;
    } else {
      console.error("❌ 登录失败:", data);
      return false;
    }
  } catch (error) {
    console.error("❌ 登录请求失败:", error);
    return false;
  }
}

async function testExistingUsers() {
  console.log("\n🔍 测试已有用户登录...");

  const existingUsers = [
    { email: "test@example.com", password: "password123" },
    { email: "premium@example.com", password: "password123" },
  ];

  for (const user of existingUsers) {
    console.log(`\n尝试登录: ${user.email}`);
    try {
      const response = await fetch(`${BASE_URL}/api/auth/callback/credentials`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: user.email,
          password: user.password,
          callbackUrl: "/",
          json: true,
        }),
      });

      const data = await response.json();

      if (response.ok && data.url) {
        console.log(`✅ ${user.email} 登录成功!`);
      } else {
        console.log(`❌ ${user.email} 登录失败:`, data);
      }
    } catch (error) {
      console.error(`❌ ${user.email} 登录请求失败:`, error);
    }
  }
}

// 主测试流程
async function runTests() {
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🧪 开始认证功能测试");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  // 测试注册
  const signupSuccess = await testSignup();

  // 如果注册成功，测试登录
  if (signupSuccess) {
    await new Promise((resolve) => setTimeout(resolve, 1000)); // 等待1秒
    await testLogin();
  }

  // 测试已有用户
  await testExistingUsers();

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("✅ 测试完成!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  console.log("💡 提示:");
  console.log("1. 打开 http://localhost:3001/login 测试前端登录");
  console.log("2. 打开 http://localhost:3001/signup 测试前端注册");
  console.log("3. 使用测试账号:");
  console.log("   - test@example.com / password123 (免费用户)");
  console.log("   - premium@example.com / password123 (高级会员)");
  console.log(`   - ${testUser.email} / ${testUser.password} (新注册用户)\n`);
}

runTests().catch(console.error);
