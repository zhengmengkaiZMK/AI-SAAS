/**
 * 腾讯ADP (智能体开发平台) Service
 * 处理与ADP API的交互，支持流式和非流式响应
 */

import { v4 as uuidv4 } from 'uuid';
import { 
  ADP_CONFIG, 
  ADPChatRequest, 
  ADPChatResponse,
  ADP_ERROR_CODES 
} from '@/lib/adp-config';

export class ADPService {
  
  /**
   * 生成会话ID (UUID v4)
   */
  static generateSessionId(): string {
    return uuidv4();
  }

  /**
   * 生成请求ID
   */
  static generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }

  /**
   * 发送聊天请求（流式响应）
   * 使用异步生成器逐步返回响应事件
   */
  static async *streamChat(request: ADPChatRequest): AsyncGenerator<ADPChatResponse> {
    const { sessionId, visitorBizId, content, requestId, stream = 'enable' } = request;

    // 验证必填参数
    if (!sessionId || sessionId.length < 2 || sessionId.length > 64) {
      yield {
        type: 'error',
        error: { code: 460006, message: '会话ID无效，长度应在2-64字符之间' }
      };
      return;
    }

    if (!content || content.trim().length === 0) {
      yield {
        type: 'error',
        error: { code: 460007, message: '消息内容不能为空' }
      };
      return;
    }

    // 构建请求体
    const body = {
      bot_app_key: ADP_CONFIG.appKey,
      session_id: sessionId,
      visitor_biz_id: visitorBizId,
      content: content.trim(),
      request_id: requestId || this.generateRequestId(),
      stream,
    };

    console.log('[ADP] Sending request:', {
      sessionId,
      visitorBizId,
      contentLength: content.length,
      requestId: body.request_id,
    });

    try {
      // 创建超时控制器
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), ADP_CONFIG.timeout);

      // 发送POST请求到ADP API
      const response = await fetch(ADP_CONFIG.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.error('[ADP] API error:', response.status, response.statusText);
        yield {
          type: 'error',
          error: {
            code: response.status,
            message: `ADP API返回错误: ${response.status} ${response.statusText}`
          }
        };
        return;
      }

      // 处理SSE流
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('Response body is null');
      }

      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          console.log('[ADP] Stream completed');
          break;
        }

        buffer += decoder.decode(value, { stream: true });

        // 按行分割
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // 保留不完整的行

        for (const line of lines) {
          if (line.trim() === '') continue;

          // 解析SSE事件
          if (line.startsWith('event:')) {
            // 事件类型行，当前实现中暂存
            continue;
          }

          if (line.startsWith('data:')) {
            const data = line.substring(5).trim();
            
            if (data === '[DONE]') {
              // 流结束标记
              console.log('[ADP] Received [DONE] marker');
              return;
            }

            try {
              const event: ADPChatResponse = JSON.parse(data);
              
              // 记录事件
              if (event.type === 'reply' && event.payload) {
                console.log('[ADP] Reply event:', {
                  contentLength: event.payload.content?.length,
                  isFinal: event.payload.is_final,
                });
              } else if (event.type === 'token_stat') {
                console.log('[ADP] Token stat:', event.payload);
              } else if (event.type === 'error') {
                console.error('[ADP] Error event:', event.error);
              }

              yield event;

              // 如果遇到错误，停止处理
              if (event.type === 'error') {
                return;
              }

            } catch (e) {
              console.error('[ADP] Failed to parse SSE data:', data, e);
              // 继续处理下一个事件，不中断流
            }
          }
        }
      }

    } catch (error: any) {
      console.error('[ADP] Stream chat error:', error);
      
      if (error.name === 'AbortError') {
        yield {
          type: 'error',
          error: {
            code: -1,
            message: '请求超时，请稍后重试'
          },
        };
      } else {
        yield {
          type: 'error',
          error: {
            code: -1,
            message: error instanceof Error ? error.message : '未知错误',
          },
        };
      }
    }
  }

  /**
   * 发送聊天请求（非流式，返回完整响应）
   */
  static async chat(request: ADPChatRequest): Promise<string> {
    const messages: string[] = [];

    for await (const event of this.streamChat({ ...request, stream: 'enable' })) {
      if (event.type === 'reply' && event.payload?.content) {
        messages.push(event.payload.content);
      } else if (event.type === 'error') {
        const errorMsg = ADP_ERROR_CODES[event.error?.code || -1] || event.error?.message || 'ADP API错误';
        throw new Error(errorMsg);
      }
    }

    return messages.join('');
  }

  /**
   * 格式化错误消息
   */
  static formatError(error: any): string {
    if (error?.code && ADP_ERROR_CODES[error.code]) {
      return ADP_ERROR_CODES[error.code];
    }
    return error?.message || '服务暂时不可用，请稍后重试';
  }
}
