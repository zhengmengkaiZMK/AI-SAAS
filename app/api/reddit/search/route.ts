import { NextRequest, NextResponse } from 'next/server';
import { SerperService } from '@/lib/services/serper.service';

export async function POST(req: NextRequest) {
  try {
    // 获取搜索参数
    const body = await req.json();
    const { query, num = 25, page = 1, tbs } = body;
    
    console.log('[API] Reddit search request:', { query, num, page, tbs });
    
    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      );
    }
    
    // 调用Serper搜索
    const result = await SerperService.searchReddit({
      query: query.trim(),
      num: Math.min(num, 25), // 限制最多25条
      page,
      tbs,
    });
    
    console.log('[API] Search completed:', {
      query: result.query,
      postsCount: result.posts.length,
      total: result.total,
    });
    
    return NextResponse.json({
      success: true,
      data: result.posts,
      total: result.total,
      searchTime: result.searchTime,
      query: result.query,
    });
    
  } catch (error) {
    console.error('[API] Reddit search error:', error);
    
    // 区分不同类型的错误
    if (error instanceof Error) {
      if (error.message.includes('timeout')) {
        return NextResponse.json(
          { error: 'Search timeout. Please try again.' },
          { status: 504 }
        );
      }
      if (error.message.includes('SERPER_API_KEY')) {
        return NextResponse.json(
          { error: 'Service configuration error.' },
          { status: 500 }
        );
      }
      
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Search failed. Please try again later.' },
      { status: 500 }
    );
  }
}
