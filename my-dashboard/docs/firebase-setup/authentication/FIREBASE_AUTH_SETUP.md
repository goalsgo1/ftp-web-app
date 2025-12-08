# Firebase Authentication 설정 가이드

> **로그인 기능 활성화 가이드**  
> 환경 변수 설정(`FIREBASE_ENV_SETUP.md`) 후 이 가이드를 따라 인증을 활성화하세요.

---

## 🔐 이메일/비밀번호 인증 활성화

로그인 기능을 사용하려면 Firebase Console에서 이메일/비밀번호 인증을 활성화해야 합니다.

### 설정 단계

1. **Firebase Console 접속**
   - [Firebase Console](https://console.firebase.google.com/) 접속
   - **PushHub** 프로젝트 선택

2. **Authentication 메뉴로 이동**
   - 좌측 사이드바에서 **"Authentication"** 클릭
   - "시작하기" 버튼이 보이면 클릭 (처음 사용하는 경우)

3. **Sign-in method 활성화**
   - 상단 탭에서 **"Sign-in method"** 선택
   - **"이메일/비밀번호"** 항목 찾기
   - 클릭하여 설정 열기

4. **이메일/비밀번호 활성화**
   - **"이메일/비밀번호"** 토글을 **활성화**
   - **"비밀번호 없이 이메일 링크로 로그인"**은 선택사항 (현재는 비활성화해도 됨)
   - **"저장"** 클릭

### ✅ 완료 확인

- Authentication 메뉴에서 "이메일/비밀번호"가 **활성화** 상태로 표시되면 완료
- 이제 웹 앱에서 로그인/회원가입이 가능합니다

---

## 🧪 테스트 계정 생성

### 방법 1: 웹 앱에서 회원가입 (권장)

1. 개발 서버 실행: `npm run dev`
2. `/login` 페이지 접속
3. "회원가입" 링크 클릭 (아직 구현되지 않았다면 직접 구현 필요)
4. 이메일/비밀번호로 계정 생성

### 방법 2: Firebase Console에서 직접 생성

1. Firebase Console → **Authentication** → **"사용자"** 탭
2. **"사용자 추가"** 버튼 클릭
3. 이메일과 비밀번호 입력
4. **"추가"** 클릭

---

## 🔍 문제 해결

### "auth/operation-not-allowed" 에러

- **원인**: 이메일/비밀번호 인증이 활성화되지 않음
- **해결**: 위의 "이메일/비밀번호 인증 활성화" 단계를 따라 설정

### "auth/invalid-email" 에러

- **원인**: 이메일 형식이 올바르지 않음
- **해결**: 올바른 이메일 형식 사용 (예: `user@example.com`)

### "auth/weak-password" 에러

- **원인**: 비밀번호가 너무 짧음 (6자 미만)
- **해결**: 6자 이상의 비밀번호 사용

---

## 📝 다음 단계

1. ✅ Firebase Authentication 활성화
2. ⏳ 테스트 계정 생성
3. ⏳ 로그인 기능 테스트
4. ⏳ 회원가입 페이지 구현 (선택사항)

---

## 🔗 관련 문서

- **Firebase 환경 변수 설정**: `FIREBASE_ENV_SETUP.md` - 먼저 환경 변수를 설정해야 합니다
- **빠른 시작**: `QUICK_START.md` - 개발 서버 실행
- **개발 가이드**: `DEVELOPMENT_GUIDE.md` - 컴포넌트 사용법 등

