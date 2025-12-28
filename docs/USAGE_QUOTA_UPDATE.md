# 使用配额功能更新说明

## 概述

本次更新实现了三个核心业务逻辑：

1. **未登录用户限制**：使用 3 次后提示注册
2. **已登录用户配额**：每天限制 5 次搜索（从原来的 3 次提升）
3. **超限自动跳转**：引导用户注册或升级会员

## 功能详情

### 1. 未登录用户（游客模式）

- **限制次数**：3 次搜索
- **跟踪方式**：使用 `localStorage` 本地存储
- **重置机制**：每天凌晨自动重置（基于日期字符串）
- **超限处理**：提示用户注册，跳转至 `/signup` 或 `/zh/signup`

**提示文案**：
- 中文：`"您已达到免费使用限制（3次）。立即注册登录后每天可使用5次！"`
- 英文：`"You've reached the free usage limit (3 searches). Sign up now for 5 searches per day!"`

### 2. 已登录免费用户

- **限制次数**：5 次搜索/天
- **跟踪方式**：数据库 `user_quotas` 表
- **重置机制**：每天凌晨自动重置（数据库按日期分组）
- **超限处理**：提示用户升级会员，跳转至 `/pricing` 或 `/zh/pricing`

**提示文案**：
- 中文：`"您已达到今日搜索限制（5次）。立即升级会员以解锁无限搜索？"`
- 英文：`"You've reached your daily search limit (5 searches). Upgrade now for unlimited searches?"`

### 3. Premium 会员

- **限制次数**：无限制
- **配额检查**：跳过检查，直接允许使用

## 技术实现

### 文件变更清单

#### 新增文件

1. **`lib/usage-tracker.ts`** - 游客使用次数跟踪服务
   - `getGuestUsageCount()` - 获取当前使用次数
   - `incrementGuestUsage()` - 增加使用次数
   - `hasGuestQuota()` - 检查是否还有配额
   - `getRemainingGuestQuota()` - 获取剩余次数
   - `clearGuestUsage()` - 清除记录（用户登录后）

2. **`scripts/update-quota-limits.sql`** - 数据库迁移脚本
   - 更新现有用户配额从 3 次改为 5 次

#### 修改文件

1. **`app/api/pain-points/analyze/route.ts`**
   - 添加用户认证检查
   - 游客模式：检查 3 次限制
   - 已登录用户：检查数据库配额
   - Premium 用户：跳过检查
   - 返回配额超限错误（403）

2. **`components/pain-point-search.tsx`**
   - 集成 `useSession` 和 `useRouter`
   - 调用 `usage-tracker` 服务
   - 前端预检查配额
   - 处理 API 配额错误并跳转
   - 显示剩余次数 UI

3. **`prisma/schema.prisma`**
   - 更新 `searchesLimit` 默认值：`3 -> 5`

4. **配额显示相关文件**
   - `app/api/user/dashboard/route.ts` - Dashboard API
   - `components/dashboard/quota-card.tsx` - 配额卡片
   - `components/dashboard/membership-card.tsx` - 会员卡片
   - `app/api/payment/capture-order/route.ts` - 支付回调

5. **定价页面相关文件**
   - `constants/pricing-plans.ts` - 定价方案配置
   - `constants/tier.tsx` - Tier 配置
   - `components/pricing-with-payment.tsx` - 定价组件
   - `components/grid-features.tsx` - 特性网格
   - `app/(marketing)/pricing/pricing-table.tsx` - 定价表格

### 数据库迁移

运行以下命令更新数据库 schema：

```bash
# 1. 生成 Prisma Client
npx prisma generate

# 2. 推送 schema 变更到数据库
npx prisma db push

# 3. （可选）运行 SQL 脚本更新现有数据
# 在 Supabase SQL Editor 中执行 scripts/update-quota-limits.sql
```

### API 响应变更

**配额超限错误响应**：

```json
{
  "error": "GUEST_QUOTA_EXCEEDED" | "QUOTA_EXCEEDED",
  "message": "错误提示文案",
  "redirectTo": "/signup" | "/pricing",
  "quota": {
    "used": 5,
    "limit": 5
  }
}
```

**HTTP 状态码**：`403 Forbidden`

## UI 展示

### 游客模式提示

在搜索框上方显示：
```
免费试用剩余 X 次搜索 （注册后每日5次）
X free searches remaining (5/day after signup)
```

### Dashboard 配额卡片

显示内容：
- 已使用次数 / 总限制
- 进度条（颜色根据百分比变化）
- 剩余次数或升级按钮

### 会员权益对比

| 特性 | 免费版 | 专业版 |
|------|--------|--------|
| 每日搜索 | 5 次 | 无限 |
| 平台支持 | Reddit & X | 全平台 |
| 痛点数量 | 10 条 | 20 条 |
| AI 深度分析 | ❌ | ✅ |
| 数据导出 | ❌ | ✅ |

## 配额重置机制

### 游客模式（LocalStorage）

- **重置时间**：每天凌晨 00:00（本地时区）
- **判断逻辑**：比较存储的日期字符串（YYYY-MM-DD）
- **实现方式**：每次读取时自动检查并重置

```typescript
function shouldReset(lastReset: string): boolean {
  return lastReset !== getTodayDateString();
}
```

### 已登录用户（数据库）

- **重置时间**：每天凌晨 00:00 UTC
- **判断逻辑**：`UserQuota.date` 字段按日期分组
- **实现方式**：
  - 每次请求时查询或创建当天配额记录
  - 旧日期记录保留用于统计

```typescript
const today = new Date();
today.setUTCHours(0, 0, 0, 0);

let todayQuota = await prisma.userQuota.findUnique({
  where: {
    unique_user_date: { userId, date: today }
  }
});

if (!todayQuota) {
  // 创建新记录，自动重置
}
```

## 测试清单

### 游客模式测试

- [ ] 第 1-3 次搜索正常
- [ ] 第 4 次搜索弹出注册提示
- [ ] 点击确定跳转至注册页面
- [ ] 点击取消停留当前页面
- [ ] 配额提示显示正确剩余次数
- [ ] 跨天后配额自动重置

### 已登录用户测试

- [ ] 免费用户第 1-5 次搜索正常
- [ ] 免费用户第 6 次搜索弹出升级提示
- [ ] 点击确定跳转至定价页面
- [ ] Dashboard 正确显示配额信息
- [ ] Premium 用户无限制搜索
- [ ] 跨天后配额自动重置

### 中英文测试

- [ ] 中文路径 `/zh/*` 显示中文提示
- [ ] 英文路径显示英文提示
- [ ] 跳转路径带正确语言前缀

## 注意事项

### 低耦合设计

1. **独立的跟踪服务**：`usage-tracker.ts` 完全独立，不依赖其他业务逻辑
2. **API 层配额检查**：在 API 路由中统一处理，不影响其他功能
3. **前端预检查**：提升用户体验，避免不必要的 API 请求
4. **错误码标准化**：使用 `GUEST_QUOTA_EXCEEDED` 和 `QUOTA_EXCEEDED` 区分场景

### 数据一致性

- 游客模式和已登录模式使用不同的存储机制
- 用户登录后可选择性清除游客记录：`clearGuestUsage()`
- 数据库配额按日期独立记录，支持历史统计

### 性能优化

- 游客模式：纯客户端操作，无数据库请求
- 已登录用户：单次数据库查询（带索引优化）
- Premium 用户：跳过配额检查，减少数据库压力

## 未来扩展

1. **灵活的配额配置**
   - 支持管理员动态调整配额
   - 不同地区不同限制

2. **配额购买**
   - 一次性购买额外配额包
   - 不改变会员类型

3. **配额分享**
   - 团队配额池
   - 配额转赠功能

4. **统计分析**
   - 用户配额使用趋势
   - 转化率分析（游客 -> 注册 -> 付费）
