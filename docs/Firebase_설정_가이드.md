# 🔥 Firebase 인증 설정 가이드

Firebase Authentication을 사용하여 로그인 기능을 설정하는 방법입니다.

## 📋 목차

1. [Firebase 프로젝트 생성](#1-firebase-프로젝트-생성)
2. [인증 활성화](#2-인증-활성화)
3. [설정 정보 복사](#3-설정-정보-복사)
4. [프로젝트에 적용](#4-프로젝트에-적용)
5. [테스트](#5-테스트)

---

## 1. Firebase 프로젝트 생성

### 1-1. Firebase 콘솔 접속

1. [Firebase Console](https://console.firebase.google.com/)에 접속
2. Google 계정으로 로그인

### 1-2. 새 프로젝트 추가

1. **"프로젝트 추가"** 클릭
2. 프로젝트 이름 입력 (예: `my-web-app`)
3. Google Analytics 설정 (선택사항, 개인 프로젝트면 비활성화 가능)
4. **"프로젝트 만들기"** 클릭
5. 생성 완료까지 대기 (약 30초~1분)

---

## 2. 인증 활성화

### 2-1. Authentication 메뉴로 이동

1. 왼쪽 메뉴에서 **"Authentication"** 클릭
2. **"시작하기"** 버튼 클릭

### 2-2. 이메일/비밀번호 인증 활성화

1. **"Sign-in method"** 탭 클릭
2. **"이메일/비밀번호"** 클릭
3. **"사용 설정"** 토글을 켜기
4. **"저장"** 클릭

✅ 이제 이메일과 비밀번호로 회원가입/로그인이 가능합니다!

---

## 3. 설정 정보 복사

### 3-1. 웹 앱 추가

1. 프로젝트 설정 아이콘(톱니바퀴) 클릭
2. **"프로젝트 설정"** 클릭
3. 아래로 스크롤하여 **"내 앱"** 섹션 찾기
4. **"</>" 웹 아이콘** 클릭

### 3-2. 앱 등록

1. 앱 닉네임 입력 (예: `My Web App`)
2. **"앱 등록"** 클릭
3. Firebase SDK 추가 안내 화면이 나타남

### 3-3. 설정 정보 복사

다음과 같은 형식의 설정 정보를 복사할 수 있습니다:

```javascript
const firebaseConfig = {
    apiKey: "AIzaSy...",
    authDomain: "my-web-app.firebaseapp.com",
    projectId: "my-web-app",
    storageBucket: "my-web-app.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef123456"
};
```

**이 정보를 저장해두세요!**

---

## 4. 프로젝트에 적용

### 4-1. `firebase-config.js` 파일 수정

`public/js/firebase-config.js` 파일을 열고 실제 Firebase 설정 정보로 교체합니다:

```javascript
const firebaseConfig = {
    apiKey: "여기에_API_KEY_붙여넣기",
    authDomain: "여기에_AUTH_DOMAIN_붙여넣기",
    projectId: "여기에_PROJECT_ID_붙여넣기",
    storageBucket: "여기에_STORAGE_BUCKET_붙여넣기",
    messagingSenderId: "여기에_SENDER_ID_붙여넣기",
    appId: "여기에_APP_ID_붙여넣기"
};
```

### 4-2. 파일 저장

설정 정보를 입력한 후 파일을 저장합니다.

---

## 5. 테스트

### 5-1. 웹 페이지 열기

1. 웹 서버를 실행하거나 `index.html` 파일을 브라우저에서 엽니다
2. **"로그인"** 버튼 클릭

### 5-2. 회원가입

1. **"회원가입"** 탭 클릭
2. 이메일과 비밀번호 입력 (비밀번호는 최소 6자 이상)
3. **"회원가입"** 버튼 클릭
4. 성공 메시지 확인

### 5-3. 로그인

1. 로그아웃 후 다시 **"로그인"** 버튼 클릭
2. 방금 만든 이메일과 비밀번호 입력
3. **"로그인"** 버튼 클릭
4. 대시보드로 이동되는지 확인

---

## 🔒 보안 설정 (선택사항)

### 도메인 허용 설정

프로덕션 배포 시 특정 도메인만 허용하도록 설정할 수 있습니다:

1. Firebase Console → Authentication → Settings
2. **"승인된 도메인"** 섹션
3. 도메인 추가/제거

기본적으로 `localhost`는 개발 환경에서 자동으로 허용됩니다.

---

## 🐛 문제 해결

### "Firebase가 로드되지 않았습니다" 에러

- HTML에서 Firebase SDK 스크립트가 제대로 로드되었는지 확인
- 인터넷 연결 확인
- 브라우저 개발자 도구 콘솔에서 에러 메시지 확인

### "인증 도메인이 승인되지 않았습니다" 에러

- Firebase Console에서 도메인이 허용되어 있는지 확인
- `localhost`는 개발 환경에서 기본 허용됨

### 비밀번호가 너무 약하다는 에러

- Firebase는 최소 6자 이상의 비밀번호를 요구
- 더 강력한 비밀번호 규칙을 설정하려면 Firebase Console에서 설정 가능

---

## 📚 다음 단계

- [Firebase 전환 가이드](./Firebase_전환_가이드.md) - 나중에 다른 플랫폼으로 전환하는 방법
- Firebase 공식 문서: [Authentication](https://firebase.google.com/docs/auth)

---

**설정이 완료되었습니다! 이제 로그인 기능을 사용할 수 있습니다.** 🎉

