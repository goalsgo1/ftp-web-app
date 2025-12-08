# 📚 문서 인덱스

> **MY-DASHBOARD 프로젝트 문서 구조**

---

## 📋 문서 분류

### 🟢 활성 사용 문서 (현재 사용 중)

#### 개발 가이드 (development-guides)
**목적**: 프로젝트 개발에 필요한 모든 가이드

- **빠른 시작** (`quick-start/`)
  - `QUICK_START.md` - 개발 서버 실행/종료 빠른 참조 가이드
- **서버 관리** (`server-management/`)
  - `DEVELOPMENT_SERVER_GUIDE.md` - 개발 서버 상세 가이드 (포트 변경, 고급 문제 해결)
- **상태 확인** (`status-check/`)
  - `CHECK_RUN_STATUS.md` - 실행 가능 상태 확인 및 점검
- **컴포넌트 사용법** (`component-usage/`)
  - `DEVELOPMENT_GUIDE.md` - 컴포넌트 사용법, 디자인 시스템, 코드 스타일 가이드

#### Firebase 설정 (firebase-setup)
**목적**: Firebase 기능 사용을 위한 설정

- **환경 변수** (`environment-variables/`)
  - `FIREBASE_ENV_SETUP.md` - Firebase 환경 변수 설정 (필수)
- **인증 설정** (`authentication/`)
  - `FIREBASE_AUTH_SETUP.md` - Firebase 인증 활성화 (로그인 기능 사용 시 필수)

#### 프로젝트 소개
- `README.md` - 프로젝트 소개 및 빠른 시작 (루트 디렉토리)

**전체 가이드 목록**: `docs/GUIDES_INDEX.md` 참고

---

### 📖 참고 문서 (나중에 참고)

#### 프로젝트 분석
- `docs/reference/PROJECT_ANALYSIS.md` - 프로젝트 종합 분석

#### 보안 가이드
- `docs/reference/WORLD_CLOCK_SECURITY_GUIDE.md` - 세계시간 기능 보안 가이드

#### 시스템 설계
- `docs/CALENDAR_JOURNAL_SYSTEM_DESIGN.md` - 캘린더 일지 시스템 설계
- `docs/FEATURE_LIST_VS_SUBSCRIPTION_MANAGEMENT.md` - 기능 목록 vs 구독 관리 비교
- `docs/FIRESTORE_SUBSCRIPTIONS_SCHEMA.md` - Firestore 구독 스키마
- `docs/FIREBASE_PROJECT_RECREATION_GUIDE.md` - Firebase 프로젝트 재생성 가이드
- `docs/FIREBASE_VS_SELF_HOSTED_COMPARISON.md` - Firebase vs Self-Hosted 비교

---

### 📦 완료/보관 문서 (이미 처리 완료)

#### 리팩토링 관련
- `docs/archive/DUPLICATE_CODE_ANALYSIS.md` - 중복 코드 분석 (리팩토링 완료)
- `docs/archive/REFACTORING_COMPLETE.md` - 리팩토링 완료 보고서
- `docs/archive/REFACTORING_PLAN.md` - 리팩토링 계획서 (완료)
- `docs/archive/REFACTORING_SUMMARY.md` - 리팩토링 요약 (완료)

#### 구조 정리
- `docs/archive/STRUCTURE_CLEANUP.md` - 프로젝트 구조 정리 완료

#### 커밋 메시지
- `docs/archive/COMMIT_MESSAGE.md` - 커밋 메시지 템플릿
- `docs/archive/COMMIT_MESSAGES.md` - 커밋 메시지 예시

#### 작업 체크리스트
- `docs/archive/CHECKLIST.md` - 프로젝트 개선 작업 체크리스트 (일부 완료)
- `docs/archive/TODO_PROMPTS.md` - TODO 프롬프트 (일부 완료)

#### 중복 가이드
- `docs/archive/FIREBASE_SETUP_GUIDE.md` - Firebase 설정 가이드 (FIREBASE_ENV_SETUP.md와 중복)

---

## 📁 문서 구조

```
my-dashboard/
├── README.md                          # 프로젝트 소개
└── docs/
    ├── DOCUMENTATION_INDEX.md         # 이 파일 (문서 인덱스)
    ├── DOCUMENTATION_ORGANIZATION.md  # 정리 보고서
    ├── DOCUMENTATION_SUMMARY.md       # 정리 요약
    ├── GUIDES_INDEX.md                # 가이드 인덱스
    ├── GUIDES_CLEANUP_SUMMARY.md      # 가이드 정리 보고서
    │
    ├── development-guides/             # 개발 가이드
    │   ├── README.md                  # 개발 가이드 소개
    │   ├── quick-start/                # 빠른 시작
    │   │   ├── README.md
    │   │   └── QUICK_START.md
    │   ├── server-management/         # 서버 관리
    │   │   ├── README.md
    │   │   └── DEVELOPMENT_SERVER_GUIDE.md
    │   ├── status-check/              # 상태 확인
    │   │   ├── README.md
    │   │   └── CHECK_RUN_STATUS.md
    │   └── component-usage/           # 컴포넌트 사용법
    │       ├── README.md
    │       └── DEVELOPMENT_GUIDE.md
    │
    ├── firebase-setup/                # Firebase 설정
    │   ├── README.md                  # Firebase 설정 소개
    │   ├── environment-variables/     # 환경 변수
    │   │   ├── README.md
    │   │   └── FIREBASE_ENV_SETUP.md
    │   └── authentication/            # 인증 설정
    │       ├── README.md
    │       └── FIREBASE_AUTH_SETUP.md
    │
    ├── reference/                      # 참고 문서
    │   ├── PROJECT_ANALYSIS.md
    │   └── WORLD_CLOCK_SECURITY_GUIDE.md
    │
    ├── archive/                        # 완료/보관 문서
    │   ├── DUPLICATE_CODE_ANALYSIS.md
    │   ├── REFACTORING_COMPLETE.md
    │   ├── REFACTORING_PLAN.md
    │   ├── REFACTORING_SUMMARY.md
    │   ├── STRUCTURE_CLEANUP.md
    │   ├── COMMIT_MESSAGE.md
    │   ├── COMMIT_MESSAGES.md
    │   ├── commit_messages.txt
    │   ├── CHECKLIST.md
    │   ├── TODO_PROMPTS.md
    │   └── FIREBASE_SETUP_GUIDE.md
    │
    └── [시스템 설계 문서들]
        ├── CALENDAR_JOURNAL_SYSTEM_DESIGN.md
        ├── FEATURE_LIST_VS_SUBSCRIPTION_MANAGEMENT.md
        ├── FIRESTORE_SUBSCRIPTIONS_SCHEMA.md
        ├── FIREBASE_PROJECT_RECREATION_GUIDE.md
        └── FIREBASE_VS_SELF_HOSTED_COMPARISON.md
```

---

## 🔍 문서 찾기

### 개발 시작하기
1. `docs/development-guides/quick-start/QUICK_START.md` - 빠른 시작
2. `docs/firebase-setup/environment-variables/FIREBASE_ENV_SETUP.md` - Firebase 설정
3. `docs/development-guides/component-usage/DEVELOPMENT_GUIDE.md` - 개발 가이드

### 문제 해결
1. `docs/development-guides/status-check/CHECK_RUN_STATUS.md` - 실행 상태 확인
2. `docs/development-guides/server-management/DEVELOPMENT_SERVER_GUIDE.md` - 서버 문제 해결

### 프로젝트 이해
1. `docs/reference/PROJECT_ANALYSIS.md` - 프로젝트 분석
2. `README.md` - 프로젝트 소개

### 과거 작업 확인
1. `docs/archive/` 폴더 내 문서들

---

## 📝 폴더별 설명

### development-guides (개발 가이드)
프로젝트 개발에 필요한 모든 가이드 문서
- **quick-start**: 빠른 시작 가이드
- **server-management**: 서버 관리 및 고급 설정
- **status-check**: 실행 상태 확인
- **component-usage**: 컴포넌트 사용법 및 개발 가이드

### firebase-setup (Firebase 설정)
Firebase 기능 사용을 위한 설정 가이드
- **environment-variables**: 환경 변수 설정
- **authentication**: 인증 활성화

### reference (참고 문서)
프로젝트 이해 및 참고용 문서

### archive (완료/보관 문서)
이미 처리 완료된 작업 기록

---

**작성일**: 2025-01-27  
**버전**: 2.0
