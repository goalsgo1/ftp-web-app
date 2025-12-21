# 자동 스크래핑 스케줄링 가이드

## 📋 개요

뉴스를 30분마다 자동으로 수집하도록 설정하는 방법을 설명합니다.

## 🎯 옵션 비교

| 방법 | 무료 여부 | 설정 난이도 | 권장 상황 |
|------|----------|------------|----------|
| **Vercel Cron Jobs** | ✅ (Pro 플랜 필요) | ⭐⭐ | Vercel 배포 시 |
| **GitHub Actions** | ✅ | ⭐⭐⭐ | 개발/테스트용 |
| **cron-job.org** | ✅ | ⭐ | 가장 간단 |
| **Firebase Cloud Functions** | ✅ (무료 티어) | ⭐⭐⭐⭐ | 프로덕션 권장 |

---

## 🚀 방법 1: cron-job.org (가장 간단, 권장)

### 장점
- ✅ 무료
- ✅ 설정 매우 간단
- ✅ 즉시 사용 가능
- ✅ 로그 확인 가능

### 설정 방법

1. **사이트 가입**
   - https://cron-job.org 접속
   - 무료 계정 생성

2. **새 작업 생성**
   - "Create cronjob" 버튼 클릭

3. **설정 입력**
   - **Title**: "뉴스 스크래퍼 자동 수집"
   - **Address (URL)**: `https://your-domain.com/api/news-scraper/scrape`
   - **Method**: POST
   - **Request body (JSON)**: 
     ```json
     {
       "featureId": "your-feature-id",
       "userId": "your-user-id",
       "sources": ["naver", "daum"],
       "categories": ["IT", "경제", "정치", "사회"]
     }
     ```
   - **Schedule**: `*/30 * * * *` (30분마다)

4. **저장 후 활성화**

### 참고
- `featureId`와 `userId`는 실제 값으로 교체해야 합니다.
- 개발 중이라면 localhost를 사용할 수 없으므로, 배포된 URL을 사용해야 합니다.

---

## 🔧 방법 2: GitHub Actions (무료, 개발용)

### 장점
- ✅ 완전 무료
- ✅ GitHub 저장소와 통합
- ✅ 로그 확인 가능

### 설정 방법

1. **워크플로우 파일 생성**

   `.github/workflows/news-scraper.yml` 파일 생성:

   ```yaml
   name: News Scraper Auto Run
   
   on:
     schedule:
       # 30분마다 실행 (UTC 시간 기준)
       - cron: '*/30 * * * *'
     workflow_dispatch:  # 수동 실행도 가능
   
   jobs:
     scrape:
       runs-on: ubuntu-latest
       steps:
         - name: Trigger Scraping
           run: |
             curl -X POST https://your-domain.com/api/news-scraper/scrape \
               -H "Content-Type: application/json" \
               -d '{
                 "featureId": "your-feature-id",
                 "userId": "your-user-id",
                 "sources": ["naver", "daum"],
                 "categories": ["IT", "경제", "정치", "사회"]
               }'
   ```

2. **GitHub에 푸시**

3. **Actions 탭에서 확인**

### 참고
- GitHub Actions는 무료 플랜에서도 사용 가능하지만, 저장소가 private이면 제한이 있을 수 있습니다.
- 최소 실행 간격은 5분입니다.

---

## ☁️ 방법 3: Vercel Cron Jobs (Vercel 배포 시)

### 장점
- ✅ Vercel과 통합
- ✅ 설정 간단
- ✅ 서버리스 자동 확장

### 설정 방법

1. **`vercel.json` 파일 생성/수정**

   프로젝트 루트에 `vercel.json` 파일 생성:

   ```json
   {
     "crons": [
       {
         "path": "/api/news-scraper/scrape",
         "schedule": "*/30 * * * *"
       }
     ]
   }
   ```

2. **API Route 수정**

   `app/api/news-scraper/scrape/route.ts`에서 cron 요청 처리:

   ```typescript
   // GET 요청이 cron에서 올 때
   export async function GET(request: NextRequest) {
     const authHeader = request.headers.get('authorization');
     if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
     }
     
     // 스크래핑 실행 로직
   }
   ```

3. **환경 변수 설정**
   - Vercel 대시보드에서 `CRON_SECRET` 환경 변수 설정

4. **배포**

### 참고
- Vercel Pro 플랜이 필요할 수 있습니다.
- Cron Jobs는 Vercel Pro 플랜에서만 사용 가능합니다.

---

## 🔥 방법 4: Firebase Cloud Functions (프로덕션 권장)

### 장점
- ✅ Firebase와 완전 통합
- ✅ 무료 티어 제공
- ✅ 안정적

### 설정 방법

Firebase Cloud Functions를 사용하려면 별도 설정이 필요합니다. 자세한 내용은 Firebase 문서를 참고하세요.

---

## 💡 추천: cron-job.org 사용

개발 및 테스트 단계에서는 **cron-job.org**를 사용하는 것을 추천합니다:

1. ✅ 가장 간단한 설정
2. ✅ 무료
3. ✅ 즉시 사용 가능
4. ✅ 로그 확인 가능

---

## ⚙️ 스케줄 설정 예시

### 30분마다
```
*/30 * * * *
```

### 1시간마다
```
0 * * * *
```

### 매일 오전 9시
```
0 9 * * *
```

### 매일 오전 9시, 오후 3시, 오후 9시
```
0 9,15,21 * * *
```

---

## 🔍 실행 확인

스케줄러가 정상 작동하는지 확인하는 방법:

1. **Firebase 콘솔에서 확인**
   - Firestore → `scrapingJobs` 컬렉션 확인
   - 최근 작업들이 주기적으로 생성되는지 확인

2. **뉴스 목록 확인**
   - 뉴스 스크래퍼 페이지에서 새로운 뉴스가 추가되는지 확인

3. **스케줄러 로그 확인**
   - 사용한 스케줄러 서비스의 로그 확인
   - 성공/실패 여부 확인

---

## ⚠️ 주의사항

1. **Rate Limiting**
   - 너무 자주 요청하지 않도록 주의
   - 네이버/다음 서버에 부하를 주지 않도록 적절한 간격 유지

2. **비용 관리**
   - API 호출 비용 확인
   - Firestore 쓰기 비용 확인

3. **에러 처리**
   - 스케줄러가 실패해도 다음 실행에 영향을 주지 않도록
   - 에러 알림 설정 (옵션)

---

## 📝 다음 단계

스케줄링 설정 후:

1. ✅ 정상 작동 확인
2. ✅ 로그 모니터링
3. ✅ 필요시 스케줄 조정

