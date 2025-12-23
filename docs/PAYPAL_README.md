# PayPal支付集成文档索引

## 📚 文档导航

### 🚀 快速开始

- **[快速切换指南](./PAYPAL_QUICK_SWITCH.md)** ⭐ 推荐
  - 5分钟从沙箱切换到生产环境
  - 环境变量清单
  - 快速故障排除

### 📖 详细文档

1. **[沙箱环境设置](./PAYPAL_SANDBOX_SETUP.md)**
   - 创建开发者账号
   - 配置测试账户
   - 测试支付流程

2. **[测试账户使用指南](./PAYPAL_TEST_ACCOUNT_GUIDE.md)**
   - 买家账户使用
   - 商家账户使用
   - 常见问题

3. **[查看交易记录](./PAYPAL_VIEW_TRANSACTIONS.md)**
   - 商家后台导航
   - 交易详情查看
   - 退款操作

4. **[生产环境部署](./PAYPAL_PRODUCTION_SETUP.md)** ⭐ 重要
   - 获取生产凭证
   - 环境变量配置
   - Webhook设置
   - 安全检查清单

5. **[会员更新流程](./MEMBERSHIP_UPDATE_FLOW.md)**
   - 完整支付流程
   - 数据库更新机制
   - Session刷新逻辑
   - 前端显示位置

---

## ⚡ 常用命令

```bash
# 检查PayPal环境配置
npm run paypal:check

# 启动开发服务器
npm run dev

# 查看数据库
npm run db:studio

# 验证整体配置
npm run verify
```

---

## 🔧 核心文件

### 后端配置

- `lib/payment/paypal-config.ts` - PayPal API调用
- `app/api/payment/create-order/route.ts` - 创建订单
- `app/api/payment/capture-order/route.ts` - 捕获支付
- `app/api/user/refresh-session/route.ts` - 刷新会员状态

### 前端组件

- `components/payment/paypal-button.tsx` - PayPal按钮
- `components/pricing-with-payment.tsx` - 价格页面
- `app/(marketing)/payment/success/page.tsx` - 支付成功页

### 配置文件

- `constants/pricing-plans.ts` - 价格方案定义
- `.env.local` - 环境变量
- `.env.example` - 环境变量模板

---

## 🎯 快速参考

### 环境切换

| 配置项 | 沙箱 | 生产 |
|--------|------|------|
| `PAYPAL_MODE` | `sandbox` | `live` |
| `PAYPAL_CLIENT_ID` | `sb-xxx` | `AXxxx` |
| API URL | api-m.sandbox.paypal.com | api-m.paypal.com |
| 测试账号 | 沙箱账号 | 真实账号 |
| 扣款 | ❌ 虚拟 | ✅ 真实 |

### 价格方案

| 方案 | 月付 | 年付 | 会员类型 |
|------|------|------|---------|
| Hobby | $4 | $30 | FREE |
| Starter | $8 | $60 | PREMIUM |
| Professional | $12 | $100 | PREMIUM |
| Enterprise | 联系我们 | 联系我们 | ENTERPRISE |

---

## 🐛 故障排除

### 问题: PayPal按钮无法加载

**解决步骤**:
1. 运行 `npm run paypal:check`
2. 检查 `NEXT_PUBLIC_PAYPAL_CLIENT_ID` 是否设置
3. 重启开发服务器

### 问题: 支付成功但会员未更新

**检查点**:
1. 数据库连接正常?
2. `capture-order` API是否成功?
3. Session是否刷新?

**调试**:
```bash
# 查看数据库
npm run db:studio

# 检查payments表
# 检查users表的membership_type
```

### 问题: 生产环境配置错误

**验证**:
```bash
npm run paypal:check
```

查看输出中的错误提示并修复。

---

## 📞 获取帮助

### 官方资源

- [PayPal开发者文档](https://developer.paypal.com/docs/)
- [PayPal REST API](https://developer.paypal.com/api/rest/)
- [PayPal沙箱](https://www.sandbox.paypal.com/)

### 本地文档

- 查看 `docs/` 目录下的所有Markdown文件
- 运行 `npm run paypal:check` 获取配置建议

---

## 🔐 安全提醒

- ❌ **永远不要**提交 `.env.local` 到Git
- ❌ **永远不要**在前端代码中硬编码Secret
- ✅ **务必**在生产环境启用HTTPS
- ✅ **务必**验证PayPal Webhook签名
- ✅ **务必**从配置文件读取价格，而非前端传参

---

## 📋 上线检查清单

```
开发阶段:
[ ] 已配置沙箱环境
[ ] 已测试完整支付流程
[ ] 已验证会员更新逻辑
[ ] 已测试退款功能

上线准备:
[ ] 已获取生产凭证
[ ] 已更新环境变量
[ ] 运行 npm run paypal:check 通过
[ ] 已用$0.01测试真实支付
[ ] 已验证退款流程
[ ] 已恢复正常价格

生产环境:
[ ] 已配置Webhook (推荐)
[ ] 已启用HTTPS
[ ] 已配置监控和日志
[ ] 已准备客服响应
```

---

## 🎉 总结

PayPal集成的核心优势:
- ✅ **零代码修改** - 只需更换环境变量
- ✅ **自动切换** - 代码会根据`PAYPAL_MODE`自动选择API
- ✅ **完整流程** - 从支付到会员更新全自动
- ✅ **安全可靠** - 使用官方REST API

从开发到生产，只需**5分钟**! 🚀

---

**最后更新**: 2025-12-23
