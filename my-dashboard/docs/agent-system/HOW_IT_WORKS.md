# 🔄 에이전트 시스템 실행 방식 설명

## 📌 핵심 정리

**에이전트 시스템은 my-dashboard 프로젝트와 함께 실행됩니다.**

별도의 서버나 프로세스를 실행할 필요가 없습니다. Next.js API Routes로 구현되어 있어서, 기존 개발 서버(`npm run dev`)가 실행되면 자동으로 포함됩니다.

---

## 🏗️ 아키텍처 구조

```
my-dashboard 프로젝트
│
├── app/
│   ├── api/                          ← API Routes (서버 사이드)
│   │   ├── agents/
│   │   │   ├── test/route.ts         ← 에이전트 테스트 API
│   │   │   └── analyze-article/route.ts
│   │   │
│   │   └── news-scraper/
│   │       ├── scrape/route.ts       ← 기존 뉴스 스크래핑 API
│   │       └── analyze-batch/route.ts ← 에이전트 분석 API
│   │
│   ├── lib/
│   │   └── agents/                   ← 에이전트 라이브러리
│   │       ├── claude-client.ts
│   │       ├── base-agent.ts
│   │       └── data-agent.ts
│   │
│   └── features/                     ← 프론트엔드 (클라이언트 사이드)
│       └── news-scraper/
│           └── page.tsx
│
└── package.json                      ← 같은 패키지에 포함
```

---

## 🚀 실행 방식

### 개발 환경

```bash
# 단 하나의 명령어로 모든 것이 실행됩니다
npm run dev
```

**결과:**
- ✅ Next.js 개발 서버 실행 (localhost:3000)
- ✅ 모든 API Routes 자동 활성화
  - `/api/agents/test` ← 에이전트 테스트
  - `/api/agents/analyze-article` ← 기사 분석
  - `/api/news-scraper/analyze-batch` ← 일괄 분석
  - `/api/news-scraper/scrape` ← 뉴스 스크래핑
- ✅ 프론트엔드 페이지 접근 가능

### 프로덕션 환경

```bash
npm run build
npm start
```

**또는 Vercel 배포 시:**
- 빌드 시 자동으로 API Routes 포함
- 별도 설정 없이 바로 사용 가능

---

## 🔄 동작 흐름

### 시나리오 1: 프론트엔드에서 에이전트 호출

```
[브라우저] 
  ↓ fetch('/api/agents/analyze-article', {...})
  ↓
[Next.js 서버 - app/api/agents/analyze-article/route.ts]
  ↓
[ContentAnalyzerAgent 실행]
  ↓
[Claude API 호출 (외부)]
  ↓
[Firestore 업데이트]
  ↓
[결과 반환]
  ↓
[브라우저에서 결과 표시]
```

### 시나리오 2: 스케줄링된 작업 (예: cron-job.org)

```
[cron-job.org]
  ↓ HTTP POST to https://your-domain.com/api/news-scraper/analyze-batch
  ↓
[Next.js 서버 - app/api/news-scraper/analyze-batch/route.ts]
  ↓
[Firestore에서 분석 필요한 기사 가져오기]
  ↓
[각 기사마다 ContentAnalyzerAgent 실행]
  ↓
[Claude API 호출 (외부)]
  ↓
[Firestore에 분석 결과 저장]
  ↓
[완료 응답 반환]
```

---

## ⚙️ 왜 별도 서버가 필요 없나요?

### Next.js API Routes의 특징

1. **서버 사이드 실행**
   - `app/api/` 폴더의 파일들은 서버에서만 실행됨
   - 클라이언트 번들에 포함되지 않음
   - 환경 변수(`ANTHROPIC_API_KEY`) 안전하게 사용 가능

2. **통합 개발**
   - 같은 프로젝트에서 프론트엔드와 백엔드 코드 관리
   - 타입 공유 가능 (TypeScript)
   - 하나의 저장소에서 모든 코드 관리

3. **간편한 배포**
   - Vercel에 배포 시 API Routes 자동 포함
   - 별도 서버 설정 불필요
   - 서버리스 함수로 자동 변환

---

## 📊 비교: 별도 서버 vs Next.js API Routes

| 항목 | 별도 서버 (예: FastAPI) | Next.js API Routes (현재 방식) |
|------|------------------------|-------------------------------|
| 실행 명령어 | `python app.py` (별도) | `npm run dev` (통합) |
| 포트 | 다른 포트 (예: 8000) | 같은 포트 (3000) |
| CORS 설정 | 필요 | 불필요 |
| 배포 | 별도 서버 배포 필요 | Vercel에 자동 포함 |
| 코드 관리 | 별도 저장소 가능 | 같은 프로젝트 |
| 타입 공유 | 어려움 | 쉬움 (TypeScript) |

---

## 🔍 현재 프로젝트에서 확인하는 방법

### 1. 개발 서버 실행 확인

```bash
npm run dev
```

터미널 출력 예시:
```
  ▲ Next.js 16.0.10
  - Local:        http://localhost:3000
  - Ready in 2.3s
```

### 2. 에이전트 API 테스트

브라우저에서 접속:
```
http://localhost:3000/api/agents/test
```

**성공 응답:**
```json
{
  "success": true,
  "response": "안녕하세요! ...",
  "usage": { ... },
  "cost": 0.0000875
}
```

→ 이것으로 에이전트가 정상 작동하는지 확인 가능!

### 3. API Routes 목록 확인

`app/api/` 폴더 구조:
```
app/api/
├── agents/
│   ├── test/route.ts           ← /api/agents/test
│   └── analyze-article/route.ts ← /api/agents/analyze-article
└── news-scraper/
    ├── scrape/route.ts         ← /api/news-scraper/scrape
    └── analyze-batch/route.ts  ← /api/news-scraper/analyze-batch
```

---

## 💡 핵심 요약

1. ✅ **같은 프로젝트**: my-dashboard 내부에 모든 코드가 있음
2. ✅ **같은 서버**: `npm run dev` 하나로 모든 것이 실행됨
3. ✅ **같은 포트**: localhost:3000에서 모든 API 접근 가능
4. ✅ **자동 포함**: 빌드/배포 시 자동으로 포함됨

**별도로 실행할 필요가 전혀 없습니다!** 🎉

---

## 🚨 만약 별도 서버를 원한다면?

만약 Python FastAPI 서버처럼 별도로 실행하고 싶다면, 완전히 다른 구조로 만들어야 합니다:

```
my-dashboard/          ← 프론트엔드
agent-server/          ← 별도 백엔드 서버 (Python/Node.js)
  ├── main.py
  ├── requirements.txt
  └── ...
```

하지만 **현재는 그럴 필요가 전혀 없습니다!** Next.js API Routes로 충분히 모든 기능을 구현할 수 있습니다.

---

## ❓ 질문

**Q: 에이전트가 백그라운드에서 계속 실행되나요?**
A: 아니요. API 요청이 올 때만 실행됩니다. 24시간 자동 실행을 원하면 cron-job.org 같은 외부 스케줄러가 주기적으로 API를 호출하면 됩니다.

**Q: 프론트엔드 코드와 섞이지 않나요?**
A: 아니요. `app/api/` 폴더의 코드는 서버에서만 실행되며, 클라이언트 번들에 포함되지 않습니다.

**Q: API 키가 안전한가요?**
A: 네. `process.env.ANTHROPIC_API_KEY`는 서버에서만 접근 가능하며, 클라이언트 코드로 전송되지 않습니다.

---

**작성일**: 2025-01-27

