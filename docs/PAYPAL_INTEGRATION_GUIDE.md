# PayPal支付集成指南

## 📋 概述

本文档介绍如何在AI-SaaS项目中集成PayPal支付功能。

## 🔑 前置要求

### 1. 创建PayPal开发者账号

1. 访问 [PayPal Developer](https://developer.paypal.com/)
2. 使用PayPal账号登录或注册
3. 进入Dashboard

### 2. 创建沙箱应用

1. 导航到 **Apps & Credentials**
2. 选择 **Sandbox** 标签
3. 点击 **Create App**
4. 填写应用名称（如：AI-SaaS Payment）
5. 点击 **Create App**

### 3. 获取API凭证

创建应用后，你将获得：
- **Client ID**: 公开密钥，用于前端
- **Secret**: 私密密钥，仅用于后端

**重要**：Secret绝不能暴露在前端代码中！

### 4. 创建沙箱测试账号

PayPal会自动为你创建两个测试账号：
- **Business账号**（商家）：用于接收付款
- **Personal账号**（买家）：用于测试购买

可在 **Sandbox > Accounts** 查看测试账号的邮箱和密码。

---

## ⚙️ 环境配置

### 1. 添加环境变量

在 `.env.local` 文件中添加：

```env
# PayPal配置
PAYPAL_MODE=sandbox                           # 沙箱模式：sandbox，生产模式：live
PAYPAL_CLIENT_ID=你的_SANDBOX_CLIENT_ID        # 从PayPal Developer获取
PAYPAL_CLIENT_SECRET=你的_SANDBOX_CLIENT_SECRET # 从PayPal Developer获取

# PayPal Webhook Secret (可选，用于验证回调)
PAYPAL_WEBHOOK_ID=你的_WEBHOOK_ID

# 应用URL（用于支付回调）
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. 生产环境配置

切换到生产环境时：
1. 在PayPal Developer切换到 **Live** 标签
2. 创建Live应用
3. 获取Live凭证
4. 修改环境变量：
   ```env
   PAYPAL_MODE=live
   PAYPAL_CLIENT_ID=你的_LIVE_CLIENT_ID
   PAYPAL_CLIENT_SECRET=你的_LIVE_CLIENT_SECRET
   ```

---

## 💳 价格方案配置

当前支持的价格方案（定义在 `constants/tier.tsx`）：

| 方案 | 月付 | 年付 | 会员等级 |
|------|------|------|----------|
| Hobby | $4 | $30 | FREE |
| Starter | $8 | $60 | PREMIUM |
| Professional | $12 | $100 | PREMIUM |
| Enterprise | 联系客服 | 联系客服 | ENTERPRISE |

---

## 🔄 支付流程

### 用户支付流程

```
1. 用户点击"Buy Now" 
   ↓
2. 前端调用 /api/payment/create-order
   ↓
3. 后端创建PayPal订单，返回orderID
   ↓
4. 前端弹出PayPal支付窗口
   ↓
5. 用户在PayPal完成支付
   ↓
6. PayPal返回支付成功回调
   ↓
7. 前端调用 /api/payment/capture-order
   ↓
8. 后端捕获支付，更新数据库
   ↓
9. 升级用户会员等级
   ↓
10. 重定向到成功页面
```

### 数据库更新流程

支付成功后：
1. 在 `payments` 表创建支付记录
2. 更新 `users` 表的 `membershipType` 和 `membershipExpiresAt`
3. 更新用户配额限制

---

## 🧪 测试指南

### 沙箱测试流程

1. 启动开发服务器：`npm run dev`
2. 访问定价页面：`http://localhost:3000/pricing`
3. 点击任意方案的"Buy Now"
4. 使用PayPal沙箱买家账号登录
5. 完成支付流程

### 沙箱测试账号

在 [PayPal Sandbox Accounts](https://developer.paypal.com/dashboard/accounts) 查看：
- **买家账号**：用于测试购买
- **商家账号**：用于接收款项

### 测试卡号

PayPal沙箱支持测试信用卡：
- Visa: `4111 1111 1111 1111`
- MasterCard: `5555 5555 5555 4444`
- 过期日期：任意未来日期
- CVV：任意3位数字

---

## 🚨 常见问题

### 1. 支付按钮不显示
- 检查 `NEXT_PUBLIC_PAYPAL_CLIENT_ID` 是否正确配置
- 打开浏览器控制台查看错误信息

### 2. 支付失败
- 确认使用沙箱测试账号登录
- 检查后端日志 `/api/payment/capture-order`

### 3. 会员状态未更新
- 检查数据库 `payments` 表的 `status` 字段
- 查看后端日志确认是否成功执行会员升级

### 4. Webhook未触发
- 确认Webhook URL配置正确
- PayPal沙箱可能有延迟，耐心等待或手动调用capture API

---

## 📚 API文档

### POST /api/payment/create-order

创建PayPal订单

**请求体：**
```json
{
  "planId": "PREMIUM_MONTHLY",
  "billingCycle": "MONTHLY"
}
```

**响应：**
```json
{
  "orderID": "8XY12345ABC67890"
}
```

### POST /api/payment/capture-order

捕获支付并完成订单

**请求体：**
```json
{
  "orderID": "8XY12345ABC67890"
}
```

**响应：**
```json
{
  "success": true,
  "paymentId": "uuid",
  "membershipType": "PREMIUM",
  "expiresAt": "2026-01-23T00:00:00.000Z"
}
```

---

## 🔐 安全最佳实践

1. ✅ **Secret密钥仅存储在后端**
2. ✅ **使用环境变量管理凭证**
3. ✅ **验证PayPal回调签名**（Webhook）
4. ✅ **检查支付金额是否匹配**
5. ✅ **记录所有支付事件日志**
6. ✅ **实现幂等性检查**（防止重复支付）

---

## 📞 支持

如有问题，请参考：
- [PayPal REST API文档](https://developer.paypal.com/docs/api/overview/)
- [PayPal SDK文档](https://www.npmjs.com/package/@paypal/checkout-server-sdk)
- 项目Issue追踪
