/**
 * 关键词提取服务
 * 使用 LLM 从用户输入中提取核心关键词
 */

import { createDefaultLLMService, type LLMService } from './llm.service';

// ==========================================
// Prompt 模板
// ==========================================

const KEYWORD_EXTRACTION_SYSTEM_PROMPT = `You are a keyword extraction expert. Extract the most relevant single keyword or short phrase from the user's input for searching pain points on Reddit.

Rules:
1. Output ONLY the keyword/phrase (2-4 words max)
2. Focus on the core product/service/topic
3. Remove modifiers like "problems with", "issues about", "why is"
4. Keep brand names intact (e.g., "Notion", "Gmail")
5. Output in English
6. If input is already a simple keyword, return it as-is

Examples:
Input: "Why is Notion so slow on mobile devices?"
Output: Notion mobile

Input: "I'm having trouble with email marketing campaigns"
Output: email marketing

Input: "What are common problems people face with meal prep?"
Output: meal prep

Input: "Notion"
Output: Notion

Input: "How can I improve my productivity when working remotely?"
Output: remote work productivity

Now extract the keyword from the following input:`;

// ==========================================
// 关键词提取服务
// ==========================================

/**
 * 关键词提取配置
 */
interface KeywordExtractorConfig {
  enabled: boolean;              // 是否启用关键词提取
  minLength?: number;            // 触发提取的最小输入长度
  maxKeywordLength?: number;     // 最大关键词长度
  llmService?: LLMService;       // 自定义 LLM 服务
}

/**
 * 关键词提取结果
 */
export interface KeywordExtractionResult {
  original: string;              // 原始输入
  extracted: string;             // 提取的关键词
  isExtracted: boolean;          // 是否进行了提取
  provider?: string;             // 使用的 LLM 提供商
  reason?: string;               // 未提取的原因（如果适用）
}

/**
 * 关键词提取服务类
 */
export class KeywordExtractorService {
  private config: KeywordExtractorConfig;
  private llmService: LLMService | null;

  constructor(config: KeywordExtractorConfig) {
    this.config = {
      minLength: 15,
      maxKeywordLength: 50,
      ...config,
    };
    
    this.llmService = config.llmService || createDefaultLLMService();
  }

  /**
   * 判断是否需要提取关键词
   */
  private shouldExtract(input: string): boolean {
    // 未启用
    if (!this.config.enabled) {
      return false;
    }

    // 没有 LLM 服务
    if (!this.llmService) {
      return false;
    }

    // 输入为空
    if (!input || input.trim().length === 0) {
      return false;
    }

    // 输入太短，可能已经是关键词
    if (input.trim().length < (this.config.minLength || 15)) {
      return false;
    }

    // 输入包含问号或疑问词，可能是问题
    const hasQuestionIndicators = /[?？]|what|why|how|when|where|who|哪|什么|为什么|怎么|如何/i.test(input);
    
    // 输入包含多个词，可能是句子
    const hasMultipleWords = input.trim().split(/\s+/).length > 3;
    
    return hasQuestionIndicators || hasMultipleWords;
  }

  /**
   * 提取关键词
   */
  async extract(input: string): Promise<KeywordExtractionResult> {
    const trimmedInput = input.trim();

    // 检查是否需要提取
    if (!this.shouldExtract(trimmedInput)) {
      return {
        original: input,
        extracted: trimmedInput,
        isExtracted: false,
        reason: 'Input is already a keyword or too short',
      };
    }

    // 检查 LLM 服务
    if (!this.llmService) {
      console.warn('LLM service not available, skipping keyword extraction');
      return {
        original: input,
        extracted: trimmedInput,
        isExtracted: false,
        reason: 'LLM service not configured',
      };
    }

    try {
      console.log('🔍 Extracting keyword from:', trimmedInput);

      // 调用 LLM 提取关键词
      const response = await this.llmService.generate({
        prompt: trimmedInput,
        systemPrompt: KEYWORD_EXTRACTION_SYSTEM_PROMPT,
        temperature: 0.3,
        maxTokens: 50,
      });

      const extractedKeyword = response.content.trim();

      console.log('✅ Extracted keyword:', extractedKeyword);
      console.log('📊 Token usage:', response.usage);

      // 验证提取的关键词
      if (!extractedKeyword || extractedKeyword.length === 0) {
        throw new Error('Empty keyword extracted');
      }

      // 关键词太长，可能提取失败
      if (extractedKeyword.length > (this.config.maxKeywordLength || 50)) {
        console.warn('Extracted keyword too long, using original input');
        return {
          original: input,
          extracted: trimmedInput,
          isExtracted: false,
          reason: 'Extracted keyword too long',
        };
      }

      return {
        original: input,
        extracted: extractedKeyword,
        isExtracted: true,
        provider: this.llmService.getProvider(),
      };
    } catch (error) {
      console.error('Keyword extraction failed:', error);
      
      // 提取失败，返回原始输入
      return {
        original: input,
        extracted: trimmedInput,
        isExtracted: false,
        reason: `Extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * 批量提取关键词
   */
  async extractBatch(inputs: string[]): Promise<KeywordExtractionResult[]> {
    return Promise.all(inputs.map(input => this.extract(input)));
  }

  /**
   * 启用/禁用服务
   */
  setEnabled(enabled: boolean) {
    this.config.enabled = enabled;
  }

  /**
   * 检查服务是否可用
   */
  isAvailable(): boolean {
    return this.config.enabled && this.llmService !== null;
  }
}

// ==========================================
// 工厂函数
// ==========================================

/**
 * 创建默认的关键词提取服务
 */
export function createKeywordExtractor(enabled: boolean = true): KeywordExtractorService {
  return new KeywordExtractorService({
    enabled,
    minLength: 15,
    maxKeywordLength: 50,
  });
}

// ==========================================
// 便捷函数
// ==========================================

/**
 * 快速提取关键词（使用默认配置）
 */
export async function extractKeyword(input: string): Promise<string> {
  const extractor = createKeywordExtractor(true);
  const result = await extractor.extract(input);
  return result.extracted;
}
