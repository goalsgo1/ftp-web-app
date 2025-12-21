/**
 * 에이전트 시스템 테스트 API
 * Claude API 연결 및 기본 동작 테스트용
 */

import { NextResponse } from 'next/server';
import { ClaudeClient } from '@/lib/agents/claude-client';

export async function GET() {
  try {
    const client = new ClaudeClient();

    const message = await client.sendMessage(
      [
        {
          role: 'user',
          content: '안녕하세요! 간단히 자기소개 부탁드립니다. 한 문장으로만 답해주세요.',
        },
      ],
      undefined,
      'claude-3-5-haiku-20241022', // 테스트는 저렴한 Haiku 사용
      1024
    );

    return NextResponse.json({
      success: true,
      response: message.content,
      usage: message.usage,
      cost: message.cost,
      message: 'Claude API 연결 성공!',
    });
  } catch (error: any) {
    console.error('에이전트 테스트 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || '서버 오류',
        hint: 'ANTHROPIC_API_KEY 환경 변수가 설정되었는지 확인하세요.',
      },
      { status: 500 }
    );
  }
}

