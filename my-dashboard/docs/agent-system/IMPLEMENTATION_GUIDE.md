# 🛠️ 에이전트 시스템 구현 가이드

## 📋 시작하기 전에

이 가이드는 Claude API를 활용한 에이전트 시스템을 단계별로 구현하는 방법을 설명합니다.

---

## 🔧 Phase 1: 기본 인프라 구축

### 1.1 Claude API 클라이언트 구현

**파일: `app/lib/agents/claude-client.ts`**

```typescript
import Anthropic from '@anthropic-ai/sdk';

export class ClaudeClient {
  private client: Anthropic;
  
  constructor() {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY 환경 변수가 설정되지 않았습니다');
    }
    this.client = new Anthropic({ apiKey });
  }

  /**
   * 메시지 전송 (일반적인 대화)
   */
  async sendMessage(
    messages: Array<{ role: 'user' | 'assistant'; content: string }>,
    systemPrompt?: string,
    model: 'claude-sonnet-4-20250514' | 'claude-3-5-haiku-20241022' = 'claude-sonnet-4-20250514',
    maxTokens: number = 4096
  ) {
    try {
      const response = await this.client.messages.create({
        model,
        max_tokens: maxTokens,
        system: systemPrompt,
        messages: messages as any,
      });

      return {
        content: response.content[0].type === 'text' ? response.content[0].text : '',
        usage: {
          inputTokens: response.usage.input_tokens,
          outputTokens: response.usage.output_tokens,
        },
        cost: this.calculateCost(
          response.usage.input_tokens,
          response.usage.output_tokens,
          model
        ),
      };
    } catch (error) {
      console.error('Claude API 오류:', error);
      throw error;
    }
  }

  /**
   * 도구 사용 메시지 (Tool Use)
   */
  async sendMessageWithTools(
    messages: Array<{ role: 'user' | 'assistant'; content: string }>,
    tools: any[],
    systemPrompt?: string,
    model: 'claude-sonnet-4-20250514' | 'claude-3-5-haiku-20241022' = 'claude-sonnet-4-20250514'
  ) {
    // Tool use 구현
    // (구현 상세 생략)
  }

  /**
   * 비용 계산
   */
  private calculateCost(inputTokens: number, outputTokens: number, model: string): number {
    // Sonnet 4.5: $3/1M input, $15/1M output
    // Haiku 3.5: $0.25/1M input, $1.25/1M output
    const pricing = {
      'claude-sonnet-4-20250514': { input: 3 / 1000000, output: 15 / 1000000 },
      'claude-3-5-haiku-20241022': { input: 0.25 / 1000000, output: 1.25 / 1000000 },
    };

    const prices = pricing[model as keyof typeof pricing] || pricing['claude-sonnet-4-20250514'];
    return inputTokens * prices.input + outputTokens * prices.output;
  }
}
```

### 1.2 Base Agent 클래스 구현

**파일: `app/lib/agents/base-agent.ts`**

```typescript
import { ClaudeClient } from './claude-client';

export interface AgentTask {
  id: string;
  type: string;
  input: Record<string, any>;
  priority: 'low' | 'medium' | 'high';
  parentTaskId?: string;
  subTasks?: AgentTask[];
}

export interface AgentResult {
  taskId: string;
  success: boolean;
  output?: Record<string, any>;
  error?: string;
  cost?: {
    tokens: number;
    price: number;
  };
  subAgentResults?: AgentResult[];
}

export abstract class BaseAgent {
  protected claude: ClaudeClient;
  protected agentId: string;
  protected agentName: string;
  protected role: string;
  protected systemPrompt: string;

  constructor(agentId: string, agentName: string, role: string, systemPrompt: string) {
    this.claude = new ClaudeClient();
    this.agentId = agentId;
    this.agentName = agentName;
    this.role = role;
    this.systemPrompt = systemPrompt;
  }

  /**
   * 작업 실행 (하위 클래스에서 구현)
   */
  abstract execute(task: AgentTask): Promise<AgentResult>;

  /**
   * 서브 에이전트 호출
   */
  async callSubAgent(subAgentId: string, task: AgentTask): Promise<AgentResult> {
    // 서브 에이전트 호출 로직
    // (구현 상세 생략)
    throw new Error('서브 에이전트 호출은 오케스트레이터를 통해 수행해야 합니다');
  }

  /**
   * Claude API 호출 래퍼
   */
  protected async callClaude(
    userMessage: string,
    model: 'claude-sonnet-4-20250514' | 'claude-3-5-haiku-20241022' = 'claude-sonnet-4-20250514'
  ) {
    return this.claude.sendMessage(
      [{ role: 'user', content: userMessage }],
      this.systemPrompt,
      model
    );
  }
}
```

### 1.3 패키지 설치

```bash
npm install @anthropic-ai/sdk
```

### 1.4 환경 변수 설정

`.env.local` 파일에 추가:

```env
ANTHROPIC_API_KEY=sk-ant-api03-...
```

---

## 🔄 Phase 2: 데이터 수집 에이전트 구현

### 2.1 Content Analyzer Agent

**파일: `app/lib/agents/data-agent.ts`**

```typescript
import { BaseAgent, AgentTask, AgentResult } from './base-agent';

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

결과는 JSON 형식으로 반환하세요.`
    );
  }

  async execute(task: AgentTask): Promise<AgentResult> {
    try {
      const { article } = task.input;
      
      if (!article || !article.title || !article.content) {
        throw new Error('기사 정보가 올바르지 않습니다');
      }

      const prompt = `
다음 뉴스 기사를 분석해주세요:

제목: ${article.title}
내용: ${article.content}
출처: ${article.source || '알 수 없음'}
발행일: ${article.publishedAt || '알 수 없음'}

다음 JSON 형식으로 응답해주세요:
{
  "summary": "3-5문장 요약",
  "keywords": ["키워드1", "키워드2", ...],
  "sentiment": "긍정|중립|부정",
  "importanceScore": 1.0-10.0,
  "refinedCategory": "IT|경제|정치|사회|기타",
  "entities": {
    "people": ["인물1", ...],
    "organizations": ["조직1", ...],
    "locations": ["장소1", ...]
  },
  "oneLiner": "한 줄 요약"
}
`;

      const response = await this.callClaude(prompt, 'claude-3-5-haiku-20241022');
      
      // JSON 파싱
      let analysisResult;
      try {
        const jsonMatch = response.content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          analysisResult = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('JSON을 찾을 수 없습니다');
        }
      } catch (parseError) {
        console.error('JSON 파싱 오류:', parseError);
        throw new Error('분석 결과를 파싱할 수 없습니다');
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
      return {
        taskId: task.id,
        success: false,
        error: error.message || '알 수 없는 오류',
      };
    }
  }
}
```

### 2.2 API Route 구현

**파일: `app/api/agents/data-agent/analyze/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { ContentAnalyzerAgent } from '@/lib/agents/data-agent';

export async function POST(request: NextRequest) {
  try {
    const { article } = await request.json();

    if (!article) {
      return NextResponse.json(
        { error: '기사 정보가 필요합니다' },
        { status: 400 }
      );
    }

    const agent = new ContentAnalyzerAgent();
    const task = {
      id: `analyze-${Date.now()}`,
      type: 'analysis',
      input: { article },
      priority: 'medium' as const,
    };

    const result = await agent.execute(task);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      analysis: result.output?.analysis,
      cost: result.cost,
    });
  } catch (error: any) {
    console.error('에이전트 실행 오류:', error);
    return NextResponse.json(
      { error: error.message || '서버 오류' },
      { status: 500 }
    );
  }
}
```

---

## 🔄 Phase 3: 오케스트레이터 구현

### 3.1 Main Orchestrator

**파일: `app/lib/agents/orchestrator.ts`**

```typescript
import { BaseAgent, AgentTask, AgentResult } from './base-agent';
import { ContentAnalyzerAgent } from './data-agent';

export class MainOrchestrator extends BaseAgent {
  private subAgents: Map<string, BaseAgent>;

  constructor() {
    super(
      'main-orchestrator',
      'Main Orchestrator',
      '전체 에이전트 시스템 조율',
      `당신은 여러 에이전트를 조율하는 오케스트레이터입니다.
작업을 분석하고 적절한 에이전트에게 분배하세요.
비용과 효율성을 고려하여 최적의 에이전트를 선택하세요.`
    );

    this.subAgents = new Map();
    this.subAgents.set('content-analyzer', new ContentAnalyzerAgent());
    // 다른 에이전트들도 추가
  }

  async execute(task: AgentTask): Promise<AgentResult> {
    try {
      // 작업 타입에 따라 적절한 에이전트 선택
      let selectedAgent: BaseAgent | null = null;

      switch (task.type) {
        case 'analysis':
          selectedAgent = this.subAgents.get('content-analyzer') || null;
          break;
        // 다른 타입들...
      }

      if (!selectedAgent) {
        throw new Error(`작업 타입 '${task.type}'에 대한 에이전트를 찾을 수 없습니다`);
      }

      // 서브 에이전트 실행
      const result = await selectedAgent.execute(task);

      return {
        taskId: task.id,
        success: result.success,
        output: result.output,
        error: result.error,
        cost: result.cost,
        subAgentResults: [result],
      };
    } catch (error: any) {
      return {
        taskId: task.id,
        success: false,
        error: error.message || '오케스트레이터 오류',
      };
    }
  }
}
```

---

## ⏰ Phase 4: 스케줄링 시스템

### 4.1 Firebase Cloud Functions 스케줄링

**옵션 1: Vercel Cron Jobs (권장 - 간단함)**

`vercel.json` 파일에 추가:

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

**옵션 2: 외부 스케줄러 (cron-job.org)**

매 30분마다 `/api/agents/orchestrator/run-scheduled` 엔드포인트 호출

### 4.2 스케줄링 API Route

**파일: `app/api/agents/orchestrator/run-scheduled/route.ts`**

```typescript
import { NextResponse } from 'next/server';
import { MainOrchestrator } from '@/lib/agents/orchestrator';
import { getNewsArticles } from '@/lib/firebase/newsScraper';

export async function GET(request: Request) {
  try {
    // 인증 확인 (예: 헤더에 API 키)
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const orchestrator = new MainOrchestrator();

    // 분석이 필요한 뉴스 기사 가져오기 (중요도 점수가 없는 것들)
    // 실제 구현에서는 Firestore 쿼리로 가져오기
    const articlesToAnalyze = []; // 예시

    const results = [];

    for (const article of articlesToAnalyze) {
      const task = {
        id: `analyze-${article.id}-${Date.now()}`,
        type: 'analysis',
        input: { article },
        priority: 'medium' as const,
      };

      const result = await orchestrator.execute(task);
      results.push(result);
    }

    return NextResponse.json({
      success: true,
      processed: results.length,
      results,
    });
  } catch (error: any) {
    console.error('스케줄링 작업 오류:', error);
    return NextResponse.json(
      { error: error.message || '서버 오류' },
      { status: 500 }
    );
  }
}
```

---

## 💡 사용 예시

### 뉴스 분석 자동화

```typescript
// app/api/news-scraper/analyze-batch/route.ts
import { ContentAnalyzerAgent } from '@/lib/agents/data-agent';
import { getNewsArticles, updateNewsArticle } from '@/lib/firebase/newsScraper';

export async function POST(request: NextRequest) {
  const { featureId } = await request.json();
  
  // 분석이 필요한 기사들 가져오기 (중요도 점수가 없는 것들)
  const articles = await getNewsArticles(featureId, { limit: 10 });
  const articlesToAnalyze = articles.filter(a => !a.importanceScore);

  const agent = new ContentAnalyzerAgent();
  const results = [];

  for (const article of articlesToAnalyze) {
    const task = {
      id: `analyze-${article.id}`,
      type: 'analysis',
      input: { article },
      priority: 'medium' as const,
    };

    const result = await agent.execute(task);
    
    if (result.success && result.output?.analysis) {
      // Firestore 업데이트
      await updateNewsArticle(article.id!, {
        summary: result.output.analysis.summary,
        keywords: result.output.analysis.keywords,
        sentiment: result.output.analysis.sentiment,
        importanceScore: result.output.analysis.importanceScore,
        refinedCategory: result.output.analysis.refinedCategory,
        entities: result.output.analysis.entities,
        oneLiner: result.output.analysis.oneLiner,
        analyzedAt: new Date(),
      });
    }

    results.push(result);
  }

  return NextResponse.json({
    success: true,
    analyzed: results.filter(r => r.success).length,
    total: articlesToAnalyze.length,
    totalCost: results.reduce((sum, r) => sum + (r.cost?.price || 0), 0),
  });
}
```

---

## 📊 모니터링 및 최적화

### 비용 추적

Firestore에 에이전트 실행 로그 저장:

```typescript
// app/lib/firebase/agentJobs.ts
export interface AgentJobLog {
  id: string;
  agentId: string;
  taskType: string;
  success: boolean;
  cost?: {
    tokens: number;
    price: number;
  };
  duration: number; // ms
  createdAt: Date;
  error?: string;
}

export async function logAgentJob(log: AgentJobLog) {
  // Firestore에 저장
}
```

---

## 🎯 다음 단계

1. ✅ 기본 인프라 구축
2. ✅ 데이터 수집 에이전트 구현
3. 🔄 마케팅 에이전트 구현
4. 🔄 수익화 에이전트 구현
5. 🔄 대시보드 UI 구현

