# Firebase 환경 변수 설정 가이드

## 📋 빠른 설정 가이드

### 1. Firebase Console에서 설정 값 복사

1. [Firebase Console](https://console.firebase.google.com/) 접속
2. **PushHub** 프로젝트 선택
3. 좌측 상단 **⚙️ 프로젝트 설정** 클릭
4. "일반" 탭 → "내 앱" 섹션에서 **웹 앱** 선택
5. **⚙️ 설정** 아이콘 클릭
6. "Firebase SDK 구성" → **"구성"** 탭 선택
7. 다음 값들을 복사:
   ```
   apiKey: "AIza..."
   authDomain: "pushhub-xxxxx.firebaseapp.com"
   projectId: "pushhub-xxxxx"
   storageBucket: "pushhub-xxxxx.appspot.com"
   messagingSenderId: "123456789"
   appId: "1:123456789:web:abcdef"
   ```

### 2. `.env.local` 파일 생성

`my-dashboard/` 폴더에 `.env.local` 파일을 생성하고 아래 내용을 입력:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...여기에_실제_값_입력
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=pushhub-xxxxx.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=pushhub-xxxxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=pushhub-xxxxx.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
```

**⚠️ 주의사항:**
- 따옴표(`"`) 없이 값만 입력하세요
- 실제 Firebase Console에서 복사한 값으로 교체하세요
- `.env.local` 파일은 Git에 커밋되지 않습니다 (`.gitignore`에 포함됨)

### 3. 개발 서버 재시작

환경 변수를 변경한 후에는 반드시 개발 서버를 재시작해야 합니다:

```bash
# 현재 실행 중인 서버 중지 (Ctrl+C)
# 서버 재시작
npm run dev
```

### 4. 설정 확인

브라우저 콘솔에서 에러가 없는지 확인하세요. 
로그인 페이지(`/login`)에서 이메일/비밀번호로 로그인을 시도해보세요.

---

## 🔍 문제 해결

### 환경 변수가 적용되지 않는 경우

1. **서버 재시작 확인**: 환경 변수 변경 후 반드시 서버 재시작
2. **파일 위치 확인**: `.env.local` 파일이 `my-dashboard/` 루트에 있는지 확인
3. **변수명 확인**: `NEXT_PUBLIC_` 접두사가 있는지 확인 (클라이언트에서 사용하려면 필수)
4. **따옴표 제거**: 값에 따옴표가 포함되어 있지 않은지 확인

### Firebase 초기화 에러

- `Firebase: Error (auth/invalid-api-key)`: API 키가 잘못되었거나 누락됨
- `Firebase: Error (auth/network-request-failed)`: 네트워크 연결 확인
- 콘솔에서 정확한 에러 메시지를 확인하세요

---

## ✅ 완료 체크리스트

- [ ] Firebase Console에서 설정 값 복사 완료
- [ ] `.env.local` 파일 생성 및 값 입력 완료
- [ ] 개발 서버 재시작 완료
- [ ] 로그인 페이지에서 로그인 시도 (테스트 계정 필요)
- [ ] 브라우저 콘솔에 에러 없음 확인

---

## 📝 다음 단계

환경 변수 설정이 완료되면:
1. Firebase Authentication에서 테스트 계정 생성
2. 로그인 기능 테스트
3. 회원가입 기능 구현 (선택사항)

