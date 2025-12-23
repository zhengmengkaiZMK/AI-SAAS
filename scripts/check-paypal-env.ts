/**
 * PayPal环境检查脚本
 * 用于验证当前PayPal配置是否正确
 */

function checkPayPalEnvironment() {
  console.log("\n🔍 检查PayPal环境配置...\n");

  const mode = process.env.PAYPAL_MODE;
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  const publicClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

  let hasError = false;

  // 检查模式
  console.log("📌 PayPal模式:");
  if (!mode) {
    console.error("   ❌ PAYPAL_MODE 未设置");
    hasError = true;
  } else if (mode === "sandbox") {
    console.log("   ✅ 沙箱环境 (Sandbox)");
    console.log("   ℹ️  使用测试账号，不会产生真实扣款");
  } else if (mode === "live") {
    console.log("   ⚠️  生产环境 (Live)");
    console.log("   ⚠️  会产生真实扣款，请谨慎测试！");
  } else {
    console.error(`   ❌ 无效的模式: ${mode} (应该是 sandbox 或 live)`);
    hasError = true;
  }

  // 检查Client ID
  console.log("\n📌 Client ID (服务端):");
  if (!clientId) {
    console.error("   ❌ PAYPAL_CLIENT_ID 未设置");
    hasError = true;
  } else {
    const isSandbox = clientId.startsWith("sb-") || clientId.startsWith("AZ");
    const isLive = clientId.startsWith("AX") || clientId.startsWith("AT");
    
    if (mode === "sandbox" && isSandbox) {
      console.log(`   ✅ 沙箱Client ID: ${clientId.substring(0, 10)}...`);
    } else if (mode === "live" && isLive) {
      console.log(`   ✅ 生产Client ID: ${clientId.substring(0, 10)}...`);
    } else if (mode === "sandbox" && !isSandbox) {
      console.error(`   ❌ 模式是sandbox，但Client ID不是沙箱密钥`);
      console.error(`   ℹ️  沙箱密钥通常以 sb- 或 AZ 开头`);
      hasError = true;
    } else if (mode === "live" && !isLive) {
      console.error(`   ❌ 模式是live，但Client ID不是生产密钥`);
      console.error(`   ℹ️  生产密钥通常以 AX 或 AT 开头`);
      hasError = true;
    }
  }

  // 检查Client Secret
  console.log("\n📌 Client Secret (服务端):");
  if (!clientSecret) {
    console.error("   ❌ PAYPAL_CLIENT_SECRET 未设置");
    hasError = true;
  } else {
    const isSandbox = clientSecret.startsWith("E");
    const isLive = clientSecret.startsWith("E");
    
    console.log(`   ✅ Secret已设置: ${clientSecret.substring(0, 5)}...`);
    
    // 检查是否与Client ID匹配
    if (mode === "sandbox") {
      console.log("   ℹ️  确保Secret来自同一个沙箱应用");
    } else if (mode === "live") {
      console.log("   ⚠️  确保Secret来自同一个生产应用");
    }
  }

  // 检查公开Client ID
  console.log("\n📌 Client ID (前端公开):");
  if (!publicClientId) {
    console.error("   ❌ NEXT_PUBLIC_PAYPAL_CLIENT_ID 未设置");
    hasError = true;
  } else if (publicClientId !== clientId) {
    console.error("   ❌ 前端Client ID与后端不一致");
    console.error(`   后端: ${clientId?.substring(0, 10)}...`);
    console.error(`   前端: ${publicClientId.substring(0, 10)}...`);
    hasError = true;
  } else {
    console.log(`   ✅ 与后端Client ID一致`);
  }

  // API Base URL
  console.log("\n📌 API Base URL:");
  const apiBase = mode === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
  console.log(`   ${mode === "live" ? "⚠️" : "✅"}  ${apiBase}`);

  // 总结
  console.log("\n" + "=".repeat(50));
  if (hasError) {
    console.error("❌ 发现配置错误，请检查上述问题");
    console.log("\n💡 提示:");
    console.log("   1. 检查 .env.local 文件");
    console.log("   2. 确保环境变量已正确设置");
    console.log("   3. 重启开发服务器使环境变量生效");
    console.log("\n📖 查看详细文档:");
    console.log("   docs/PAYPAL_PRODUCTION_SETUP.md");
    process.exit(1);
  } else {
    console.log("✅ PayPal环境配置正确");
    
    if (mode === "live") {
      console.log("\n⚠️  警告: 当前是生产环境!");
      console.log("   - 所有支付都是真实的");
      console.log("   - 会产生PayPal手续费 (2.9% + $0.30)");
      console.log("   - 建议先用$0.01测试");
    } else {
      console.log("\n✅ 沙箱环境，可以安全测试");
      console.log("   - 使用沙箱测试账号");
      console.log("   - 不会产生真实扣款");
    }
    
    console.log("\n🚀 准备就绪，可以开始测试!");
  }
  console.log("=".repeat(50) + "\n");
}

// 执行检查
checkPayPalEnvironment();
