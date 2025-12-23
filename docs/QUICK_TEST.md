# ⚡ 快速测试指南

## ✅ 问题已解决

数据库连接问题已修复！添加了 `?pgbouncer=true` 参数来禁用 prepared statements。

---

## 🎯 立即测试

**服务器地址:** http://localhost:3000

### 1️⃣ 注册新用户

**访问:** http://localhost:3000/signup

**填写信息:**
- 姓名: `测试用户`
- 邮箱: `your-email@example.com` (使用新邮箱)
- 密码: `test123456`

**点击:** Sign Up

**预期:** 自动登录并跳转首页，右上角显示用户头像

---

### 2️⃣ 测试登录 (使用刚注册的账号)

**访问:** http://localhost:3000/login

**使用您刚注册的账号登录**

**点击:** Sign in

---

### 3️⃣ 查看用户菜单

**操作:**
1. 登录后点击右上角头像
2. 查看用户信息和会员类型
3. 测试各个菜单项

---

### 4️⃣ 退出登录

**操作:**
1. 点击右上角头像
2. 点击 "退出登录"
3. 确认回到首页且显示 "登录/注册" 按钮

---

## 🧪 命令行测试

```bash
# 自动化测试
npm run test:auth

# 查看数据库
npm run test:db

# Prisma Studio (可视化)
npm run db:studio
```

---

## ✅ 测试检查项

- [ ] 注册成功
- [ ] 登录成功
- [ ] 显示用户头像
- [ ] 下拉菜单正常
- [ ] 退出登录成功
- [ ] 错误提示正常

---

**测试页面:**
- 注册: http://localhost:3000/signup
- 登录: http://localhost:3000/login
- 首页: http://localhost:3000

**如有问题，查看完整指南:** `docs/AUTH_TESTING_GUIDE.md`

---

## 💡 重要提示

数据库配置已优化，添加了 `?pgbouncer=true` 参数以兼容 Supabase 连接池。

如需创建测试用户，运行:
```bash
npm run db:seed
```
