# 报告导出功能说明

## 功能概述

痛点分析报告支持两种导出方式：
1. **复制到剪贴板** - 以 JSON 格式复制完整报告数据
2. **导出为 PDF** - 通过浏览器打印功能生成专业格式的 PDF 文档

---

## 1. 复制报告 (Copy Report)

### 功能说明
点击"复制报告"按钮后，系统会将分析报告以 **JSON 格式**复制到剪贴板。

### JSON 数据结构
```json
{
  "metadata": {
    "title": "Pain Point Analysis Report",
    "query": "用户搜索的关键词",
    "generatedAt": "2025-12-25T14:30:00.000Z",
    "frustrationScore": 85
  },
  "summary": "执行摘要内容...",
  "insights": [
    {
      "rank": 1,
      "title": "痛点标题",
      "severity": "High Severity",
      "category": "类别",
      "description": "问题描述",
      "opportunity": "商机建议",
      "userFeedback": {
        "quote": "用户引用",
        "author": "Reddit User",
        "source": "https://reddit.com/..."
      }
    }
  ]
}
```

### 使用场景
- 将数据导入其他工具进行分析
- 保存为 JSON 文件备份
- 与团队成员分享结构化数据
- API 集成或自动化处理

### 用户体验
- 点击按钮后立即复制
- 按钮图标变为 ✓，显示"已复制！"
- 2秒后自动恢复原始状态
- 复制失败会弹窗提示

---

## 2. 导出 PDF (Export to PDF)

### 功能说明
点击"导出 PDF"按钮后，系统会打开浏览器打印对话框，用户可以：
- 保存为 PDF 文件
- 直接打印纸质版本
- 调整打印设置（页边距、方向等）

### PDF 文档结构
1. **报告标题** - Pain Point Analysis Report
2. **元数据区域**
   - 搜索关键词
   - 生成时间
   - 愤怒指数评分
3. **执行摘要** - 高亮背景显示
4. **痛点详情卡片**
   - 排名和标题
   - 严重性徽章（彩色标签）
   - 类别标签
   - 问题描述
   - 商机建议（蓝色高亮框）
   - 用户引用（如果有）
5. **页脚** - 生成工具信息

### 样式特点
- 专业的排版和间距
- 彩色徽章区分严重性
- 避免跨页断裂
- 打印友好的配色方案
- 支持浏览器暗色模式预览

### 使用场景
- 向客户展示分析报告
- 会议资料准备
- 存档备份
- 离线阅读

### 用户体验
- 点击按钮后显示"导出中..."
- 自动打开浏览器打印对话框
- 用户可预览后再决定保存或打印
- 无需安装额外插件或库

---

## 技术实现

### 架构设计
采用**低耦合、高内聚**的设计原则：

```
lib/report-export.ts (独立工具库)
    ↓
components/pain-point-results.tsx (UI组件)
    ↓
用户操作 → 功能触发
```

### 核心文件
- `lib/report-export.ts` - 导出功能的核心逻辑
- `components/pain-point-results.tsx` - UI 组件集成

### 关键函数

#### `generateReportJSON(reportData)`
生成标准化的 JSON 格式报告

#### `generateReportMarkdown(reportData)` 
生成 Markdown 格式报告（可选）

#### `copyReportToClipboard(reportData, format)`
复制报告到剪贴板
- 参数：`format` 支持 'json' 或 'markdown'
- 返回：Promise<boolean>

#### `exportReportToPDF(reportData)`
导出为 PDF（使用浏览器打印）
- 创建临时打印窗口
- 注入格式化的 HTML 和 CSS
- 自动触发打印对话框

### 依赖项
- **零外部依赖** - 仅使用浏览器原生 API
- `navigator.clipboard` - 剪贴板 API
- `window.open()` + `window.print()` - 打印功能

### 浏览器兼容性
- ✅ Chrome/Edge 85+
- ✅ Firefox 80+
- ✅ Safari 14+
- ⚠️ 需要 HTTPS 或 localhost（剪贴板 API 要求）

---

## 扩展性

### 添加新的导出格式
在 `lib/report-export.ts` 中添加新函数：

```typescript
export function generateReportCSV(reportData: ReportData): string {
  // 实现 CSV 导出逻辑
}
```

### 自定义 PDF 样式
修改 `exportReportToPDF()` 函数中的 `<style>` 部分

### 支持多语言
所有用户可见文本已支持中英文切换（基于路由 `/zh`）

---

## 注意事项

1. **剪贴板权限**
   - 首次使用可能需要用户授权
   - 必须在 HTTPS 或 localhost 下运行

2. **弹窗拦截**
   - PDF 导出使用 `window.open()`
   - 某些浏览器可能需要用户允许弹窗

3. **数据隐私**
   - 所有操作在客户端完成
   - 不会将数据发送到服务器
   - PDF 生成完全本地化

4. **性能考虑**
   - 大型报告（>100个痛点）可能需要较长打印时间
   - 建议在结果页面加载完成后再导出

---

## 测试检查清单

- [ ] 复制 JSON 格式报告成功
- [ ] 按钮状态切换正常（复制后显示 ✓）
- [ ] PDF 打印对话框正常打开
- [ ] PDF 内容格式正确（标题、徽章、布局）
- [ ] 支持中英文切换
- [ ] 错误提示正常显示
- [ ] 移动端适配正常
- [ ] 暗色模式下样式正常

---

## 未来改进方向

1. **高级 PDF 功能**
   - 使用 jsPDF 或 pdfmake 库
   - 添加图表和可视化
   - 支持页眉页脚

2. **更多导出格式**
   - CSV（适合 Excel 分析）
   - DOCX（可编辑文档）
   - PNG/JPEG（图片格式）

3. **云端保存**
   - 集成 Google Drive
   - 集成 Dropbox
   - 支持直接分享链接

4. **报告模板**
   - 允许用户选择不同样式
   - 自定义品牌颜色和 Logo
   - 多种布局选项
