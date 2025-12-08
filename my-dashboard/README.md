# PushHub - 푸시알림 통합 관리 대시보드

> 웹 기반 기능들의 푸시알림을 통합 관리하는 플랫폼

---

## 🚀 빠른 시작

### 개발 서버 실행

```powershell
npm.cmd run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

**자세한 가이드:**
- [빠른 시작 가이드](docs/development-guides/quick-start/QUICK_START.md)
- [개발 서버 가이드](docs/development-guides/server-management/DEVELOPMENT_SERVER_GUIDE.md)
- [실행 상태 확인](docs/development-guides/status-check/CHECK_RUN_STATUS.md)

---

## 📋 필수 설정

### Firebase 환경 변수 설정

Firebase 기능을 사용하려면 `.env.local` 파일이 필요합니다.

**설정 방법:**
1. [Firebase Console](https://console.firebase.google.com/)에서 프로젝트 설정 값 복사
2. 프로젝트 루트에 `.env.local` 파일 생성
3. 환경 변수 입력

**자세한 가이드:**
- [Firebase 환경 변수 설정](docs/firebase-setup/environment-variables/FIREBASE_ENV_SETUP.md)
- [Firebase 인증 설정](docs/firebase-setup/authentication/FIREBASE_AUTH_SETUP.md)

---

## 🛠️ 기술 스택

- **프레임워크**: Next.js 16 (App Router)
- **UI 라이브러리**: React 19
- **언어**: TypeScript
- **스타일링**: Tailwind CSS 4
- **백엔드**: Firebase (Firestore + Authentication)
- **상태 관리**: Zustand (설치됨)
- **기타**: date-fns, react-icons

---

## 📁 프로젝트 구조

```
app/
├── components/          # 재사용 가능한 컴포넌트
│   ├── features/       # 기능별 컴포넌트
│   ├── layout/         # 레이아웃 컴포넌트
│   ├── preview/        # 프리뷰 컴포넌트
│   └── ui/             # 공통 UI 컴포넌트
├── features/           # 기능 페이지
├── lib/                # 라이브러리/유틸리티
│   ├── firebase/       # Firebase 연동
│   └── utils/          # 유틸리티 함수
├── hooks/              # 커스텀 훅
├── styles/             # 디자인 시스템
└── types/              # TypeScript 타입 정의
```

---

## 📚 문서

### 🟢 활성 사용 문서

#### 개발 가이드
- [빠른 시작](docs/development-guides/quick-start/QUICK_START.md) - 개발 서버 실행/종료
- [서버 관리](docs/development-guides/server-management/DEVELOPMENT_SERVER_GUIDE.md) - 상세 가이드
- [상태 확인](docs/development-guides/status-check/CHECK_RUN_STATUS.md) - 실행 가능 여부 확인
- [컴포넌트 사용법](docs/development-guides/component-usage/DEVELOPMENT_GUIDE.md) - 컴포넌트 사용법

#### Firebase 설정
- [환경 변수 설정](docs/firebase-setup/environment-variables/FIREBASE_ENV_SETUP.md) - Firebase 환경 변수 설정
- [인증 설정](docs/firebase-setup/authentication/FIREBASE_AUTH_SETUP.md) - Firebase 인증 활성화

### 📖 참고 문서

- [문서 인덱스](docs/DOCUMENTATION_INDEX.md) - 전체 문서 목록
- [폴더 구조 설명](docs/FOLDER_STRUCTURE.md) - 문서 폴더 구조
- [프로젝트 분석](docs/reference/PROJECT_ANALYSIS.md)
- [시스템 설계 문서](docs/) - 각종 설계 문서

---

## 🎯 주요 기능

### ✅ 구현 완료

- 웹 기능 통합 관리
- 사용자 인증 (Firebase)
- 세계시간 기능 (World Clock)
- 디자인 시스템 구축
- 공통 컴포넌트 라이브러리

### 🚧 개발 중

- 구독 관리 기능
- 알림 설정 저장
- 알림 히스토리

---

## 🔧 개발 명령어

```powershell
# 개발 서버 실행
npm.cmd run dev

# 프로덕션 빌드
npm.cmd run build

# 프로덕션 서버 실행
npm.cmd start

# 린트 검사
npm.cmd run lint
```

---

## 📝 라이선스

Private Project

---

**버전**: 0.1.0  
**최종 업데이트**: 2025-01-27
