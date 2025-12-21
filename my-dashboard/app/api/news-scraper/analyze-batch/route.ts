/**
 * 뉴스 기사 일괄 분석 API
 * 분석이 필요한 기사들을 자동으로 찾아서 분석
 */

import { NextRequest, NextResponse } from 'next/server';
import { ContentAnalyzerAgent } from '@/lib/agents/data-agent';
import { getNewsArticles, updateNewsArticle } from '@/lib/firebase/newsScraper';

export async function POST(request: NextRequest) {
  try {
    const { featureId, limit = 10, forceReanalyze = false } = await request.json();

    if (!featureId) {
      return NextResponse.json(
        { error: 'featureId가 필요합니다' },
        { status: 400 }
      );
    }

    // 기사 목록 가져오기
    const allArticles = await getNewsArticles(featureId, {
      limit: limit * 2, // 분석 실패를 고려해 여유있게 가져오기
      sortBy: 'published_at',
    });

    // 분석이 필요한 기사들 필터링
    const articlesToAnalyze = allArticles.filter(article => {
      if (forceReanalyze) return true;
      return !article.importanceScore; // 중요도 점수가 없는 것만
    }).slice(0, limit);

    if (articlesToAnalyze.length === 0) {
      return NextResponse.json({
        success: true,
        message: '분석할 기사가 없습니다',
        analyzed: 0,
        total: 0,
        totalCost: 0,
        results: [],
      });
    }

    const agent = new ContentAnalyzerAgent();
    const results = [];
    let successCount = 0;
    let totalCost = 0;

    // 각 기사 분석
    for (const article of articlesToAnalyze) {
      const task = {
        id: `analyze-${article.id}-${Date.now()}`,
        type: 'analysis',
        input: { article },
        priority: 'medium' as const,
      };

      const result = await agent.execute(task);
      results.push({
        articleId: article.id,
        title: article.title,
        success: result.success,
        error: result.error,
        cost: result.cost,
      });

      if (result.success && result.output?.analysis) {
        const analysis = result.output.analysis;

        // Firestore 업데이트
        try {
          await updateNewsArticle(article.id!, {
            summary: analysis.summary,
            keywords: analysis.keywords || [],
            sentiment: analysis.sentiment,
            importanceScore: analysis.importanceScore,
            refinedCategory: analysis.refinedCategory,
            entities: analysis.entities,
            oneLiner: analysis.oneLiner,
            analyzedAt: new Date(),
          });

          successCount++;
          if (result.cost?.price) {
            totalCost += result.cost.price;
          }
        } catch (updateError) {
          console.error(`기사 업데이트 실패 (${article.id}):`, updateError);
          result.success = false;
          result.error = 'Firestore 업데이트 실패';
        }
      }

      // Rate limiting: 각 요청 사이에 약간의 딜레이
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    return NextResponse.json({
      success: true,
      analyzed: successCount,
      total: articlesToAnalyze.length,
      failed: articlesToAnalyze.length - successCount,
      totalCost: totalCost,
      estimatedMonthlyCost: totalCost * (30 * 48), // 30분마다 실행 가정
      results,
    });
  } catch (error: any) {
    console.error('일괄 분석 오류:', error);
    return NextResponse.json(
      { error: error.message || '서버 오류' },
      { status: 500 }
    );
  }
}

