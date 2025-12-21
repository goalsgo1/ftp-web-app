# 뉴스 스크래퍼 구현 가이드

## 📋 현재 상태

✅ **완료된 작업:**
- 기본 페이지 UI 구조 (`app/features/news-scraper/page.tsx`)
- 기능 등록 모달에 뉴스 스크래퍼 옵션 추가
- 샘플 데이터로 동작 확인 가능

## 🎯 다음 해야 할 일 상세 가이드

### Phase 1: Firebase Firestore 데이터 구조 설계 및 구현

#### 1.1 Firestore 컬렉션 구조 설계

**컬렉션: `newsArticles`**
```typescript
// app/lib/firebase/newsScraper.ts

export interface NewsArticle {
  id?: string;
  featureId: string;  // 어떤 기능(뉴스 스크래퍼)에 속하는지
  userId?: string;    // 생성자 ID (공개/비공개 구분용)
  
  // 원본 정보
  title: string;
  url: string;
  content: string;
  source: 'naver' | 'daum' | 'rss';
  originalCategory?: string;
  publishedAt: Date;
  author?: string;
  
  // AI 분석 결과
  summary?: string;
  keywords?: string[];  // ["AI", "기술", "산업"]
  refinedCategory?: 'IT' | '경제' | '정치' | '사회' | '기타';
  sentiment?: '긍정' | '중립' | '부정';
  importanceScore?: number;  // 1.0 ~ 10.0
  entities?: {
    people?: string[];
    organizations?: string[];
    locations?: string[];
  };
  oneLiner?: string;
  
  // 메타데이터
  scrapedAt: Date;
  analyzedAt?: Date;
  contentHash?: string;  // 중복 방지를 위한 해시 (URL 기반)
  
  createdAt?: Date;
  updatedAt?: Date;
}
```

**컬렉션: `scrapingJobs`**
```typescript
export interface ScrapingJob {
  id?: string;
  featureId: string;
  userId: string;  // 작업을 시작한 사용자
  
  source: 'naver' | 'daum' | 'rss' | 'all';
  startedAt: Date;
  finishedAt?: Date;
  status: 'running' | 'success' | 'failed';
  articlesFound?: number;
  articlesSaved?: number;
  errorMessage?: string;
  executionTimeSeconds?: number;
  
  createdAt?: Date;
}
```

**컬렉션: `newsScraperSettings`** (기능별 설정)
```typescript
export interface NewsScraperSettings {
  id?: string;
  featureId: string;
  userId: string;  // 설정을 소유한 사용자 (생성자)
  
  // 스크래핑 설정
  scrapingEnabled: boolean;
  scrapingInterval: number;  // 분 단위 (기본 30분)
  sources: ('naver' | 'daum' | 'rss')[];
  categories: ('IT' | '경제' | '정치' | '사회' | '기타')[];
  
  // AI 분석 설정
  aiAnalysisEnabled: boolean;
  analyzeOnScrape: boolean;  // 스크래핑 시 즉시 분석
  
  // 데이터 보관 설정
  retentionDays: number;  // 보관 기간 (기본 30일)
  autoDelete: boolean;    // 자동 삭제 여부
  
  createdAt?: Date;
  updatedAt?: Date;
}
```

#### 1.2 Firebase 함수 구현

**파일: `app/lib/firebase/newsScraper.ts`**

필요한 함수들:
- `addNewsArticle()` - 뉴스 아티클 추가
- `getNewsArticles()` - 뉴스 목록 조회 (필터링, 정렬 지원)
- `getNewsArticleById()` - 상세 조회
- `deleteNewsArticle()` - 뉴스 삭제
- `getNewsStatistics()` - 통계 조회
- `saveNewsScraperSettings()` - 설정 저장
- `getNewsScraperSettings()` - 설정 조회
- `addScrapingJob()` - 스크래핑 작업 기록
- `getScrapingJobs()` - 스크래핑 작업 목록

**인덱스 설계:**
```
newsArticles:
- userId (asc), publishedAt (desc)
- featureId (asc), publishedAt (desc)
- featureId (asc), refinedCategory (asc), publishedAt (desc)
- featureId (asc), importanceScore (desc)
- contentHash (asc) - 중복 체크용
```

---

### Phase 2: 프론트엔드 데이터 연동

#### 2.1 Firebase 함수 연동

**파일: `app/features/news-scraper/page.tsx` 수정**

1. 샘플 데이터 제거
2. `getNewsArticles()` 호출하여 실제 데이터 가져오기
3. `featureId`를 사용하여 해당 기능의 뉴스만 조회
4. 실시간 업데이트 지원 (옵션: `onSnapshot` 사용)

**예시:**
```typescript
useEffect(() => {
  if (!hasAccess || !featureId) return;
  
  const loadArticles = async () => {
    try {
      setIsLoading(true);
      const articles = await getNewsArticles(featureId, {
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        sortBy: sortBy,
      });
      setArticles(articles);
      setFilteredArticles(articles);
    } catch (error) {
      console.error('뉴스 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  loadArticles();
}, [featureId, selectedCategory, sortBy]);
```

#### 2.2 통계 데이터 연동

`getNewsStatistics()` 함수로 통계 데이터 가져오기:
- 전체 뉴스 수
- 오늘의 뉴스 수
- 카테고리별 분포
- 평균 중요도
- 마지막 스크래핑 시간

---

### Phase 3: 백엔드 스크래핑 서비스 구현

#### 3.1 아키텍처 선택

**옵션 A: Next.js API Routes 사용** (권장 - 현재 프로젝트 구조 유지)
- `app/api/news-scraper/scrape/route.ts`
- `app/api/news-scraper/analyze/route.ts`
- Next.js 서버리스 함수로 구현

**옵션 B: 별도 백엔드 서버** (문서의 FastAPI 방식)
- Python FastAPI 서버 별도 구축
- 별도 서버 관리 필요

#### 3.2 스크래핑 서비스 구현 (Next.js API Routes 기준)

**파일: `app/api/news-scraper/scrape/route.ts`**

**필요한 라이브러리:**
```json
{
  "cheerio": "^1.0.0-rc.12",  // HTML 파싱
  "axios": "^1.6.0",           // HTTP 요청
  "rss-parser": "^3.13.0"      // RSS 피드 파싱
}
```

**구현 내용:**
1. 네이버 뉴스 스크래핑
   - 뉴스 섹션별 URL 크롤링
   - 기사 제목, URL, 내용 추출
   - 중복 체크 (contentHash)

2. 다음 뉴스 스크래핑
   - 다음 뉴스 API 또는 크롤링
   - 동일한 방식으로 데이터 추출

3. RSS 피드 파싱
   - RSS 피드 URL 목록 관리
   - 피드 항목 파싱

4. Firestore에 저장
   - 중복 체크 후 저장
   - `scrapingJobs` 컬렉션에 작업 기록

**예시 구조:**
```typescript
// app/api/news-scraper/scrape/route.ts
export async function POST(request: Request) {
  const { featureId, sources, categories } = await request.json();
  
  // 인증 확인
  // 스크래핑 작업 생성
  // 각 소스별 스크래핑 실행
  // AI 분석 (옵션)
  // Firestore 저장
  // 작업 완료 기록
  
  return Response.json({ success: true, articlesSaved: 10 });
}
```

#### 3.3 스케줄링 구현

**옵션 1: Vercel Cron Jobs** (Vercel 배포 시)
- `vercel.json`에 cron 설정
- 30분마다 API Route 호출

**옵션 2: Firebase Cloud Functions** (권장)
- Cloud Functions로 스케줄러 구현
- Firebase Admin SDK 사용

**옵션 3: 외부 스케줄러 서비스**
- GitHub Actions (무료)
- cron-job.org

---

### Phase 4: AI 분석 기능 구현

#### 4.1 Claude API 연동

**필요한 정보:**
- Anthropic API 키 (환경 변수)
- Claude API 엔드포인트

**파일: `app/api/news-scraper/analyze/route.ts`**

**구현 내용:**
1. 뉴스 본문을 Claude API에 전송
2. 프롬프트 설계:
   ```
   다음 뉴스 기사를 분석해주세요:
   
   [뉴스 본문]
   
   다음 형식으로 JSON으로 응답해주세요:
   {
     "summary": "3-5문장 요약",
     "keywords": ["키워드1", "키워드2"],
     "refinedCategory": "IT|경제|정치|사회|기타",
     "sentiment": "긍정|중립|부정",
     "importanceScore": 1.0-10.0,
     "entities": {
       "people": [],
       "organizations": [],
       "locations": []
     },
     "oneLiner": "한 줄 요약"
   }
   ```

3. 분석 결과를 Firestore에 업데이트

**비용 관리:**
- 한 기사당 약 $0.001-0.005 (본문 길이에 따라)
- 월 1000개 기사 분석 시 약 $1-5
- 중요도 점수 기준으로 필터링하여 분석할 기사 선택 가능

---

### Phase 5: 관리자 기능 구현

#### 5.1 스크래핑 설정 페이지

**새 파일: `app/features/news-scraper/admin/page.tsx`**

**기능:**
- 스크래핑 on/off 토글
- 소스 선택 (네이버, 다음, RSS)
- 카테고리 선택
- 스크래핑 주기 설정
- 즉시 스크래핑 실행 버튼
- 마지막 스크래핑 상태 표시

#### 5.2 스크래핑 작업 로그

- 작업 목록 표시
- 성공/실패 상태
- 실행 시간
- 발견/저장된 기사 수
- 에러 메시지

#### 5.3 통계 대시보드

- 카테고리별 분포 차트
- 날짜별 기사 수 추이
- 중요도 분포
- 감정 분석 결과 시각화

---

### Phase 6: 최적화 및 개선

#### 6.1 성능 최적화

1. **페이지네이션**
   - 무한 스크롤 또는 페이지 번호
   - 한 번에 20개씩 로드

2. **캐싱**
   - 통계 데이터 캐싱 (5분)
   - 인기 뉴스 캐싱

3. **인덱스 최적화**
   - Firestore 복합 인덱스 생성
   - 쿼리 최적화

#### 6.2 사용자 경험 개선

1. **로딩 상태**
   - 스켈레톤 UI
   - 진행률 표시

2. **에러 처리**
   - 친화적인 에러 메시지
   - 재시도 기능

3. **검색 개선**
   - 자동완성
   - 검색 필터 확장

#### 6.3 보안 강화

1. **API 보안**
   - 인증 확인
   - Rate limiting
   - 입력 검증

2. **Firestore 보안 규칙**
   ```javascript
   match /newsArticles/{articleId} {
     allow read: if resource.data.isPublic == true 
       || request.auth.uid == resource.data.userId;
     allow write: if request.auth.uid == resource.data.userId;
   }
   ```

---

## 📦 필요한 패키지 설치

```bash
# 스크래핑
npm install cheerio axios rss-parser

# AI 분석
npm install @anthropic-ai/sdk

# 유틸리티
npm install crypto-js  # contentHash 생성용
```

---

## 🔄 구현 우선순위

### 우선순위 1 (필수)
1. ✅ Firebase Firestore 데이터 구조 설계
2. ✅ `newsScraper.ts` 기본 함수 구현 (CRUD)
3. ✅ 프론트엔드 Firebase 연동
4. ✅ 실제 데이터로 UI 동작 확인

### 우선순위 2 (핵심 기능)
5. ✅ 네이버 뉴스 스크래핑 구현
6. ✅ 스크래핑 API Route 구현
7. ✅ 수동 스크래핑 실행 기능
8. ✅ AI 분석 기본 구현

### 우선순위 3 (고도화)
9. ✅ 자동 스케줄링
10. ✅ 관리자 페이지
11. ✅ 통계 대시보드
12. ✅ 성능 최적화

---

## 📝 구현 체크리스트

### Phase 1: 데이터 구조
- [ ] `NewsArticle` 인터페이스 정의
- [ ] `ScrapingJob` 인터페이스 정의
- [ ] `NewsScraperSettings` 인터페이스 정의
- [ ] `app/lib/firebase/newsScraper.ts` 파일 생성
- [ ] 기본 CRUD 함수 구현
- [ ] Firestore 인덱스 설정

### Phase 2: 프론트엔드 연동
- [ ] `page.tsx`에서 샘플 데이터 제거
- [ ] `getNewsArticles()` 연동
- [ ] 실시간 데이터 로드 확인
- [ ] 통계 데이터 연동
- [ ] 에러 처리 추가

### Phase 3: 스크래핑 구현
- [ ] 필요한 패키지 설치
- [ ] 네이버 뉴스 스크래퍼 구현
- [ ] 다음 뉴스 스크래퍼 구현
- [ ] RSS 파서 구현
- [ ] API Route 생성
- [ ] 수동 실행 기능 추가

### Phase 4: AI 분석
- [ ] Anthropic API 키 설정
- [ ] 분석 API Route 구현
- [ ] 프롬프트 설계
- [ ] 분석 결과 저장
- [ ] 비용 모니터링

### Phase 5: 관리자 기능
- [ ] 설정 페이지 UI
- [ ] 설정 저장/로드
- [ ] 스크래핑 작업 로그
- [ ] 통계 대시보드

### Phase 6: 최적화
- [ ] 페이지네이션
- [ ] 캐싱 전략
- [ ] 성능 측정 및 개선
- [ ] 보안 규칙 검토

---

## 💡 추가 고려사항

### 1. 비용 관리
- AI 분석 비용 절감: 중요도 점수 기준 필터링
- 스크래핑 빈도 조절: 실제 필요에 따라 조정
- 데이터 보관 기간: 30일 자동 삭제

### 2. 법적 고려사항
- robots.txt 준수
- 저작권 고지
- 이용약관 확인

### 3. 확장성
- 다른 뉴스 소스 추가 용이
- 다른 AI 모델 지원 가능
- 알림 기능 추가 가능

---

## 🚀 시작하기

1. **Firebase 함수 구현부터 시작**
   - `app/lib/firebase/newsScraper.ts` 파일 생성
   - 기본 CRUD 함수 구현
   - Firestore 인덱스 설정

2. **프론트엔드 연동**
   - 실제 데이터로 UI 테스트
   - 기능 동작 확인

3. **스크래핑 구현**
   - 간단한 테스트부터 시작
   - 점진적으로 소스 추가

4. **AI 분석 추가**
   - 비용을 고려하여 선택적 구현
   - 중요도 높은 기사만 분석

각 단계를 완료한 후 다음 단계로 진행하세요!

