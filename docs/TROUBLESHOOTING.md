# 🔧 问题排查指南

## 已解决的问题

### ✅ "注册失败，请稍后重试" 错误

**问题原因:** Supabase pgBouncer 连接池的 prepared statement 冲突

**解决方案:** 已在 `.env.local` 中添加 `?pgbouncer=true` 参数

```env
DATABASE_URL="postgresql://...?pgbouncer=true"
```

**状态:** ✅ 已修复

---

## 常见问题

### Q1: 注册后没有自动登录？

**检查步骤:**
1. 打开浏览器开发者工具 (F12)
2. 查看 Console 是否有错误
3. 检查 Network 标签，查看 `/api/auth/signup` 的响应

**可能原因:**
- NextAuth session 配置问题
- Cookie 设置问题

**解决方法:**
```bash
# 重启开发服务器
npm run dev
```

---

### Q2: 数据库连接失败

**错误信息:** `Can't reach database server`

**检查步骤:**
1. 确认 `.env.local` 中的 `DATABASE_URL` 正确
2. 测试数据库连接:
```bash
npm run test:db
```

**解决方法:**
- 检查 Supabase 项目是否在线
- 确认数据库密码正确
- 确认网络连接正常

---

### Q3: Prisma Client 未生成

**错误信息:** `Cannot find module '@prisma/client'`

**解决方法:**
```bash
npx prisma generate
```

---

### Q4: 页面显示 404

**可能原因:**
- 服务器未启动
- 端口冲突

**解决方法:**
```bash
# 停止所有 Next.js 进程
pkill -f "next dev"

# 重新启动
npm run dev
```

---

### Q5: "prepared statement already exists" 错误

**这是已解决的问题！**

如果仍然遇到此错误：

1. 确认 `.env.local` 包含 `?pgbouncer=true`
2. 重启开发服务器
3. 如果还不行，清除 Prisma 缓存:
```bash
rm -rf node_modules/.prisma
npx prisma generate
npm run dev
```

---

## 调试技巧

### 查看详细日志

**服务器日志:**
- 注册 API 已添加详细日志
- 查看终端输出的 emoji 标记信息

**数据库查询日志:**
```typescript
// lib/db/prisma.ts 已配置
log: ['query', 'error', 'warn']
```

### 数据库管理工具

**Prisma Studio (推荐):**
```bash
npm run db:studio
# 访问 http://localhost:5555
```

**测试脚本:**
```bash
npm run test:db    # 查看数据库状态
npm run db:seed    # 创建测试用户
```

---

## 重置方法

### 完全重置数据库

⚠️ **警告: 这将删除所有数据**

```bash
npm run db:reset
npm run db:push
npm run db:seed
```

### 仅重置 Prisma Client

```bash
npx prisma generate
```

### 重启开发环境

```bash
# 停止所有进程
pkill -f "next dev"

# 清除缓存并重启
rm -rf .next
npm run dev
```

---

## 获取帮助

如果问题仍未解决：

1. **查看完整日志:**
   - 终端服务器日志
   - 浏览器 Console
   - Network 请求详情

2. **检查配置文件:**
   - `.env.local`
   - `prisma/schema.prisma`
   - `lib/auth.ts`

3. **验证环境:**
   ```bash
   node --version    # >= 18
   npm --version     # >= 9
   ```

4. **清除并重装:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install --legacy-peer-deps
   npx prisma generate
   ```

---

**最后更新:** 2025-12-23  
**状态:** 所有已知问题已解决 ✅
