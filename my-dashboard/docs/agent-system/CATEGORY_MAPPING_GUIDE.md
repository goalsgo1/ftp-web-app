# 🏷️ 기능 이름 → 뉴스 카테고리 매핑 가이드

## 📋 개요

기능을 만들 때 이름만 설정해도, 자동으로 관련된 뉴스 카테고리를 추론하여 수집합니다.

---

## 🤖 자동 카테고리 추론

### 작동 방식

1. **기능 이름 기반 추론**
   - 기능 이름에서 키워드를 찾아 카테고리 추론
   - 예: "정치" → `['정치']`

2. **설명 기반 추론** (더 정확)
   - 기능 이름 + 설명을 함께 분석
   - 여러 키워드 매칭으로 더 정확한 추론

3. **우선순위**
   - Feature의 `newsCategories` 필드가 있으면 우선 사용
   - 없으면 이름/설명 기반 추론
   - 설정(`NewsScraperSettings`)이 있으면 설정 우선

---

## 📊 카테고리 매핑 규칙

### 정치 카테고리

**키워드**: 정치, 선거, 국회, 정당, 의원, 대통령, 정부, 국회의원

**예시**:
- "정치" → `['정치']`
- "선거 뉴스" → `['정치']`
- "국회 소식" → `['정치']`

---

### 경제 카테고리

**키워드**: 주식, 증권, 유가, 경제, 금융, 투자, 부동산, 코인, 비트코인, 환율, 금리

**예시**:
- "유가주식" → `['경제']`
- "주식 투자" → `['경제']`
- "코인 시세" → `['경제']`
- "부동산 정보" → `['경제']`

---

### IT 카테고리

**키워드**: IT, AI, 인공지능, 기술, 스마트, 디지털, 소프트웨어, 하드웨어, 개발, 프로그래밍, 코딩, 앱, 게임, 전자

**예시**:
- "AI 뉴스" → `['IT']`
- "기술 트렌드" → `['IT']`
- "개발 정보" → `['IT']`

---

### 사회 카테고리

**키워드**: 사회, 교육, 의료, 건강, 환경, 교통, 날씨, 재난, 사고, 범죄

**예시**:
- "사회 이슈" → `['사회']`
- "교육 정책" → `['사회']`
- "환경 뉴스" → `['사회']`

---

### 기타 카테고리

**키워드**: 연예, 엔터테인먼트, 예능, 가수, 배우, 영화, 드라마, 음악, 스포츠

**예시**:
- "연예계" → `['기타']`
- "스포츠 뉴스" → `['기타']`
- "K-POP 소식" → `['기타']`

---

## 🔧 수동 설정 방법

### 방법 1: Feature에 직접 설정 (권장)

기능을 등록할 때 `newsCategories` 필드를 설정:

```typescript
await addFeature({
  name: "정치",
  description: "정치 관련 뉴스",
  category: "뉴스",
  url: "/features/news-scraper?id=politics-feature-id",
  newsCategories: ['정치'], // ← 직접 설정
  newsSources: ['naver', 'daum'],
});
```

### 방법 2: NewsScraperSettings 사용

각 기능의 설정에서 카테고리를 지정:

```typescript
await saveNewsScraperSettings(featureId, userId, {
  scrapingEnabled: true,
  scrapingInterval: 30,
  sources: ['naver', 'daum'],
  categories: ['정치'], // ← 여기서 설정
  // ...
});
```

---

## 💡 추론 예시

### 예시 1: "정치" 기능

**입력**:
- 이름: "정치"
- 설명: "정치 관련 뉴스 수집"

**추론 결과**: `['정치']`

---

### 예시 2: "유가주식" 기능

**입력**:
- 이름: "유가주식"
- 설명: "주식 시세 및 투자 정보"

**추론 결과**: `['경제']`

---

### 예시 3: "연예계" 기능

**입력**:
- 이름: "연예계"
- 설명: "연예인 소식 및 엔터테인먼트 뉴스"

**추론 결과**: `['기타']`

---

### 예시 4: "IT 트렌드" 기능

**입력**:
- 이름: "IT 트렌드"
- 설명: "최신 기술 동향 및 AI 뉴스"

**추론 결과**: `['IT']`

---

## ⚙️ 현재 구현

### 코드 위치

**`app/lib/utils/featureCategoryMapper.ts`**

```typescript
export function inferNewsCategoriesFromFeature(
  featureName: string, 
  description?: string
): NewsCategory[]
```

**사용 위치**:

**`app/features/news-scraper/page.tsx`**:
```typescript
// 기능 정보 로드 시 자동으로 카테고리 추론
const categoriesToUse = inferNewsCategoriesFromFeature(
  featureData.name,
  featureData.description
);
setScrapingCategories(categoriesToUse);

// 스크랩할 때 추론된 카테고리 사용
categories: scrapingCategories
```

---

## 🔄 동작 흐름

```
1. 기능 등록 (이름: "정치")
   ↓
2. 뉴스 스크래퍼 페이지 접근
   ↓
3. 기능 정보 로드
   ↓
4. 카테고리 추론 (inferNewsCategoriesFromFeature)
   → "정치" → ['정치']
   ↓
5. 추론된 카테고리 저장 (scrapingCategories)
   ↓
6. "지금 수집하기" 클릭
   ↓
7. API 호출 시 추론된 카테고리 사용
   → categories: ['정치']
   ↓
8. 정치 카테고리 뉴스만 수집됨! ✅
```

---

## ⚠️ 주의사항

1. **추론의 한계**
   - 키워드 기반 추론이므로 100% 정확하지 않을 수 있음
   - 복잡한 이름의 경우 잘못 추론될 수 있음

2. **해결 방법**
   - Feature에 `newsCategories` 필드 직접 설정 (가장 정확)
   - NewsScraperSettings에서 카테고리 지정 (나중에 수정 가능)

3. **기본값**
   - 추론 실패 시: `['IT', '경제', '정치', '사회']` (모든 카테고리)

---

## 📝 추천 사용법

### 빠른 설정 (자동 추론)

1. 기능 이름에 키워드 포함 (예: "정치", "유가주식")
2. 설명에 관련 키워드 추가
3. 자동으로 추론됨 ✅

### 정확한 설정 (수동)

1. Feature 등록 시 `newsCategories` 필드 설정
2. 또는 NewsScraperSettings에서 카테고리 지정
3. 100% 정확한 수집 ✅

---

**작성일**: 2025-01-27

