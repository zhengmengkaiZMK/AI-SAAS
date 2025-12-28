# 配额功能部署检查清单

## 📋 部署前检查

### 代码变更确认

- [x] ✅ 新增文件（5个）
  - [x] `lib/usage-tracker.ts` - 游客跟踪服务
  - [x] `scripts/update-quota-limits.sql` - 数据库迁移脚本
  - [x] `docs/USAGE_QUOTA_UPDATE.md` - 实现文档
  - [x] `docs/TESTING_GUIDE.md` - 测试指南
  - [x] `docs/QUOTA_IMPLEMENTATION_SUMMARY.md` - 总结文档

- [x] ✅ 修改核心文件（14个）
  - [x] `app/api/pain-points/analyze/route.ts` - API配额检查
  - [x] `components/pain-point-search.tsx` - 前端搜索组件
  - [x] `prisma/schema.prisma` - 数据库schema
  - [x] Dashboard相关（3个）
  - [x] 定价页面相关（5个）
  - [x] 支付相关（1个）

### 代码质量检查

```bash
# 1. 检查 TypeScript 错误
npm run type-check  # 或 tsc --noEmit

# 2. 检查 Linter 错误
npm run lint

# 3. 运行单元测试（如有）
npm run test

# 4. 本地构建测试
npm run build
```

**结果**：
- [ ] TypeScript 无错误
- [ ] Linter 无错误
- [ ] 测试通过
- [ ] 构建成功

---

## 🗄️ 数据库迁移

### Step 1: 生成 Prisma Client

```bash
cd /Users/kevinnzheng/Documents/出海应用开发/AI-SaaS
npx prisma generate
```

**预期输出**：
```
✔ Generated Prisma Client to ./node_modules/@prisma/client
```

**检查**：
- [ ] 命令执行成功
- [ ] 无错误提示

### Step 2: 推送 Schema 变更

```bash
npx prisma db push
```

**预期输出**：
```
✔ Your database is now in sync with your schema.
```

**检查**：
- [ ] Schema 同步成功
- [ ] 无警告或错误

### Step 3: 更新现有数据

在 Supabase SQL Editor 中执行 `scripts/update-quota-limits.sql`：

```sql
-- 更新现有配额限制从3次改为5次
UPDATE user_quotas
SET searches_limit = 5
WHERE searches_limit = 3;

-- 验证更新结果
SELECT COUNT(*) FROM user_quotas WHERE searches_limit = 5;
```

**检查**：
- [ ] SQL 执行成功
- [ ] 更新记录数正确
- [ ] 验证查询返回预期结果

### Step 4: 验证数据完整性

```sql
-- 检查是否有异常配额记录
SELECT 
  u.email,
  u.membership_type,
  uq.searches_limit,
  uq.searches_used
FROM user_quotas uq
JOIN users u ON u.id = uq.user_id
WHERE uq.searches_limit NOT IN (5, 999999)
ORDER BY uq.created_at DESC
LIMIT 10;
```

**预期结果**：无记录返回（或只有合理的自定义配额）

**检查**：
- [ ] 无异常配额记录
- [ ] 免费用户配额 = 5
- [ ] Premium 用户配额 = 999999

---

## 🧪 功能测试

### 测试环境准备

```bash
# 启动本地开发服务器
npm run dev

# 或重启现有服务
lsof -ti:3000 | xargs kill -9
npm run dev
```

**检查**：
- [ ] 服务器启动成功
- [ ] 可访问 http://localhost:3000
- [ ] 控制台无错误

### 游客模式测试

#### 方法1: 手动测试

1. **打开隐身窗口**（确保未登录）
2. **访问首页**：http://localhost:3000
3. **观察UI**：
   - [ ] 显示 "免费试用剩余 3 次搜索"
4. **执行第1次搜索**：
   - [ ] 搜索成功
   - [ ] 显示 "剩余 2 次"
5. **执行第2次搜索**：
   - [ ] 搜索成功
   - [ ] 显示 "剩余 1 次（注册后每日5次）"
6. **执行第3次搜索**：
   - [ ] 搜索成功
   - [ ] 显示 "剩余 0 次"
7. **执行第4次搜索**：
   - [ ] 弹出确认对话框
   - [ ] 文案正确（中/英文）
   - [ ] 点击确定跳转到 `/signup`
   - [ ] 点击取消停留当前页

#### 方法2: 自动化测试

在浏览器控制台运行：

```javascript
// 加载测试脚本
const script = document.createElement('script');
script.src = '/scripts/test-quota-functionality.js';
document.head.appendChild(script);

// 等待脚本加载后运行
setTimeout(() => {
  quotaTests.testGuest();
}, 1000);
```

**检查**：
- [ ] 测试脚本执行成功
- [ ] 所有断言通过
- [ ] 控制台显示 "✅ 游客模式测试通过！"

### 已登录用户测试

1. **登录测试账户**（确保是 FREE 会员）
2. **访问 Dashboard**：http://localhost:3000/dashboard
   - [ ] 配额卡片显示
   - [ ] "已使用 X / 5"
   - [ ] 进度条正确
3. **执行5次搜索**：
   - [ ] 前5次正常
   - [ ] Dashboard 实时更新
4. **执行第6次搜索**：
   - [ ] 弹出确认对话框
   - [ ] 文案正确
   - [ ] 点击确定跳转到 `/pricing`

### Premium 用户测试

1. **升级或使用 Premium 账户**
2. **执行10+次搜索**：
   - [ ] 无任何限制
   - [ ] Dashboard 显示 "无限次查询"

### 跨天重置测试

在控制台执行：

```javascript
// 游客模式：设置昨天的日期
localStorage.setItem('pain_point_guest_usage', JSON.stringify({
  count: 3,
  lastReset: '2025-12-24' // 昨天
}));

// 刷新页面，执行搜索
// 应该显示 "剩余 3 次"（重置）
```

**检查**：
- [ ] 配额自动重置
- [ ] 可以重新使用3次

### 中英文测试

1. **访问英文页面**：http://localhost:3000
   - [ ] 提示文案为英文
2. **访问中文页面**：http://localhost:3000/zh
   - [ ] 提示文案为中文
3. **测试跳转路径**：
   - [ ] 英文页面超限 → `/signup`
   - [ ] 中文页面超限 → `/zh/signup`

---

## 🚀 部署到生产环境

### Step 1: 提交代码

```bash
# 检查变更
git status

# 添加所有变更
git add .

# 提交
git commit -m "feat: 实现配额限制功能

- 未登录用户：3次限制 + 跳转注册
- 已登录用户：5次/天限制 + 跳转定价
- Premium用户：无限制
- 更新所有UI文案（3次→5次）
- 添加游客使用次数跟踪服务
- 完善文档和测试指南
"

# 推送
git push origin main
```

**检查**：
- [ ] 代码推送成功
- [ ] GitHub Actions 通过（如有）

### Step 2: Vercel 部署

Vercel 会自动检测到推送并开始部署。

**监控部署**：
1. 访问 Vercel Dashboard
2. 查看部署状态
3. 等待部署完成

**检查**：
- [ ] 部署状态：Success
- [ ] 无构建错误
- [ ] 无运行时错误

### Step 3: 生产环境数据库迁移

在 Supabase 生产环境执行：

```sql
-- 1. 备份现有数据（可选）
CREATE TABLE user_quotas_backup AS 
SELECT * FROM user_quotas;

-- 2. 更新配额限制
UPDATE user_quotas
SET searches_limit = 5
WHERE searches_limit = 3;

-- 3. 验证
SELECT 
  COUNT(*) as total_records,
  COUNT(CASE WHEN searches_limit = 5 THEN 1 END) as free_users,
  COUNT(CASE WHEN searches_limit = 999999 THEN 1 END) as premium_users
FROM user_quotas;
```

**检查**：
- [ ] SQL 执行成功
- [ ] 数据正确更新
- [ ] 验证查询结果符合预期

### Step 4: 生产环境测试

使用生产环境 URL 重复上述功能测试：

**游客模式**：
- [ ] 3次限制生效
- [ ] 跳转正确

**已登录用户**：
- [ ] 5次限制生效
- [ ] Dashboard 正确

**Premium 用户**：
- [ ] 无限制使用

---

## 📊 监控与验证

### 部署后立即检查（前5分钟）

```sql
-- 检查新创建的配额记录
SELECT *
FROM user_quotas
WHERE created_at > NOW() - INTERVAL '5 minutes'
ORDER BY created_at DESC
LIMIT 10;
```

**预期**：
- [ ] `searches_limit` = 5（免费用户）
- [ ] 记录创建正常

### 部署后30分钟检查

```sql
-- 查看配额使用情况
SELECT 
  u.membership_type,
  COUNT(*) as active_users,
  AVG(uq.searches_used) as avg_usage
FROM user_quotas uq
JOIN users u ON u.id = uq.user_id
WHERE uq.date = CURRENT_DATE
  AND uq.created_at > NOW() - INTERVAL '30 minutes'
GROUP BY u.membership_type;
```

**预期**：
- [ ] 有用户开始使用
- [ ] 平均使用次数正常
- [ ] 无异常数据

### 监控错误日志

**Vercel 日志**：
1. 访问 Vercel Dashboard
2. 查看 Function Logs
3. 搜索 `[PainPointAnalyze]` 或 `QUOTA_EXCEEDED`

**检查**：
- [ ] 无 500 错误
- [ ] 配额检查正常执行
- [ ] 超限日志符合预期

### 用户反馈收集

**前24小时关注**：
- [ ] 用户是否收到正确的限制提示
- [ ] 跳转是否正常工作
- [ ] 有无误报（Premium 用户被限制）
- [ ] 配额重置是否正常

---

## 🐛 回滚计划

### 紧急回滚步骤

如果出现严重问题，执行以下步骤：

#### 1. 代码回滚（Vercel）

```bash
# 方法1: 在 Vercel Dashboard 中回滚到上一个部署

# 方法2: Git 回滚
git revert HEAD
git push origin main
```

#### 2. 数据库回滚

```sql
-- 恢复旧的配额限制
UPDATE user_quotas
SET searches_limit = 3
WHERE searches_limit = 5
  AND user_id IN (
    SELECT id FROM users WHERE membership_type = 'FREE'
  );
```

#### 3. 通知用户

如果回滚影响用户体验，考虑：
- 发送邮件通知
- 在网站显示公告
- 社交媒体说明

---

## ✅ 最终确认

### 所有检查项完成

- [ ] 代码变更验证
- [ ] 代码质量检查
- [ ] 数据库迁移
- [ ] 功能测试（游客、用户、Premium）
- [ ] 跨天重置测试
- [ ] 中英文测试
- [ ] 生产环境部署
- [ ] 监控与验证

### 文档完整性

- [ ] `docs/USAGE_QUOTA_UPDATE.md` - 实现文档
- [ ] `docs/TESTING_GUIDE.md` - 测试指南
- [ ] `docs/QUOTA_IMPLEMENTATION_SUMMARY.md` - 总结文档
- [ ] `docs/DEPLOYMENT_CHECKLIST.md` - 本文档
- [ ] README 更新（如需要）

### 团队通知

- [ ] 通知团队成员功能上线
- [ ] 分享文档链接
- [ ] 说明新的配额限制
- [ ] 提醒注意监控指标

---

## 📞 支持联系

**部署负责人**：_____________  
**部署日期**：2025-12-25  
**部署时间**：_____________  

**紧急联系**：
- 技术支持：_____________
- 数据库管理：_____________
- 产品负责人：_____________

---

**签字确认**：

- [ ] 开发人员：_____________ 日期：_______
- [ ] 测试人员：_____________ 日期：_______
- [ ] 产品经理：_____________ 日期：_______

---

**部署完成！** 🎉
