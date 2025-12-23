'use client';

import { useState } from 'react';
import { Search, ExternalLink, Loader2, AlertCircle, CheckCircle2, TrendingUp } from 'lucide-react';

interface RedditPost {
  title: string;
  link: string;
  snippet: string;
  date?: string;
  subreddit?: string;
  position: number;
  domain: string;
}

interface SearchResponse {
  success: boolean;
  data: RedditPost[];
  total: number;
  searchTime: number;
  query: string;
  error?: string;
}

const POPULAR_SUBREDDITS = [
  'python', 'javascript', 'webdev', 'programming',
  'technology', 'gaming', 'fitness', 'cooking'
];

const TIME_RANGES = [
  { value: '', label: '不限时间' },
  { value: 'qdr:h', label: '过去1小时' },
  { value: 'qdr:d', label: '过去24小时' },
  { value: 'qdr:w', label: '过去1周' },
  { value: 'qdr:m', label: '过去1月' },
  { value: 'qdr:y', label: '过去1年' },
];

export default function RedditTestPage() {
  // 搜索参数
  const [query, setQuery] = useState('');
  const [subreddit, setSubreddit] = useState('');
  const [numResults, setNumResults] = useState(10);
  const [timeRange, setTimeRange] = useState('');
  
  // 搜索结果
  const [results, setResults] = useState<RedditPost[]>([]);
  const [searchInfo, setSearchInfo] = useState<{
    total: number;
    searchTime: number;
    query: string;
  } | null>(null);
  
  // UI状态
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSearch = async () => {
    if (!query.trim() && !subreddit.trim()) {
      setError('请输入搜索关键词或选择一个子版块');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    setResults([]);
    setSearchInfo(null);

    try {
      let endpoint: string;
      let options: RequestInit;

      if (subreddit.trim()) {
        // 搜索特定子版块
        const params = new URLSearchParams();
        if (query.trim()) params.append('query', query.trim());
        params.append('num', numResults.toString());
        if (timeRange) params.append('tbs', timeRange);
        
        endpoint = `/api/reddit/subreddit/${subreddit}?${params.toString()}`;
        options = { method: 'GET' };
      } else {
        // 全站搜索
        endpoint = '/api/reddit/search';
        const body: any = {
          query: query.trim(),
          num: numResults,
        };
        if (timeRange) body.tbs = timeRange;
        
        options = {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        };
      }

      console.log('发送请求到:', endpoint);
      const startTime = Date.now();
      
      const response = await fetch(endpoint, options);
      const data: SearchResponse = await response.json();
      
      const duration = Date.now() - startTime;

      if (!response.ok) {
        throw new Error(data.error || '搜索失败');
      }

      setResults(data.data || []);
      setSearchInfo({
        total: data.total || 0,
        searchTime: data.searchTime || 0,
        query: data.query || query,
      });
      setSuccess(`✓ 搜索完成，耗时 ${duration}ms（API响应：${(data.searchTime || 0).toFixed(2)}秒）`);

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '搜索失败';
      setError(errorMsg);
      console.error('搜索错误:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubredditClick = (sub: string) => {
    setSubreddit(sub);
  };

  const clearAll = () => {
    setQuery('');
    setSubreddit('');
    setNumResults(10);
    setTimeRange('');
    setResults([]);
    setSearchInfo(null);
    setError('');
    setSuccess('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            🔍 Reddit 搜索测试页面
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            基于 Serper.dev API - 测试 Reddit 内容检索功能
          </p>
        </div>

        {/* Search Configuration Panel */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">
            搜索配置
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Query Input */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                搜索关键词 *
              </label>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="例如：python技巧、web开发..."
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                  focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                  placeholder-gray-400 dark:placeholder-gray-500"
                disabled={loading}
              />
            </div>

            {/* Subreddit Input */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                子版块（可选）
              </label>
              <input
                type="text"
                value={subreddit}
                onChange={(e) => setSubreddit(e.target.value)}
                placeholder="例如：python, webdev..."
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg
                  focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                  placeholder-gray-400 dark:placeholder-gray-500"
                disabled={loading}
              />
            </div>

            {/* Number of Results */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                结果数量
              </label>
              <select
                value={numResults}
                onChange={(e) => setNumResults(parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg
                  focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                disabled={loading}
              >
                <option value={5}>5 条结果</option>
                <option value={10}>10 条结果</option>
                <option value={15}>15 条结果</option>
                <option value={20}>20 条结果</option>
                <option value={25}>25 条结果</option>
              </select>
            </div>

            {/* Time Range */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                时间范围
              </label>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg
                  focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                disabled={loading}
              >
                {TIME_RANGES.map(range => (
                  <option key={range.value} value={range.value}>
                    {range.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Popular Subreddits */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                <TrendingUp className="inline w-4 h-4 mr-1" />
                快捷选择子版块
              </label>
              <div className="flex flex-wrap gap-2">
                {POPULAR_SUBREDDITS.map((sub) => (
                  <button
                    key={sub}
                    onClick={() => handleSubredditClick(sub)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all
                      ${subreddit === sub 
                        ? 'bg-blue-600 text-white shadow-md' 
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    disabled={loading}
                  >
                    r/{sub}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mt-8">
            <button
              onClick={handleSearch}
              disabled={loading || (!query.trim() && !subreddit.trim())}
              className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg 
                hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed
                flex items-center justify-center gap-2 font-medium text-lg
                transition-all shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <>
                  <Loader2 size={24} className="animate-spin" />
                  搜索中...
                </>
              ) : (
                <>
                  <Search size={24} />
                  搜索 Reddit
                </>
              )}
            </button>
            
            <button
              onClick={clearAll}
              disabled={loading}
              className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 
                rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 font-medium
                transition-all disabled:opacity-50"
            >
              清空全部
            </button>
          </div>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 
            text-red-700 dark:text-red-400 px-6 py-4 rounded-lg mb-6 flex items-start gap-3">
            <AlertCircle size={24} className="flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold">错误</div>
              <div>{error}</div>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 
            text-green-700 dark:text-green-400 px-6 py-4 rounded-lg mb-6 flex items-start gap-3">
            <CheckCircle2 size={24} className="flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold">成功</div>
              <div>{success}</div>
            </div>
          </div>
        )}

        {/* Search Info */}
        {searchInfo && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 
            text-blue-700 dark:text-blue-400 px-6 py-4 rounded-lg mb-6">
            <div className="font-semibold mb-2">搜索统计</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium">查询词：</span> {searchInfo.query}
              </div>
              <div>
                <span className="font-medium">总结果数：</span> {searchInfo.total.toLocaleString()}
              </div>
              <div>
                <span className="font-medium">API耗时：</span> {searchInfo.searchTime.toFixed(2)}秒
              </div>
            </div>
          </div>
        )}

        {/* Search Results */}
        {results.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              搜索结果（{results.length} 条）
            </h2>
            
            {results.map((post, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md 
                  hover:shadow-2xl transition-all p-6 border border-gray-200 dark:border-gray-700"
              >
                {/* Position & Subreddit Badge */}
                <div className="flex items-center gap-3 mb-3">
                  <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 
                    text-xs font-bold rounded-full">
                    #{post.position}
                  </span>
                  {post.subreddit && (
                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 
                      text-xs font-medium rounded-full">
                      r/{post.subreddit}
                    </span>
                  )}
                  {post.date && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {post.date}
                    </span>
                  )}
                </div>

                {/* Title */}
                <a
                  href={post.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xl font-semibold text-blue-600 dark:text-blue-400 
                    hover:underline flex items-start gap-2 group mb-3"
                >
                  <span className="flex-1">{post.title}</span>
                  <ExternalLink 
                    size={20} 
                    className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity mt-1" 
                  />
                </a>

                {/* Snippet */}
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                  {post.snippet}
                </p>

                {/* Link */}
                <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  🔗 {post.link}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && results.length === 0 && !error && (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
            <Search size={80} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-xl mb-2">
              暂无搜索结果
            </p>
            <p className="text-gray-400 dark:text-gray-500 text-sm">
              输入搜索关键词并点击"搜索 Reddit"开始使用
            </p>
          </div>
        )}

        {/* Debug Info */}
        <div className="mt-8 p-6 bg-gray-100 dark:bg-gray-900 rounded-lg">
          <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
            🛠️ 调试信息
          </h3>
          <div className="space-y-2 text-sm font-mono text-gray-700 dark:text-gray-300">
            <div><strong>API 地址：</strong> {subreddit.trim() ? `/api/reddit/subreddit/${subreddit}` : '/api/reddit/search'}</div>
            <div><strong>请求方法：</strong> {subreddit.trim() ? 'GET' : 'POST'}</div>
            <div><strong>查询词：</strong> {query || '(空)'}</div>
            <div><strong>子版块：</strong> {subreddit || '(全部)'}</div>
            <div><strong>结果数量：</strong> {numResults}</div>
            <div><strong>时间范围：</strong> {timeRange || '不限时间'}</div>
            <div><strong>返回结果：</strong> {results.length} 条</div>
          </div>
        </div>
      </div>
    </div>
  );
}
