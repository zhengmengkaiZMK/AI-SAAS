/**
 * Serper.dev API客户端
 * 用于搜索Reddit内容
 */

const SERPER_API_URL = process.env.SERPER_API_URL || 'https://google.serper.dev/search';
const SERPER_API_KEY = process.env.SERPER_API_KEY || '66c8fcd3f7280a42e045cce7193382a6fd64125a';
const SERPER_TIMEOUT = parseInt(process.env.SERPER_TIMEOUT || '10000');

export interface SerperSearchParams {
  query: string;
  num?: number;
  page?: number;
  gl?: string; // 国家代码
  hl?: string; // 语言代码
  tbs?: string; // 时间范围过滤
}

export interface RedditPost {
  title: string;
  link: string;
  snippet: string;
  date?: string;
  subreddit?: string;
  position: number;
  domain: string;
}

export interface SerperSearchResult {
  posts: RedditPost[];
  total: number;
  searchTime: number;
  query: string;
}

export class SerperService {
  
  /**
   * 搜索Reddit帖子
   */
  static async searchReddit(params: SerperSearchParams): Promise<SerperSearchResult> {
    const { query, num = 25, page = 1, gl = 'us', hl = 'en', tbs } = params;
    
    if (!query || query.trim().length === 0) {
      throw new Error('Search query is required');
    }
    
    if (!SERPER_API_KEY) {
      throw new Error('SERPER_API_KEY is not configured');
    }
    
    try {
      // 构建搜索查询，限定在Reddit站点
      const searchQuery = `site:reddit.com ${query.trim()}`;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), SERPER_TIMEOUT);
      
      const requestBody: any = {
        q: searchQuery,
        num: Math.min(num, 100), // 限制最多100条
        page,
        gl,
        hl,
        autocorrect: true,
      };

      // 如果有时间范围过滤，添加tbs参数
      if (tbs) {
        requestBody.tbs = tbs;
      }
      
      console.log('[Serper] Sending request:', {
        url: SERPER_API_URL,
        query: searchQuery,
        num,
        page,
        tbs,
      });

      const response = await fetch(SERPER_API_URL, {
        method: 'POST',
        headers: {
          'X-API-KEY': SERPER_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[Serper] API error:', response.status, errorText);
        throw new Error(`Serper API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('[Serper] Response received:', {
        organicCount: data.organic?.length || 0,
        totalResults: data.searchInformation?.totalResults,
      });
      
      // 解析结果
      const posts = this.parseSearchResults(data);
      
      return {
        posts,
        total: this.parseTotalResults(data.searchInformation?.totalResults),
        searchTime: data.searchInformation?.timeTaken || 0,
        query: query,
      };

    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.error('[Serper] Request timeout');
        throw new Error('Search request timeout');
      }
      console.error('[Serper] Search error:', error);
      throw new Error(error instanceof Error ? error.message : 'Search failed');
    }
  }

  /**
   * 搜索指定子版块的帖子
   */
  static async searchSubreddit(
    subreddit: string,
    query?: string,
    num: number = 25,
    tbs?: string
  ): Promise<SerperSearchResult> {
    if (!subreddit || subreddit.trim().length === 0) {
      throw new Error('Subreddit name is required');
    }
    
    // 移除r/前缀（如果有）
    const cleanSubreddit = subreddit.replace(/^r\//, '').trim();
    
    // 构建子版块搜索
    const searchQuery = query && query.trim()
      ? `site:reddit.com/r/${cleanSubreddit} ${query.trim()}`
      : `site:reddit.com/r/${cleanSubreddit}`;
    
    return this.searchReddit({ query: searchQuery, num, tbs });
  }

  /**
   * 解析Serper返回的搜索结果
   */
  private static parseSearchResults(data: any): RedditPost[] {
    const organic = data.organic || [];
    
    return organic.map((result: any, index: number) => {
      // 从URL中提取子版块名称
      const subredditMatch = result.link?.match(/reddit\.com\/r\/([^\/]+)/);
      const subreddit = subredditMatch ? subredditMatch[1] : null;
      
      return {
        title: result.title || 'Untitled',
        link: result.link || '',
        snippet: result.snippet || '',
        date: result.date || null,
        subreddit,
        position: result.position || index + 1,
        domain: result.domain || 'reddit.com',
      };
    }).filter(post => post.link); // 过滤掉没有链接的结果
  }

  /**
   * 解析总结果数量
   */
  private static parseTotalResults(totalStr?: string): number {
    if (!totalStr) return 0;
    // 移除逗号，转换为数字
    const num = parseInt(totalStr.replace(/,/g, ''));
    return isNaN(num) ? 0 : num;
  }

  /**
   * 获取单个Reddit帖子详情（通过URL）
   */
  static async getPostByUrl(postUrl: string): Promise<RedditPost | null> {
    if (!postUrl) {
      throw new Error('Post URL is required');
    }
    
    try {
      const response = await fetch(SERPER_API_URL, {
        method: 'POST',
        headers: {
          'X-API-KEY': SERPER_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: `site:${postUrl}`,
          num: 1,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch post details');
      }

      const data = await response.json();
      const posts = this.parseSearchResults(data);
      
      return posts[0] || null;

    } catch (error) {
      console.error('[Serper] Get post error:', error);
      return null;
    }
  }
}
