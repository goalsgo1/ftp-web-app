# 캘린더 이벤트 Firestore 인덱스 설정 가이드

> **작성일**: 2025-01-XX  
> **프로젝트**: PushHub (푸시 알림 대시보드)

---

## 🔍 문제 상황

공유된 캘린더 기능을 사용할 때 다음과 같은 Firebase 에러가 발생할 수 있습니다:

```
The query requires an index. You can create it here: [링크]
```

이는 공개 기능(`isPublic = true`)인 경우 `userId` 필터 없이 `featureId`와 `date`로만 쿼리하기 때문에 Firestore 복합 인덱스가 필요하기 때문입니다.

---

## ✅ 해결 방법

### 방법 1: 에러 메시지의 링크 사용 (가장 빠름)

1. **브라우저 콘솔에서 에러 메시지 확인**
   - 개발자 도구(F12) → Console 탭
   - 에러 메시지에 표시된 URL 클릭

2. **Firebase Console에서 인덱스 생성**
   - 링크를 클릭하면 Firebase Console의 인덱스 생성 페이지로 이동
   - "인덱스 만들기" 버튼 클릭
   - 인덱스 생성 완료까지 1-2분 대기

3. **인덱스 생성 확인**
   - Firebase Console → Firestore Database → Indexes 탭
   - 생성된 인덱스의 상태가 "Enabled"인지 확인

---

### 방법 2: Firebase Console에서 수동 생성

1. **Firebase Console 접속**
   - [Firebase Console](https://console.firebase.google.com/) 접속
   - 프로젝트 선택

2. **Firestore Database로 이동**
   - 좌측 메뉴 → **"Firestore Database"** 클릭
   - 상단 탭에서 **"Indexes"** 선택

3. **복합 인덱스 만들기**
   - **"복합 인덱스 만들기"** 버튼 클릭
   - 다음 설정 입력:
     - **컬렉션 ID**: `calendarEvents`
     - **필드 추가**:
       - `featureId` (오름차순, Ascending)
       - `date` (내림차순, Descending)
     - **쿼리 범위**: 컬렉션 (기본값)
   - **"인덱스 만들기"** 버튼 클릭

4. **인덱스 생성 완료 대기**
   - 인덱스 생성에는 1-2분 소요됩니다
   - 상태가 "Enabled"가 될 때까지 대기

---

## 📋 필요한 인덱스 목록

### 1. 공개 캘린더 이벤트 조회용 인덱스

**컬렉션**: `calendarEvents`  
**필드**:
- `featureId` (Ascending)
- `date` (Descending)

**용도**: 공개 기능(`isPublic = true`)인 경우 모든 사용자의 이벤트를 날짜순으로 조회

---

## 🔧 인덱스 생성 후 확인

인덱스 생성이 완료되면:

1. **애플리케이션 새로고침**
   - 브라우저에서 페이지 새로고침 (F5)
   - 또는 개발 서버 재시작

2. **에러 확인**
   - 개발자 도구 콘솔에서 에러가 사라졌는지 확인
   - 공유된 캘린더에 정상적으로 접근되는지 확인

3. **기능 테스트**
   - `test@gmail.com`으로 로그인하여 캘린더를 공개 상태로 설정
   - 일정 작성
   - `test1@gmail.com`으로 로그인하여 공유된 캘린더 접근
   - 작성한 일정이 보이는지 확인

---

## ⚠️ 주의사항

1. **인덱스 생성 시간**
   - 인덱스 생성에는 1-2분이 소요됩니다
   - 생성 중에는 해당 쿼리가 실패할 수 있습니다

2. **인덱스 비용**
   - Firestore 인덱스는 무료 플랜에서도 사용 가능합니다
   - 저장 공간만 약간 사용합니다 (보통 매우 작음)

3. **기존 인덱스 확인**
   - 이미 인덱스가 생성되어 있는지 확인하려면
   - Firebase Console → Firestore Database → Indexes 탭에서 확인

---

## 🐛 문제 해결

### 인덱스 생성 후에도 에러가 발생하는 경우

1. **인덱스 상태 확인**
   - Firebase Console에서 인덱스 상태가 "Enabled"인지 확인
   - "Building" 상태라면 완료될 때까지 대기

2. **브라우저 캐시 삭제**
   - 브라우저 캐시 삭제 후 다시 시도
   - 또는 시크릿 모드에서 테스트

3. **쿼리 확인**
   - 개발자 도구 콘솔에서 실제 쿼리 확인
   - `featureId`와 `date` 필드가 올바르게 사용되는지 확인

---

## 📚 관련 문서

- [Firebase Firestore 인덱스 가이드](https://firebase.google.com/docs/firestore/query-data/indexing)
- [Firebase 프로젝트 재생성 가이드](../FIREBASE_PROJECT_RECREATION_GUIDE.md)
- [Firestore 구독 스키마](../../FIRESTORE_SUBSCRIPTIONS_SCHEMA.md)

---

**✅ 인덱스 생성 완료!**

인덱스가 생성되면 공유된 캘린더 기능이 정상적으로 작동합니다.

