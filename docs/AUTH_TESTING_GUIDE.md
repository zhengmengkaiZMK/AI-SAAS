# 🔐 认证功能测试指南

## 📋 功能概览

已完成的功能：
- ✅ 用户注册 (邮箱 + 密码)
- ✅ 用户登录 (NextAuth.js + JWT)
- ✅ Session 管理
- ✅ 用户信息显示
- ✅ 退出登录
- ✅ 自动创建用户配额
- ✅ 前端表单验证
- ✅ 错误处理和提示

---

## 🚀 快速开始

### 1. 启动开发服务器

```bash
npm run dev
```

服务器地址: `http://localhost:3000` (或 3001)

### 2. 运行自动化测试 (可选)

```bash
npm run test:auth
```

---

## 🧪 测试场景

### 场景 1: 新用户注册

**步骤：**
1. 访问 `http://localhost:3001/signup`
2. 填写表单：
   - 姓名: `张三`
   - 邮箱: `zhangsan@example.com`
   - 密码: `test123456` (至少 6 位)
3. 点击 "Sign Up"

**预期结果：**
- ✅ 注册成功后自动登录
- ✅ 跳转到首页
- ✅ 右上角显示用户头像和名字
- ✅ 数据库中创建用户记录
- ✅ 自动创建配额记录 (免费用户: 3 次搜索 / 10 条消息)

**验证数据库：**
```bash
npm run test:db
```

---

### 场景 2: 已有用户登录

**测试账号 (已在数据库中)：**

| 邮箱 | 密码 | 会员类型 |
|------|------|----------|
| test@example.com | password123 | 免费用户 |
| premium@example.com | password123 | 高级会员 |

**步骤：**
1. 访问 `http://localhost:3001/login`
2. 输入邮箱和密码
3. 点击 "Sign in"

**预期结果：**
- ✅ 登录成功跳转到首页
- ✅ 右上角显示用户信息
- ✅ 高级会员显示金色标签

---

### 场景 3: 错误处理

#### 3.1 邮箱已注册
1. 访问 `/signup`
2. 使用已存在的邮箱 (如 `test@example.com`)
3. 提交表单

**预期结果：**
- ❌ 显示错误: "该邮箱已被注册"

#### 3.2 登录密码错误
1. 访问 `/login`
2. 输入正确邮箱但错误密码
3. 提交表单

**预期结果：**
- ❌ 显示错误: "邮箱或密码错误"

#### 3.3 表单验证
1. 尝试提交空表单
2. 输入无效邮箱格式
3. 密码少于 6 位

**预期结果：**
- ❌ 显示相应的验证错误信息

---

### 场景 4: 用户导航菜单

**步骤：**
1. 登录成功后
2. 点击右上角用户头像

**预期结果：**
- ✅ 显示下拉菜单
- ✅ 显示用户名和邮箱
- ✅ 显示会员类型标签
- ✅ 菜单项：
  - 仪表板
  - 升级会员
  - 设置
  - 退出登录

---

### 场景 5: 退出登录

**步骤：**
1. 已登录状态
2. 点击右上角头像
3. 点击 "退出登录"

**预期结果：**
- ✅ 退出成功
- ✅ 跳转到首页
- ✅ 右上角恢复为 "登录/注册" 按钮

---

## 🔍 API 测试

### 注册 API

```bash
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "测试用户",
    "email": "test123@example.com",
    "password": "password123"
  }'
```

**成功响应：**
```json
{
  "message": "注册成功",
  "user": {
    "id": "...",
    "name": "测试用户",
    "email": "test123@example.com",
    "membership": "FREE"
  }
}
```

### 登录 API

```bash
curl -X POST http://localhost:3001/api/auth/callback/credentials \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "callbackUrl": "/"
  }'
```

---

## 📊 数据库验证

### 查看所有用户
```bash
npm run test:db
```

### 使用 Prisma Studio
```bash
npm run db:studio
```

然后访问 `http://localhost:5555` 查看数据库内容。

---

## 🛠️ 技术架构

### 认证流程图

```
┌─────────┐       ┌──────────────┐       ┌─────────────┐       ┌──────────┐
│ 前端表单 │  ───> │  API Route   │  ───> │   Prisma    │  ───> │ Supabase │
│ (Zod)   │       │ (NextAuth.js)│       │  (ORM)      │       │    DB    │
└─────────┘       └──────────────┘       └─────────────┘       └──────────┘
                          │
                          ▼
                   ┌──────────────┐
                   │ JWT Session  │
                   └──────────────┘
```

### 组件说明

| 组件 | 文件位置 | 作用 |
|------|----------|------|
| 登录表单 | `components/login.tsx` | 用户登录界面 |
| 注册表单 | `components/signup.tsx` | 用户注册界面 |
| 用户导航 | `components/user-nav.tsx` | 用户信息菜单 |
| Session Provider | `components/session-provider.tsx` | NextAuth session 管理 |
| NextAuth 配置 | `lib/auth.ts` | 认证策略和回调 |
| 注册 API | `app/api/auth/signup/route.ts` | 用户注册逻辑 |
| NextAuth API | `app/api/auth/[...nextauth]/route.ts` | NextAuth 端点 |

---

## 🔧 环境变量

确保 `.env.local` 包含：

```env
# 数据库
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

---

## ❓ 常见问题

### Q1: 登录后页面没有刷新？
**A:** 检查浏览器控制台是否有错误，确保 SessionProvider 已正确包裹在 layout 中。

### Q2: 注册后显示 500 错误？
**A:** 检查数据库连接，运行 `npm run test:db` 验证连接。

### Q3: 密码加密是否安全？
**A:** 是的，使用 bcrypt (10 rounds) 加密，符合行业标准。

### Q4: 如何重置测试数据？
**A:** 访问 `http://localhost:5555` (Prisma Studio)，删除测试用户。

---

## 📝 下一步

完成基础认证后，可以添加：

1. ✨ OAuth 登录 (Google / GitHub)
2. 📧 邮箱验证
3. 🔑 忘记密码功能
4. 🔒 双因素认证 (2FA)
5. 👥 用户角色管理
6. 📊 用户活动日志

---

## 🎉 测试检查清单

- [ ] 新用户注册成功
- [ ] 已有用户登录成功
- [ ] 错误提示正确显示
- [ ] 用户导航菜单正常
- [ ] 退出登录功能正常
- [ ] Session 持久化 (刷新页面后仍登录)
- [ ] 移动端界面正常
- [ ] 数据库记录正确创建
- [ ] 配额自动初始化
- [ ] API 测试通过

---

**祝测试顺利！** 🚀
