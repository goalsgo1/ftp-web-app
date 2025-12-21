# 📋 기능별 뉴스 스크래퍼 구조 설명

## ✅ 현재 구조

**각 기능(feature)별로 완전히 독립적으로 작동합니다!**

---

## 🏗️ 구조 설명

### 1. 기능별 독립성

각 기능(예: "정치", "연예계", "유가주식", "사회")은 `featureId`로 구분됩니다.

```
웹 기능 목록
├── 정치 (featureId: "politics-feature-id")
│   ├── 뉴스 수집 (독립적)
│   ├── 분석 화면 (독립적)
│   └── 리포트 생성 (독립적)
│
├── 연예계 (featureId: "entertainment-feature-id")
│   ├── 뉴스 수집 (독립적)
│   ├── 분석 화면 (독립적)
│   └── 리포트 생성 (독립적)
│
└── 유가주식 (featureId: "stock-feature-id")
    ├── 뉴스 수집 (독립적)
    ├── 분석 화면 (독립적)
    └── 리포트 생성 (독립적)
```

---

## 📍 접근 방법

### URL 구조

각 기능은 URL 파라미터로 구분됩니다:

```
/features/news-scraper?featureId=politics-feature-id     → 정치 뉴스
/features/news-scraper?featureId=entertainment-feature-id → 연예계 뉴스
/features/news-scraper?featureId=stock-feature-id        → 유가주식 뉴스
```

### 웹 기능 목록에서 접근

1. 기능 목록 페이지에서 특정 기능 클릭
2. 해당 기능의 `featureId`로 뉴스 스크래퍼 페이지 이동
3. 해당 기능의 뉴스만 표시

---

## 🔄 각 기능별로 할 수 있는 것

### ✅ 1. 뉴스 수집 (독립적)

각 기능마다 별도로 뉴스를 수집할 수 있습니다:

```typescript
// 정치 기능
POST /api/news-scraper/scrape
{
  featureId: "politics-feature-id",
  sources: ["naver", "daum"],
  categories: ["정치"]
}

// 연예계 기능
POST /api/news-scraper/scrape
{
  featureId: "entertainment-feature-id",
  sources: ["naver", "daum"],
  categories: ["연예"]
}
```

**결과**: 
- 각 기능의 뉴스는 `featureId`로 구분되어 Firestore에 저장됩니다
- 서로 섞이지 않습니다

---

### ✅ 2. 분석 화면 (독립적)

각 기능별로 분석 화면이 독립적으로 작동합니다:

```typescript
// 정치 기능의 분석
POST /api/news-scraper/analyze-batch
{
  featureId: "politics-feature-id",
  limit: 20
}

// 연예계 기능의 분석
POST /api/news-scraper/analyze-batch
{
  featureId: "entertainment-feature-id",
  limit: 20
}
```

**UI에서**:
- 각 기능 페이지에서 "전체 분석" 버튼 클릭
- 해당 기능의 뉴스만 분석됩니다
- 분석 결과도 해당 기능에만 저장됩니다

---

### ✅ 3. 리포트 생성 (독립적)

각 기능별로 리포트를 생성할 수 있습니다:

```typescript
// 정치 기능의 리포트
POST /api/agents/generate-report
{
  featureId: "politics-feature-id",
  limit: 100
}

// 연예계 기능의 리포트
POST /api/agents/generate-report
{
  featureId: "entertainment-feature-id",
  limit: 100
}
```

**결과**:
- 각 기능의 리포트는 독립적으로 생성됩니다
- 해당 기능의 뉴스만 분석 대상입니다

---

## 💾 데이터 저장 구조

### Firestore 컬렉션: `newsArticles`

```typescript
{
  id: "article-1",
  featureId: "politics-feature-id",  // ← 기능별 구분
  title: "정치 뉴스 제목",
  // ... 기타 필드
}

{
  id: "article-2",
  featureId: "entertainment-feature-id",  // ← 다른 기능
  title: "연예계 뉴스 제목",
  // ... 기타 필드
}
```

**쿼리**: 
- `where('featureId', '==', 'politics-feature-id')` → 정치 뉴스만
- `where('featureId', '==', 'entertainment-feature-id')` → 연예계 뉴스만

---

## 🎯 사용 시나리오

### 시나리오 1: 정치 뉴스 관리

1. 기능 목록에서 "정치" 클릭
2. `/features/news-scraper?featureId=politics-feature-id` 이동
3. "지금 수집하기" 클릭 → 정치 카테고리 뉴스만 수집
4. "전체 분석" 클릭 → 정치 뉴스만 분석
5. 리포트 생성 → 정치 관련 리포트만 생성

### 시나리오 2: 연예계 뉴스 관리

1. 기능 목록에서 "연예계" 클릭
2. `/features/news-scraper?featureId=entertainment-feature-id` 이동
3. "지금 수집하기" 클릭 → 연예 카테고리 뉴스만 수집
4. "전체 분석" 클릭 → 연예계 뉴스만 분석
5. 리포트 생성 → 연예계 관련 리포트만 생성

---

## 🔍 확인 방법

### 코드에서 확인

**`app/features/news-scraper/page.tsx`**:
```typescript
const featureId = searchParams.get('featureId') || searchParams.get('id') || 'news-scraper';
// ↑ URL 파라미터로 featureId 받음

const articles = await getNewsArticles(featureId, { ... });
// ↑ featureId로 필터링된 뉴스만 가져옴
```

**`app/lib/firebase/newsScraper.ts`**:
```typescript
export const getNewsArticles = async (
  featureId: string,  // ← 기능별 구분
  options: GetNewsArticlesOptions = {}
): Promise<NewsArticle[]> => {
  let q = query(
    collection(db, 'newsArticles'),
    where('featureId', '==', featureId)  // ← featureId로 필터링
  );
  // ...
}
```

---

## ✅ 정리

**질문**: 각 기능별로 뉴스 수집, 분석, 리포트가 독립적으로 있나요?

**답변**: **네, 맞습니다!**

1. ✅ **뉴스 수집**: 각 featureId별로 독립적으로 수집
2. ✅ **분석 화면**: 각 featureId별로 독립적으로 분석
3. ✅ **리포트 생성**: 각 featureId별로 독립적으로 생성

모든 것이 `featureId`로 구분되어 완전히 독립적으로 작동합니다!

---

**작성일**: 2025-01-27

