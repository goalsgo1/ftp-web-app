# 📁 문서 폴더 구조 설명

> **docs 폴더 내 모든 폴더의 목적과 구조**

---

## 📋 폴더 구조 개요

```
docs/
├── development-guides/      # 개발 가이드 (한글: 개발 가이드)
├── firebase-setup/          # Firebase 설정 (한글: Firebase 설정)
├── reference/               # 참고 문서 (한글: 참고 문서)
├── archive/                 # 완료/보관 문서 (한글: 완료/보관 문서)
└── [시스템 설계 문서들]     # 루트에 위치한 설계 문서
```

---

## 🟢 development-guides (개발 가이드)

**목적**: 프로젝트 개발에 필요한 모든 가이드 문서

### 폴더 구조
```
development-guides/
├── README.md                    # 개발 가이드 소개
├── quick-start/                 # 빠른 시작 (한글: 빠른 시작)
│   ├── README.md
│   └── QUICK_START.md
├── server-management/           # 서버 관리 (한글: 서버 관리)
│   ├── README.md
│   └── DEVELOPMENT_SERVER_GUIDE.md
├── status-check/                # 상태 확인 (한글: 상태 확인)
│   ├── README.md
│   └── CHECK_RUN_STATUS.md
└── component-usage/             # 컴포넌트 사용법 (한글: 컴포넌트 사용법)
    ├── README.md
    └── DEVELOPMENT_GUIDE.md
```

### 각 폴더의 목적

#### quick-start (빠른 시작)
- **목적**: 개발 서버 실행/종료 빠른 참조 가이드
- **대상**: 처음 시작하는 개발자
- **파일**: `QUICK_START.md`

#### server-management (서버 관리)
- **목적**: 개발 서버 상세 관리 및 고급 설정
- **대상**: 포트 변경, 고급 문제 해결이 필요한 개발자
- **파일**: `DEVELOPMENT_SERVER_GUIDE.md`

#### status-check (상태 확인)
- **목적**: 실행 가능 상태 점검 및 체크리스트
- **대상**: 실행 전 상태를 확인하고 싶은 개발자
- **파일**: `CHECK_RUN_STATUS.md`

#### component-usage (컴포넌트 사용법)
- **목적**: 공통 컴포넌트 사용법 및 개발 가이드
- **대상**: 새 기능을 추가하는 개발자
- **파일**: `DEVELOPMENT_GUIDE.md`

---

## 🔥 firebase-setup (Firebase 설정)

**목적**: Firebase 기능 사용을 위한 설정 가이드

### 폴더 구조
```
firebase-setup/
├── README.md                    # Firebase 설정 소개
├── environment-variables/       # 환경 변수 (한글: 환경 변수)
│   ├── README.md
│   └── FIREBASE_ENV_SETUP.md
└── authentication/              # 인증 설정 (한글: 인증 설정)
    ├── README.md
    └── FIREBASE_AUTH_SETUP.md
```

### 각 폴더의 목적

#### environment-variables (환경 변수)
- **목적**: Firebase 환경 변수 설정
- **대상**: Firebase 기능을 사용하려는 모든 개발자
- **필수**: Firebase 기능 사용 시 필수
- **파일**: `FIREBASE_ENV_SETUP.md`

#### authentication (인증 설정)
- **목적**: Firebase 인증 활성화
- **대상**: 로그인 기능을 사용하려는 개발자
- **필수**: 로그인 기능 사용 시 필수
- **파일**: `FIREBASE_AUTH_SETUP.md`

---

## 📖 reference (참고 문서)

**목적**: 프로젝트 이해 및 참고용 문서

### 폴더 구조
```
reference/
├── PROJECT_ANALYSIS.md          # 프로젝트 종합 분석
└── WORLD_CLOCK_SECURITY_GUIDE.md  # 세계시간 기능 보안 가이드
```

---

## 📦 archive (완료/보관 문서)

**목적**: 이미 처리 완료된 작업 기록 보관

### 폴더 구조
```
archive/
├── DUPLICATE_CODE_ANALYSIS.md   # 중복 코드 분석 (리팩토링 완료)
├── REFACTORING_COMPLETE.md      # 리팩토링 완료 보고서
├── REFACTORING_PLAN.md          # 리팩토링 계획서 (완료)
├── REFACTORING_SUMMARY.md       # 리팩토링 요약 (완료)
├── STRUCTURE_CLEANUP.md         # 구조 정리 완료
├── COMMIT_MESSAGE.md            # 커밋 메시지 템플릿
├── COMMIT_MESSAGES.md           # 커밋 메시지 예시
├── commit_messages.txt          # 커밋 메시지 텍스트
├── CHECKLIST.md                 # 작업 체크리스트 (일부 완료)
├── TODO_PROMPTS.md              # TODO 프롬프트 (일부 완료)
└── FIREBASE_SETUP_GUIDE.md      # Firebase 설정 가이드 (중복)
```

---

## 📄 루트 문서 (docs/)

시스템 설계 및 스키마 문서

```
docs/
├── CALENDAR_JOURNAL_SYSTEM_DESIGN.md
├── FEATURE_LIST_VS_SUBSCRIPTION_MANAGEMENT.md
├── FIRESTORE_SUBSCRIPTIONS_SCHEMA.md
├── FIREBASE_PROJECT_RECREATION_GUIDE.md
└── FIREBASE_VS_SELF_HOSTED_COMPARISON.md
```

---

## 🔍 문서 찾기 가이드

### 처음 시작하는 경우
1. `development-guides/quick-start/QUICK_START.md`
2. `firebase-setup/environment-variables/FIREBASE_ENV_SETUP.md`
3. `firebase-setup/authentication/FIREBASE_AUTH_SETUP.md`

### 문제가 발생한 경우
1. `development-guides/status-check/CHECK_RUN_STATUS.md`
2. `development-guides/server-management/DEVELOPMENT_SERVER_GUIDE.md`

### 새 기능을 추가하는 경우
1. `development-guides/component-usage/DEVELOPMENT_GUIDE.md`

### 프로젝트 이해
1. `reference/PROJECT_ANALYSIS.md`

---

**작성일**: 2025-01-27  
**버전**: 1.0


