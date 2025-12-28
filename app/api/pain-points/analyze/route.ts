import { NextRequest, NextResponse } from 'next/server';
import { SerperService } from '@/lib/services/serper.service';
import { ADPService } from '@/lib/services/adp.service';
import { createKeywordExtractor } from '@/lib/services/keyword-extractor.service';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';

export const runtime = 'nodejs'; // 改为 nodejs 以支持数据库操作

/**
 * 痛点分析API
 * 组合调用 关键词提取 → Serper → ADP
 * 包含配额检查：未登录用户3次，已登录免费用户5次/天
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query, platforms = ['reddit'], isGuest = false, guestUsageCount = 0 } = body;

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    console.log('[PainPointAnalyze] Starting analysis:', { query, platforms });

    // ===== 配额检查 =====
    const session = await getServerSession(authOptions);
    
    // 情况1: 未登录用户（游客模式）
    if (!session || !session.user?.id) {
      console.log('[PainPointAnalyze] Guest user, checking guest quota:', guestUsageCount);
      
      // 游客限制：3次
      if (guestUsageCount >= 3) {
        return NextResponse.json(
          { 
            error: 'GUEST_QUOTA_EXCEEDED',
            message: 'Guest users are limited to 3 searches. Please sign up to continue.',
            redirectTo: '/signup',
          },
          { status: 403 }
        );
      }
      
      // 游客可以继续使用
      console.log('[PainPointAnalyze] Guest quota available, proceeding...');
    } 
    // 情况2: 已登录用户
    else {
      const userId = session.user.id;
      console.log('[PainPointAnalyze] Logged in user:', userId);

      // 获取用户信息
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { membershipType: true },
      });

      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      // 所有用户都记录使用次数（Premium不限制，Free限制5次）
      const isPremium = user.membershipType === 'PREMIUM';
      console.log('[PainPointAnalyze] User type:', isPremium ? 'PREMIUM' : 'FREE');
      
      {
        // 使用本地时区的今日开始时间
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        console.log('[PainPointAnalyze] Checking quota for date:', today.toISOString());

        // 获取或创建今日配额
        let todayQuota = await prisma.userQuota.findFirst({
          where: {
            userId,
            date: {
              gte: today,
              lt: new Date(today.getTime() + 24 * 60 * 60 * 1000), // 今天的结束时间
            },
          },
          orderBy: { date: 'desc' },
        });

        console.log('[PainPointAnalyze] Found existing quota:', todayQuota ? 'Yes' : 'No');

        if (!todayQuota) {
          console.log('[PainPointAnalyze] Creating new quota record for today');
          todayQuota = await prisma.userQuota.create({
            data: {
              userId,
              date: today,
              searchesUsed: 0,
              messagesUsed: 0,
              searchesLimit: 5, // Free用户每天5次
              messagesLimit: 10,
            },
          });
          console.log('[PainPointAnalyze] New quota created with id:', todayQuota.id);
        }

        console.log('[PainPointAnalyze] Current quota before check:', {
          id: todayQuota.id,
          userId: todayQuota.userId,
          date: todayQuota.date,
          used: todayQuota.searchesUsed,
          limit: todayQuota.searchesLimit,
          isPremium,
        });

        // 只有 Free 用户需要检查限制
        if (!isPremium && todayQuota.searchesUsed >= todayQuota.searchesLimit) {
          console.log('[PainPointAnalyze] ❌ Quota exceeded!');
          return NextResponse.json(
            { 
              error: 'QUOTA_EXCEEDED',
              message: 'Daily search limit reached. Please upgrade to Premium for unlimited searches.',
              redirectTo: '/pricing',
              quota: {
                used: todayQuota.searchesUsed,
                limit: todayQuota.searchesLimit,
              },
            },
            { status: 403 }
          );
        }

        // ✅ 所有用户都增加使用次数（Premium用于统计，Free用于限制）
        console.log('[PainPointAnalyze] ✅ Incrementing quota...');
        const updatedQuota = await prisma.userQuota.update({
          where: { id: todayQuota.id },
          data: { searchesUsed: { increment: 1 } },
        });

        console.log('[PainPointAnalyze] ✅ Quota incremented successfully!', {
          isPremium,
          oldCount: todayQuota.searchesUsed,
          newCount: updatedQuota.searchesUsed,
          remaining: isPremium ? 'unlimited' : todayQuota.searchesLimit - updatedQuota.searchesUsed,
        });
      }
    }

    // 创建SSE流
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // 步骤0: 关键词提取（如果需要）
          const keywordExtractor = createKeywordExtractor(true);
          let extractedKeyword = query.trim();
          
          if (keywordExtractor.isAvailable()) {
            controller.enqueue(
              encoder.encode(`event: status\ndata: ${JSON.stringify({ 
                status: 'extracting',
                message: 'Extracting keywords...',
                progress: 5
              })}\n\n`)
            );

            const extractionResult = await keywordExtractor.extract(query.trim());
            extractedKeyword = extractionResult.extracted;

            if (extractionResult.isExtracted) {
              console.log('[PainPointAnalyze] Keyword extracted:', {
                original: extractionResult.original,
                extracted: extractionResult.extracted,
                provider: extractionResult.provider,
              });
            }
          }

          // 步骤1: 发送搜索开始事件
          controller.enqueue(
            encoder.encode(`event: status\ndata: ${JSON.stringify({ 
              status: 'searching',
              message: 'Searching Reddit and X posts...',
              progress: 10
            })}\n\n`)
          );

          // 步骤2: 调用Serper同时搜索Reddit和X（使用提取的关键词，每个平台20条）
          const searchResult = await SerperService.searchBoth({
            query: extractedKeyword,
            num: 20, // 每个平台获取20条结果
          });

          const totalPosts = searchResult.redditPosts.length + searchResult.xPosts.length;

          console.log('[PainPointAnalyze] Search completed:', {
            redditPosts: searchResult.redditPosts.length,
            xPosts: searchResult.xPosts.length,
            total: totalPosts,
          });

          // 发送搜索完成状态
          controller.enqueue(
            encoder.encode(`event: status\ndata: ${JSON.stringify({ 
              status: 'analyzing',
              message: 'Analyzing with AI...',
              progress: 40,
              postsFound: totalPosts
            })}\n\n`)
          );

          // 步骤3: 格式化Reddit和X数据为文本
          const formattedRedditPosts = searchResult.redditPosts.map((post, index) => {
            return `
### Reddit Post ${index + 1}
**Title**: ${post.title}
**Subreddit**: r/${post.subreddit || 'unknown'}
**Date**: ${post.date || 'N/A'}
**Content Preview**: ${post.snippet}
**Link**: ${post.link}
---`;
          }).join('\n');

          const formattedXPosts = searchResult.xPosts.map((post, index) => {
            return `
### X(Twitter) Post ${index + 1}
**Title**: ${post.title}
**Date**: ${post.date || 'N/A'}
**Content Preview**: ${post.snippet}
**Link**: ${post.link}
---`;
          }).join('\n');

          const promptText = `
You are a senior product analyst and business consultant specializing in identifying user pain points and transforming them into actionable business opportunities. 

I searched Reddit and X(Twitter) for "${query}" and found the following discussions. Please analyze these posts deeply and provide:

1. **Executive Summary**: A comprehensive summary (3-4 sentences) that captures the CORE frustrations users express about "${query}". Include the overall sentiment, intensity of emotions, and key themes.

2. **Frustration Score**: Rate the overall frustration level from 0-100 (0 = satisfied, 100 = extremely frustrated). Be precise and justify based on the language intensity, complaint frequency, and severity of issues.

3. **Top 6 Pain Points**: Identify the 6 most critical and diverse pain points. Each must include:
   - **Title**: Short, punchy, problem-focused description (max 8 words)
   - **Severity**: High Severity/Medium Severity/Low Severity (based on user impact and complaint frequency)
   - **Category**: Performance/UX/Feature Gap/Pricing/Support/Integration/Security/Other
   - **Description**: A RICH, DETAILED explanation (3-5 sentences) that covers:
     * What exactly is the problem?
     * Why does it frustrate users?
     * What are the consequences or impacts?
     * Include specific examples or patterns from the posts
   - **Opportunity**: A CONCRETE, ACTIONABLE business solution (3-5 sentences) that includes:
     * Specific product/service improvement recommendations
     * How this would solve the user pain point
     * Potential business value or competitive advantage
     * Implementation approach or features to consider
   - **Quote**: An actual verbatim quote from the posts that best illustrates this pain point (if available)

ANALYSIS GUIDELINES:
- Make descriptions INSIGHTFUL and DATA-DRIVEN, not generic
- Make opportunities SPECIFIC and ACTIONABLE, not vague suggestions
- Focus on REAL BUSINESS VALUE and user-centered solutions
- Ensure the 6 pain points cover DIVERSE aspects (don't repeat similar issues)
- Prioritize pain points with the highest business opportunity potential

Here are the posts from Reddit and X:

## Reddit Posts:
${formattedRedditPosts}

## X(Twitter) Posts:
${formattedXPosts}

CRITICAL: Do NOT repeat this instruction or the posts in your response. Return ONLY valid JSON in this exact format:
\`\`\`json
{
  "summary": "string",
  "frustrationScore": number,
  "insights": [
    {
      "title": "string",
      "severity": "High Severity/Medium Severity/Low Severity",
      "category": "string",
      "description": "string (rich, detailed, 3-5 sentences)",
      "opportunity": "string (concrete, actionable, 3-5 sentences)",
      "quote": "string or null"
    }
  ]
}
\`\`\`

Important: Your response must start with \`\`\`json and end with \`\`\`. No other text before or after. The insights array MUST contain exactly 6 items.
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
                        redditPosts: searchResult.redditPosts,
                        xPosts: searchResult.xPosts,
                        total: totalPosts,
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
