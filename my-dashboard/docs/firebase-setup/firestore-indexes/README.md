# Firestore 인덱스 설정

Firestore 복합 인덱스 설정 가이드입니다.

## 📚 문서 목록

### [캘린더 이벤트 인덱스 설정](./CALENDAR_EVENTS_INDEX.md)

공유된 캘린더 기능을 사용하기 위한 Firestore 인덱스 설정 가이드입니다.

**주요 내용:**
- 공개 캘린더 이벤트 조회용 인덱스 생성 방법
- 에러 해결 방법
- 인덱스 생성 후 확인 방법

### [뉴스 스크래퍼 인덱스 설정](../../news-scraper-project/FIRESTORE_INDEXES.md)

뉴스 스크래퍼 기능을 사용하기 위한 Firestore 인덱스 설정 가이드입니다.

**주요 내용:**
- 뉴스 아티클 조회용 인덱스 생성 방법
- 여러 필터링 옵션별 인덱스 목록
- 에러 해결 방법

---

## 🎯 빠른 요약

### 인덱스가 필요한 경우

Firestore에서 복합 쿼리(여러 필드로 필터링 + 정렬)를 사용할 때 인덱스가 필요합니다.

**에러 메시지 예시:**
```
The query requires an index. You can create it here: [링크]
```

### 해결 방법

1. **에러 메시지의 링크 클릭** (가장 빠름)
2. Firebase Console에서 수동 생성
3. 인덱스 생성 완료 대기 (1-2분)
4. 애플리케이션 새로고침

---

## 📋 현재 프로젝트에서 필요한 인덱스

| 컬렉션 | 필드 | 용도 |
|--------|------|------|
| `calendarEvents` | `featureId` (Asc), `date` (Desc) | 공개 캘린더 이벤트 조회 |
| `newsArticles` | `featureId` (Asc), `publishedAt` (Desc) | 뉴스 목록 조회 |
| `newsArticles` | `featureId` (Asc), `refinedCategory` (Asc), `publishedAt` (Desc) | 카테고리별 뉴스 조회 |
| `scrapingJobs` | `featureId` (Asc), `startedAt` (Desc) | 스크래핑 작업 목록 조회 |

---

## 🔗 관련 문서

- [Firebase 프로젝트 재생성 가이드](../FIREBASE_PROJECT_RECREATION_GUIDE.md)
- [Firestore 구독 스키마](../../FIRESTORE_SUBSCRIPTIONS_SCHEMA.md)

