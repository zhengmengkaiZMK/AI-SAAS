# 会员更新流程文档

## 概述

本文档说明用户购买会员后,系统如何自动更新数据库和前端显示的会员状态。

---

## 完整流程

### 1. 用户发起支付

**触发点**: 用户在Pricing页面点击"Buy Now"按钮

**组件**: `components/pricing-with-payment.tsx`

**流程**:
1. 用户选择方案 (Hobby/Starter/Professional)
2. 选择计费周期 (Monthly/Yearly)
3. 点击"Buy Now"打开支付弹窗
4. 弹窗显示PayPal支付按钮

---

### 2. 创建PayPal订单

**API**: `POST /api/payment/create-order`

**文件**: `app/api/payment/create-order/route.ts`

**请求体**:
```json
{
  "planId": "STARTER_MONTHLY"
}
```

**流程**:
1. 验证用户登录状态
2. 根据`planId`获取方案详情
3. 调用PayPal API创建订单
4. 返回`orderID`给前端

**响应**:
```json
{
  "orderID": "8VF19123XX456YZ"
}
```

---

### 3. 用户完成PayPal支付

**组件**: `components/payment/paypal-button.tsx`

**流程**:
1. PayPal SDK弹出支付窗口
2. 用户在PayPal完成支付
3. PayPal SDK触发`onApprove`回调

---

### 4. 捕获支付并更新会员

**API**: `POST /api/payment/capture-order`

**文件**: `app/api/payment/capture-order/route.ts`

**请求体**:
```json
{
  "orderID": "8VF19123XX456YZ"
}
```

**关键流程 (数据库事务)**:

```typescript
await prisma.$transaction(async (tx) => {
  // 1. 创建支付记录
  const payment = await tx.payment.create({
    data: {
      userId,
      provider: "PAYPAL",
      providerOrderId: orderID,
      providerPaymentId: captureID,
      amount,
      currency,
      planId: plan.id,
      status: "COMPLETED",
      completedAt: new Date(),
    },
  });

  // 2. 更新用户会员状态
  const user = await tx.user.update({
    where: { id: userId },
    data: {
      membershipType: plan.membershipType,  // FREE/PREMIUM/ENTERPRISE
      membershipExpiresAt: expiresAt,        // 到期时间
    },
  });

  // 3. 更新用户配额
  await tx.userQuota.upsert({
    where: { unique_user_date: { userId, date: today } },
    update: {
      searchesLimit: quotaLimits.searches,
      messagesLimit: quotaLimits.messages,
    },
    create: { /* ... */ },
  });

  return { payment, user };
});
```

**响应**:
```json
{
  "success": true,
  "paymentId": "uuid-xxx",
  "membershipType": "PREMIUM",
  "expiresAt": "2026-01-23T00:00:00.000Z"
}
```

---

### 5. 刷新用户Session

**API**: `GET /api/user/refresh-session`

**文件**: `app/api/user/refresh-session/route.ts`

**流程**:
1. 从数据库读取最新的用户信息
2. 返回更新后的`membershipType`和`membershipExpiresAt`

**响应**:
```json
{
  "success": true,
  "user": {
    "id": "uuid-xxx",
    "email": "user@example.com",
    "name": "User Name",
    "membershipType": "PREMIUM",
    "membershipExpiresAt": "2026-01-23T00:00:00.000Z"
  }
}
```

---

### 6. 前端跳转到成功页面

**页面**: `/payment/success?paymentId=xxx`

**文件**: `app/(marketing)/payment/success/page.tsx`

**流程**:
1. 从URL获取`paymentId`
2. 调用`/api/payment/status/${paymentId}`获取支付详情
3. 调用`/api/user/refresh-session`获取最新会员信息
4. 显示支付成功界面和会员徽章
5. 提示用户刷新页面查看最新状态

---

## Session更新机制

### NextAuth JWT Callback增强

**文件**: `lib/auth.ts`

```typescript
callbacks: {
  async jwt({ token, user, trigger }) {
    // 用户首次登录时保存基本信息
    if (user) {
      token.id = user.id;
      token.membershipType = user.membershipType;
    }
    
    // 当触发更新时或每次会话时,从数据库获取最新的membershipType
    if (trigger === "update" || !user) {
      const dbUser = await prisma.user.findUnique({
        where: { id: token.id },
        select: { membershipType: true, membershipExpiresAt: true },
      });
      
      if (dbUser) {
        token.membershipType = dbUser.membershipType;
        token.membershipExpiresAt = dbUser.membershipExpiresAt;
      }
    }
    
    return token;
  },
}
```

**说明**:
- `trigger === "update"`: 当调用`update()`方法时触发
- `!user`: 表示非首次登录,每次验证session时都会从数据库刷新

---

## 前端显示会员状态的位置

### 1. 导航栏 - UserNav组件

**文件**: `components/user-nav.tsx`

**显示内容**:
- Premium徽章 (紫色-粉色渐变)
- Enterprise徽章 (黄色-橙色渐变)

**数据来源**:
```typescript
const { data: session } = useSession();
const membershipType = session?.user?.membershipType;
```

---

### 2. Dashboard - 用户信息卡片

**文件**: `components/dashboard/user-info-card.tsx`

**显示内容**:
- 用户姓名
- 会员类型标签
- 邮箱地址

**数据来源**:
```typescript
const dashboardData = await fetch("/api/user/dashboard");
const user = dashboardData.user;
```

---

### 3. Dashboard - 会员卡片

**文件**: `components/dashboard/membership-card.tsx`

**显示内容**:
- 当前方案名称
- 到期时间
- 升级提示 (FREE用户)

**数据来源**:
```typescript
props.membershipType // 从父组件传递
```

---

### 4. 配额显示

**文件**: `components/dashboard/quota-card.tsx`

**显示内容**:
- 每日搜索配额
- 每日消息配额
- 进度条

**配额规则**:
```typescript
function getQuotaLimits(membershipType: string) {
  switch (membershipType) {
    case "PREMIUM":
      return { searches: 100, messages: 500 };
    case "ENTERPRISE":
      return { searches: 1000, messages: 5000 };
    default: // FREE
      return { searches: 3, messages: 10 };
  }
}
```

---

## 数据库Schema

### Users表

```prisma
model User {
  id                  String         @id @default(dbgenerated("gen_random_uuid()"))
  email               String         @unique
  
  // 会员信息
  membershipType      MembershipType @default(FREE)
  membershipExpiresAt DateTime?
  
  // 关联
  payments            Payment[]
  quotas              UserQuota[]
}

enum MembershipType {
  FREE
  PREMIUM
  ENTERPRISE
}
```

### Payments表

```prisma
model Payment {
  id                String          @id
  userId            String
  
  provider          PaymentProvider @default(PAYPAL)
  providerOrderId   String          @unique
  providerPaymentId String?         @unique
  
  amount            Decimal
  currency          String          @default("USD")
  planId            String
  
  status            PaymentStatus   @default(PENDING)
  completedAt       DateTime?
  
  user              User            @relation(...)
}

enum PaymentStatus {
  PENDING
  COMPLETED
  FAILED
  REFUNDED
  CANCELLED
}
```

---

## 方案映射

### 价格方案定义

**文件**: `constants/pricing-plans.ts`

| Plan ID              | Tier         | Billing | Amount | MembershipType | Duration |
|---------------------|--------------|---------|--------|----------------|----------|
| HOBBY_MONTHLY       | HOBBY        | MONTHLY | $4     | FREE           | 30 days  |
| HOBBY_YEARLY        | HOBBY        | YEARLY  | $30    | FREE           | 365 days |
| STARTER_MONTHLY     | STARTER      | MONTHLY | $8     | PREMIUM        | 30 days  |
| STARTER_YEARLY      | STARTER      | YEARLY  | $60    | PREMIUM        | 365 days |
| PROFESSIONAL_MONTHLY| PROFESSIONAL | MONTHLY | $12    | PREMIUM        | 30 days  |
| PROFESSIONAL_YEARLY | PROFESSIONAL | YEARLY  | $100   | PREMIUM        | 365 days |

---

## 测试流程

### 1. 准备环境

```bash
# 1. 启动数据库
npm run db:studio

# 2. 启动开发服务器
npm run dev
```

### 2. 测试支付

1. 访问 http://localhost:3000/pricing
2. 登录账号 (或注册新账号)
3. 选择Starter Monthly ($8)
4. 点击"Buy Now"
5. 使用PayPal沙箱测试账号支付
6. 验证支付成功页面显示

### 3. 验证数据更新

**检查数据库**:
```sql
-- 查看支付记录
SELECT * FROM payments WHERE user_id = 'xxx' ORDER BY created_at DESC LIMIT 1;

-- 查看用户会员状态
SELECT id, email, membership_type, membership_expires_at 
FROM users WHERE id = 'xxx';

-- 查看配额更新
SELECT * FROM user_quotas WHERE user_id = 'xxx' ORDER BY date DESC LIMIT 1;
```

**检查前端显示**:
1. 导航栏是否显示Premium徽章
2. Dashboard是否显示正确的会员类型
3. 配额是否更新为Premium限制

---

## 常见问题

### Q1: 支付成功但前端未更新会员状态?

**原因**: Session未刷新

**解决**:
1. 支付成功后使用`window.location.href`强制刷新页面
2. 或调用`/api/user/refresh-session`并更新session

---

### Q2: 如何查看用户的支付历史?

**API**: `GET /api/payment/history`

**实现**:
```typescript
const payments = await prisma.payment.findMany({
  where: { userId: session.user.id },
  orderBy: { createdAt: 'desc' },
  include: { user: { select: { email: true } } },
});
```

---

### Q3: 会员到期后如何处理?

**方案1**: Cron任务自动降级
```typescript
// scripts/expire-memberships.ts
const expiredUsers = await prisma.user.updateMany({
  where: {
    membershipExpiresAt: { lt: new Date() },
    membershipType: { not: "FREE" },
  },
  data: {
    membershipType: "FREE",
  },
});
```

**方案2**: 运行时检查
```typescript
// middleware or API
if (user.membershipExpiresAt < new Date()) {
  await prisma.user.update({
    where: { id: user.id },
    data: { membershipType: "FREE" },
  });
}
```

---

## 安全注意事项

### 1. 幂等性检查

在`capture-order`中已实现:
```typescript
const existingPayment = await prisma.payment.findUnique({
  where: { providerOrderId: orderID },
});

if (existingPayment && existingPayment.status === "COMPLETED") {
  return NextResponse.json({ /* 已处理 */ });
}
```

### 2. 金额验证

**重要**: 不要完全信任前端传递的金额,应从配置文件读取:
```typescript
const plan = getPlanById(planId);
if (Math.abs(plan.amount - capturedAmount) > 0.01) {
  throw new Error("Amount mismatch");
}
```

### 3. 用户身份验证

所有支付API必须验证:
```typescript
const session = await getServerSession(authOptions);
if (!session?.user?.id) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
```

---

## 总结

支付成功后,系统通过以下步骤自动更新会员状态:

1. ✅ **数据库更新**: `users.membershipType` + `users.membershipExpiresAt`
2. ✅ **配额更新**: `user_quotas` 表更新限制
3. ✅ **Session刷新**: JWT token中的`membershipType`实时更新
4. ✅ **前端显示**: 所有组件自动从session读取最新状态

用户支付后,刷新页面即可看到会员徽章和升级后的配额。
