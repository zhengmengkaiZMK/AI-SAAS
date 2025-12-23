# PayPal支付集成 - 快速上手指南

## ✅ 已完成的工作

我已经为你创建了完整的PayPal支付系统，包括：

### 📁 文件结构
```
lib/payment/
  └── paypal-config.ts              # PayPal SDK配置

types/
  └── payment.ts                     # 支付类型定义

constants/
  └── pricing-plans.ts               # 价格方案配置

app/api/payment/
  ├── create-order/route.ts          # 创建订单API
  ├── capture-order/route.ts         # 捕获支付API
  └── status/[paymentId]/route.ts    # 支付状态查询API

components/payment/
  └── paypal-button.tsx              # PayPal按钮组件

components/
  └── pricing-with-payment.tsx       # 带支付的定价组件

app/(marketing)/payment/
  ├── success/page.tsx               # 支付成功页面
  ├── cancelled/page.tsx             # 支付取消页面
  └── error/page.tsx                 # 支付失败页面

docs/
  ├── PAYPAL_INTEGRATION_GUIDE.md    # 完整集成指南
  └── PAYPAL_SETUP_STEPS.md          # 本文档
```

---

## 🚀 下一步操作

### 步骤1：获取PayPal凭证

1. **访问PayPal开发者平台**
   - 打开 https://developer.paypal.com/
   - 使用你的PayPal账号登录

2. **创建沙箱应用**
   - 点击 `Apps & Credentials`
   - 选择 `Sandbox` 标签
   - 点击 `Create App` 按钮
   - 输入应用名称：`AI-SaaS Payment`
   - 点击 `Create App`

3. **复制API凭证**
   - 复制 **Client ID**
   - 点击 `Show` 查看 **Secret**，并复制

### 步骤2：配置环境变量

在项目根目录创建 `.env.local` 文件（如果还没有）：

```bash
# 复制以下内容到 .env.local
PAYPAL_MODE=sandbox
PAYPAL_CLIENT_ID=你的_CLIENT_ID
PAYPAL_CLIENT_SECRET=你的_CLIENT_SECRET
NEXT_PUBLIC_PAYPAL_CLIENT_ID=你的_CLIENT_ID
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**重要**：
- `PAYPAL_CLIENT_ID` 和 `PAYPAL_CLIENT_SECRET` 用于后端
- `NEXT_PUBLIC_PAYPAL_CLIENT_ID` 用于前端PayPal按钮
- 两者的值相同

### 步骤3：安装依赖

```bash
npm install @paypal/checkout-server-sdk
```

### 步骤4：更新Pricing页面

有两种方式集成支付：

#### 方式A：替换现有Pricing组件

修改 `app/(marketing)/pricing/page.tsx`：

```tsx
import { PricingWithPayment } from "@/components/pricing-with-payment";

export default function PricingPage() {
  return (
    <div className="py-20 px-4">
      <h1 className="text-4xl font-bold text-center mb-12">
        Pricing Plans
      </h1>
      <PricingWithPayment />
    </div>
  );
}
```

#### 方式B：在现有页面中添加支付功能

保留现有UI，只在需要支付的地方引入 `<PayPalButton>` 组件。

### 步骤5：启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000/pricing

---

## 🧪 测试支付流程

### 1. 获取测试账号

在PayPal Developer Dashboard：
- 导航到 `Sandbox > Accounts`
- 查看自动生成的测试账号：
  - **Business账号**（商家）
  - **Personal账号**（买家）
- 点击账号旁的 `···` 查看密码

### 2. 测试步骤

1. 在定价页面点击任意方案的"Buy Now"
2. PayPal支付窗口弹出
3. 使用 **Personal测试账号** 登录
4. 完成支付
5. 系统自动跳转到成功页面
6. 检查用户Dashboard，会员状态应已更新

### 3. 测试卡号

PayPal沙箱支持测试信用卡（如果未登录PayPal账号）：
- **Visa**: 4111 1111 1111 1111
- **MasterCard**: 5555 5555 5555 4444
- **过期日期**: 任意未来日期
- **CVV**: 任意3位数字

---

## 📊 查看支付记录

### 在PayPal Dashboard查看
1. 登录 https://developer.paypal.com/
2. 切换到 `Sandbox Accounts`
3. 点击 **Business账号** 的邮箱
4. 查看交易历史

### 在你的数据库查看
```sql
SELECT * FROM payments ORDER BY created_at DESC LIMIT 10;
```

---

## 🔧 常见问题排查

### 问题1：PayPal按钮不显示

**原因**：
- 环境变量未配置
- Client ID错误

**解决**：
1. 检查 `.env.local` 是否存在
2. 确认 `NEXT_PUBLIC_PAYPAL_CLIENT_ID` 已设置
3. 重启开发服务器：`npm run dev`
4. 打开浏览器控制台查看错误

### 问题2：支付后会员状态未更新

**检查**：
1. 打开浏览器Network标签
2. 查看 `/api/payment/capture-order` 请求
3. 检查响应是否包含错误
4. 查看服务器终端日志

**常见原因**：
- 数据库连接问题
- Prisma Schema未同步：运行 `npx prisma db push`

### 问题3：支付成功但跳转失败

**检查**：
- 确认 `NEXT_PUBLIC_APP_URL` 已设置
- 检查支付成功页面路由：`/payment/success`

---

## 🌐 切换到生产环境

### 1. 创建Live应用

1. 在PayPal Developer Dashboard
2. 切换到 **Live** 标签
3. 创建新应用
4. 获取Live凭证

### 2. 更新环境变量

```env
PAYPAL_MODE=live
PAYPAL_CLIENT_ID=你的_LIVE_CLIENT_ID
PAYPAL_CLIENT_SECRET=你的_LIVE_CLIENT_SECRET
NEXT_PUBLIC_PAYPAL_CLIENT_ID=你的_LIVE_CLIENT_ID
```

### 3. 验证Webhook（推荐）

1. 在PayPal Dashboard创建Webhook
2. URL设置为：`https://your-domain.com/api/payment/webhook`
3. 选择事件：`PAYMENT.CAPTURE.COMPLETED`
4. 复制Webhook ID到环境变量

---

## 📞 需要帮助？

如果遇到问题：
1. 查看完整文档：`docs/PAYPAL_INTEGRATION_GUIDE.md`
2. 检查PayPal官方文档：https://developer.paypal.com/docs/
3. 查看项目日志和错误信息

---

## ✨ 下一步优化建议

1. **添加Webhook**：实现服务器端支付验证
2. **订阅模式**：使用PayPal订阅API实现自动续费
3. **多币种支持**：支持其他货币
4. **发票系统**：自动生成支付发票
5. **退款功能**：添加退款API

祝支付集成顺利！🎉
