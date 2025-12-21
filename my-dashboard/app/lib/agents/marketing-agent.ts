/**
 * Marketing Agent - 마케팅 콘텐츠 생성 에이전트
 */

import { BaseAgent, AgentTask, AgentResult } from './base-agent';
import type { NewsArticle } from '@/lib/firebase/newsScraper';

export interface MarketingContent {
  title: string;
  description: string;
  hashtags: string[];
  platforms: {
    twitter?: string;
    linkedin?: string;
    facebook?: string;
  };
}

export class MarketingAgent extends BaseAgent {
  constructor() {
    super(
      'marketing-agent',
      'Marketing Agent',
      '뉴스 기사 기반 마케팅 콘텐츠 생성',
      `당신은 소셜 미디어 마케팅 전문가입니다. 뉴스 기사를 바탕으로 각 플랫폼에 맞는 마케팅 콘텐츠를 생성하세요.

작업:
1. 트위터/X용: 280자 이내, 이모지 사용, 해시태그 2-3개
2. LinkedIn용: 전문적이고 분석적인 톤, 300-500자
3. Facebook용: 친근한 톤, 200-300자

결과는 반드시 JSON 형식으로 반환하세요.`
    );
  }

  async execute(task: AgentTask): Promise<AgentResult> {
    try {
      const { article } = task.input;
      
      if (!article || !article.title || !article.content) {
        throw new Error('기사 정보가 올바르지 않습니다.');
      }

      // 이미 분석된 정보 활용
      const hasAnalysis = !!article.importanceScore;
      const analysisInfo = hasAnalysis
        ? `
분석 정보:
- 요약: ${article.summary || '없음'}
- 감정: ${article.sentiment || '없음'}
- 중요도: ${article.importanceScore || '없음'}
- 키워드: ${article.keywords?.join(', ') || '없음'}
- 한 줄 요약: ${article.oneLiner || '없음'}
`
        : '';

      const prompt = `
다음 뉴스 기사를 바탕으로 소셜 미디어 마케팅 콘텐츠를 생성해주세요:

제목: ${article.title}
내용: ${article.content.substring(0, 500)}...
출처: ${article.source}
${analysisInfo}

다음 JSON 형식으로 응답해주세요 (다른 설명 없이 JSON만):
{
  "title": "콘텐츠 제목",
  "description": "간단한 설명",
  "hashtags": ["해시태그1", "해시태그2", "해시태그3"],
  "platforms": {
    "twitter": "트위터용 포스트 (280자 이내, 이모지 포함)",
    "linkedin": "LinkedIn용 포스트 (전문적, 300-500자)",
    "facebook": "Facebook용 포스트 (친근한 톤, 200-300자)"
  }
}
`;

      // 마케팅 콘텐츠 생성은 Haiku 사용 (비용 절감)
      const response = await this.callClaude(prompt, 'claude-3-5-haiku-20241022');
      
      // JSON 파싱
      let marketingContent: MarketingContent;
      try {
        const jsonMatch = response.content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          marketingContent = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('JSON을 찾을 수 없습니다');
        }
      } catch (parseError) {
        console.error('JSON 파싱 오류:', parseError);
        throw new Error('마케팅 콘텐츠를 파싱할 수 없습니다.');
      }

      return {
        taskId: task.id,
        success: true,
        output: {
          marketingContent,
          articleId: article.id,
        },
        cost: {
          tokens: response.usage.inputTokens + response.usage.outputTokens,
          price: response.cost,
        },
      };
    } catch (error: any) {
      console.error(`Marketing Agent 오류 (${task.id}):`, error);
      return {
        taskId: task.id,
        success: false,
        error: error.message || '알 수 없는 오류',
      };
    }
  }
}

