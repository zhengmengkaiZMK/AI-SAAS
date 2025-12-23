# Supabase 集成完整指南

## 📋 目录
1. [Supabase 注册和项目创建](#step1)
2. [执行 SQL 脚本创建数据库](#step2)
3. [配置项目环境变量](#step3)
4. [生成 Prisma 客户端](#step4)
5. [验证数据库连接](#step5)
6. [常用操作命令](#commands)
7. [故障排查](#troubleshooting)

---

## <a id="step1"></a>第一步：Supabase 注册和项目创建

### 1.1 注册账号

1. 访问 [https://supabase.com](https://supabase.com)
2. 点击 **"Start your project"** 或 **"Sign In"**
3. 使用 GitHub 账号登录（推荐）

### 1.2 创建新项目

1. 点击 **"New Project"**
2. 填写项目信息：
   - **Name**: `ai-saas-db`
   - **Database Password**: 生成强密码（保存到密码管理器！）
   - **Region**: 选择 `Northeast Asia (Tokyo)` 或 `Southeast Asia (Singapore)`
   - **Pricing Plan**: 选择 **"Free"** 开始

3. 点击 **"Create new project"**，等待 1-2 分钟

### 1.3 获取连接信息

1. 进入项目 Dashboard
2. 左侧菜单：**Settings** → **Database**
3. 找到 **"Connection string"** 部分
4. 选择 **"URI"** 标签页
5. 复制连接字符串：
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxx.supabase.co:5432/postgres
   ```
6. 替换 `[YOUR-PASSWORD]` 为你的密码

### 1.4 获取 API 密钥（可选）

如果需要使用 Supabase 客户端 SDK：

1. 左侧菜单：**Settings** → **API**
2. 复制以下内容：
   - **Project URL**: `https://xxxxxx.supabase.co`
   - **anon public key**: 公开密钥
   - **service_role key**: 服务端密钥（保密！）

---

## <a id="step2"></a>第二步：执行 SQL 脚本创建数据库

### 2.1 打开 SQL 编辑器

1. 左侧菜单：**SQL Editor**
2. 点击 **"New query"**

### 2.2 执行 SQL 脚本

1. 打开项目中的 `docs/supabase-schema.sql` 文件
2. 复制**全部内容**
3. 粘贴到 Supabase SQL 编辑器
4. 点击右下角 **"Run"** 按钮（或按 Ctrl/Cmd + Enter）
5. 等待执行完成（约 3-5 秒）

### 2.3 验证表创建

1. 左侧菜单：**Table Editor**
2. 应该能看到以下表：
   - ✅ users
   - ✅ sessions
   - ✅ user_quotas
   - ✅ payments
   - ✅ search_history
   - ✅ chat_history

3. 点击任意表可以查看结构和测试数据

---

## <a id="step3"></a>第三步：配置项目环境变量

### 3.1 复制示例文件

```bash
cd /Users/kevinnzheng/Documents/出海应用开发/AI-SaaS
cp .env.example .env.local
```

### 3.2 编辑 `.env.local` 文件

使用你喜欢的编辑器打开 `.env.local`，填写以下内容：

```env
# 数据库连接（必填）
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.xxxxxx.supabase.co:5432/postgres"

# Supabase API（可选）
NEXT_PUBLIC_SUPABASE_URL="https://xxxxxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# NextAuth（必填）
NEXTAUTH_SECRET="请运行: openssl rand -base64 32 生成"
NEXTAUTH_URL="http://localhost:3000"

# 其他配置根据需要填写...
```

### 3.3 生成 NEXTAUTH_SECRET

在终端运行：

```bash
openssl rand -base64 32
```

将输出的字符串填入 `NEXTAUTH_SECRET`。

---

## <a id="step4"></a>第四步：生成 Prisma 客户端

### 4.1 安装依赖

```bash
npm install @prisma/client prisma
```

### 4.2 生成 Prisma 客户端

由于数据库已通过 SQL 脚本创建，我们使用 Prisma 的 `db pull` 命令：

```bash
# 拉取数据库 schema（可选，验证连接）
npx prisma db pull

# 生成 Prisma 客户端
npx prisma generate
```

**注意**：由于我们已经手动编写了 `prisma/schema.prisma`，直接执行 `generate` 即可。

### 4.3 验证生成

成功后会看到：

```
✔ Generated Prisma Client (5.x.x) to ./node_modules/@prisma/client
```

---

## <a id="step5"></a>第五步：验证数据库连接

### 5.1 创建测试脚本

在项目根目录创建 `scripts/test-db.ts`：

```typescript
import { prisma, testDatabaseConnection } from '@/lib/db/prisma';

async function main() {
  console.log('🔍 Testing database connection...\n');
  
  // 测试连接
  await testDatabaseConnection();
  
  // 查询用户数量
  const userCount = await prisma.user.count();
  console.log(`📊 Total users: ${userCount}`);
  
  // 查询测试用户
  const testUser = await prisma.user.findUnique({
    where: { email: 'test@example.com' },
    include: { quotas: true },
  });
  
  if (testUser) {
    console.log('\n✅ Test user found:');
    console.log(`   Email: ${testUser.email}`);
    console.log(`   Name: ${testUser.name}`);
    console.log(`   Membership: ${testUser.membershipType}`);
    console.log(`   Quotas: ${testUser.quotas.length} records`);
  }
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

### 5.2 添加运行脚本到 package.json

```json
{
  "scripts": {
    "test:db": "tsx scripts/test-db.ts"
  }
}
```

### 5.3 安装 tsx 并运行

```bash
npm install -D tsx
npm run test:db
```

如果成功，应该看到：

```
✅ Database connection successful
📊 Total users: 2
✅ Test user found:
   Email: test@example.com
   Name: Test User
   Membership: FREE
   Quotas: 1 records
```

---

## <a id="commands"></a>常用操作命令

### Prisma 相关

```bash
# 生成 Prisma 客户端
npx prisma generate

# 查看数据库（打开 Prisma Studio）
npx prisma studio

# 拉取数据库 schema（从数据库同步到 schema.prisma）
npx prisma db pull

# 推送 schema 到数据库（仅开发环境）
npx prisma db push

# 格式化 schema 文件
npx prisma format

# 验证 schema 文件
npx prisma validate
```

### 数据库迁移（生产环境）

```bash
# 创建迁移
npx prisma migrate dev --name init

# 应用迁移（生产）
npx prisma migrate deploy

# 查看迁移状态
npx prisma migrate status
```

### Supabase CLI（可选）

```bash
# 安装 Supabase CLI
npm install -g supabase

# 登录
supabase login

# 链接项目
supabase link --project-ref your-project-ref

# 拉取远程更改
supabase db pull
```

---

## <a id="troubleshooting"></a>故障排查

### ❌ 连接失败：Connection timeout

**原因**：网络问题或防火墙阻止

**解决方案**：
1. 检查网络连接
2. 尝试使用 VPN
3. 检查 Supabase 项目状态（Dashboard）

### ❌ 认证失败：password authentication failed

**原因**：密码错误

**解决方案**：
1. 在 Supabase Dashboard → Settings → Database 中重置密码
2. 更新 `.env.local` 中的 `DATABASE_URL`

### ❌ Prisma 生成失败：Schema parsing error

**原因**：`schema.prisma` 语法错误

**解决方案**：
```bash
# 验证 schema
npx prisma validate

# 格式化 schema
npx prisma format
```

### ❌ 表已存在错误

**原因**：重复执行 SQL 脚本

**解决方案**：
SQL 脚本开头已包含 `DROP TABLE IF EXISTS`，可以重新执行。

### ⚠️ RLS 策略导致无法访问数据

**原因**：启用了 Row Level Security 但没有正确的策略

**临时解决方案**（仅开发环境）：

```sql
-- 在 Supabase SQL Editor 中执行
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_quotas DISABLE ROW LEVEL SECURITY;
ALTER TABLE payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE search_history DISABLE ROW LEVEL SECURITY;
ALTER TABLE chat_history DISABLE ROW LEVEL SECURITY;
```

**生产环境**：配置正确的 RLS 策略或使用 `service_role` 密钥。

---

## 🎉 完成！

现在你的项目已经成功集成 Supabase！

### 下一步

1. ✅ 实现用户注册/登录 API
2. ✅ 集成 NextAuth.js
3. ✅ 实现配额管理功能
4. ✅ 集成支付系统

### 有用的链接

- 📚 [Supabase 文档](https://supabase.com/docs)
- 📚 [Prisma 文档](https://www.prisma.io/docs)
- 📚 [NextAuth.js 文档](https://next-auth.js.org)
- 💬 [项目架构文档](./系统架构设计文档.mdc)
