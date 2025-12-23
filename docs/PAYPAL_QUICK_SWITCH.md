# PayPal环境快速切换指南

## 🚀 5分钟快速上线

### 步骤1: 获取生产凭证 (2分钟)

1. 访问 https://www.paypal.com/businessmanage/account/aboutBusiness
2. 点击 **设置** → **API访问权限**
3. 创建应用，获取:
   - Client ID (以AX开头)
   - Client Secret (以EL开头)

### 步骤2: 更新环境变量 (1分钟)

修改 `.env.local`:

```bash
# 只需修改这4个变量
PAYPAL_MODE="live"                                    # sandbox → live
PAYPAL_CLIENT_ID="AXxxxxxxxxxxxxxxxxxx"               # 替换为生产ID
PAYPAL_CLIENT_SECRET="ELxxxxxxxxxxxxxxxxxx"           # 替换为生产Secret
NEXT_PUBLIC_PAYPAL_CLIENT_ID="AXxxxxxxxxxxxxxxxxxx"   # 与上面相同
```

### 步骤3: 验证配置 (30秒)

```bash
npm run paypal:check
```

看到 ✅ 就可以了!

### 步骤4: 测试支付 (1分钟)

1. 临时改价格为 $0.01:
```typescript
// constants/pricing-plans.ts
STARTER_MONTHLY: { amount: 0.01 }
```

2. 重启服务器:
```bash
npm run dev
```

3. 访问 http://localhost:3000/pricing
4. 用真实PayPal账号支付 $0.01
5. 验证成功后立即退款
6. 恢复价格为 $8.00

### 步骤5: 部署 (30秒)

```bash
# Vercel
vercel --prod

# 在Vercel Dashboard设置环境变量
# Settings → Environment Variables
# 添加上面4个变量
```

---

## ⚡ 快速对比

| 项目 | 开发环境 | 生产环境 |
|------|---------|---------|
| 修改代码? | ❌ 不需要 | ❌ 不需要 |
| 修改环境变量? | ❌ 不需要 | ✅ 需要 (4个) |
| 重新部署? | ❌ 不需要 | ✅ 需要 |
| 真实扣款? | ❌ 否 | ✅ 是 |

---

## 🔄 回滚到沙箱

如果需要切换回沙箱:

```bash
# 修改 .env.local
PAYPAL_MODE="sandbox"
PAYPAL_CLIENT_ID="sb-xxxxxxxxxx"
PAYPAL_CLIENT_SECRET="xxxxxxxxxx"
NEXT_PUBLIC_PAYPAL_CLIENT_ID="sb-xxxxxxxxxx"

# 验证
npm run paypal:check

# 重启
npm run dev
```

---

## 📝 环境变量备忘录

建议创建两个文件:

**`.env.development`** (沙箱):
```bash
PAYPAL_MODE="sandbox"
PAYPAL_CLIENT_ID="sb-abc123..."
PAYPAL_CLIENT_SECRET="xxx..."
NEXT_PUBLIC_PAYPAL_CLIENT_ID="sb-abc123..."
```

**`.env.production`** (生产):
```bash
PAYPAL_MODE="live"
PAYPAL_CLIENT_ID="AXabc123..."
PAYPAL_CLIENT_SECRET="ELabc123..."
NEXT_PUBLIC_PAYPAL_CLIENT_ID="AXabc123..."
```

切换时只需复制对应文件到 `.env.local`!

---

## ✅ 上线前检查

```bash
# 1. 检查环境
npm run paypal:check

# 2. 检查输出
✅ 生产环境 (Live)
✅ 生产Client ID: AXxxxxxxx...
✅ Secret已设置
✅ 与后端Client ID一致

# 3. 看到上面的 ✅ 就可以发布了!
```

---

## 🆘 常见错误

### 错误1: PayPal按钮无法加载

```bash
# 检查前端环境变量
echo $NEXT_PUBLIC_PAYPAL_CLIENT_ID
# 应该以 AX 开头 (生产) 或 sb- 开头 (沙箱)

# 解决: 重启开发服务器
npm run dev
```

### 错误2: 支付失败

```bash
# 运行检查脚本
npm run paypal:check

# 如果显示错误，根据提示修复
```

### 错误3: 模式不匹配

```
❌ 模式是live，但Client ID不是生产密钥
```

**解决**: Client ID和模式不匹配，检查 `.env.local`:
- `PAYPAL_MODE=live` → Client ID必须是 `AX...`
- `PAYPAL_MODE=sandbox` → Client ID必须是 `sb-...`

---

## 📞 需要帮助?

查看完整文档:
- 📖 `docs/PAYPAL_PRODUCTION_SETUP.md` - 详细部署指南
- 📖 `docs/PAYPAL_SANDBOX_SETUP.md` - 沙箱环境设置
- 📖 `docs/MEMBERSHIP_UPDATE_FLOW.md` - 支付流程说明

---

**记住**: 你的代码**无需任何修改**，只需更换环境变量! 🎉
