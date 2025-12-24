# 定价方案迁移指南

## 📋 概述

本次更新将定价方案从 4 个套餐（Hobby、Starter、Professional、Enterprise）简化为 2 个套餐（Free、Professional）。

## ✅ 已完成的代码更改

### 1. 核心配置文件
- ✅ `types/payment.ts` - 更新 PlanTier 类型
- ✅ `constants/pricing-plans.ts` - 重新定义定价方案
- ✅ `constants/tier.tsx` - 更新套餐配置

### 2. 前端组件
- ✅ `components/pricing-with-payment.tsx` - 更新为2列布局，新定价
- ✅ `components/pricing.tsx` - 调整网格布局
- ✅ `app/(marketing)/pricing/pricing-table.tsx` - 更新功能对比表
- ✅ `components/dashboard/user-info-card.tsx` - 更新会员标签
- ✅ `components/dashboard/membership-card.tsx` - 更新权益显示
- ✅ `components/user-nav.tsx` - 更新徽章显示
- ✅ `app/(marketing)/payment/success/page.tsx` - 更新成功页面

### 3. 后端逻辑
- ✅ `app/api/payment/capture-order/route.ts` - 更新金额映射和配额限制
- ✅ `app/api/user/dashboard/route.ts` - 更新配额限制函数
- ✅ `prisma/schema.prisma` - 移除 ENTERPRISE 枚举

## 🗄️ 数据库迁移

### 重要提示
当前数据库中 **ENTERPRISE** 枚举值已被移除。如果生产环境有用户使用 ENTERPRISE 会员类型，需要先迁移数据。

### 迁移步骤

#### 选项 1: 自动迁移（推荐用于开发环境）
```bash
# 生成 Prisma 迁移
npx prisma migrate dev --name remove_enterprise_membership

# 应用迁移
npx prisma migrate deploy
```

#### 选项 2: 手动迁移（推荐用于生产环境）

**步骤 1: 检查是否有 ENTERPRISE 用户**
```sql
SELECT COUNT(*) FROM users WHERE membership_type = 'ENTERPRISE';
```

**步骤 2: 如果有 ENTERPRISE 用户，迁移到 PREMIUM**
```sql
-- 将所有 ENTERPRISE 用户迁移到 PREMIUM
UPDATE users 
SET membership_type = 'PREMIUM' 
WHERE membership_type = 'ENTERPRISE';
```

**步骤 3: 更新枚举类型**
```sql
-- 方法 A: 直接修改枚举（PostgreSQL）
ALTER TYPE "MembershipType" RENAME TO "MembershipType_old";
CREATE TYPE "MembershipType" AS ENUM ('FREE', 'PREMIUM');
ALTER TABLE users 
  ALTER COLUMN membership_type TYPE "MembershipType" 
  USING membership_type::text::"MembershipType";
DROP TYPE "MembershipType_old";

-- 方法 B: 使用 Prisma 迁移（推荐）
-- 运行 npx prisma migrate deploy
```

## 📊 新定价方案

### Free 套餐
- **价格**: $0
- **每日查询**: 3次
- **平台支持**: Reddit & X
- **痛点显示**: 10条/查询
- **其他**: 基础关键词分析，48小时邮件支持

### Professional 套餐
- **月付**: $10/月
- **年付**: $96/年（8折优惠，节省$24）
- **每日查询**: 无限次
- **平台支持**: 全平台（Reddit、X、ProductHunt、Hacker News等）
- **痛点显示**: 20条/查询
- **其他**: AI深度分析、原文链接、数据导出、查询历史、12小时优先支持

## 🔧 配额限制更新

### 代码中的配额设置
```typescript
// Free: 每日3次搜索
{ searches: 3, messages: 10 }

// Professional (PREMIUM): 无限制
{ searches: 999999, messages: 999999 }
```

## ⚠️ 注意事项

1. **数据库迁移**: 生产环境请先备份数据库
2. **用户通知**: 如有 ENTERPRISE 用户被迁移到 PREMIUM，建议发送通知邮件
3. **支付金额**: PayPal 金额映射已更新为 $10 和 $96
4. **测试**: 部署前请在开发环境充分测试支付流程

## 🚀 部署清单

- [ ] 备份生产数据库
- [ ] 检查是否有 ENTERPRISE 用户
- [ ] 运行数据库迁移
- [ ] 部署前端代码
- [ ] 部署后端代码
- [ ] 测试支付流程（使用 PayPal Sandbox）
- [ ] 验证会员权限正确显示
- [ ] 检查 Dashboard 配额显示
- [ ] 通知受影响用户（如有）

## 📝 回滚方案

如果需要回滚：

1. **还原数据库枚举**
```sql
ALTER TYPE "MembershipType" ADD VALUE 'ENTERPRISE';
```

2. **还原代码**: 使用 git 回滚到之前的提交
```bash
git revert HEAD
```

## 🔗 相关文件

- 定价配置: `constants/pricing-plans.ts`
- 数据库 Schema: `prisma/schema.prisma`
- 支付处理: `app/api/payment/capture-order/route.ts`
- 定价页面: `components/pricing-with-payment.tsx`

---

**最后更新**: 2025-12-24
