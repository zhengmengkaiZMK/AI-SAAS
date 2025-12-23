# PayPal生产环境配置指南

## 📋 概述

从沙箱环境切换到生产环境需要修改以下内容：
1. ✅ 获取生产环境的PayPal凭证
2. ✅ 更新环境变量
3. ✅ 修改前端SDK URL
4. ✅ 测试真实支付
5. ✅ 配置Webhook（可选）

---

## 🔑 1. 获取生产环境凭证

### 步骤1: 登录PayPal生产环境

访问: https://www.paypal.com/businessmanage/account/aboutBusiness

**注意**: 这是**真实的PayPal商家账户**，不是开发者账户！

### 步骤2: 申请API访问权限

1. 登录后台 → **设置** → **API访问权限**
2. 选择 **NVP/SOAP API集成（经典版）** 或 **REST API**
3. 点击 **创建应用** (Create App)

### 步骤3: 创建REST API应用

```
应用名称: AI-SaaS Production
环境: Live (生产)
```

### 步骤4: 获取凭证

创建成功后会得到:
```
Client ID:     AXxxxxxxxxxxxxxxxxxxxxxxxxxxxx  (Live模式)
Client Secret: ELxxxxxxxxxxxxxxxxxxxxxxxxxxxx  (Live模式)
```

**⚠️ 重要**: 
- Sandbox凭证以 `sb-` 开头
- Live凭证不以 `sb-` 开头
- **绝对不要泄露Secret!**

---

## ⚙️ 2. 更新环境变量

### 修改 `.env.local` 或 `.env.production`

```bash
# ==========================================
# PayPal生产环境配置
# ==========================================

# 模式: 从 "sandbox" 改为 "live"
PAYPAL_MODE="live"

# 生产环境Client ID (服务端)
PAYPAL_CLIENT_ID="AXxxxxxxxxxxxxxxxxxxxxxxxxxx"

# 生产环境Client Secret (服务端，保密!)
PAYPAL_CLIENT_SECRET="ELxxxxxxxxxxxxxxxxxxxxxxxxxx"

# 生产环境Client ID (前端公开密钥)
NEXT_PUBLIC_PAYPAL_CLIENT_ID="AXxxxxxxxxxxxxxxxxxxxxxxxxxx"

# Webhook ID (可选，用于接收支付通知)
PAYPAL_WEBHOOK_ID="WH-xxxxxxxxxxxxx"
```

### 环境变量对比

| 环境变量 | 开发环境 (Sandbox) | 生产环境 (Live) |
|---------|-------------------|----------------|
| `PAYPAL_MODE` | `sandbox` | `live` |
| `PAYPAL_CLIENT_ID` | sb-xxx (沙箱) | AXxxx (生产) |
| `PAYPAL_CLIENT_SECRET` | 沙箱Secret | 生产Secret |
| `NEXT_PUBLIC_PAYPAL_CLIENT_ID` | sb-xxx | AXxxx |

---

## 🔄 3. 代码检查（无需修改）

我们的代码已经支持环境切换，以下是验证点：

### ✅ 后端API自动切换

**文件**: `lib/payment/paypal-config.ts`

```typescript
// 已自动根据环境变量切换
const PAYPAL_API_BASE = process.env.PAYPAL_MODE === "live"
  ? "https://api-m.paypal.com"          // 生产环境
  : "https://api-m.sandbox.paypal.com"; // 沙箱环境
```

**验证**:
- ✅ `PAYPAL_MODE=live` → 使用生产API
- ✅ `PAYPAL_MODE=sandbox` → 使用沙箱API

### ✅ 前端SDK自动加载

**文件**: `components/payment/paypal-button.tsx`

```typescript
// 前端SDK会根据Client ID自动判断环境
script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD`;
```

**PayPal SDK行为**:
- 如果`client-id`是沙箱密钥 → 自动连接沙箱
- 如果`client-id`是生产密钥 → 自动连接生产环境

---

## 🧪 4. 测试真实支付

### ⚠️ 测试前必读

**生产环境测试会产生真实扣款！** 建议步骤:

1. **使用最小金额测试** (如$0.01)
2. **立即退款** 验证退款流程
3. **确认完整流程** 后再恢复正常价格

### 测试步骤

#### Step 1: 临时降低价格

修改 `constants/pricing-plans.ts`:

```typescript
STARTER_MONTHLY: {
  amount: 0.01,  // 临时改为 $0.01 测试
  // ...
}
```

#### Step 2: 部署到生产环境

```bash
# Vercel部署
vercel --prod

# 或其他平台
npm run build
```

#### Step 3: 执行测试支付

1. 访问生产环境 `https://yourdomain.com/pricing`
2. 使用**真实PayPal账号**支付 $0.01
3. 验证以下流程:
   - ✅ PayPal弹窗正常打开
   - ✅ 登录真实PayPal账号
   - ✅ 支付成功
   - ✅ 数据库更新 `membershipType`
   - ✅ 跳转到成功页面
   - ✅ Dashboard显示Premium徽章

#### Step 4: 验证商家后台

登录 https://www.paypal.com/businessmanage/transactions

检查:
- ✅ 交易记录显示 $0.01
- ✅ 状态为 "已完成"
- ✅ 手续费计算正确

#### Step 5: 测试退款（重要）

1. 在商家后台找到刚才的交易
2. 点击 **退款** → 全额退款
3. 确认退款成功

#### Step 6: 恢复正常价格

测试通过后，将价格改回:

```typescript
STARTER_MONTHLY: {
  amount: 8.0,  // 恢复正常价格
  // ...
}
```

---

## 🔔 5. 配置Webhook（可选但推荐）

Webhook用于接收PayPal的异步通知，确保支付状态同步。

### 为什么需要Webhook?

- ✅ **即时通知**: 用户支付成功后立即收到通知
- ✅ **退款处理**: 自动处理退款和争议
- ✅ **可靠性**: 即使前端失败，后端也能收到通知

### 步骤1: 创建Webhook端点

**文件**: `app/api/webhooks/paypal/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    // 1. 获取PayPal签名
    const signature = request.headers.get("paypal-transmission-sig");
    const transmissionId = request.headers.get("paypal-transmission-id");
    const timestamp = request.headers.get("paypal-transmission-time");
    const certUrl = request.headers.get("paypal-cert-url");
    
    const body = await request.text();
    const event = JSON.parse(body);

    // 2. 验证签名（重要！防止伪造请求）
    const isValid = await verifyPayPalSignature({
      signature,
      transmissionId,
      timestamp,
      certUrl,
      webhookId: process.env.PAYPAL_WEBHOOK_ID!,
      body,
    });

    if (!isValid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // 3. 处理不同的事件类型
    switch (event.event_type) {
      case "PAYMENT.CAPTURE.COMPLETED":
        await handlePaymentCompleted(event);
        break;
      
      case "PAYMENT.CAPTURE.REFUNDED":
        await handlePaymentRefunded(event);
        break;
      
      case "PAYMENT.CAPTURE.DENIED":
        await handlePaymentDenied(event);
        break;
      
      default:
        console.log("[Webhook] Unhandled event:", event.event_type);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[Webhook] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 处理支付完成
async function handlePaymentCompleted(event: any) {
  const orderId = event.resource.supplementary_data?.related_ids?.order_id;
  
  await prisma.payment.updateMany({
    where: { providerOrderId: orderId },
    data: { status: "COMPLETED", completedAt: new Date() },
  });
  
  console.log("[Webhook] Payment completed:", orderId);
}

// 处理退款
async function handlePaymentRefunded(event: any) {
  const orderId = event.resource.supplementary_data?.related_ids?.order_id;
  
  const payment = await prisma.payment.findFirst({
    where: { providerOrderId: orderId },
    include: { user: true },
  });

  if (payment) {
    await prisma.$transaction([
      // 更新支付状态
      prisma.payment.update({
        where: { id: payment.id },
        data: { status: "REFUNDED", refundedAt: new Date() },
      }),
      // 降级会员
      prisma.user.update({
        where: { id: payment.userId },
        data: { membershipType: "FREE" },
      }),
    ]);
  }
  
  console.log("[Webhook] Payment refunded:", orderId);
}

// 处理支付拒绝
async function handlePaymentDenied(event: any) {
  const orderId = event.resource.supplementary_data?.related_ids?.order_id;
  
  await prisma.payment.updateMany({
    where: { providerOrderId: orderId },
    data: { status: "FAILED" },
  });
  
  console.log("[Webhook] Payment denied:", orderId);
}

// 验证PayPal签名
async function verifyPayPalSignature(params: {
  signature: string | null;
  transmissionId: string | null;
  timestamp: string | null;
  certUrl: string | null;
  webhookId: string;
  body: string;
}): Promise<boolean> {
  // 调用PayPal验证API
  const accessToken = await getPayPalAccessToken();
  
  const response = await fetch(
    `${process.env.PAYPAL_MODE === "live" 
      ? "https://api-m.paypal.com" 
      : "https://api-m.sandbox.paypal.com"
    }/v1/notifications/verify-webhook-signature`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        transmission_id: params.transmissionId,
        transmission_time: params.timestamp,
        cert_url: params.certUrl,
        auth_algo: "SHA256withRSA",
        transmission_sig: params.signature,
        webhook_id: params.webhookId,
        webhook_event: JSON.parse(params.body),
      }),
    }
  );

  const result = await response.json();
  return result.verification_status === "SUCCESS";
}
```

### 步骤2: 在PayPal配置Webhook

1. 登录 https://developer.paypal.com/dashboard/
2. 选择你的**生产环境应用**
3. 点击 **Webhooks** → **Add Webhook**

配置:
```
Webhook URL: https://yourdomain.com/api/webhooks/paypal
Event types:
  ✅ Payment capture completed
  ✅ Payment capture refunded
  ✅ Payment capture denied
```

4. 保存后获取 **Webhook ID**
5. 添加到 `.env.local`:
```bash
PAYPAL_WEBHOOK_ID="WH-xxxxxxxxxxxxx"
```

---

## 📊 6. 监控和日志

### 生产环境监控清单

- ✅ **PayPal交易记录**: https://www.paypal.com/businessmanage/transactions
- ✅ **数据库支付记录**: 定期检查`payments`表
- ✅ **错误日志**: 监控API错误和失败支付
- ✅ **用户反馈**: 及时处理支付问题

### 推荐监控工具

1. **Sentry** - 错误追踪
2. **Vercel Analytics** - 性能监控
3. **PayPal Reports** - 交易报告
4. **Database Monitoring** - Supabase监控

---

## 🔒 7. 安全检查清单

### 上线前必检

- [ ] ✅ 环境变量中的Secret **不要提交到Git**
- [ ] ✅ `.env.production`添加到`.gitignore`
- [ ] ✅ 验证金额匹配（前端显示 = 后端扣款）
- [ ] ✅ 启用HTTPS（PayPal要求）
- [ ] ✅ 配置CORS允许的域名
- [ ] ✅ Webhook签名验证已启用
- [ ] ✅ 数据库备份已配置
- [ ] ✅ 错误处理覆盖所有场景

### 常见安全问题

❌ **错误做法**:
```typescript
// 前端直接传递金额（可被篡改）
const amount = req.body.amount;
```

✅ **正确做法**:
```typescript
// 后端从配置文件读取金额
const plan = getPlanById(planId);
const amount = plan.amount;
```

---

## 🚀 8. 部署流程

### 完整部署步骤

```bash
# 1. 确认所有测试通过
npm run test

# 2. 构建生产版本
npm run build

# 3. 检查环境变量
echo $PAYPAL_MODE  # 应该是 "live"

# 4. 部署到Vercel
vercel --prod

# 5. 设置Vercel环境变量
vercel env add PAYPAL_MODE production
vercel env add PAYPAL_CLIENT_ID production
vercel env add PAYPAL_CLIENT_SECRET production
vercel env add NEXT_PUBLIC_PAYPAL_CLIENT_ID production

# 6. 重新部署
vercel --prod
```

### Vercel环境变量配置

在Vercel Dashboard设置:

```
Settings → Environment Variables

PAYPAL_MODE = live
PAYPAL_CLIENT_ID = AXxxxxxxxxxx (生产)
PAYPAL_CLIENT_SECRET = ELxxxxxxxxxx (生产，加密)
NEXT_PUBLIC_PAYPAL_CLIENT_ID = AXxxxxxxxxxx (生产)
PAYPAL_WEBHOOK_ID = WH-xxxxxxxxxx
```

---

## 📝 9. 环境对比表

| 配置项 | 开发环境 | 生产环境 |
|--------|---------|---------|
| **PayPal模式** | sandbox | live |
| **API Base URL** | api-m.sandbox.paypal.com | api-m.paypal.com |
| **Client ID** | sb-xxx | AXxxx |
| **测试账号** | 沙箱测试账号 | 真实PayPal账号 |
| **支付** | 虚拟支付 | 真实扣款 |
| **退款** | 虚拟退款 | 真实退款 |
| **手续费** | 无 | 2.9% + $0.30 |

---

## ❓ 常见问题

### Q1: 切换到生产环境后，PayPal按钮无法加载？

**原因**: 前端还在使用沙箱Client ID

**解决**:
```bash
# 检查环境变量
echo $NEXT_PUBLIC_PAYPAL_CLIENT_ID

# 应该以 AX 开头，而不是 sb-
# 如果不对，更新并重新部署
```

---

### Q2: 支付成功但数据库未更新？

**原因**: 服务端还在使用沙箱凭证

**解决**:
```bash
# 检查服务端环境变量
PAYPAL_MODE=live
PAYPAL_CLIENT_ID=AXxxx (不是sb-)
PAYPAL_CLIENT_SECRET=ELxxx
```

---

### Q3: 如何临时切换回沙箱环境？

**方法1**: 修改环境变量
```bash
PAYPAL_MODE=sandbox
```

**方法2**: 使用不同的环境
```bash
# .env.development (沙箱)
PAYPAL_MODE=sandbox

# .env.production (生产)
PAYPAL_MODE=live
```

---

### Q4: PayPal手续费是多少？

**标准费率** (美国):
- 国内交易: 2.9% + $0.30 per transaction
- 国际交易: 4.4% + 固定费用

**示例**:
```
用户支付: $8.00
PayPal扣除: $0.53 (2.9% + $0.30)
你收到: $7.47
```

---

## 📚 10. 相关文档

- [PayPal REST API文档](https://developer.paypal.com/api/rest/)
- [PayPal Webhooks指南](https://developer.paypal.com/api/rest/webhooks/)
- [PayPal费率说明](https://www.paypal.com/us/webapps/mpp/paypal-fees)

---

## ✅ 上线检查清单

使用以下清单确保正式发布准备就绪:

```
[ ] 已获取生产环境PayPal凭证
[ ] 已更新所有环境变量 (PAYPAL_MODE=live)
[ ] 已在Vercel/服务器上设置环境变量
[ ] 已使用$0.01测试真实支付流程
[ ] 已验证退款功能正常
[ ] 已配置Webhook（推荐）
[ ] 已验证Webhook签名
[ ] 已恢复正常价格
[ ] 已检查所有安全项
[ ] 已配置生产环境监控
[ ] 已准备客服应对支付问题
```

---

## 🎉 总结

切换到生产环境只需3步:

1. **获取生产凭证** - PayPal商家后台
2. **更新环境变量** - `PAYPAL_MODE=live`
3. **测试后部署** - 先用$0.01测试

你的代码**无需任何修改**，只需更换环境变量即可无缝切换! 🚀
