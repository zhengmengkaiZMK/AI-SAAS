# 导出功能测试指南

## 快速测试步骤

### 1. 准备测试环境
1. 确保服务器运行：`npm run dev`
2. 访问首页：http://localhost:3000
3. 登录账号（或使用游客模式）

### 2. 执行搜索获取报告
输入测试关键词（例如："Notion 使用痛点"），点击"查找痛点"按钮

### 3. 测试"复制报告"功能

#### 步骤：
1. 等待分析完成，滚动到页面底部
2. 点击 "Copy Report" 按钮
3. 观察按钮状态变化：图标变为 ✓，文字显示"已复制！"
4. 打开文本编辑器，粘贴内容（Ctrl+V 或 Cmd+V）

#### 预期结果：
```json
{
  "metadata": {
    "title": "Pain Point Analysis Report",
    "query": "Notion 使用痛点",
    "generatedAt": "2025/12/25 下午10:30:00",
    "frustrationScore": 85
  },
  "summary": "...",
  "insights": [...]
}
```

#### 验证点：
- ✅ JSON 格式正确（可以使用 jsonlint.com 验证）
- ✅ 包含所有字段：metadata, summary, insights
- ✅ insights 数组包含所有痛点详情
- ✅ userFeedback 包含 quote、author、source
- ✅ 按钮状态切换流畅（2秒后恢复）

---

### 4. 测试"导出 PDF"功能

#### 步骤：
1. 点击 "Export to PDF" 按钮
2. 等待浏览器打印对话框打开（约0.5秒）
3. 在打印预览中检查内容

#### 预期结果：
打开浏览器原生打印对话框，显示格式化的报告：

**页面结构：**
- 🔍 Pain Point Analysis Report（标题）
- 灰色元数据卡片（Query、Generated、Frustration Score）
- Executive Summary 区域（蓝色边框）
- Top Pain Points 列表
  - 每个痛点一张卡片
  - 彩色严重性徽章（红色=高，橙色=中，黄色=低）
  - 蓝色商机建议框
  - 用户引用（如果有）
- 页脚水印

#### 验证点：
- ✅ 所有文本内容完整显示
- ✅ 颜色和样式正确渲染
- ✅ 卡片不会跨页断裂
- ✅ 可以选择"另存为 PDF"
- ✅ 可以直接打印
- ✅ 预览窗口可以正常关闭

#### 保存 PDF：
1. 在打印对话框中选择"目标" → "另存为 PDF"
2. 选择保存位置
3. 点击"保存"按钮
4. 打开保存的 PDF 文件验证内容

---

### 5. 边界情况测试

#### 测试场景 A：无用户引用的痛点
- 某些痛点可能没有 `quote` 字段
- JSON 中 `userFeedback` 应为 `null`
- PDF 中不显示引用区域

#### 测试场景 B：中文界面
1. 访问：http://localhost:3000/zh
2. 执行相同的测试流程
3. 验证按钮文字显示中文：
   - "复制报告"
   - "已复制！"
   - "导出 PDF"
   - "导出中..."

#### 测试场景 C：错误处理
1. **剪贴板权限被拒绝**
   - 浏览器设置中禁用剪贴板权限
   - 点击复制按钮
   - 应显示错误提示："复制失败，请重试"

2. **弹窗被拦截**
   - 浏览器设置中启用严格弹窗拦截
   - 点击导出 PDF
   - 检查是否有提示用户允许弹窗

#### 测试场景 D：移动端
1. 使用浏览器开发者工具切换到移动视图
2. 测试按钮布局（应该垂直堆叠）
3. 测试复制和导出功能

---

### 6. 性能测试

#### 大数据量测试：
如果报告包含 10+ 个痛点：
- 复制速度应 < 1秒
- PDF 生成时间应 < 2秒
- 不应该卡顿或崩溃

#### 内存测试：
连续执行 5 次导出操作：
- 浏览器内存不应明显增长
- PDF 预览窗口应正确释放

---

### 7. 浏览器兼容性测试

在以下浏览器中测试：

| 浏览器 | 复制功能 | PDF 导出 | 备注 |
|--------|---------|---------|------|
| Chrome 120+ | ✅ | ✅ | 推荐 |
| Firefox 120+ | ✅ | ✅ | 推荐 |
| Safari 17+ | ✅ | ✅ | 需要 macOS/iOS |
| Edge 120+ | ✅ | ✅ | 推荐 |
| Mobile Safari | ✅ | ⚠️ | PDF 预览可能不同 |
| Mobile Chrome | ✅ | ⚠️ | PDF 预览可能不同 |

---

## 常见问题排查

### Q1: 点击"复制报告"后没有反应
**可能原因：**
- 浏览器不支持 Clipboard API
- 未使用 HTTPS 或 localhost
- 用户拒绝了剪贴板权限

**解决方法：**
1. 检查浏览器控制台是否有错误
2. 确认 URL 是 `localhost` 或 HTTPS
3. 重新授权剪贴板权限

### Q2: PDF 导出后样式错乱
**可能原因：**
- 浏览器缓存问题
- CSS 未正确加载

**解决方法：**
1. 清除浏览器缓存
2. 刷新页面重试
3. 检查控制台 CSS 错误

### Q3: 复制的 JSON 格式不正确
**可能原因：**
- 数据源包含特殊字符
- JSON 序列化失败

**解决方法：**
1. 使用 JSON 验证工具检查
2. 查看控制台错误日志
3. 报告 bug 给开发团队

### Q4: 移动端导出 PDF 失败
**说明：**
- 移动浏览器的打印功能可能受限
- 建议在桌面端使用 PDF 导出功能
- 移动端可以使用复制功能

---

## 开发者测试命令

### 单元测试（如果有）
```bash
npm test -- report-export
```

### 手动测试 JSON 生成
```javascript
// 在浏览器控制台执行
const testData = {
  data: {
    summary: "Test summary",
    frustrationScore: 85,
    insights: [
      {
        title: "Test Pain Point",
        severity: "High",
        category: "UX",
        description: "Test description",
        opportunity: "Test opportunity",
        quote: "Test quote",
      }
    ]
  },
  query: "test query",
  timestamp: new Date().toLocaleString(),
};

// 导入函数（需要在 pain-point-results 组件页面）
// 然后调用测试
```

---

## 测试完成检查清单

- [ ] ✅ 复制功能在 Chrome 中正常
- [ ] ✅ 复制功能在 Firefox 中正常
- [ ] ✅ PDF 导出在 Chrome 中正常
- [ ] ✅ PDF 导出在 Firefox 中正常
- [ ] ✅ 中文界面正常显示
- [ ] ✅ 英文界面正常显示
- [ ] ✅ 错误提示正常显示
- [ ] ✅ 按钮状态切换流畅
- [ ] ✅ JSON 格式正确
- [ ] ✅ PDF 样式美观
- [ ] ✅ 移动端布局正常
- [ ] ✅ 无控制台错误

---

## 反馈渠道

如发现问题，请记录：
1. 浏览器版本
2. 操作系统
3. 复现步骤
4. 错误截图
5. 控制台日志
