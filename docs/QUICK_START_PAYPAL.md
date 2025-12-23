# 🚀 PayPal集成 - 5分钟快速启动

## 第1步：获取PayPal凭证 (2分钟)

1. 访问 https://developer.paypal.com/
2. 登录 → `Apps & Credentials` → `Sandbox` → `Create App`
3. 复制 **Client ID** 和 **Secret**

## 第2步：配置环境变量 (1分钟)

在项目根目录创建 `.env.local`：

```env
PAYPAL_MODE=sandbox
PAYPAL_CLIENT_ID=粘贴你的Client_ID
PAYPAL_CLIENT_SECRET=粘贴你的Secret
NEXT_PUBLIC_PAYPAL_CLIENT_ID=粘贴你的Client_ID
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 第3步：安装依赖 (1分钟)

```bash
npm install
```

## 第4步：启动项目 (30秒)

```bash
npm run dev
```

## 第5步：测试支付 (30秒)

1. 访问 http://localhost:3000/pricing
2. 点击"Buy Now"
3. 在PayPal窗口使用测试账号登录
4. 完成支付

**测试账号获取**：PayPal Developer → Sandbox → Accounts

---

## ✅ 完成！

支付系统已就绪。查看详细文档：
- `docs/PAYPAL_SETUP_STEPS.md` - 完整步骤
- `docs/PAYMENT_INTEGRATION_SUMMARY.md` - 功能总结
