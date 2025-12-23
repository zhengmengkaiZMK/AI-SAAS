/**
 * 腾讯ADP (智能体开发平台) 配置文件
 * 官方文档: https://cloud.tencent.com/document/product/1759/105561
 */

export const ADP_CONFIG = {
  // API接口地址
  apiUrl: process.env.TENCENT_ADP_API_URL || 'https://wss.lke.cloud.tencent.com/v1/qbot/chat/sse',
  
  // 应用密钥
  appKey: process.env.TENCENT_ADP_APP_KEY || 'UOIbSacEfCvAcjcKEEWxErzjBQfcyOwYrrZAiYMQcskZceXxxTkewfgBFzVXxtznHNhhjAOOHZwWsUpRQfXUzSWbtPeYGYhiXAaJPRTkNtLUsChkBiAvKXGaFTYEKXAY',
  
  // 超时时间（毫秒）
  timeout: 30000,
  
  // 最大重试次数
  maxRetries: 3,
};

/**
 * ADP聊天请求参数
 */
export interface ADPChatRequest {
  sessionId: string;         // 会话ID，用于维持上下文
  visitorBizId: string;      // 访客业务ID，用于标识用户
  content: string;           // 用户发送的消息内容
  requestId?: string;        // 请求ID，用于链路追踪
  stream?: 'enable' | 'disable'; // 是否启用流式传输
}

/**
 * ADP事件响应
 */
export interface ADPChatResponse {
  type: 'reply' | 'token_stat' | 'reference' | 'error';
  payload?: ADPReplyPayload | ADPTokenStatPayload | ADPReferencePayload;
  error?: {
    code: number;
    message: string;
  };
  message_id?: string;
}

/**
 * Reply事件负载（AI回复）
 */
export interface ADPReplyPayload {
  content: string;           // AI回复的文本内容
  record_id: string;         // 消息记录ID
  session_id: string;        // 会话ID
  is_final: boolean;         // 是否为最后一次回复
  is_evil: boolean;          // 是否包含敏感内容
  thought_process?: string;  // 思考过程（可选）
  response_type: number;     // 响应类型
}

/**
 * Token统计事件负载
 */
export interface ADPTokenStatPayload {
  elapsed: number;           // 耗时（毫秒）
  token_count: number;       // Token消耗数量
  procedures: Array<{
    title: string;
    count: number;
    status: 'success' | 'failed';
  }>;
}

/**
 * 参考来源事件负载
 */
export interface ADPReferencePayload {
  references: Array<{
    type: 1 | 2;            // 1: 网络搜索, 2: 知识库文档
    name: string;
    url: string;
  }>;
}

/**
 * 错误码映射
 */
export const ADP_ERROR_CODES: Record<number, string> = {
  460004: '应用不存在，请检查AppKey配置',
  460005: 'AppKey无效，认证失败',
  460006: '会话ID无效',
  460007: '消息内容不能为空',
  460008: '请求频率过高，请稍后再试',
  460009: '服务暂时不可用',
  460010: '配额已用完',
};
