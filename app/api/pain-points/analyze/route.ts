import { NextRequest, NextResponse } from 'next/server';
import { SerperService } from '@/lib/services/serper.service';
import { ADPService } from '@/lib/services/adp.service';

export const runtime = 'edge';

/**
 * 痛点分析API
 * 组合调用Serper和ADP接口
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query, platforms = ['reddit'] } = body;

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    console.log('[PainPointAnalyze] Starting analysis:', { query, platforms });

    // 创建SSE流
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // 步骤1: 发送开始事件
          controller.enqueue(
            encoder.encode(`event: status\ndata: ${JSON.stringify({ 
              status: 'searching',
              message: 'Searching Reddit posts...',
              progress: 10
            })}\n\n`)
          );

          // 步骤2: 调用Serper搜索Reddit
          const searchResult = await SerperService.searchReddit({
            query: query.trim(),
            num: 10, // 获取10条结果
          });

          console.log('[PainPointAnalyze] Search completed:', {
            postsCount: searchResult.posts.length,
            total: searchResult.total,
          });

          // 发送搜索完成状态
          controller.enqueue(
            encoder.encode(`event: status\ndata: ${JSON.stringify({ 
              status: 'analyzing',
              message: 'Analyzing with AI...',
              progress: 40,
              postsFound: searchResult.posts.length
            })}\n\n`)
          );

          // 步骤3: 格式化Reddit数据为文本
          const formattedPosts = searchResult.posts.map((post, index) => {
            return `
### Post ${index + 1}
**Title**: ${post.title}
**Subreddit**: r/${post.subreddit || 'unknown'}
**Date**: ${post.date || 'N/A'}
**Content Preview**: ${post.snippet}
**Link**: ${post.link}
---`;
          }).join('\n');

          const promptText = `
You are a product analyst specializing in identifying user pain points. 

I searched Reddit for "${query}" and found the following discussions. Please analyze these posts and provide:

1. **Executive Summary**: A concise summary (2-3 sentences) of the main frustrations users express about "${query}". Include the overall sentiment.

2. **Frustration Score**: Rate the overall frustration level from 0-100 (0 = satisfied, 100 = extremely frustrated).

3. **Top 3 Pain Points**: Identify the 3 most critical pain points with:
   - **Title**: Short, punchy description
   - **Severity**: High/Medium/Low
   - **Category**: Performance/UX/Feature Gap/Pricing/Support/Other
   - **Description**: What users are complaining about (1-2 sentences)
   - **Opportunity**: Actionable product improvement suggestion
   - **Quote**: An actual quote from the posts (if available)

Here are the Reddit posts:

${formattedPosts}

CRITICAL: Do NOT repeat this instruction or the Reddit posts in your response. Return ONLY valid JSON in this exact format:
\`\`\`json
{
  "summary": "string",
  "frustrationScore": number,
  "insights": [
    {
      "title": "string",
      "severity": "High/Medium/Low Severity",
      "category": "string",
      "description": "string",
      "opportunity": "string",
      "quote": "string or null"
    }
  ]
}
\`\`\`

Important: Your response must start with \`\`\`json and end with \`\`\`. No other text before or after.
`;

          console.log('[PainPointAnalyze] Sending to ADP...');

          // 步骤4: 调用ADP分析
          let adpResponse = '';
          let chunkCount = 0;

          for await (const event of ADPService.streamChat({
            sessionId: ADPService.generateSessionId(),
            visitorBizId: 'pain-point-analyzer',
            content: promptText,
          })) {
            if (event.type === 'reply' && event.payload) {
              const replyPayload = event.payload as import('@/lib/adp-config').ADPReplyPayload;
              adpResponse = replyPayload.content;
              chunkCount++;

              // 只更新进度，不显示中间内容
              controller.enqueue(
                encoder.encode(`event: status\ndata: ${JSON.stringify({
                  status: 'analyzing',
                  message: 'AI analyzing...',
                  progress: 40 + Math.min(chunkCount * 2, 50)
                })}\n\n`)
              );

              // 如果是最终响应，发送完成事件
              if (replyPayload.is_final) {
                console.log('[PainPointAnalyze] Analysis completed');
                console.log('[PainPointAnalyze] Raw ADP response length:', adpResponse.length);
                
                // 提取JSON部分（过滤掉prompt回显）
                let cleanedResponse = '';
                
                // 方法1: 优先提取```json 代码块中的内容
                const jsonBlockMatch = adpResponse.match(/```json\s*([\s\S]*?)\s*```/);
                if (jsonBlockMatch) {
                  cleanedResponse = jsonBlockMatch[1].trim();
                  console.log('[PainPointAnalyze] Extracted JSON from code block');
                } else {
                  // 方法2: 如果没有代码块，尝试找到第一个 { 到最后一个 }
                  const firstBrace = adpResponse.indexOf('{');
                  const lastBrace = adpResponse.lastIndexOf('}');
                  
                  if (firstBrace !== -1 && lastBrace !== -1 && firstBrace < lastBrace) {
                    cleanedResponse = adpResponse.substring(firstBrace, lastBrace + 1);
                    console.log('[PainPointAnalyze] Extracted JSON by braces');
                  }
                }
                
                // 验证JSON是否有效且包含必要字段
                let isValidResult = false;
                try {
                  const parsed = JSON.parse(cleanedResponse);
                  // 检查是否包含必要字段（不是模板）
                  if (parsed.summary && 
                      typeof parsed.summary === 'string' && 
                      parsed.summary !== 'string' && // 排除模板占位符
                      parsed.frustrationScore && 
                      typeof parsed.frustrationScore === 'number' &&
                      Array.isArray(parsed.insights) &&
                      parsed.insights.length > 0) {
                    isValidResult = true;
                    console.log('[PainPointAnalyze] Valid result detected');
                  } else {
                    console.warn('[PainPointAnalyze] Invalid result structure:', parsed);
                  }
                } catch (e) {
                  console.error('[PainPointAnalyze] JSON parse error:', e);
                }
                
                // 只有在结果有效时才发送完成事件
                if (isValidResult && cleanedResponse) {
                  console.log('[PainPointAnalyze] Sending valid result, length:', cleanedResponse.length);
                  
                  controller.enqueue(
                    encoder.encode(`event: complete\ndata: ${JSON.stringify({
                      status: 'completed',
                      message: 'Analysis complete!',
                      progress: 100,
                      result: cleanedResponse,
                      searchData: {
                        posts: searchResult.posts,
                        total: searchResult.total,
                        searchTime: searchResult.searchTime,
                      }
                    })}\n\n`)
                  );
                } else {
                  console.warn('[PainPointAnalyze] Result not valid yet, waiting...');
                  // 如果结果无效，继续等待更多chunks
                }
              }
            } else if (event.type === 'error') {
              throw new Error(event.error?.message || 'ADP analysis failed');
            }
          }

          // 发送结束标记
          controller.enqueue(encoder.encode('event: done\ndata: [DONE]\n\n'));
          controller.close();

        } catch (error) {
          console.error('[PainPointAnalyze] Error:', error);
          
          const errorEvent = {
            type: 'error',
            error: {
              message: error instanceof Error ? error.message : 'Analysis failed',
            },
          };
          
          controller.enqueue(
            encoder.encode(`event: error\ndata: ${JSON.stringify(errorEvent)}\n\n`)
          );
          controller.close();
        }
      },
    });

    // 返回SSE响应
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    });

  } catch (error) {
    console.error('[PainPointAnalyze] Request error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
