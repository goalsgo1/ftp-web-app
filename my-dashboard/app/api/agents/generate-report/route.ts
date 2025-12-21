/**
 * 리포트 생성 API
 * 뉴스 데이터 기반 리포트 자동 생성
 */

import { NextRequest, NextResponse } from 'next/server';
import { ReportGeneratorAgent } from '@/lib/agents/report-generator-agent';
import { getNewsArticles } from '@/lib/firebase/newsScraper';

export async function POST(request: NextRequest) {
  try {
    const { featureId, period, limit = 100 } = await request.json();

    if (!featureId) {
      return NextResponse.json(
        { error: 'featureId가 필요합니다' },
        { status: 400 }
      );
    }

    // 기사 목록 가져오기
    const articles = await getNewsArticles(featureId, {
      limit,
      sortBy: 'importance_score',
    });

    if (articles.length === 0) {
      return NextResponse.json(
        { error: '분석할 기사가 없습니다' },
        { status: 400 }
      );
    }

    // 에이전트 실행
    const agent = new ReportGeneratorAgent();
    const task = {
      id: `report-${featureId}-${Date.now()}`,
      type: 'report',
      input: {
        articles,
        period: period || {
          start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7일 전
          end: new Date(),
        },
      },
      priority: 'medium' as const,
    };

    const result = await agent.execute(task);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || '리포트 생성 실패' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      report: result.output?.report,
      cost: result.cost,
      message: '리포트 생성 완료',
    });
  } catch (error: any) {
    console.error('리포트 생성 오류:', error);
    return NextResponse.json(
      { error: error.message || '서버 오류' },
      { status: 500 }
    );
  }
}

