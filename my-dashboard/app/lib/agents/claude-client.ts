/**
 * Claude API 클라이언트
 * Anthropic Claude API를 사용하기 위한 래퍼 클래스
 */

import Anthropic from '@anthropic-ai/sdk';

export interface ClaudeResponse {
  content: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
  };
  cost: number;
}

export class ClaudeClient {
  private client: Anthropic;
  
  constructor() {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY 환경 변수가 설정되지 않았습니다. .env.local 파일에 ANTHROPIC_API_KEY를 추가하세요.');
    }
    this.client = new Anthropic({ apiKey });
  }

  /**
   * 메시지 전송 (일반적인 대화)
   */
  async sendMessage(
    messages: Array<{ role: 'user' | 'assistant'; content: string }>,
    systemPrompt?: string,
    model: 'claude-sonnet-4-20250514' | 'claude-3-5-haiku-20241022' = 'claude-sonnet-4-20250514',
    maxTokens: number = 4096
  ): Promise<ClaudeResponse> {
    try {
      const response = await this.client.messages.create({
        model,
        max_tokens: maxTokens,
        system: systemPrompt,
        messages: messages as any,
      });

      const textContent = response.content.find(item => item.type === 'text');
      const content = textContent && 'text' in textContent ? textContent.text : '';

      return {
        content,
        usage: {
          inputTokens: response.usage.input_tokens,
          outputTokens: response.usage.output_tokens,
        },
        cost: this.calculateCost(
          response.usage.input_tokens,
          response.usage.output_tokens,
          model
        ),
      };
    } catch (error: any) {
      console.error('Claude API 오류:', error);
      
      // Anthropic API 오류 메시지 파싱
      let errorMessage = error.message || '알 수 없는 오류';
      
      if (error.status === 400 || error.status === 401) {
        try {
          // API 응답에서 상세 오류 추출
          if (error.response?.data?.error?.message) {
            errorMessage = error.response.data.error.message;
          } else if (typeof error.message === 'string' && error.message.includes('credit balance')) {
            errorMessage = 'Anthropic API 크레딧 잔액이 부족합니다. Anthropic Console에서 크레딧을 충전하거나 결제 수단을 등록해주세요. (https://console.anthropic.com/)';
          }
        } catch (e) {
          // 파싱 실패 시 원본 메시지 사용
        }
      } else if (error.status === 429) {
        errorMessage = 'API 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.';
      } else if (error.status === 401) {
        errorMessage = 'API 키가 유효하지 않습니다. .env.local 파일의 ANTHROPIC_API_KEY를 확인해주세요.';
      }
      
      throw new Error(`Claude API 호출 실패: ${errorMessage}`);
    }
  }

  /**
   * 비용 계산 (USD)
   */
  private calculateCost(inputTokens: number, outputTokens: number, model: string): number {
    // Sonnet 4.5: $3/1M input, $15/1M output
    // Haiku 3.5: $0.25/1M input, $1.25/1M output
    const pricing: Record<string, { input: number; output: number }> = {
      'claude-sonnet-4-20250514': { input: 3 / 1000000, output: 15 / 1000000 },
      'claude-3-5-haiku-20241022': { input: 0.25 / 1000000, output: 1.25 / 1000000 },
    };

    const prices = pricing[model] || pricing['claude-sonnet-4-20250514'];
    return inputTokens * prices.input + outputTokens * prices.output;
  }

  /**
   * 비용 계산 헬퍼 (외부에서 사용 가능)
   */
  static calculateCost(
    inputTokens: number,
    outputTokens: number,
    model: 'haiku' | 'sonnet' = 'haiku'
  ): number {
    const pricing = {
      haiku: { input: 0.25 / 1000000, output: 1.25 / 1000000 },
      sonnet: { input: 3 / 1000000, output: 15 / 1000000 },
    };

    const prices = pricing[model];
    return inputTokens * prices.input + outputTokens * prices.output;
  }
}

