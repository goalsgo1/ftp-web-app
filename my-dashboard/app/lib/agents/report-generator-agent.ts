/**
 * Report Generator Agent - 리포트 자동 생성 에이전트
 */

import { BaseAgent, AgentTask, AgentResult } from './base-agent';
import type { NewsArticle } from '@/lib/firebase/newsScraper';

export interface Report {
  title: string;
  summary: string;
  period: {
    start: Date;
    end: Date;
  };
  insights: {
    totalArticles: number;
    topKeywords: Array<{ keyword: string; count: number }>;
    sentimentDistribution: {
      positive: number;
      neutral: number;
      negative: number;
    };
    topCategories: Array<{ category: string; count: number }>;
    topSources: Array<{ source: string; count: number }>;
    averageImportance: number;
  };
  highlights: Array<{
    title: string;
    description: string;
    articleId?: string;
  }>;
  recommendations?: string[];
}

export class ReportGeneratorAgent extends BaseAgent {
  constructor() {
    super(
      'report-generator',
      'Report Generator',
      '뉴스 데이터 기반 리포트 자동 생성',
      `당신은 데이터 분석 및 리포트 작성 전문가입니다. 수집된 뉴스 데이터를 분석하여 인사이트가 담긴 리포트를 생성하세요.

작업:
1. 전체 통계 분석
2. 트렌드 파악
3. 주요 하이라이트 추출
4. 향후 예측 및 추천사항 제시

결과는 반드시 JSON 형식으로 반환하세요.`
    );
  }

  async execute(task: AgentTask): Promise<AgentResult> {
    try {
      const { articles, period } = task.input;
      
      if (!articles || !Array.isArray(articles) || articles.length === 0) {
        throw new Error('분석할 기사 목록이 필요합니다.');
      }

      // 통계 계산 (간단한 분석)
      const stats = this.calculateStats(articles);

      const prompt = `
다음 뉴스 기사 데이터를 분석하여 리포트를 생성해주세요:

기간: ${period?.start ? new Date(period.start).toLocaleDateString('ko-KR') : '전체'}
총 기사 수: ${articles.length}

통계:
- 긍정: ${stats.sentiment.positive}개
- 중립: ${stats.sentiment.neutral}개
- 부정: ${stats.sentiment.negative}개
- 평균 중요도: ${stats.averageImportance.toFixed(2)}
- 주요 키워드: ${stats.topKeywords.slice(0, 5).map(k => k.keyword).join(', ')}

주요 기사 제목들:
${articles.slice(0, 10).map((a: NewsArticle) => `- ${a.title}`).join('\n')}

다음 JSON 형식으로 응답해주세요 (다른 설명 없이 JSON만):
{
  "title": "리포트 제목 (예: 2025년 1월 뉴스 트렌드 리포트)",
  "summary": "리포트 요약 (3-5문장)",
  "insights": {
    "totalArticles": ${articles.length},
    "topKeywords": ${JSON.stringify(stats.topKeywords.slice(0, 10))},
    "sentimentDistribution": {
      "positive": ${stats.sentiment.positive},
      "neutral": ${stats.sentiment.neutral},
      "negative": ${stats.sentiment.negative}
    },
    "averageImportance": ${stats.averageImportance}
  },
  "highlights": [
    {
      "title": "하이라이트 제목",
      "description": "설명",
      "articleId": "기사ID"
    }
  ],
  "recommendations": ["추천사항1", "추천사항2", "추천사항3"]
}
`;

      // 리포트 생성은 Sonnet 사용 (더 나은 품질)
      const response = await this.callClaude(prompt, 'claude-sonnet-4-20250514');
      
      // JSON 파싱
      let report: Report;
      try {
        const jsonMatch = response.content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          report = {
            ...parsed,
            period: period || {
              start: new Date(),
              end: new Date(),
            },
          };
        } else {
          throw new Error('JSON을 찾을 수 없습니다');
        }
      } catch (parseError) {
        console.error('JSON 파싱 오류:', parseError);
        throw new Error('리포트를 파싱할 수 없습니다.');
      }

      return {
        taskId: task.id,
        success: true,
        output: {
          report,
        },
        cost: {
          tokens: response.usage.inputTokens + response.usage.outputTokens,
          price: response.cost,
        },
      };
    } catch (error: any) {
      console.error(`Report Generator Agent 오류 (${task.id}):`, error);
      return {
        taskId: task.id,
        success: false,
        error: error.message || '알 수 없는 오류',
      };
    }
  }

  private calculateStats(articles: NewsArticle[]) {
    // 키워드 카운트
    const keywordCount: Record<string, number> = {};
    articles.forEach(article => {
      if (article.keywords) {
        article.keywords.forEach(keyword => {
          keywordCount[keyword] = (keywordCount[keyword] || 0) + 1;
        });
      }
    });

    const topKeywords = Object.entries(keywordCount)
      .map(([keyword, count]) => ({ keyword, count }))
      .sort((a, b) => b.count - a.count);

    // 감정 분포
    const sentiment = {
      positive: articles.filter(a => a.sentiment === '긍정').length,
      neutral: articles.filter(a => a.sentiment === '중립').length,
      negative: articles.filter(a => a.sentiment === '부정').length,
    };

    // 평균 중요도
    const importanceScores = articles
      .filter(a => a.importanceScore != null)
      .map(a => a.importanceScore!);
    const averageImportance = importanceScores.length > 0
      ? importanceScores.reduce((sum, score) => sum + score, 0) / importanceScores.length
      : 0;

    return {
      topKeywords,
      sentiment,
      averageImportance,
    };
  }
}

