import { NextRequest, NextResponse } from 'next/server';
import { SerperService } from '@/lib/services/serper.service';

export async function GET(
  req: NextRequest,
  { params }: { params: { name: string } }
) {
  try {
    // 获取子版块名称和可选查询
    const { name } = params;
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('query') || '';
    const num = parseInt(searchParams.get('num') || '25');
    const tbs = searchParams.get('tbs') || undefined;
    
    console.log('[API] Subreddit search request:', { 
      subreddit: name, 
      query, 
      num,
      tbs 
    });
    
    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Subreddit name is required' },
        { status: 400 }
      );
    }
    
    // 搜索子版块
    const result = await SerperService.searchSubreddit(
      name,
      query,
      Math.min(num, 25),
      tbs
    );
    
    console.log('[API] Subreddit search completed:', {
      subreddit: name,
      postsCount: result.posts.length,
    });
    
    return NextResponse.json({
      success: true,
      data: result.posts,
      total: result.total,
      searchTime: result.searchTime,
      subreddit: name,
    });
    
  } catch (error) {
    console.error('[API] Subreddit search error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Search failed' },
      { status: 500 }
    );
  }
}
