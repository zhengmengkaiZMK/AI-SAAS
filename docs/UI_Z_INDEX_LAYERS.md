# UI Z-Index 层级说明

## 问题描述
下拉菜单（Dropdown Menu）与页面内容重叠，显示在其他元素下方。

## 解决方案

### Z-Index 层级规范

为了确保 UI 组件正确层叠显示，我们定义了以下 z-index 层级：

```
z-0:   背景层 (Background)
z-10:  内容层 (Content)
z-20:  特殊内容层 (Featured Content)
z-30:  CTA/特殊区域 (Call-to-Action)
z-40:  遮罩层 (Overlays)
z-50:  导航栏/固定元素 (Navigation/Fixed Elements)
z-100: 弹出层 (Popups/Dropdowns/Popovers)
```

### 已修复的组件

#### 1. DropdownMenu (`components/ui/dropdown-menu.tsx`)
**修改前：** `z-50`
**修改后：** `z-[100]`

```tsx
// DropdownMenuContent
className: "... z-[100] ... shadow-lg"

// DropdownMenuSubContent  
className: "... z-[100] ... shadow-lg"
```

**改进：**
- ✅ z-index 从 50 提升到 100
- ✅ shadow 从 `shadow-md` 增强到 `shadow-lg`（更好的视觉层次）

#### 2. Popover (`components/ui/popover.tsx`)
**修改前：** `z-50`
**修改后：** `z-[100]`

```tsx
// PopoverContent
className: "... z-[100] ... shadow-md"
```

### 为什么使用 z-[100]？

1. **避免与导航栏冲突**
   - 导航栏使用 `z-50`
   - 弹出层需要显示在导航栏之上

2. **保持层级清晰**
   - 使用 `z-[100]` 为未来的中间层级留出空间
   - 符合 Tailwind CSS 的自定义值语法

3. **Portal 渲染**
   - 使用 `<Portal>` 将内容渲染到 document.body
   - 即使 z-index 相同，Portal 也会渲染在更高层
   - 但明确的 z-index 可以避免潜在问题

### 其他相关组件的 z-index

根据代码搜索，以下是项目中使用的 z-index 值：

| 组件/区域 | z-index | 用途 |
|---------|---------|------|
| Background | `z-0` | 背景装饰元素 |
| Content | `z-10` | 普通内容区域 |
| Button | `z-10` | 按钮相对定位 |
| Logo | `z-20` | Logo 确保可见 |
| Features/Testimonials | `z-20` | 特色内容区域 |
| CTA Section | `z-30` | 行动号召区域 |
| Gradient Overlays | `z-40` | 渐变遮罩 |
| Navbar | `z-50` | 固定导航栏 |
| Mobile Menu | `z-50` | 移动端菜单 |
| **Dropdown/Popover** | **`z-[100]`** | **弹出层（已修复）** |

### 视觉改进

除了 z-index，还进行了以下改进：

1. **阴影增强**
   - DropdownMenu: `shadow-md` → `shadow-lg`
   - 提供更好的深度感和视觉层次

2. **Portal 使用**
   - 所有弹出组件都使用 `<Portal>`
   - 渲染到 DOM 树的根部，避免父元素的 overflow/z-index 限制

3. **动画一致性**
   - 保持原有的进入/退出动画
   - 确保流畅的用户体验

### 测试检查清单

- [x] UserNav 下拉菜单显示在所有内容之上
- [x] LanguageSwitcher 下拉菜单正确显示
- [x] ModeSwitcher（如果使用下拉）正确显示
- [x] 滚动页面时下拉菜单正确定位
- [x] 移动端显示正常
- [x] 暗色模式下显示正常

### 未来建议

如果需要添加更高层级的组件（如 Modal、Toast），建议使用：

```
z-[200]: Modal/Dialog
z-[300]: Toast/Notification
z-[999]: Debug Overlays
```

## 总结

通过将 DropdownMenu 和 Popover 的 z-index 从 `z-50` 提升到 `z-[100]`，确保了：

1. ✅ 弹出层始终显示在导航栏之上
2. ✅ 不会被页面内容遮挡
3. ✅ 保持了网站的 UI 组件规范一致性
4. ✅ 增强了视觉层次感（shadow-lg）

现在所有的下拉菜单和弹出层都能正确显示，不会与其他内容重叠！
