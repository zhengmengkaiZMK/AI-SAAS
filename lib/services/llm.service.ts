/**
 * LLM Service - 统一的大语言模型服务层
 * 支持多种模型提供商的可拔插架构
 * 
 * 支持的模型：
 * - Google Gemini
 * - OpenAI GPT (待实现)
 * - Claude (待实现)
 * - 其他自定义模型
 */

// ==========================================
// 类型定义
// ==========================================

/**
 * LLM 提供商类型
 */
export type LLMProvider = 'gemini' | 'openai' | 'claude' | 'custom';

/**
 * LLM 请求参数
 */
interface LLMRequestParams {
  prompt: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
}

/**
 * LLM 响应结果
 */
interface LLMResponse {
  content: string;
  provider: LLMProvider;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

/**
 * LLM 服务配置
 */
interface LLMServiceConfig {
  provider: LLMProvider;
  apiKey: string;
  model?: string;
  baseURL?: string;
}

// ==========================================
// Gemini API 实现
// ==========================================

/**
 * Google Gemini API 调用
 */
async function callGeminiAPI(params: LLMRequestParams, config: LLMServiceConfig): Promise<LLMResponse> {
  const model = config.model || 'gemini-2.5-flash';
  const apiKey = config.apiKey;
  const baseURL = config.baseURL || 'https://generativelanguage.googleapis.com/v1beta';

  const url = `${baseURL}/models/${model}:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: params.systemPrompt 
                  ? `${params.systemPrompt}\n\n${params.prompt}`
                  : params.prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: params.temperature || 0.3,
          maxOutputTokens: params.maxTokens || 100,
          topP: 0.95,
          topK: 40,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Gemini API error: ${JSON.stringify(error)}`);
    }

    const data = await response.json();
    
    // 提取生成的文本
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // 提取 token 使用情况
    const usage = data.usageMetadata ? {
      promptTokens: data.usageMetadata.promptTokenCount || 0,
      completionTokens: data.usageMetadata.candidatesTokenCount || 0,
      totalTokens: data.usageMetadata.totalTokenCount || 0,
    } : undefined;

    return {
      content: content.trim(),
      provider: 'gemini',
      usage,
    };
  } catch (error) {
    console.error('Gemini API call failed:', error);
    throw error;
  }
}

// ==========================================
// OpenAI API 实现 (预留接口)
// ==========================================

async function callOpenAIAPI(params: LLMRequestParams, config: LLMServiceConfig): Promise<LLMResponse> {
  // TODO: 实现 OpenAI API 调用
  throw new Error('OpenAI API not implemented yet');
}

// ==========================================
// Claude API 实现 (预留接口)
// ==========================================

async function callClaudeAPI(params: LLMRequestParams, config: LLMServiceConfig): Promise<LLMResponse> {
  // TODO: 实现 Claude API 调用
  throw new Error('Claude API not implemented yet');
}

// ==========================================
// 统一服务接口
// ==========================================

/**
 * LLM 服务类
 */
export class LLMService {
  private config: LLMServiceConfig;

  constructor(config: LLMServiceConfig) {
    this.config = config;
  }

  /**
   * 调用 LLM 生成响应
   */
  async generate(params: LLMRequestParams): Promise<LLMResponse> {
    switch (this.config.provider) {
      case 'gemini':
        return callGeminiAPI(params, this.config);
      case 'openai':
        return callOpenAIAPI(params, this.config);
      case 'claude':
        return callClaudeAPI(params, this.config);
      default:
        throw new Error(`Unsupported LLM provider: ${this.config.provider}`);
    }
  }

  /**
   * 获取当前配置的提供商
   */
  getProvider(): LLMProvider {
    return this.config.provider;
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<LLMServiceConfig>) {
    this.config = { ...this.config, ...config };
  }
}

// ==========================================
// 工厂函数
// ==========================================

/**
 * 创建 LLM 服务实例
 */
export function createLLMService(config: LLMServiceConfig): LLMService {
  return new LLMService(config);
}

/**
 * 从环境变量创建默认 LLM 服务
 */
export function createDefaultLLMService(): LLMService | null {
  // 优先使用 Gemini
  if (process.env.GEMINI_API_KEY) {
    return new LLMService({
      provider: 'gemini',
      apiKey: process.env.GEMINI_API_KEY,
      model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
    });
  }

  // 备用 OpenAI
  if (process.env.OPENAI_API_KEY) {
    return new LLMService({
      provider: 'openai',
      apiKey: process.env.OPENAI_API_KEY,
      model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
    });
  }

  // 没有配置任何 API Key
  return null;
}
