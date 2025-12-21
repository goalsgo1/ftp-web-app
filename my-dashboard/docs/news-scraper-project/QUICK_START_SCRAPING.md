# 자동 스크래핑 빠른 시작 가이드

## ✅ 현재 상태

- ✅ 스크래핑 API Route 구현 완료 (`/api/news-scraper/scrape`)
- ✅ 스크래핑 유틸리티 함수 구현 완료
- ✅ 페이지에 "지금 수집하기" 버튼 추가 완료
- ✅ 패키지 설치 필요: `rss-parser`

---

## 🚀 빠른 시작 (3단계)

### 1단계: 패키지 설치

```bash
npm install rss-parser
npm install --save-dev @types/rss-parser
```

### 2단계: 수동 실행 테스트

1. 개발 서버 실행
   ```bash
   npm run dev
   ```

2. 브라우저에서 뉴스 스크래퍼 페이지 접속
   - http://localhost:3000/features/news-scraper

3. "지금 수집하기" 버튼 클릭

4. 결과 확인
   - 콘솔에서 성공 메시지 확인
   - 뉴스 목록에 새로운 기사 표시 확인

### 3단계: 자동 스케줄링 설정 (선택사항)

자동으로 30분마다 실행하려면 다음 중 하나를 선택:

#### 방법 A: cron-job.org 사용 (권장)

1. https://cron-job.org 접속 및 가입
2. 새 작업 생성
3. URL: `https://your-domain.com/api/news-scraper/scrape`
4. Method: POST
5. Body (JSON):
   ```json
   {
     "featureId": "your-feature-id",
     "userId": "your-user-id",
     "sources": ["naver", "daum"],
     "categories": ["IT", "경제", "정치", "사회"]
   }
   ```
6. Schedule: `*/30 * * * *` (30분마다)

자세한 내용: `SCHEDULING_GUIDE.md` 참고

---

## 🔍 테스트 방법

### 1. API 직접 테스트

```bash
curl -X POST http://localhost:3000/api/news-scraper/scrape \
  -H "Content-Type: application/json" \
  -d '{
    "featureId": "your-feature-id",
    "userId": "your-user-id",
    "sources": ["naver"],
    "categories": ["IT"]
  }'
```

### 2. 브라우저 콘솔에서 테스트

```javascript
fetch('/api/news-scraper/scrape', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    featureId: 'your-feature-id',
    userId: 'your-user-id',
    sources: ['naver'],
    categories: ['IT']
  })
})
.then(r => r.json())
.then(console.log);
```

---

## 📋 확인 사항

스크래핑이 정상 작동하는지 확인:

1. ✅ **Firestore 확인**
   - `newsArticles` 컬렉션에 새 기사 추가 확인
   - `scrapingJobs` 컬렉션에 작업 기록 확인

2. ✅ **UI 확인**
   - 뉴스 목록에 새 기사 표시 확인
   - 통계 카드 업데이트 확인

3. ✅ **에러 확인**
   - 콘솔에서 에러 메시지 확인
   - 네트워크 탭에서 API 응답 확인

---

## ⚠️ 문제 해결

### 패키지 설치 에러

```bash
# 캐시 클리어 후 재설치
npm cache clean --force
npm install rss-parser
```

### 스크래핑이 실행되지 않는 경우

1. **로그 확인**
   - 브라우저 콘솔 확인
   - 서버 로그 확인

2. **API Route 확인**
   - `/api/news-scraper/scrape` 엔드포인트 접근 가능한지 확인

3. **Firebase 설정 확인**
   - 환경 변수 정상 설정 확인
   - Firestore 인덱스 생성 확인

---

## 🎯 다음 단계

스크래핑이 정상 작동하면:

1. ✅ 자동 스케줄링 설정
2. ✅ AI 분석 기능 추가 (Phase 4)
3. ✅ 관리자 페이지 개선

