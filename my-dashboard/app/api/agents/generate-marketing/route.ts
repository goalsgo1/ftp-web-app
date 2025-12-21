/**
 * 마케팅 콘텐츠 생성 API
 * 뉴스 기사 기반으로 소셜 미디어 콘텐츠 생성
 */

import { NextRequest, NextResponse } from 'next/server';
import { MarketingAgent } from '@/lib/agents/marketing-agent';
import { getNewsArticleById } from '@/lib/firebase/newsScraper';

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

    // 에이전트 실행
    const agent = new MarketingAgent();
    const task = {
      id: `marketing-${articleId}-${Date.now()}`,
      type: 'marketing',
      input: { article },
      priority: 'medium' as const,
    };

    const result = await agent.execute(task);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || '마케팅 콘텐츠 생성 실패' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      marketingContent: result.output?.marketingContent,
      cost: result.cost,
      message: '마케팅 콘텐츠 생성 완료',
    });
  } catch (error: any) {
    console.error('마케팅 콘텐츠 생성 오류:', error);
    return NextResponse.json(
      { error: error.message || '서버 오류' },
      { status: 500 }
    );
  }
}

