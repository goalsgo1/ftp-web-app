/**
 * 뉴스 기사 분석 API
 * 단일 기사를 Claude API로 분석
 */

import { NextRequest, NextResponse } from 'next/server';
import { ContentAnalyzerAgent } from '@/lib/agents/data-agent';
import { getNewsArticleById, updateNewsArticle } from '@/lib/firebase/newsScraper';

export async function POST(request: NextRequest) {
  try {
    const { articleId } = await request.json();

    if (!articleId) {
      return NextResponse.json(
        { error: 'articleId가 필요합니다' },
        { status: 400 }
      );
    }

    // 기사 가져오기
    const article = await getNewsArticleById(articleId);
    if (!article) {
      return NextResponse.json(
        { error: '기사를 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    // 이미 분석된 경우 스킵 (선택사항)
    // if (article.importanceScore) {
    //   return NextResponse.json({
    //     success: true,
    //     message: '이미 분석된 기사입니다',
    //     analysis: {
    //       summary: article.summary,
    //       keywords: article.keywords,
    //       sentiment: article.sentiment,
    //       importanceScore: article.importanceScore,
    //       refinedCategory: article.refinedCategory,
    //       oneLiner: article.oneLiner,
    //     },
    //   });
    // }

    // 에이전트 실행
    const agent = new ContentAnalyzerAgent();
    const task = {
      id: `analyze-${articleId}-${Date.now()}`,
      type: 'analysis',
      input: { article },
      priority: 'medium' as const,
    };

    const result = await agent.execute(task);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || '분석 실패' },
        { status: 500 }
      );
    }

    const analysis = result.output?.analysis;
    if (!analysis) {
      return NextResponse.json(
        { error: '분석 결과가 없습니다' },
        { status: 500 }
      );
    }

    // Firestore 업데이트
    try {
      await updateNewsArticle(articleId, {
        summary: analysis.summary,
        keywords: analysis.keywords || [],
        sentiment: analysis.sentiment,
        importanceScore: analysis.importanceScore,
        refinedCategory: analysis.refinedCategory,
        entities: analysis.entities,
        oneLiner: analysis.oneLiner,
        analyzedAt: new Date(),
      });
    } catch (updateError) {
      console.error('Firestore 업데이트 오류:', updateError);
      // 분석 결과는 반환하지만 업데이트 실패는 경고로 처리
    }

    return NextResponse.json({
      success: true,
      analysis,
      cost: result.cost,
      message: '분석 완료',
    });
  } catch (error: any) {
    console.error('기사 분석 오류:', error);
    return NextResponse.json(
      { error: error.message || '서버 오류' },
      { status: 500 }
    );
  }
}

