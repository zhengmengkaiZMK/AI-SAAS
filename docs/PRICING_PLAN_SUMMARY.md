# 定价方案说明文档

## 📋 当前定价方案

### 🆓 Free 套餐（免费版）

**价格**: $0

**功能特性**:
- ✅ 每日 3 次免费查询
- ✅ 支持 Reddit 和 X 平台
- ✅ 每次查询显示 10 条用户痛点
- ✅ 基础关键词分析
- ✅ 48小时内邮件支持

**中文描述**: "适合个人试用和探索用户洞察"  
**English**: "Perfect for individuals trying out the platform and exploring user insights."

**目标用户**: 个人试用、轻度用户

---

### 💎 Professional 套餐（专业版）⭐ 推荐

**月付**: $10/月  
**年付**: $96/年（原价 $120，8折优惠，节省 $24）

**功能特性**:
- ✅ 每日不限次数查询
- ✅ 全平台支持（Reddit、X、ProductHunt、Hacker News等）
- ✅ 每次查询显示 20 条用户痛点
- ✅ AI 驱动的深度分析和洞察
- ✅ 可直接跳转痛点原帖地址
- ✅ 支持数据导出（CSV/JSON）
- ✅ 12小时内优先邮件支持
- ✅ 保存所有查询历史

**中文描述**: "适合创业者、市场人员和研究人员，需要深度洞察和无限访问"  
**English**: "Ideal for entrepreneurs, marketers, and researchers who need deep insights and unlimited access."

**目标用户**: 专业用户、创业者、市场研究人员

---

## 🎯 功能对比表

| 功能特性 | Free 免费版 | Professional 专业版 |
|---------|------------|-------------------|
| **每日查询次数** | 3次 | 无限次 |
| **支持平台** | Reddit & X | 全平台支持 |
| **痛点显示数量** | 10条 | 20条 |
| **基础关键词分析** | ✅ | ✅ |
| **AI深度分析** | ❌ | ✅ |
| **原帖链接** | ❌ | ✅ |
| **数据导出** | ❌ | ✅ (CSV/JSON) |
| **查询历史** | ❌ | ✅ |
| **邮件支持** | 48小时 | 12小时（优先） |
| **价格** | $0 | $10/月 或 $96/年 |

---

## 💰 定价策略

### 年付优惠
- 月付价格: $10/月 × 12 = $120/年
- 年付价格: $96/年
- **节省金额**: $24/年
- **优惠折扣**: 8折（80%）

### 价格定位
- **Free**: 完全免费，吸引用户注册和试用
- **Professional**: 定价合理，面向专业用户和小团队

---

## 🔐 会员类型映射

### 数据库中的会员类型
```typescript
enum MembershipType {
  FREE      // 免费版
  PREMIUM   // 专业版（Professional）
}
```

### 前端显示
- `FREE` → "免费版" / "Free"
- `PREMIUM` → "专业版" / "Professional"

---

## 📊 配额限制

### Free 套餐
```typescript
{
  searches: 3,        // 每日3次搜索
  messages: 10,       // 每日10条消息
  painPoints: 10,     // 每次显示10条痛点
  platforms: ['reddit', 'x']  // 仅支持2个平台
}
```

### Professional 套餐
```typescript
{
  searches: 999999,   // 无限制（实际上限很高）
  messages: 999999,   // 无限制
  painPoints: 20,     // 每次显示20条痛点
  platforms: ['reddit', 'x', 'producthunt', 'hackernews', ...]  // 全平台
}
```

---

## 🎨 UI/UX 设计

### 页面布局
- **2列网格**: Free 和 Professional 并排显示
- **Featured 标记**: Professional 套餐带有推荐标记
- **对比突出**: 通过功能列表清晰对比两个套餐

### 视觉设计
- **Free**: 灰色调，简洁风格
- **Professional**: 深色/渐变背景，高级感（featured）
- **价格显示**: 年付显示原价划线，突出优惠

### 交互设计
- **Free 套餐**: 点击跳转到注册页面
- **Professional 套餐**: 点击打开 PayPal 支付弹窗
- **计费周期切换**: 月付/年付动画切换

---

## 🛠️ 技术实现

### 支付集成
- **支付平台**: PayPal
- **支付模式**: Sandbox（测试）/ Live（生产）
- **金额映射**:
  - `$10` → PROFESSIONAL_MONTHLY
  - `$96` → PROFESSIONAL_YEARLY

### 会员管理
- **注册默认**: FREE 会员
- **支付后升级**: 自动升级到 PREMIUM
- **会员到期**: 
  - Professional 月付: 30天后到期
  - Professional 年付: 365天后到期
  - Free: 永久有效

### 数据存储
```typescript
// User 表字段
{
  membershipType: 'FREE' | 'PREMIUM',
  membershipExpiresAt: Date | null
}

// Payment 表
{
  planId: 'PROFESSIONAL_MONTHLY' | 'PROFESSIONAL_YEARLY',
  amount: 10 | 96,
  status: 'COMPLETED'
}
```

---

## 📱 用户流程

### Free 用户注册流程
1. 访问网站 → 点击 "Sign Up"
2. 填写邮箱密码 → 注册成功
3. 默认获得 FREE 会员
4. 可立即使用（每日3次查询）

### 升级到 Professional 流程
1. 访问 Pricing 页面
2. 选择 Professional 套餐
3. 选择月付/年付
4. 点击 "Subscribe Now"
5. PayPal 支付弹窗打开
6. 完成支付
7. 自动跳转到成功页面
8. 会员权限实时生效

### Dashboard 显示
- 显示当前会员类型徽章
- 显示剩余配额（Free用户）
- 显示会员到期时间（Professional用户）
- "升级会员"按钮（Free用户）

---

## 🌐 多语言支持

### 中文
- 免费版 / 专业版
- 每日3次免费查询 / 每日不限次数查询
- 支持 Reddit 和 X 平台 / 全平台支持
- 立即订阅 / 开始使用

### English
- Free / Professional
- 3 searches per day / Unlimited searches per day
- Reddit & X platform support / All platforms support
- Subscribe Now / Get Started

---

## 🔄 与旧方案对比

### 旧方案（已废弃）
- Hobby ($4/月, $30/年)
- Starter ($8/月, $60/年)
- Professional ($12/月, $100/年)
- Enterprise (Contact Us)

### 新方案（当前）
- Free ($0)
- Professional ($10/月, $96/年)

### 变更理由
1. **简化选择**: 减少决策疲劳，只有免费和付费两个选项
2. **更清晰定位**: Free 吸引试用，Professional 满足专业需求
3. **更优价格**: $10/月 比旧的 Starter 和 Professional 都更具竞争力
4. **功能聚焦**: 专注于核心价值（用户痛点分析）

---

## 📈 定价建议

### 当前定价优势
✅ 低门槛: Free 套餐吸引用户  
✅ 高性价比: $10/月 对标竞品有优势  
✅ 年付激励: 8折优惠鼓励长期订阅  
✅ 明确升级路径: Free → Professional

### 未来优化方向
- 考虑添加团队套餐（5-10人）
- 考虑添加 API 访问权限（开发者）
- 根据数据优化定价策略

---

**文档版本**: 1.0  
**最后更新**: 2025-12-24  
**维护者**: AI-SaaS Team
