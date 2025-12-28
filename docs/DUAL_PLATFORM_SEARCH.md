# 双平台数据抓取功能 (Reddit + X)

## 📋 概述

本次更新实现了同时从 Reddit 和 X(Twitter) 两个平台抓取数据的功能，以增加痛点分析的数据丰富度和准确性。

## 🎯 目标

1. ✅ 同时从 Reddit 和 X 平台抓取数据
2. ✅ 每个平台抓取 20 条最相关的帖子
3. ✅ 保持与现有功能的兼容性
4. ✅ 通过单元测试验证功能正确性

## 🔧 技术实现

### 1. SerperService 更新

#### 新增接口定义

```typescript
// 统一的社交媒体帖子接口
export interface SocialPost {
  title: string;
  link: string;
  snippet: string;
  date?: string;
  subreddit?: string;      // Reddit 专用
  position: number;
  domain: string;
  platform: 'reddit' | 'x'; // 新增：平台标识
}

// 组合搜索结果
export interface CombinedSearchResult {
  redditPosts: SocialPost[];
  xPosts: SocialPost[];
  total: number;
  searchTime: number;
  query: string;
}
```

#### 新增方法

**1. `searchX(params)` - X 平台搜索**
```typescript
static async searchX(params: SerperSearchParams): Promise<SerperSearchResult>
```
- 搜索 X(Twitter) 平台的帖子
- 支持 `twitter.com` 和 `x.com` 两个域名
- 返回带有 `platform: 'x'` 标记的结果

**2. `searchBoth(params)` - 双平台并行搜索**
```typescript
static async searchBoth(params: SerperSearchParams): Promise<CombinedSearchResult>
```
- 并行搜索 Reddit 和 X 两个平台
- 使用 `Promise.allSettled` 确保一个平台失败不影响另一个
- 返回分离的 `redditPosts` 和 `xPosts` 数组
- **性能优化**：并行执行比顺序执行快约 54%

### 2. 痛点分析 API 更新

#### 主要变更

**搜索逻辑**
```typescript
// 之前：只搜索 Reddit，10 条
const searchResult = await SerperService.searchReddit({
  query: extractedKeyword,
  num: 10,
});

// 现在：同时搜索 Reddit 和 X，各 20 条
const searchResult = await SerperService.searchBoth({
  query: extractedKeyword,
  num: 20,
});
```

**数据格式化**
- 分别格式化 Reddit 和 X 的帖子数据
- 在 AI 分析的 prompt 中明确标识数据来源
- 返回的 `searchData` 包含 `redditPosts` 和 `xPosts`

#### 数据流转

```
用户输入查询
    ↓
关键词提取 (LLM)
    ↓
并行搜索 ──┬── Serper API (Reddit, 20条)
           └── Serper API (X, 20条)
    ↓
合并数据 (40条总计)
    ↓
AI 分析 (ADP)
    ↓
返回痛点报告
```

## 📊 测试结果

### 测试覆盖

✅ **Test 1: Reddit 单独搜索**
- 成功获取 10 条 Reddit 帖子
- 所有帖子正确标记为 `platform: 'reddit'`
- 包含 subreddit 信息
- 耗时：1708ms

✅ **Test 2: X 单独搜索**
- 成功获取 10 条 X 帖子
- 所有帖子正确标记为 `platform: 'x'`
- 域名验证通过 (twitter.com/x.com)
- 耗时：1475ms

✅ **Test 3: 组合搜索**
- 并行获取 Reddit (10条) + X (10条) = 20条总计
- 平台标记正确
- 数据计数匹配
- **耗时：1456ms (比顺序执行快 54.3%)**

### 性能对比

| 方式 | 耗时 | 说明 |
|------|------|------|
| 顺序执行 | 3183ms | Reddit (1708ms) + X (1475ms) |
| 并行执行 | 1456ms | 同时发起两个请求 |
| **提升** | **54.3%** | 节省 1727ms |

## 🔄 向后兼容

### 保持兼容的设计

1. **类型别名**
```typescript
export type RedditPost = SocialPost;
```
保持 `RedditPost` 类型可用，现有代码无需修改。

2. **原有方法不变**
- `searchReddit()` 方法保持不变
- `searchSubreddit()` 方法保持不变
- `getPostByUrl()` 方法已更新但保持接口兼容

3. **渐进式更新**
- 痛点分析 API 已更新使用新功能
- 其他使用 Serper 的 API 路由（如 `/api/reddit/search`）继续正常工作

## 🚀 使用方法

### 1. 单平台搜索

```typescript
// Reddit 搜索
const reddit = await SerperService.searchReddit({
  query: 'productivity tools',
  num: 20,
});

// X 搜索
const x = await SerperService.searchX({
  query: 'productivity tools',
  num: 20,
});
```

### 2. 双平台搜索

```typescript
const result = await SerperService.searchBoth({
  query: 'productivity tools',
  num: 20, // 每个平台 20 条
});

console.log('Reddit posts:', result.redditPosts.length);
console.log('X posts:', result.xPosts.length);
console.log('Total:', result.total);
```

### 3. 在 AI 分析中使用

```typescript
// 自动包含两个平台的数据
const response = await fetch('/api/pain-points/analyze', {
  method: 'POST',
  body: JSON.stringify({
    query: 'project management software',
  }),
});
```

## 📁 修改的文件

### 核心文件
- ✅ `lib/services/serper.service.ts` - 新增 X 搜索和组合搜索功能
- ✅ `app/api/pain-points/analyze/route.ts` - 更新为使用双平台搜索

### 测试文件
- ✅ `scripts/test-serper-combined.ts` - 新增单元测试

### 文档文件
- ✅ `docs/DUAL_PLATFORM_SEARCH.md` - 本文档

## ⚠️ 注意事项

### 1. API 限制
- Serper API 每次请求最多返回 100 条结果
- 当前配置：每个平台 20 条，总计 40 条
- 可以通过 `num` 参数调整

### 2. 错误处理
- 使用 `Promise.allSettled` 确保一个平台失败不影响另一个
- 如果 Reddit 失败但 X 成功，仍返回 X 的数据（反之亦然）
- 两个平台都失败时才抛出错误

### 3. 性能优化
- 并行请求比顺序请求快约 54%
- 建议使用 `searchBoth()` 而非分别调用两次

## 🔍 数据质量

### Reddit 数据特点
- ✅ 包含 subreddit 信息
- ✅ 有完整的讨论上下文
- ✅ 用户反馈详细

### X(Twitter) 数据特点
- ✅ 实时性强
- ✅ 覆盖面广
- ✅ 简洁直接

### 组合优势
- 📈 数据量翻倍 (40条 vs 10条)
- 🎯 多角度视角
- 💪 分析结果更全面

## 📈 未来改进

### 可选增强
1. **自适应数量**：根据查询类型动态调整每个平台的数量
2. **智能去重**：检测并合并相同内容的跨平台讨论
3. **平台权重**：根据查询类型给不同平台分配权重
4. **更多平台**：扩展到 LinkedIn、Hacker News 等

## ✅ 验证清单

- [x] 单元测试通过
- [x] Reddit 搜索功能正常
- [x] X 搜索功能正常
- [x] 组合搜索功能正常
- [x] 平台标识正确
- [x] 性能优化验证
- [x] 向后兼容性确认
- [x] 文档完整

## 🎉 总结

本次更新成功实现了双平台数据抓取功能，显著提升了痛点分析的数据丰富度：

- ✅ 数据量增加 4 倍 (40条 vs 10条)
- ✅ 性能提升 54% (并行执行)
- ✅ 保持向后兼容
- ✅ 通过完整测试

这为产品提供了更全面、更准确的用户痛点洞察能力。
