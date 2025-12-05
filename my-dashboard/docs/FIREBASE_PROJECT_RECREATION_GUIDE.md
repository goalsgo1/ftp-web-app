# Firebase 프로젝트 재생성 가이드

> **작성일**: 2025-01-XX  
> **프로젝트**: PushHub (푸시 알림 대시보드)  
> **목적**: 기존 Firebase 프로젝트를 제거한 후 새로 생성하는 단계별 가이드

---

## 📑 목차

1. [사전 준비사항](#-사전-준비사항)
2. [단계별 재생성 가이드](#-단계별-재생성-가이드)
   - [Step 1: Firebase Console 접속 및 프로젝트 생성](#step-1-firebase-console-접속-및-프로젝트-생성)
   - [Step 2: 무료 플랜 확인 및 설정](#step-2-무료-플랜-확인-및-설정)
   - [Step 3: 웹 앱 등록](#step-3-웹-앱-등록)
   - [Step 4: Authentication (인증) 활성화](#step-4-authentication-인증-활성화)
   - [Step 5: Firestore Database 생성](#step-5-firestore-database-생성)
   - [Step 6: Cloud Messaging (FCM) 활성화](#step-6-cloud-messaging-fcm-활성화-푸시-알림용)
   - [Step 7: 환경 변수 설정](#step-7-환경-변수-설정)
   - [Step 8: 개발 서버 재시작](#step-8-개발-서버-재시작)
   - [Step 9: 테스트 및 확인](#step-9-테스트-및-확인)
3. [완료 체크리스트](#-완료-체크리스트)
4. [문제 해결](#-문제-해결)
5. [비용 모니터링 팁](#-비용-모니터링-팁)
6. [다음 단계](#-다음-단계)
7. [관련 문서](#-관련-문서)
8. [참고 사항](#-참고-사항)

---

## 📋 사전 준비사항

### 확인 사항
- ✅ Firebase Console 접속 가능한 Google 계정
- ✅ 프로젝트 코드는 이미 Firebase SDK 통합 완료
- ✅ `.env.local` 파일이 없거나 기존 값 제거 준비

---

## 🚀 단계별 재생성 가이드

### Step 1: Firebase Console 접속 및 프로젝트 생성

1. **Firebase Console 접속**
   - [Firebase Console](https://console.firebase.google.com/) 접속
   - Google 계정으로 로그인

2. **새 프로젝트 생성**
   - 우측 상단 또는 중앙의 **"프로젝트 추가"** 버튼 클릭
   - 프로젝트 이름 입력: **PushHub** (또는 원하는 이름)
   - 프로젝트 ID는 자동 생성되거나 수동 변경 가능

3. **Google Analytics 설정 (선택사항)**
   - Google Analytics 사용 여부 선택
   - 사용하지 않아도 Firebase 기능은 정상 작동
   - **권장**: 초기에는 비활성화, 나중에 필요 시 추가 가능

4. **프로젝트 생성 완료**
   - "계속" 버튼 클릭
   - 프로젝트 생성 완료까지 1-2분 소요

---

### Step 2: 무료 플랜 확인 및 설정

1. **플랜 확인**
   - Firebase는 기본적으로 **Spark Plan (무료)** 으로 시작
   - 프로젝트 대시보드에서 플랜 확인 가능
   - 좌측 메뉴 → **"사용량 및 청구"** 클릭

2. **무료 한도 확인**
   - **Authentication**: 무제한 무료 ✅
   - **Firestore**: 
     - 저장: 1GB 무료
     - 읽기: 50,000회/일 무료
     - 쓰기: 20,000회/일 무료
   - **Cloud Messaging (FCM)**: 무제한 무료 ✅

3. **예산 알림 설정 (중요!)**
   - "사용량 및 청구" → **"예산 및 알림"** 탭
   - **"예산 추가"** 클릭
   - 예산 금액 설정: **$0** (무료 한도 모니터링용)
   - 알림 이메일 설정
   - **목적**: 무료 한도 초과 전 경고 받기

---

### Step 3: 웹 앱 등록

1. **웹 앱 추가**
   - 프로젝트 대시보드에서 **웹 아이콘** (`</>`) 클릭
   - 또는 좌측 메뉴 → **"프로젝트 설정"** → "내 앱" 섹션에서 웹 앱 추가

2. **앱 정보 입력**
   - 앱 닉네임: **PushHub Web** (또는 원하는 이름)
   - Firebase Hosting 설정: **체크하지 않음** (나중에 필요하면 추가)
   - "앱 등록" 버튼 클릭

3. **Firebase SDK 설정 코드 복사**
   - 다음 화면에서 Firebase SDK 설정 코드가 표시됨
   - **중요**: 이 코드는 나중에 사용하지 않음 (환경 변수로 설정)
   - 대신 **"구성"** 탭의 값들을 복사할 예정

---

### Step 4: Authentication (인증) 활성화

1. **Authentication 메뉴 접속**
   - 좌측 메뉴 → **"Authentication"** 클릭
   - "시작하기" 버튼 클릭 (처음 사용 시)

2. **Sign-in method 활성화**
   - **"Sign-in method"** 탭 클릭
   - **"이메일/비밀번호"** 클릭
   - **"사용 설정"** 토글 활성화
   - **"저장"** 버튼 클릭

3. **추가 인증 방법 (선택사항)**
   - Google 로그인: 필요 시 활성화
   - Apple 로그인: 필요 시 활성화
   - 현재는 이메일/비밀번호만 활성화해도 충분

---

### Step 5: Firestore Database 생성

1. **Firestore Database 메뉴 접속**
   - 좌측 메뉴 → **"Firestore Database"** 클릭
   - "데이터베이스 만들기" 버튼 클릭

2. **데이터베이스 생성 설정**
   - **보안 규칙**: **"테스트 모드에서 시작"** 선택
     - ⚠️ **주의**: 나중에 프로덕션 배포 시 보안 규칙 수정 필수
   - **위치 선택**: **"asia-northeast3 (Seoul)"** 권장
     - 한국에서 가장 가까운 리전
     - 지연 시간 최소화

3. **생성 완료**
   - "사용 설정" 버튼 클릭
   - 데이터베이스 생성 완료까지 1-2분 소요

---

### Step 6: Cloud Messaging (FCM) 활성화 (푸시 알림용)

1. **Cloud Messaging 메뉴 접속**
   - 좌측 메뉴 → **"Cloud Messaging"** 클릭
   - 또는 프로젝트 설정 → "Cloud Messaging" 탭

2. **서버 키 확인 (나중에 필요)**
   - "Cloud Messaging API (V1)" 활성화 확인
   - 서버 키는 나중에 푸시 알림 구현 시 필요

3. **웹 푸시 인증서 생성 (선택사항)**
   - 웹 푸시 알림을 위한 VAPID 키 생성
   - 나중에 푸시 알림 구현 시 필요

---

### Step 7: 환경 변수 설정

1. **Firebase 설정 값 복사**
   - 좌측 상단 **⚙️ 프로젝트 설정** 클릭
   - "일반" 탭 → "내 앱" 섹션에서 **웹 앱** 선택
   - **⚙️ 설정** 아이콘 클릭
   - "Firebase SDK 구성" → **"구성"** 탭 선택
   - Firebase Console에서 표시되는 설정 코드 예시:
     ```javascript
     const firebaseConfig = {
       apiKey: "AIzaSyATSGbSAPk7jXC1a6jM7iRPlKHRsnUCRhU",
       authDomain: "pushhub-ade16.firebaseapp.com",
       projectId: "pushhub-ade16",
       storageBucket: "pushhub-ade16.firebasestorage.app",
       messagingSenderId: "680663464614",
       appId: "1:680663464614:web:806b5297e35e06a20fd267"
     };
     ```

2. **`.env.local` 파일 생성**
   - `my-dashboard/` 폴더로 이동
   - `.env.local` 파일 생성 (없는 경우)
   - 다음 내용 입력 (위에서 복사한 값들을 사용):

   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyATSGbSAPk7jXC1a6jM7iRPlKHRsnUCRhU
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=pushhub-ade16.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=pushhub-ade16
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=pushhub-ade16.firebasestorage.app
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=680663464614
   NEXT_PUBLIC_FIREBASE_APP_ID=1:680663464614:web:806b5297e35e06a20fd267
   ```

   **⚠️ 중요 사항:**
   - 위 값들은 **실제 프로젝트 예시**입니다. 본인의 Firebase 프로젝트 값으로 교체하세요.
   - 따옴표(`"`) 없이 값만 입력
   - `.env.local` 파일은 Git에 커밋되지 않음 (`.gitignore`에 포함)

   **⚠️ 중요 사항:**
   - 따옴표(`"`) 없이 값만 입력
   - 실제 Firebase Console에서 복사한 값으로 교체
   - `.env.local` 파일은 Git에 커밋되지 않음 (`.gitignore`에 포함)

3. **기존 `.env.local` 파일이 있는 경우**
   - 기존 값들을 새로 복사한 값으로 교체
   - 또는 파일을 백업 후 새로 생성

---

### Step 8: 개발 서버 재시작

1. **서버 중지**
   - 현재 실행 중인 개발 서버가 있다면 중지 (Ctrl+C)

2. **서버 재시작**
   ```bash
   cd my-dashboard
   npm run dev
   ```

3. **환경 변수 로드 확인**
   - 서버가 정상적으로 시작되는지 확인
   - 브라우저 콘솔에서 Firebase 초기화 에러가 없는지 확인

---

### Step 9: 테스트 및 확인

1. **Firebase 연결 테스트**
   - 브라우저 개발자 도구 (F12) → Console 탭
   - 에러 메시지가 없는지 확인
   - `Firebase: Error` 메시지가 있으면 환경 변수 확인

2. **로그인 기능 테스트**
   - `/login` 페이지 접속
   - Firebase Console → Authentication → "사용자" 탭에서 테스트 계정 생성
   - 또는 회원가입 페이지에서 새 계정 생성
   - 로그인 시도하여 정상 작동 확인

3. **Firestore 연결 테스트**
   - 대시보드에서 기능 추가 시도
   - Firebase Console → Firestore Database → Data 탭에서 데이터 확인
   - 데이터가 정상적으로 저장되는지 확인

4. **인덱스 에러 확인 (필요 시)**
   - 구독 목록이나 기능 목록을 불러올 때 인덱스 에러가 발생할 수 있음
   - 브라우저 콘솔에서 `The query requires an index` 에러 확인
   - 에러 메시지의 링크를 클릭하여 인덱스 자동 생성
   - 또는 "문제 해결" 섹션의 "Firestore 인덱스 에러" 참고

---

## ✅ 완료 체크리스트

### Firebase Console 설정
- [ ] 새 프로젝트 생성 완료
- [ ] 무료 플랜 (Spark Plan) 확인
- [ ] 예산 알림 설정 완료
- [ ] 웹 앱 등록 완료
- [ ] Authentication 활성화 (이메일/비밀번호)
- [ ] Firestore Database 생성 완료
- [ ] Cloud Messaging 활성화 확인

### 로컬 환경 설정
- [ ] Firebase 설정 값 복사 완료
- [ ] `.env.local` 파일 생성 및 값 입력 완료
- [ ] 개발 서버 재시작 완료

### 테스트
- [ ] 브라우저 콘솔에 에러 없음 확인
- [ ] 로그인 기능 정상 작동 확인
- [ ] Firestore 데이터 저장 정상 작동 확인

---

## 🔍 문제 해결

### 환경 변수가 적용되지 않는 경우

1. **서버 재시작 확인**
   - 환경 변수 변경 후 반드시 서버 재시작 필요
   - `.env.local` 파일 수정 후 서버 재시작

2. **파일 위치 확인**
   - `.env.local` 파일이 `my-dashboard/` 루트에 있는지 확인
   - 파일명이 정확한지 확인 (`.env.local`)

3. **변수명 확인**
   - `NEXT_PUBLIC_` 접두사가 있는지 확인 (클라이언트에서 사용하려면 필수)
   - 대소문자 정확히 입력

4. **값 형식 확인**
   - 따옴표(`"`) 없이 값만 입력
   - 공백 없이 입력
   - Firebase Console에서 정확히 복사했는지 확인

### Firebase 초기화 에러

1. **`Firebase: Error (auth/invalid-api-key)`**
   - API 키가 잘못되었거나 누락됨
   - `.env.local` 파일의 `NEXT_PUBLIC_FIREBASE_API_KEY` 값 확인

2. **`Firebase: Error (auth/network-request-failed)`**
   - 네트워크 연결 확인
   - 방화벽 설정 확인

3. **`Firebase: Error (firestore/permission-denied)`**
   - Firestore 보안 규칙 확인
   - 테스트 모드로 설정되어 있는지 확인

### Firestore 인덱스 에러

**에러 메시지**: `The query requires an index`

이 에러는 Firestore에서 복합 쿼리(여러 필드를 사용하는 쿼리)를 실행할 때 발생합니다.

#### 해결 방법 1: 에러 메시지의 링크 클릭 (가장 빠름)

1. **브라우저 콘솔에서 에러 확인**
   - 개발자 도구 (F12) → Console 탭
   - 에러 메시지에 Firebase Console 링크가 포함되어 있음
   - 예시: `https://console.firebase.google.com/v1/r/project/pushhub-ade16/firestore/indexes?create_composite=...`

2. **링크 클릭하여 인덱스 생성**
   - 에러 메시지의 링크를 클릭
   - Firebase Console의 인덱스 생성 페이지로 이동
   - "인덱스 만들기" 버튼 클릭
   - 인덱스 생성 완료까지 1-2분 소요

#### 해결 방법 2: Firebase Console에서 수동 생성

1. **Firebase Console 접속**
   - [Firebase Console](https://console.firebase.google.com/) 접속
   - 프로젝트 선택

2. **Firestore 인덱스 메뉴 이동**
   - 좌측 메뉴 → **"Firestore Database"** 클릭
   - 상단 탭에서 **"Indexes"** 클릭

3. **복합 인덱스 생성**
   - **"복합 인덱스 만들기"** 버튼 클릭
   - 컬렉션 ID: `subscriptions`
   - 필드 추가:
     - 필드: `userId`, 정렬: 오름차순 (Ascending)
     - 필드: `subscribedAt`, 정렬: 내림차순 (Descending)
   - "만들기" 버튼 클릭

4. **인덱스 생성 완료 대기**
   - 인덱스 생성에는 1-2분 소요
   - 상태가 "Enabled"가 되면 사용 가능

#### 일반적인 인덱스 패턴

프로젝트에서 자주 사용되는 인덱스:

1. **subscriptions 컬렉션**
   - `userId` (오름차순) + `subscribedAt` (내림차순)

2. **features 컬렉션** (필요 시)
   - `creatorId` (오름차순) + `createdAt` (내림차순)

#### notificationLogs 컬렉션 인덱스

알림 수정 로그 기능을 사용하려면 다음 인덱스가 필요합니다:

1. **Firebase Console → Firestore Database → Indexes** 이동
2. **"복합 인덱스 만들기"** 클릭
3. 다음 설정 입력:
   - **컬렉션 ID**: `notificationLogs`
   - **필드 추가**:
     - `featureId` (오름차순, Ascending)
     - `createdAt` (내림차순, Descending)
4. **인덱스 만들기** 클릭
5. 인덱스 생성 완료까지 1-2분 대기

또는 에러 메시지에 표시된 링크를 클릭하면 자동으로 인덱스 생성 페이지로 이동합니다.

#### 인덱스 생성 확인

- Firebase Console → Firestore Database → Indexes 탭
- 생성된 인덱스 목록에서 상태 확인
- "Enabled" 상태면 정상 작동

### Firestore 보안 규칙 확인

현재는 테스트 모드로 시작했지만, 나중에 프로덕션 배포 시 보안 규칙을 수정해야 합니다:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 사용자 인증 확인
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // 기능 데이터 (예시)
    match /features/{featureId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

---

## 💰 비용 모니터링 팁

### 무료 한도 모니터링

1. **일일 사용량 확인**
   - Firebase Console → "사용량 및 청구" → "사용량" 탭
   - 일일 사용량 추이 확인

2. **알림 설정**
   - 예산 알림 설정으로 무료 한도 초과 전 경고 받기
   - 이메일 알림 활성화

3. **비용 절감 방법**
   - 불필요한 읽기/쓰기 최소화
   - 쿼리 최적화 (인덱스 활용)
   - 클라이언트 사이드 캐싱 활용

### 예상 비용

- **소규모 프로젝트 (사용자 100명 이하)**: 무료 ✅
- **중규모 프로젝트 (사용자 1,000명 이하)**: 대부분 무료 한도 내 ✅
- **대규모 프로젝트**: 사용량에 따라 유료 플랜 필요

---

## 📚 다음 단계

Firebase 프로젝트 재생성이 완료되면:

1. **푸시 알림 구현**
   - FCM (Firebase Cloud Messaging) 설정
   - 서비스 워커 등록
   - 푸시 알림 코드 구현

2. **보안 규칙 설정**
   - Firestore 보안 규칙 수정
   - 프로덕션 환경에 맞게 규칙 적용

3. **모니터링 설정**
   - 사용량 모니터링 습관화
   - 에러 로그 확인

---

## 🔗 관련 문서

- [Firebase 설정 가이드](./FIREBASE_SETUP_GUIDE.md)
- [Firebase 환경 변수 설정](./FIREBASE_ENV_SETUP.md)
- [Firebase vs 자체 서버 비교](./FIREBASE_VS_SELF_HOSTED_COMPARISON.md)
- [Firebase Authentication 설정](./FIREBASE_AUTH_SETUP.md)

---

## 💡 참고 사항

### 무료 플랜 한도 상세

| 서비스 | 무료 한도 |
|--------|----------|
| Authentication | 무제한 |
| Firestore 저장 | 1GB |
| Firestore 읽기 | 50,000회/일 |
| Firestore 쓰기 | 20,000회/일 |
| Firestore 삭제 | 20,000회/일 |
| Cloud Messaging (FCM) | 무제한 |
| Hosting 저장 | 10GB |
| Hosting 전송 | 360MB/일 |

### 유료 플랜 전환 시점

다음 상황에서는 유료 플랜(Blaze Plan)으로 전환해야 합니다:
- Firestore 읽기: 50,000회/일 초과
- Firestore 쓰기: 20,000회/일 초과
- Firestore 저장: 1GB 초과

**주의**: Blaze Plan은 종량제이므로 사용한 만큼만 과금됩니다. 무료 한도는 그대로 제공되며, 초과분만 과금됩니다.

---

**✅ Firebase 프로젝트 재생성 완료!**

이제 프로젝트를 정상적으로 사용할 수 있습니다. 문제가 발생하면 위의 "문제 해결" 섹션을 참고하세요.

