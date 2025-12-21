/**
 * Data Agent - 뉴스 분석 에이전트
 */

import { BaseAgent, AgentTask, AgentResult } from './base-agent';
import type { NewsArticle } from '@/lib/firebase/newsScraper';

export class ContentAnalyzerAgent extends BaseAgent {
  constructor() {
    super(
      'content-analyzer',
      'Content Analyzer',
      '뉴스 기사 분석 및 인사이트 생성',
      `당신은 뉴스 기사 분석 전문가입니다. 다음 작업을 수행하세요:
1. 기사 요약 (3-5문장)
2. 키워드 추출 (5-10개)
3. 감정 분석 (긍정/중립/부정)
4. 중요도 점수 (1-10)
5. 카테고리 분류 (IT/경제/정치/사회/기타)
6. 엔티티 추출 (인물/조직/장소)
7. 한 줄 요약

결과는 반드시 JSON 형식으로 반환하세요. 다른 설명 없이 JSON만 반환해야 합니다.`
    );
  }

  async execute(task: AgentTask): Promise<AgentResult> {
    try {
      const { article } = task.input;
      
      if (!article || !article.title || !article.content) {
        throw new Error('기사 정보가 올바르지 않습니다. title과 content가 필요합니다.');
      }

      const prompt = `
다음 뉴스 기사를 분석해주세요:

제목: ${article.title}
내용: ${article.content}
출처: ${article.source || '알 수 없음'}
발행일: ${article.publishedAt ? new Date(article.publishedAt).toLocaleString('ko-KR') : '알 수 없음'}

다음 JSON 형식으로 응답해주세요 (다른 설명 없이 JSON만):
{
  "summary": "3-5문장 요약",
  "keywords": ["키워드1", "키워드2", "키워드3"],
  "sentiment": "긍정|중립|부정",
  "importanceScore": 1.0-10.0,
  "refinedCategory": "IT|경제|정치|사회|기타",
  "entities": {
    "people": ["인물1"],
    "organizations": ["조직1"],
    "locations": ["장소1"]
  },
  "oneLiner": "한 줄 요약"
}
`;

      // 비용 절감을 위해 Haiku 사용 (간단한 분석 작업)
      const response = await this.callClaude(prompt, 'claude-3-5-haiku-20241022');
      
      // JSON 파싱
      let analysisResult: any;
      try {
        // JSON 블록 찾기 (```json ... ``` 또는 {...} 형태)
        const jsonMatch = response.content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          analysisResult = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('JSON을 찾을 수 없습니다');
        }
      } catch (parseError) {
        console.error('JSON 파싱 오류:', parseError);
        console.error('응답 내용:', response.content);
        throw new Error('분석 결과를 파싱할 수 없습니다. 응답 형식이 올바르지 않습니다.');
      }

      // 검증
      if (!analysisResult.summary || !analysisResult.sentiment || !analysisResult.importanceScore) {
        throw new Error('분석 결과가 불완전합니다. 필수 필드가 누락되었습니다.');
      }

      return {
        taskId: task.id,
        success: true,
        output: {
          analysis: analysisResult,
          articleId: article.id,
        },
        cost: {
          tokens: response.usage.inputTokens + response.usage.outputTokens,
          price: response.cost,
        },
      };
    } catch (error: any) {
      console.error(`Content Analyzer Agent 오류 (${task.id}):`, error);
      return {
        taskId: task.id,
        success: false,
        error: error.message || '알 수 없는 오류',
      };
    }
  }
}

