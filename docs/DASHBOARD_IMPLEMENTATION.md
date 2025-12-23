# 用户仪表盘实现文档

## 📋 功能概述

用户仪表盘（Dashboard）是一个完整的用户管理界面，用于显示用户信息、配额使用情况、会员状态和历史统计数据。

## 🎯 功能特性

### 1. 用户信息卡片
- ✅ 显示用户头像（首字母缩写）
- ✅ 用户名和邮箱
- ✅ 会员类型（FREE/PREMIUM/ENTERPRISE）
- ✅ 加入时间（格式化日期）
- ✅ 响应式设计

### 2. 配额使用卡片
- ✅ Reddit 搜索配额（今日使用/限额）
- ✅ AI 对话配额（今日使用/限额）
- ✅ 实时进度条（颜色根据使用率变化）
  - 绿色：<80%
  - 黄色：80-99%
  - 红色：≥100%
- ✅ 剩余次数显示
- ✅ 配额达到限制时显示升级提示
- ✅ 自动跳转到定价页面

### 3. 会员状态卡片
- ✅ 会员等级图标和标题
- ✅ 权益列表：
  - FREE: 3次搜索/天, 10条消息/天
  - PREMIUM: 100次搜索/天, 500条消息/天
  - ENTERPRISE: 无限搜索, 无限消息
- ✅ 会员到期时间（付费会员）
- ✅ 升级按钮（免费用户）

### 4. 活动统计图表
- ✅ 总搜索次数（历史累计）
- ✅ 总消息数（历史累计）
- ✅ 可视化进度条
- ✅ 配额重置时间提示

### 5. UI/UX 特性
- ✅ 深色模式支持
- ✅ 中英文双语支持
- ✅ 响应式布局（移动端/平板/桌面）
- ✅ 加载骨架屏
- ✅ 错误处理和提示
- ✅ 平滑动画过渡

## 🏗️ 技术架构

### 文件结构

```
app/
├── (dashboard)/
│   ├── dashboard/
│   │   └── page.tsx              # 仪表盘页面（服务端）
│   └── layout.tsx                # 仪表盘布局（带导航栏）
│
├── api/
│   └── user/
│       └── dashboard/
│           └── route.ts          # 仪表盘数据 API
│
components/
└── dashboard/
    ├── dashboard-content.tsx     # 主内容组件（客户端）
    ├── user-info-card.tsx        # 用户信息卡片
    ├── quota-card.tsx            # 配额卡片
    ├── membership-card.tsx       # 会员卡片
    ├── activity-chart.tsx        # 活动统计图表
    └── skeleton.tsx              # 骨架屏组件
```

### 数据流向

```
浏览器访问 /dashboard
  ↓
page.tsx (服务端组件)
  ↓ getServerSession() - 检查登录
  ↓
DashboardContent (客户端组件)
  ↓ useEffect + fetch
GET /api/user/dashboard
  ↓
route.ts (API)
  ↓ getServerSession() - 验证身份
  ↓ prisma.user.findUnique() - 获取用户信息
  ↓ prisma.userQuota.findUnique() - 获取今日配额
  ↓ prisma.userQuota.findMany() - 获取历史统计
  ↓
返回 JSON 数据
  ↓
DashboardContent 渲染
  ↓ 分发到各个子组件
UserInfoCard / QuotaCard / MembershipCard / ActivityChart
```

## 📊 API 接口

### GET `/api/user/dashboard`

**认证要求**: 必须登录

**请求头**:
```
Cookie: next-auth.session-token=xxx
```

**响应成功** (200):
```json
{
  "quota": {
    "date": "2024-01-15T00:00:00.000Z",
    "searchesUsed": 2,
    "searchesLimit": 3,
    "messagesUsed": 5,
    "messagesLimit": 10
  },
  "stats": {
    "totalSearches": 45,
    "totalMessages": 128,
    "memberSince": "2024-01-01T10:30:00.000Z"
  },
  "user": {
    "name": "John Doe",
    "email": "john@example.com",
    "membershipType": "FREE",
    "membershipExpiresAt": null
  }
}
```

**响应错误** (401):
```json
{
  "error": "Unauthorized"
}
```

**响应错误** (500):
```json
{
  "error": "Failed to fetch dashboard data",
  "details": "..."  // 仅开发环境
}
```

## 🔧 核心逻辑

### 1. 配额自动创建

如果用户今日配额不存在，API 会自动创建：

```typescript
if (!todayQuota) {
  const quotaLimits = getQuotaLimits(user.membershipType);
  
  todayQuota = await prisma.userQuota.create({
    data: {
      userId,
      date: today,  // UTC 00:00:00
      searchesUsed: 0,
      messagesUsed: 0,
      searchesLimit: quotaLimits.searches,
      messagesLimit: quotaLimits.messages,
    },
  });
}
```

### 2. 配额限制规则

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

### 3. 进度条颜色逻辑

```typescript
const percentage = (used / limit) * 100;
const isNearLimit = percentage >= 80;
const isExceeded = used >= limit;

// 颜色映射
isExceeded → red (已超限)
isNearLimit → yellow (即将达到)
default → blue/purple (正常)
```

### 4. 国际化实现

```typescript
const pathname = usePathname();
const isZh = pathname.startsWith("/zh");

// 使用示例
{isZh ? "仪表板" : "Dashboard"}
```

## 🎨 样式设计

### 颜色主题

```css
/* 卡片背景 */
bg-white dark:bg-neutral-900

/* 边框 */
border-neutral-200 dark:border-neutral-800

/* 文字 */
text-black dark:text-white          /* 主标题 */
text-neutral-600 dark:text-neutral-300  /* 副标题 */
text-neutral-400 dark:text-neutral-500  /* 辅助信息 */

/* 功能色 */
- 搜索: blue-500 (蓝色)
- 消息: purple-500 (紫色)
- 统计: green-500 (绿色)
- 会员: yellow-500 (黄色，PREMIUM)
- 企业: purple-500 (紫色，ENTERPRISE)
```

### 响应式布局

```css
/* 移动端 (default) */
grid-cols-1

/* 桌面端 (lg:) */
lg:grid-cols-3

/* 卡片间距 */
gap-6
```

## 🔐 权限控制

### 页面级别

```typescript
// app/(dashboard)/dashboard/page.tsx
export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/login");  // 未登录重定向
  }
  
  return <DashboardContent />;
}
```

### API 级别

```typescript
// app/api/user/dashboard/route.ts
const session = await getServerSession(authOptions);
if (!session || !session.user?.id) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
```

## 📱 移动端适配

### 布局调整

- **桌面端**: 左侧用户信息 (1列) + 右侧配额 (2列)
- **移动端**: 全部堆叠为 1列

### 字体大小

```css
text-3xl   /* 页面标题 */
text-2xl   /* 卡片数字 */
text-lg    /* 卡片标题 */
text-sm    /* 辅助信息 */
text-xs    /* 时间戳 */
```

## 🧪 测试场景

### 1. 免费用户
- ✅ 显示 3/3 搜索配额
- ✅ 显示 10/10 消息配额
- ✅ 显示"升级会员"按钮
- ✅ 会员卡片显示 FREE 标识

### 2. 高级会员
- ✅ 显示 100 搜索配额
- ✅ 显示 500 消息配额
- ✅ 会员卡片显示 PREMIUM 标识
- ✅ 显示到期时间

### 3. 配额达到限制
- ✅ 进度条变红
- ✅ 显示"已达到今日限额"
- ✅ 显示升级提示卡片
- ✅ 升级按钮可点击

### 4. 国际化
- ✅ 英文路径 `/dashboard` 显示英文
- ✅ 中文路径 `/zh/dashboard` 显示中文
- ✅ 日期格式本地化

### 5. 深色模式
- ✅ 所有组件正确切换
- ✅ 颜色对比度符合标准
- ✅ 图标颜色适配

## 🚀 未来扩展

### 优先级 P1
1. **历史趋势图表**
   - 过去 7 天使用情况折线图
   - 使用 Recharts 或 Chart.js

2. **搜索历史记录**
   - 显示最近 10 次搜索
   - 支持重新执行搜索

3. **对话历史**
   - 显示最近对话会话
   - 支持恢复会话

### 优先级 P2
1. **导出数据**
   - 导出使用统计为 CSV/PDF
   - 生成月度报告

2. **账户设置**
   - 修改个人信息
   - 上传头像
   - 修改密码

3. **通知中心**
   - 配额预警通知
   - 会员到期提醒
   - 系统公告

## 📖 使用指南

### 访问仪表盘

1. 确保已登录
2. 访问 `http://localhost:3000/dashboard`
3. 或点击导航栏用户头像 → "仪表板"

### 查看配额

- **剩余配额**: 查看今日剩余使用次数
- **使用进度**: 进度条颜色表示使用状态
- **配额重置**: 每日 UTC 00:00 自动重置

### 升级会员

1. 配额不足时点击"升级"按钮
2. 或在会员卡片点击"升级会员"
3. 跳转到定价页面选择套餐

## 🐛 故障排查

### 问题1: 页面显示 401 错误
**原因**: 未登录或 Session 过期
**解决**: 重新登录

### 问题2: 配额数据不正确
**原因**: 数据库配额记录未创建
**解决**: API 会自动创建今日配额

### 问题3: 深色模式显示异常
**原因**: Tailwind dark: 类未生效
**解决**: 检查 `next-themes` 配置

### 问题4: 语言切换无效
**原因**: 路径前缀不正确
**解决**: 确保访问 `/zh/dashboard` 查看中文

## 📚 相关文档

- [用户认证文档](./AUTH_TESTING_GUIDE.md)
- [配额系统设计](./系统架构设计文档.mdc)
- [API 文档](./需求任务说明书.mdc)

---

**文档版本**: v1.0  
**创建时间**: 2024-01-15  
**最后更新**: 2024-01-15  
