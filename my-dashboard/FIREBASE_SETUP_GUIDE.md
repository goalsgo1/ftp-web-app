# Firebase 설정 가이드

## 📋 Firebase 프로젝트 구조

### 하나의 프로젝트에 여러 앱 등록 가능 ✅

Firebase는 **하나의 프로젝트**에 여러 앱을 등록할 수 있습니다:
- ✅ 웹 앱 (현재)
- ✅ iOS 앱 (나중에 Flutter 개발 시)
- ✅ Android 앱 (나중에 Flutter 개발 시)

**앱 이름**: **PushHub** (브레인스토밍 문서 기준)

---

## 🚀 설정 단계

### Step 1: Firebase 프로젝트 생성

1. [Firebase Console](https://console.firebase.google.com/) 접속
2. "프로젝트 추가" 클릭
3. 프로젝트 이름: **PushHub** (또는 **pushhub**)
4. Google Analytics 설정 (선택사항)
5. 프로젝트 생성 완료

### Step 2: 웹 앱 등록 (현재 단계)

1. Firebase 프로젝트 대시보드에서 **웹 아이콘** (`</>`) 클릭
2. 앱 닉네임: **PushHub Web** (또는 원하는 이름)
3. Firebase Hosting 설정: **체크하지 않음** (나중에 필요하면 추가)
4. "앱 등록" 클릭
5. **Firebase SDK 설정 코드 복사** (나중에 사용)

### Step 3: 인증 설정

1. Firebase Console → **Authentication** 메뉴
2. "시작하기" 클릭
3. **Sign-in method** 탭에서 사용할 인증 방법 활성화:
   - ✅ **이메일/비밀번호** (필수)
   - ✅ **Google** (선택사항)
   - ✅ **Apple** (선택사항)

### Step 4: Firestore 데이터베이스 설정 (나중에 필요 시)

1. Firebase Console → **Firestore Database**
2. "데이터베이스 만들기" 클릭
3. 보안 규칙: **테스트 모드**로 시작 (나중에 수정)
4. 위치 선택: **asia-northeast3 (Seoul)** 권장

---

## 📦 Next.js에 Firebase 설치

### 패키지 설치

```bash
npm install firebase
```

### Firebase 설정 파일 생성

`lib/firebase/config.ts` 파일 생성:

```typescript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);

// 서비스 export
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
```

---

## 🔐 환경 변수 설정

### Step 1: Firebase Console에서 설정 값 복사

1. Firebase Console → 프로젝트 설정 (톱니바퀴 아이콘)
2. "일반" 탭 → "내 앱" 섹션
3. 웹 앱 선택 → **설정** 아이콘 클릭
4. "Firebase SDK 구성" → "구성" 탭에서 다음 값들을 복사:
   - `apiKey`
   - `authDomain`
   - `projectId`
   - `storageBucket`
   - `messagingSenderId`
   - `appId`

### Step 2: `.env.local` 파일 생성

프로젝트 루트(`my-dashboard/`)에 `.env.local` 파일을 생성하고 다음 내용을 입력:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=여기에_apiKey_값_입력
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=여기에_authDomain_값_입력
NEXT_PUBLIC_FIREBASE_PROJECT_ID=여기에_projectId_값_입력
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=여기에_storageBucket_값_입력
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=여기에_messagingSenderId_값_입력
NEXT_PUBLIC_FIREBASE_APP_ID=여기에_appId_값_입력
```

**⚠️ 중요**: 
- `.env.local` 파일은 `.gitignore`에 포함되어 있어 Git에 커밋되지 않습니다.
- 실제 값은 Firebase Console에서 복사한 값으로 교체해야 합니다.

### Step 3: 개발 서버 재시작

환경 변수를 변경한 후에는 **반드시 개발 서버를 재시작**해야 합니다:

```bash
# 서버 중지 (Ctrl+C)
# 서버 재시작
npm run dev
```

### Step 4: 설정 확인

`app/lib/firebase/config.ts` 파일이 이미 환경 변수를 사용하도록 설정되어 있습니다:

```typescript
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};
```

---

## 📱 나중에 앱 추가하기

### iOS 앱 추가 (Flutter 개발 시)

1. Firebase Console → 프로젝트 설정 → "앱 추가" → **iOS**
2. Bundle ID 입력 (Flutter 프로젝트의 iOS Bundle ID)
3. `GoogleService-Info.plist` 다운로드
4. Flutter 프로젝트의 `ios/Runner/` 폴더에 추가

### Android 앱 추가 (Flutter 개발 시)

1. Firebase Console → 프로젝트 설정 → "앱 추가" → **Android**
2. 패키지 이름 입력 (Flutter 프로젝트의 Android 패키지명)
3. `google-services.json` 다운로드
4. Flutter 프로젝트의 `android/app/` 폴더에 추가

---

## ✅ 현재 단계 요약

### 지금 해야 할 것
1. ✅ Firebase 프로젝트 생성 (이름: **PushHub**)
2. ✅ 웹 앱 등록
3. ✅ 이메일/비밀번호 인증 활성화
4. ✅ Firebase SDK 설치 및 설정

### 나중에 할 것
- ⏳ iOS 앱 등록 (Flutter 앱 개발 시)
- ⏳ Android 앱 등록 (Flutter 앱 개발 시)
- ⏳ Firestore 데이터베이스 설정 (기능 등록 시)
- ⏳ FCM 설정 (푸시알림 구현 시)

---

## 🎯 권장 순서

1. **지금**: 웹 앱만 등록하고 인증 기능 구현
2. **나중에**: Flutter 앱 개발할 때 iOS/Android 앱 추가
3. **필요 시**: Firestore, FCM 등 추가 서비스 설정

**결론**: 웹부터 시작하고, 나중에 앱 개발할 때 iOS/Android를 추가하면 됩니다! 🚀

