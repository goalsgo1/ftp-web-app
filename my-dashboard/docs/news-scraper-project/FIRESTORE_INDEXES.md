# Firestore 인덱스 설정 가이드

## 🔍 문제 상황

뉴스 스크래퍼를 사용할 때 다음과 같은 오류가 발생할 수 있습니다:

```
FirebaseError: The query requires an index
```

이것은 Firestore에서 복합 쿼리를 사용할 때 필요한 인덱스가 없어서 발생하는 오류입니다.

---

## ✅ 해결 방법

### 방법 1: Firebase 콘솔에서 자동 생성 (권장)

1. 오류 메시지에 제공된 링크 클릭
   - 오류 메시지에 파란색 링크가 표시됩니다
   - 예: `https://console.firebase.google.com/v1/r/project/.../firestore/indexes?create_composite=...`

2. Firebase 콘솔에서 "인덱스 생성" 버튼 클릭

3. 인덱스가 생성될 때까지 대기 (보통 1-2분 소요)

4. 페이지 새로고침 후 다시 시도

### 방법 2: 수동으로 인덱스 생성

Firebase 콘솔에서 직접 인덱스를 생성할 수도 있습니다:

1. **Firebase 콘솔 접속**
   - https://console.firebase.google.com
   - 프로젝트 선택

2. **Firestore Database** 메뉴 클릭

3. **인덱스** 탭 클릭

4. **복합 인덱스 생성** 클릭

5. 다음 인덱스들을 생성:

---

## 📋 필요한 인덱스 목록

### 1. newsArticles 컬렉션 - 기본 쿼리

**컬렉션 ID**: `newsArticles`

**필드**:
- `featureId` (오름차순)
- `publishedAt` (내림차순)

**쿼리 범위**: 컬렉션

**용도**: 뉴스 목록 조회 (featureId로 필터링하고 publishedAt으로 정렬)

---

### 2. newsArticles 컬렉션 - 카테고리 필터링

**컬렉션 ID**: `newsArticles`

**필드**:
- `featureId` (오름차순)
- `refinedCategory` (오름차순)
- `publishedAt` (내림차순)

**쿼리 범위**: 컬렉션

**용도**: 카테고리별 뉴스 조회

---

### 3. newsArticles 컬렉션 - 소스 필터링

**컬렉션 ID**: `newsArticles`

**필드**:
- `featureId` (오름차순)
- `source` (오름차순)
- `publishedAt` (내림차순)

**쿼리 범위**: 컬렉션

**용도**: 소스별 뉴스 조회

---

### 4. newsArticles 컬렉션 - 중요도 정렬

**컬렉션 ID**: `newsArticles`

**필드**:
- `featureId` (오름차순)
- `importanceScore` (내림차순)

**쿼리 범위**: 컬렉션

**용도**: 중요도 순 정렬

---

### 5. newsArticles 컬렉션 - 카테고리 + 중요도

**컬렉션 ID**: `newsArticles`

**필드**:
- `featureId` (오름차순)
- `refinedCategory` (오름차순)
- `importanceScore` (내림차순)

**쿼리 범위**: 컬렉션

**용도**: 카테고리별 중요도 순 정렬

---

### 6. scrapingJobs 컬렉션

**컬렉션 ID**: `scrapingJobs`

**필드**:
- `featureId` (오름차순)
- `startedAt` (내림차순)

**쿼리 범위**: 컬렉션

**용도**: 스크래핑 작업 목록 조회

---

## 🚀 빠른 해결 방법

오류가 발생하면:

1. **오류 메시지의 링크 클릭** (가장 빠름)
2. Firebase 콘솔에서 인덱스 생성 대기 (1-2분)
3. 페이지 새로고침
4. 다시 시도

---

## 📝 인덱스 생성 확인

인덱스가 생성되었는지 확인하려면:

1. Firebase 콘솔 → Firestore Database → 인덱스 탭
2. 생성된 인덱스 목록 확인
3. 상태가 "Enabled"인지 확인

---

## ⚠️ 참고사항

- 인덱스 생성에는 시간이 걸릴 수 있습니다 (보통 1-2분)
- 인덱스를 많이 만들수면 쓰기 비용이 약간 증가할 수 있습니다
- 하지만 읽기 성능이 크게 향상됩니다

---

## 🔧 인덱스가 없어도 동작하도록 코드 수정

만약 인덱스를 만들기 전에 테스트하고 싶다면, 쿼리 로직을 수정할 수 있습니다:

**옵션 1**: 클라이언트 측에서 정렬
- Firebase에서 정렬 없이 데이터 가져오기
- JavaScript에서 정렬 처리

**옵션 2**: 인덱스가 필요한 쿼리 제거
- 기본 정렬만 사용 (featureId만 필터링)
- 클라이언트에서 추가 필터링/정렬

하지만 **권장 방법은 인덱스를 생성하는 것**입니다. 성능상 이점이 큽니다.

