# 更新日志 (Changelog)

## [v1.3.0] - 2025-12-28

### ✨ 新增功能 (New Features)

#### Settings 页面
- **用户名修改功能**
  - 可以修改用户显示名称
  - 邮箱显示但不可修改
  - 实时表单验证
  - 成功/错误提示反馈
  - Session自动更新

- **密码修改功能**
  - 当前密码验证
  - 新密码强度指示器（弱/中等/强/很强）
  - 密码确认匹配验证
  - 防止新旧密码相同
  - OAuth用户保护（禁止修改密码）
  
- **UI/UX特性**
  - Tab标签页切换（个人信息 / 安全设置）
  - 响应式设计（移动端/桌面端自适应）
  - 暗黑模式完整支持
  - 中英文双语界面
  - 与现有UI风格完全一致

- **安全特性**
  - 服务端Session验证
  - Bcrypt密码加密（10 rounds）
  - 多层数据验证（前端 + 后端）
  - OAuth用户特殊处理
  - 未登录用户自动重定向

#### API端点
- `PATCH /api/user/update-profile` - 更新用户信息
- `PATCH /api/user/update-password` - 更新密码

#### 导航集成
- Settings选项已添加到用户下拉菜单
- 访问路径：用户头像 → Settings

---

## [v1.2.0] - 2025-12-28

### 🔧 优化 (Improvements)

#### UI简化
1. **首页优化**
   - 隐藏了平台选择框（Reddit/X checkbox）
   - 界面更加简洁

2. **Dashboard优化**
   - 隐藏了"总体使用统计"模块（Overall Usage Stats）
   - 隐藏了会员卡中的痛点数量显示
   - 页面布局更加紧凑

**注意：** 所有隐藏功能都通过注释实现，可随时恢复

---

## [v1.1.0] - 2025-12-28

### ✨ 新增功能 (New Features)

#### 痛点分析增强
1. **卡片数量提升**
   - 从3个痛点卡片增加到6个
   - 提供更全面的分析维度

2. **内容丰富度提升**
   - 问题描述：从1-2句扩展到3-5句详细说明
   - 商机建议：从简单建议扩展到3-5句具体方案
   - 包含具体案例、影响分析、实施建议

3. **平台来源智能显示**
   - 根据帖子来源动态显示按钮文案
   - Reddit来源：显示"View on Reddit" / "在 Reddit 查看"
   - X来源：显示"View on X" / "在 X 查看"
   - 支持中英文双语

#### AI Prompt优化
- 升级为"senior product analyst and business consultant"角色
- 强调洞察性、可执行性和商业价值
- 要求提供数据驱动的分析

---

## 文件变更统计

### v1.3.0 新增文件
```
app/(dashboard)/settings/page.tsx
components/settings/settings-content.tsx
components/settings/update-name-form.tsx
components/settings/update-password-form.tsx
app/api/user/update-profile/route.ts
app/api/user/update-password/route.ts
docs/SETTINGS_PAGE_IMPLEMENTATION.md
docs/SETTINGS_TEST_CHECKLIST.md
```

### v1.2.0 修改文件
```
components/pain-point-search.tsx (隐藏平台选择)
components/dashboard/dashboard-content.tsx (隐藏使用统计)
components/dashboard/membership-card.tsx (隐藏痛点数量)
docs/UI_OPTIMIZATION_HIDE_FEATURES.md
```

### v1.1.0 修改文件
```
app/api/pain-points/analyze/route.ts (AI prompt升级)
components/pain-point-results.tsx (平台识别、UI更新)
docs/PAIN_POINT_INSIGHTS_UPGRADE.md
```

---

## 技术栈

- **Frontend:** Next.js 14, React, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes, NextAuth.js
- **Database:** PostgreSQL (Supabase), Prisma ORM
- **Validation:** Zod
- **Security:** Bcrypt, Session-based authentication
- **UI Components:** Radix UI, Lucide Icons

---

## 升级指南

### 数据库迁移
**v1.3.0 无需迁移** - 使用现有User表结构

### 依赖更新
无新增依赖

### 配置更改
无配置更改

---

## 已知问题

目前无已知问题

---

## 贡献者

- AI Assistant - 开发与文档

---

## 支持

如有问题，请参考以下文档：
- [Settings功能实现文档](./docs/SETTINGS_PAGE_IMPLEMENTATION.md)
- [Settings测试清单](./docs/SETTINGS_TEST_CHECKLIST.md)
- [UI优化文档](./docs/UI_OPTIMIZATION_HIDE_FEATURES.md)
- [痛点卡片升级文档](./docs/PAIN_POINT_INSIGHTS_UPGRADE.md)

---

**最后更新：** 2025-12-28
