# 🚀 에이전트 시스템 Quick Start

## 📋 5분 만에 시작하기

### 1단계: 환경 변수 설정

`.env.local` 파일에 추가:

```env
ANTHROPIC_API_KEY=sk-ant-api03-...
CRON_SECRET=your-secret-key-here
```

### 2단계: 패키지 설치

```bash
npm install @anthropic-ai/sdk
```

### 3단계: 기본 에이전트 테스트

간단한 테스트 API Route 생성:

**`app/api/agents/test/route.ts`**

```typescript
import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export async function GET() {
  try {
    const client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const message = await client.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: '안녕하세요! 간단히 자기소개 부탁드립니다.',
        },
      ],
    });

    const content = message.content[0];
    if (content.type === 'text') {
      return NextResponse.json({
        success: true,
        response: content.text,
        usage: message.usage,
      });
    }

    return NextResponse.json({ error: 'Unexpected response type' }, { status: 500 });
  } catch (error: any) {
    console.error('Claude API 오류:', error);
    return NextResponse.json(
      { error: error.message || '서버 오류' },
      { status: 500 }
    );
  }
}
```

브라우저에서 테스트:

```
http://localhost:3000/api/agents/test
```

---

## 🎯 실제 사용 예시: 뉴스 분석 자동화

### 간단한 버전 (즉시 사용 가능)

**`app/api/news-scraper/analyze-simple/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getNewsArticles, updateNewsArticle } from '@/lib/firebase/newsScraper';

export async function POST(request: NextRequest) {
  try {
    const { featureId, articleId } = await request.json();

    if (!featureId || !articleId) {
      return NextResponse.json(
        { error: 'featureId와 articleId가 필요합니다' },
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

    // Claude API 호출
    const client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const prompt = `
다음 뉴스 기사를 분석해주세요:

제목: ${article.title}
내용: ${article.content}
출처: ${article.source}

다음 JSON 형식으로 응답해주세요:
{
  "summary": "3-5문장 요약",
  "keywords": ["키워드1", "키워드2"],
  "sentiment": "긍정|중립|부정",
  "importanceScore": 1.0-10.0,
  "refinedCategory": "IT|경제|정치|사회|기타",
  "oneLiner": "한 줄 요약"
}
`;

    const message = await client.messages.create({
      model: 'claude-3-5-haiku-20241022', // 비용 절감을 위해 Haiku 사용
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('예상치 못한 응답 형식');
    }

    // JSON 파싱
    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('JSON을 찾을 수 없습니다');
    }

    const analysis = JSON.parse(jsonMatch[0]);

    // Firestore 업데이트
    await updateNewsArticle(articleId, {
      summary: analysis.summary,
      keywords: analysis.keywords,
      sentiment: analysis.sentiment,
      importanceScore: analysis.importanceScore,
      refinedCategory: analysis.refinedCategory,
      oneLiner: analysis.oneLiner,
      analyzedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      analysis,
      cost: {
        inputTokens: message.usage.input_tokens,
        outputTokens: message.usage.output_tokens,
        estimatedPrice: (message.usage.input_tokens * 0.25 + message.usage.output_tokens * 1.25) / 1000000,
      },
    });
  } catch (error: any) {
    console.error('분석 오류:', error);
    return NextResponse.json(
      { error: error.message || '서버 오류' },
      { status: 500 }
    );
  }
}
```

---

## 🔄 자동화 설정

### 옵션 1: Vercel Cron Jobs (가장 간단)

`vercel.json` 파일 생성/수정:

```json
{
  "crons": [
    {
      "path": "/api/agents/orchestrator/run-scheduled",
      "schedule": "*/30 * * * *"
    }
  ]
}
```

### 옵션 2: cron-job.org (무료, 즉시 사용 가능)

1. [cron-job.org](https://cron-job.org) 회원가입
2. 새 cron job 생성
3. URL: `https://your-domain.com/api/agents/orchestrator/run-scheduled`
4. 스케줄: `*/30 * * * *` (30분마다)
5. HTTP Header에 인증 키 추가:
   ```
   Authorization: Bearer your-secret-key-here
   ```

---

## 📊 비용 모니터링

### 예상 비용 계산기

```typescript
// app/lib/utils/cost-calculator.ts
export function calculateCost(
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

// 사용 예시
const cost = calculateCost(1000, 500, 'haiku'); // 약 $0.000875
```

### 월 예상 비용

```
뉴스 분석 (1000개/일, Haiku 사용):
- Input: 1000개 × 500 토큰 = 500,000 토큰/일
- Output: 1000개 × 200 토큰 = 200,000 토큰/일
- 일일 비용: 약 $0.875
- 월간 비용: 약 $26.25

Sonnet 사용 시:
- 월간 비용: 약 $315
```

**권장**: 대부분의 작업에 Haiku 사용, 복잡한 분석만 Sonnet 사용

---

## 🎯 다음 단계

1. ✅ 기본 테스트 완료
2. 📖 [아키텍처 문서](./AGENT_ARCHITECTURE.md) 읽기
3. 🛠️ [구현 가이드](./IMPLEMENTATION_GUIDE.md) 따라하기
4. 🚀 실제 에이전트 구현 시작

---

## 💡 팁

### 토큰 절감 전략

1. **모델 선택**: 간단한 작업은 Haiku, 복잡한 작업만 Sonnet
2. **배치 처리**: 여러 기사를 한 번에 분석 (가능한 경우)
3. **프롬프트 최적화**: 불필요한 설명 제거
4. **캐싱**: 유사한 요청 결과 재사용

### 에러 처리

```typescript
try {
  // Claude API 호출
} catch (error: any) {
  if (error.status === 429) {
    // Rate limit - 재시도 로직
  } else if (error.status === 401) {
    // API 키 오류
  } else {
    // 기타 오류
  }
}
```

---

## 📚 관련 문서

- [아키텍처 설계](./AGENT_ARCHITECTURE.md)
- [구현 가이드](./IMPLEMENTATION_GUIDE.md)
- [Claude API 문서](https://docs.anthropic.com/)

