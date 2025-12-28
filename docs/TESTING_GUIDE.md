# 配额功能测试指南

## 快速测试流程

### 1. 测试游客模式（未登录）

#### 步骤 1: 清除本地存储
在浏览器控制台执行：
```javascript
localStorage.removeItem('pain_point_guest_usage')
```

#### 步骤 2: 执行搜索
1. 打开首页（未登录状态）
2. 在搜索框输入任意关键词，如 "Notion"
3. 点击 "Find Pain Points" 按钮
4. 重复 3 次

**预期结果**：
- 搜索框上方显示 "免费试用剩余 X 次搜索"
- 第 1 次：剩余 2 次
- 第 2 次：剩余 1 次（显示提示：注册后每日5次）
- 第 3 次：剩余 0 次

#### 步骤 3: 测试限制
第 4 次搜索时：

**预期结果**：
- 弹出确认对话框
- 中文：`"您已达到免费使用限制（3次）。立即注册登录后每天可使用5次！"`
- 英文：`"You've reached the free usage limit (3 searches). Sign up now for 5 searches per day!"`
- 点击确定跳转到 `/signup`
- 点击取消停留在当前页面

#### 步骤 4: 测试跨天重置
在控制台设置昨天的日期：
```javascript
localStorage.setItem('pain_point_guest_usage', JSON.stringify({
  count: 3,
  lastReset: '2025-12-24' // 昨天的日期
}))
```

刷新页面，再次搜索：

**预期结果**：
- 配额自动重置
- 显示 "剩余 3 次"（重置到初始状态）

---

### 2. 测试已登录免费用户

#### 步骤 1: 登录账户
1. 注册或登录一个免费账户
2. 确认会员类型为 "FREE"

#### 步骤 2: 查看 Dashboard
访问 `/dashboard`

**预期结果**：
- "Reddit 搜索配额" 卡片显示
- 已使用次数 / 5
- 进度条根据使用率变色：
  - < 80%: 蓝色
  - 80%-99%: 黄色
  - 100%: 红色

#### 步骤 3: 执行搜索
返回首页，执行 5 次搜索

**预期结果**：
- 不显示游客提示（已登录）
- Dashboard 配额实时更新
- 第 5 次搜索成功完成

#### 步骤 4: 测试超限
执行第 6 次搜索

**预期结果**：
- 弹出确认对话框
- 中文：`"您已达到今日搜索限制（5次）。立即升级会员以解锁无限搜索？"`
- 英文：`"You've reached your daily search limit (5 searches). Upgrade now for unlimited searches?"`
- 点击确定跳转到 `/pricing`
- Dashboard 显示 "已达到今日限额"

#### 步骤 5: 测试跨天重置
在数据库中手动修改配额日期：
```sql
-- 在 Supabase SQL Editor 执行
UPDATE user_quotas 
SET date = CURRENT_DATE - INTERVAL '1 day'
WHERE user_id = 'YOUR_USER_ID';
```

刷新页面，再次搜索：

**预期结果**：
- 配额自动重置
- Dashboard 显示新的配额记录

---

### 3. 测试 Premium 用户

#### 步骤 1: 升级会员
1. 访问 `/pricing`
2. 购买 Professional 套餐
3. 完成支付流程

#### 步骤 2: 验证无限制
执行 10+ 次搜索

**预期结果**：
- 无任何限制提示
- 所有搜索正常执行
- Dashboard 显示 "无限次查询"

---

## API 测试

### 测试游客配额 API

```bash
# 测试游客模式（无 session）
curl -X POST http://localhost:3000/api/pain-points/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Notion",
    "platforms": ["reddit"],
    "isGuest": true,
    "guestUsageCount": 3
  }'
```

**预期响应**：
```json
{
  "error": "GUEST_QUOTA_EXCEEDED",
  "message": "Guest users are limited to 3 searches. Please sign up to continue.",
  "redirectTo": "/signup"
}
```

### 测试已登录用户配额 API

需要带上有效的 session cookie：

```bash
# 第 1-5 次：正常返回
curl -X POST http://localhost:3000/api/pain-points/analyze \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -d '{
    "query": "Notion",
    "platforms": ["reddit"]
  }'

# 第 6 次：配额超限
# 预期响应
{
  "error": "QUOTA_EXCEEDED",
  "message": "Daily search limit reached. Please upgrade to Premium for unlimited searches.",
  "redirectTo": "/pricing",
  "quota": {
    "used": 5,
    "limit": 5
  }
}
```

---

## 数据库验证

### 查询配额记录

```sql
-- 查看所有用户的今日配额
SELECT 
  u.email,
  u.membership_type,
  uq.date,
  uq.searches_used,
  uq.searches_limit
FROM user_quotas uq
JOIN users u ON u.id = uq.user_id
WHERE uq.date = CURRENT_DATE
ORDER BY uq.searches_used DESC;
```

### 查看配额使用趋势

```sql
-- 最近 7 天配额使用情况
SELECT 
  date,
  COUNT(*) as total_users,
  SUM(searches_used) as total_searches,
  AVG(searches_used) as avg_searches
FROM user_quotas
WHERE date >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY date
ORDER BY date DESC;
```

### 查找超限用户

```sql
-- 今日达到限制的用户
SELECT 
  u.email,
  u.membership_type,
  uq.searches_used,
  uq.searches_limit
FROM user_quotas uq
JOIN users u ON u.id = uq.user_id
WHERE uq.date = CURRENT_DATE
  AND uq.searches_used >= uq.searches_limit
  AND u.membership_type = 'FREE';
```

---

## 边界情况测试

### 1. 时区测试
- 在不同时区测试配额重置
- 验证 UTC 时间正确性

### 2. 并发测试
- 同时发起多个搜索请求
- 验证配额递增的原子性

### 3. 会员升级测试
- 免费用户用完 5 次后升级
- 验证立即解除限制

### 4. 会员降级测试
- Premium 到期后降为 Free
- 验证配额限制生效

### 5. LocalStorage 清除测试
- 清除浏览器数据后游客配额重置
- 验证不影响已登录用户

---

## 自动化测试脚本

创建 `test-quota-limits.ts`：

```typescript
// 游客模式测试
async function testGuestQuota() {
  // 清除 localStorage
  localStorage.removeItem('pain_point_guest_usage');
  
  // 执行 3 次搜索
  for (let i = 1; i <= 3; i++) {
    const response = await fetch('/api/pain-points/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `Test ${i}`,
        platforms: ['reddit'],
        isGuest: true,
        guestUsageCount: i - 1,
      }),
    });
    
    console.log(`Search ${i}:`, response.status);
  }
  
  // 第 4 次应该失败
  const response = await fetch('/api/pain-points/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: 'Test 4',
      platforms: ['reddit'],
      isGuest: true,
      guestUsageCount: 3,
    }),
  });
  
  console.log('Search 4 (should fail):', response.status, await response.json());
}

testGuestQuota();
```

---

## 问题排查

### 问题 1: 配额没有重置

**检查**：
- 服务器时区设置（UTC）
- `date` 字段是否正确存储
- 是否有多条同一天的记录

**解决**：
```sql
-- 删除重复记录
DELETE FROM user_quotas
WHERE id NOT IN (
  SELECT MIN(id)
  FROM user_quotas
  GROUP BY user_id, date
);
```

### 问题 2: 游客配额不准确

**检查**：
- localStorage 是否被正确写入
- 浏览器隐私模式会禁用 localStorage
- 日期比较逻辑是否正确

**解决**：
- 在控制台检查：`localStorage.getItem('pain_point_guest_usage')`
- 验证日期字符串格式

### 问题 3: Premium 用户被限制

**检查**：
- 用户 `membershipType` 字段
- Session token 是否过期
- 数据库连接是否正常

**解决**：
```sql
-- 验证用户会员类型
SELECT id, email, membership_type, membership_expires_at
FROM users
WHERE email = 'user@example.com';
```

---

## 监控指标

### 关键指标
1. 游客转化率：游客达到 3 次限制后的注册率
2. 升级转化率：免费用户达到 5 次限制后的付费率
3. 平均每日搜索次数
4. 配额利用率（已使用/总限制）

### 监控查询
```sql
-- 今日活跃用户配额使用情况
SELECT 
  CASE 
    WHEN u.membership_type = 'FREE' THEN 'Free'
    WHEN u.membership_type = 'PREMIUM' THEN 'Premium'
  END as tier,
  COUNT(DISTINCT uq.user_id) as active_users,
  AVG(uq.searches_used) as avg_searches,
  SUM(CASE WHEN uq.searches_used >= uq.searches_limit THEN 1 ELSE 0 END) as reached_limit
FROM user_quotas uq
JOIN users u ON u.id = uq.user_id
WHERE uq.date = CURRENT_DATE
GROUP BY u.membership_type;
```
