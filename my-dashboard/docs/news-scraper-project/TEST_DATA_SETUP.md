# 뉴스 스크래퍼 테스트 데이터 추가 가이드

## 📋 개요

뉴스 스크래퍼 기능과 테스트 데이터를 추가하는 방법을 설명합니다.

## 🚀 방법 1: 브라우저 콘솔에서 실행 (권장)

### 1단계: 개발 서버 실행

```powershell
npm.cmd run dev
```

### 2단계: 브라우저에서 로그인

1. http://localhost:3000 접속
2. 로그인 또는 회원가입

### 3단계: 개발자 도구 열기

- `F12` 키 또는 `Ctrl + Shift + I` (Windows)
- `Cmd + Option + I` (Mac)

### 4단계: 콘솔에서 스크립트 실행

```javascript
// 전체 설정 (기능 추가 + 테스트 데이터)
const { setupNewsScraperFeature } = await import('/scripts/add-news-scraper-test-data.ts');
await setupNewsScraperFeature();
```

또는 단계별로 실행:

```javascript
// 1. 기능만 추가
const { addNewsScraperFeature } = await import('/scripts/add-news-scraper-test-data.ts');
const featureId = await addNewsScraperFeature();

// 2. 테스트 데이터 추가 (기능 ID 필요)
const { addNewsScraperTestData } = await import('/scripts/add-news-scraper-test-data.ts');
await addNewsScraperTestData(featureId);
```

### 5단계: 결과 확인

콘솔에 성공 메시지가 표시되면:

```
=== 뉴스 스크래퍼 설정 완료 ===

다음 URL에서 확인하세요:
http://localhost:3000/features/news-scraper?featureId=xxxxx
```

브라우저에서 해당 URL로 이동하여 확인하세요.

---

## 📦 추가되는 테스트 데이터

다음 5개의 샘플 뉴스가 추가됩니다:

1. **AI 기술 발전으로 산업 전반에 변화 예상** (IT, 긍정, 중요도 8.5)
2. **코로나19 이후 경제 회복세 지속** (경제, 긍정, 중요도 7.8)
3. **정치 개혁 논의 본격화** (정치, 중립, 중요도 6.5)
4. **사회적 기업 확산으로 일자리 창출 기대** (사회, 긍정, 중요도 7.0)
5. **반도체 산업 경쟁 심화** (IT, 중립, 중요도 8.0)

각 뉴스는 다음 정보를 포함합니다:
- 제목, URL, 본문
- 출처 (네이버, 다음, RSS)
- AI 분석 결과 (요약, 키워드, 감정, 중요도 점수)
- 엔티티 정보 (인물, 기관, 지역)
- 원라인 요약

---

## 🔍 확인 방법

### 기능 목록에서 확인

1. 메인 페이지에서 "웹 기능 목록" 클릭
2. "뉴스 스크래퍼" 기능이 목록에 표시되는지 확인

### 뉴스 목록에서 확인

1. 뉴스 스크래퍼 페이지 접속
2. 5개의 테스트 뉴스가 표시되는지 확인
3. 카테고리별 필터링 작동 확인
4. 검색 기능 작동 확인
5. 중요도 순 정렬 작동 확인

---

## 🛠️ 문제 해결

### 로그인이 안 되는 경우

```
Error: 로그인이 필요합니다.
```

**해결 방법:**
1. 브라우저에서 로그인 상태인지 확인
2. Firebase 인증이 정상 작동하는지 확인

### 기능이 이미 등록되어 있는 경우

```
뉴스 스크래퍼 기능이 이미 등록되어 있습니다.
```

**해결 방법:**
- 이 메시지는 정상입니다. 기존 기능 ID를 사용하여 테스트 데이터만 추가할 수 있습니다.

### 테스트 데이터만 추가하고 싶은 경우

```javascript
// featureId를 알고 있는 경우
const { addNewsScraperTestData } = await import('/scripts/add-news-scraper-test-data.ts');
await addNewsScraperTestData('your-feature-id-here');
```

---

## 📝 다음 단계

테스트 데이터 추가 후:

1. ✅ UI에서 데이터 확인
2. ✅ 필터링 및 검색 기능 테스트
3. ✅ 상세 보기 모달 테스트
4. 🔄 실제 스크래핑 기능 구현 (Phase 3)

---

## 💡 참고사항

- 테스트 데이터는 중복 체크(`contentHash`)를 하지 않으므로 여러 번 실행하면 중복 데이터가 생성될 수 있습니다.
- 실제 사용 시에는 스크래핑 기능에서 중복 체크를 구현해야 합니다.
- 테스트 데이터를 삭제하려면 Firebase 콘솔에서 `newsArticles` 컬렉션을 확인하세요.

