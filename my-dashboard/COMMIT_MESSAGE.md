# 커밋 메시지

## 주요 커밋 (전체 프로젝트)

```
feat: PushHub 대시보드 초기 구현 및 스마트폰 프리뷰 추가

- Next.js 16 + React 19 + TypeScript 기반 대시보드 프로젝트 생성
- 웹 기능 통합 관리 시스템 구현
  * 기능 목록 조회 및 구독 관리 (FeatureList)
  * 구독 중인 기능 관리 (SubscriptionManagement)
  * 기능별 알림 설정 및 시간대별 규칙 설정 (NotificationSettings)
  * 알림 히스토리 조회 및 필터링 (NotificationHistory)
- 스마트폰 프리뷰 슬라이드쇼 추가 (PhonePreview)
  * 앱 대시보드 화면 시뮬레이션
  * 푸시알림 수신 화면
  * 알림 시간 설정 화면
  * 푸시알림 클릭 후 웹 페이지 이동 시뮬레이션
- 반응형 대시보드 레이아웃 구현 (DashboardLayout)
- 필요한 라이브러리 설치 (react-icons, zustand, date-fns)
- Next.js 설치 가이드 및 브레인스토밍 진행내용 문서 추가
```

## 세부 커밋 (선택사항)

### 1. 프로젝트 초기 설정
```
feat: Next.js 프로젝트 초기 설정

- create-next-app으로 프로젝트 생성
- TypeScript, Tailwind CSS, ESLint 설정
- 기본 프로젝트 구조 구성
```

### 2. 대시보드 컴포넌트 구현
```
feat: 대시보드 핵심 컴포넌트 구현

- DashboardLayout: 반응형 레이아웃 및 사이드바 네비게이션
- FeatureList: 웹 기능 목록, 검색, 필터, 구독 기능
- SubscriptionManagement: 구독 관리 및 통계
- NotificationSettings: 알림 설정 및 시간대별 규칙
- NotificationHistory: 알림 히스토리 및 필터링
```

### 3. 스마트폰 프리뷰 추가
```
feat: 스마트폰 프리뷰 슬라이드쇼 추가

- PhonePreview 컴포넌트 구현
- 4개 슬라이드로 푸시알림 동작 시뮬레이션
- 슬라이드 네비게이션 및 페이지네이션
- 반응형 디자인 (데스크톱 전용)
```

### 4. 문서 추가
```
docs: Next.js 설치 가이드 및 브레인스토밍 문서 추가

- Next.js 설치 가이드 작성
- 브레인스토밍 진행내용 요약 문서 작성
- 문제 해결 가이드 포함
```

