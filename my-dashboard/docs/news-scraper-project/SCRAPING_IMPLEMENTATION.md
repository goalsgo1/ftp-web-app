# 자동 스크래핑 구현 가이드

## 📋 개요

뉴스를 자동으로 수집하는 기능을 구현하는 방법을 설명합니다.

## 🔧 필요한 패키지 설치

먼저 다음 패키지들을 설치해야 합니다:

```bash
npm install cheerio axios rss-parser crypto
npm install --save-dev @types/rss-parser
```

---

## 🚀 구현 단계

### 1단계: 스크래핑 유틸리티 함수 작성

`app/lib/utils/newsScraper.ts` 파일을 생성하여 각 소스별 스크래핑 로직을 구현합니다.

### 2단계: 스크래핑 API Route 구현

`app/api/news-scraper/scrape/route.ts` 파일을 생성하여 스크래핑을 실행하는 API 엔드포인트를 만듭니다.

### 3단계: 스케줄링 설정

자동 실행을 위한 스케줄러를 설정합니다. 여러 옵션이 있습니다:

#### 옵션 A: Vercel Cron Jobs (Vercel 배포 시)

`vercel.json` 파일에 cron 설정 추가

#### 옵션 B: 외부 스케줄러 서비스 (개발/로컬 테스트용)

- GitHub Actions (무료)
- cron-job.org (무료)
- EasyCron (무료 티어 있음)

#### 옵션 C: Firebase Cloud Functions (권장 - 프로덕션)

Firebase Cloud Functions로 스케줄러 구현

---

## ⚠️ 중요 사항

### 1. 법적 고려사항

- **robots.txt 준수**: 스크래핑 전에 대상 사이트의 robots.txt 확인
- **이용약관 확인**: 각 사이트의 이용약관 확인
- **저작권 고지**: 원문 출처 명확히 표시

### 2. 기술적 제약사항

- **Rate Limiting**: 너무 빠르게 요청하지 않도록 딜레이 추가
- **User-Agent 설정**: 정상적인 브라우저로 보이도록 설정
- **에러 처리**: 네트워크 오류, 타임아웃 등 처리

### 3. 중복 방지

- URL 해시 기반 중복 체크
- Firestore에 저장 전 중복 확인

---

## 📝 구현 예시

### 기본 구조

```typescript
// app/api/news-scraper/scrape/route.ts
export async function POST(request: Request) {
  // 1. 인증 확인
  // 2. 스크래핑 작업 생성 (scrapingJobs 컬렉션)
  // 3. 각 소스별 스크래핑 실행
  // 4. 중복 체크
  // 5. Firestore 저장
  // 6. 작업 완료 기록
}
```

---

## 🔄 스케줄링 방법 상세

### 방법 1: Vercel Cron Jobs

`vercel.json` 파일:

```json
{
  "crons": [{
    "path": "/api/news-scraper/scrape",
    "schedule": "*/30 * * * *"
  }]
}
```

- `*/30 * * * *`: 30분마다 실행

### 방법 2: GitHub Actions (무료)

`.github/workflows/news-scraper.yml`:

```yaml
name: News Scraper
on:
  schedule:
    - cron: '*/30 * * * *'  # 30분마다
  workflow_dispatch:  # 수동 실행 가능

jobs:
  scrape:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Scraping
        run: |
          curl -X POST https://your-domain.com/api/news-scraper/scrape
```

### 방법 3: cron-job.org

1. https://cron-job.org 접속
2. 새 작업 생성
3. URL: `https://your-domain.com/api/news-scraper/scrape`
4. Method: POST
5. Schedule: 30분마다

---

## 🎯 다음 단계

1. ✅ 패키지 설치
2. ✅ 스크래핑 유틸리티 구현
3. ✅ API Route 구현
4. ✅ 테스트 (수동 실행)
5. ✅ 스케줄링 설정

---

## 💡 참고사항

- 초기 구현은 간단하게 시작 (네이버 뉴스 RSS만)
- 점진적으로 소스 추가 (다음, 다른 RSS 피드)
- 에러 처리와 로깅 중요
- 성능 모니터링 필요

