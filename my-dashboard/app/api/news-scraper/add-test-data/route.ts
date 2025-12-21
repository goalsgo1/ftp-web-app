import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // 테스트 데이터 추가는 개발 환경에서만 사용
    return NextResponse.json({
      success: false,
      message: '이 엔드포인트는 개발 중입니다.',
      note: '테스트 데이터 추가는 스크립트를 직접 실행하세요.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

