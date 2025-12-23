# PayPal 沙箱测试账户设置指南

## 问题：PayPal登录后要求输入卡号

### 原因
沙箱测试账户默认余额为0，PayPal会要求添加支付方式。

---

## 解决方法

### 方法1：给测试账户添加余额

1. **登录 PayPal Developer Dashboard**
   - https://developer.paypal.com/dashboard/

2. **进入 Sandbox Accounts**
   - 点击左侧菜单 "Testing Tools" → "Sandbox Accounts"

3. **找到你的买家测试账号**
   - 邮箱格式：`sb-xxxxx@personal.example.com`
   - 点击账号右侧的 "..." → "View/Edit Account"

4. **设置余额**
   - 在 "Funding" 标签页
   - 设置 "PayPal Balance" 为 `100.00` USD
   - 点击 "Save"

5. **重新测试支付**
   - 现在登录时应该可以直接使用PayPal余额支付
   - 不需要输入卡号

---

### 方法2：使用预创建的测试账户

PayPal会为你自动创建两个测试账户：

#### 买家账户（Personal Account）
- **用途**：用于测试支付
- **邮箱**：`sb-xxxxx@personal.example.com`
- **默认余额**：通常已有余额

#### 卖家账户（Business Account）  
- **用途**：接收支付
- **邮箱**：`sb-yyyyy@business.example.com`

**查看账户详情：**
1. 在 Sandbox Accounts 列表中找到账户
2. 点击 "..." → "View/Edit Account"
3. 在 "Profile" 标签查看：
   - Email
   - Password
   - Balance（余额）

---

### 方法3：修改支付流程（不推荐）

如果你想测试信用卡支付，可以使用PayPal提供的测试卡号：

**测试信用卡**
- **卡号**：4032039974482896 (Visa)
- **过期日期**：任意未来日期（如 12/2025）
- **CVV**：任意3位数字（如 123）
- **账单地址**：任意美国地址

但这不是纯PayPal支付，会绕过PayPal余额。

---

## 推荐的测试流程

### Step 1: 准备测试账户
```bash
1. 登录 https://developer.paypal.com/dashboard/
2. 进入 Sandbox Accounts
3. 确认买家账户有余额（至少$100）
4. 记录买家账户的邮箱和密码
```

### Step 2: 测试支付
```bash
1. 访问你的网站 pricing 页面
2. 选择 Starter ($0.01/mo)
3. 点击 PayPal 按钮
4. 在弹窗中登录测试买家账户
5. 应该看到余额可用，直接完成支付
```

### Step 3: 验证结果
```bash
1. 查看是否跳转到成功页面
2. 检查数据库是否记录支付
3. 验证会员等级是否升级
```

---

## 常见问题

### Q1: 找不到测试账户密码？
**A**: 在 Sandbox Accounts → View/Edit Account → Profile 中查看或重置密码

### Q2: 测试账户余额不够？
**A**: 在 View/Edit Account → Funding 中修改 PayPal Balance

### Q3: 想要测试真实的银行卡支付？
**A**: 使用生产环境，沙箱环境只支持测试数据

### Q4: 支付后没有升级会员？
**A**: 检查浏览器控制台和服务器日志，查看支付捕获是否成功

---

## 快速设置脚本

如果你想快速设置，按以下步骤：

1. 访问：https://developer.paypal.com/dashboard/accounts
2. 选择你的买家测试账户
3. 编辑账户，设置余额为 $100
4. 保存
5. 使用该账户登录测试支付

完成！现在你可以使用纯PayPal余额进行测试了。
