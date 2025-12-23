# ✅ Supabase 集成检查清单

## 📋 准备阶段

- [ ] 注册 Supabase 账号
- [ ] 准备密码管理器（用于保存数据库密码）
- [ ] 确保 Node.js 版本 >= 18

---

## 🗄️ Supabase 设置

- [ ] 创建新项目
  - [ ] 项目名称：`ai-saas-db`
  - [ ] 密码：已生成并保存
  - [ ] 区域：已选择（Tokyo/Singapore）
  
- [ ] 获取连接信息
  - [ ] 数据库连接字符串（URI）
  - [ ] Supabase URL（可选）
  - [ ] anon key（可选）
  - [ ] service_role key（可选）

- [ ] 执行 SQL 脚本
  - [ ] 打开 SQL Editor
  - [ ] 粘贴 `docs/supabase-schema.sql` 内容
  - [ ] 成功执行
  - [ ] 验证表创建（6个表）

---

## 💻 项目配置

- [ ] 环境变量配置
  - [ ] 创建 `.env.local` 文件
  - [ ] 配置 `DATABASE_URL`
  - [ ] 生成并配置 `NEXTAUTH_SECRET`
  - [ ] 配置 `NEXTAUTH_URL`
  
- [ ] 安装依赖
  ```bash
  - [ ] npm install @prisma/client
  - [ ] npm install prisma
  - [ ] npm install tsx
  ```

- [ ] Prisma 设置
  - [ ] 文件 `prisma/schema.prisma` 已创建
  - [ ] 执行 `npm run db:generate`
  - [ ] 生成成功

---

## 🧪 验证测试

- [ ] 数据库连接测试
  - [ ] 执行 `npm run test:db`
  - [ ] 看到成功输出
  - [ ] 确认有 2 个测试用户
  
- [ ] Prisma Studio 测试（可选）
  - [ ] 执行 `npm run db:studio`
  - [ ] 浏览器打开成功
  - [ ] 可以查看表数据

---

## 📁 文件检查

确保以下文件已创建：

- [ ] `prisma/schema.prisma` - Prisma schema 定义
- [ ] `lib/db/prisma.ts` - Prisma 客户端单例
- [ ] `docs/supabase-schema.sql` - 数据库 SQL 脚本
- [ ] `scripts/test-db.ts` - 测试脚本
- [ ] `.env.local` - 环境变量（不提交到 Git）
- [ ] `.env.example` - 环境变量示例

---

## 🚫 Git 忽略检查

确保 `.gitignore` 包含：

```
.env*.local
.env
/prisma/migrations/
node_modules/.prisma/
```

---

## 📊 数据库表验证

在 Supabase Dashboard 或 Prisma Studio 中验证：

- [ ] `users` - 用户表
- [ ] `sessions` - 会话表
- [ ] `user_quotas` - 配额表
- [ ] `payments` - 支付记录表
- [ ] `search_history` - 搜索历史表
- [ ] `chat_history` - 聊天历史表

---

## 🔒 安全检查

- [ ] `.env.local` 已添加到 `.gitignore`
- [ ] 数据库密码足够强（至少 12 位，包含大小写字母、数字、符号）
- [ ] `NEXTAUTH_SECRET` 已生成（32字节随机字符串）
- [ ] 生产环境变量已单独配置（不使用开发环境的）

---

## 🎯 下一步行动

完成上述检查后，可以继续：

1. [ ] 实现用户注册 API
2. [ ] 实现用户登录 API  
3. [ ] 集成 NextAuth.js
4. [ ] 实现个人信息管理
5. [ ] 实现配额系统
6. [ ] 集成支付功能

---

## 📞 获取帮助

如果遇到问题：

1. 查看 [快速开始指南](./QUICK_START.md)
2. 查看 [完整集成指南](./SUPABASE_SETUP_GUIDE.md)
3. 查看 [故障排查部分](./SUPABASE_SETUP_GUIDE.md#troubleshooting)

---

## ✨ 完成标志

当所有复选框都勾选后，你应该能够：

✅ 成功运行 `npm run test:db`  
✅ 看到 2 个测试用户数据  
✅ 在 Supabase Dashboard 中查看数据  
✅ 在 Prisma Studio 中编辑数据  

**恭喜！Supabase 已成功集成到项目中！🎉**
