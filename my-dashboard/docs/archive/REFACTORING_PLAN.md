# 리팩토링 계획서: Design System 기반 컴포넌트 구조화

## 📋 목차
1. [현재 구조 분석](#현재-구조-분석)
2. [목표 구조](#목표-구조)
3. [단계별 리팩토링 계획](#단계별-리팩토링-계획)
4. [상세 작업 내용](#상세-작업-내용)
5. [마이그레이션 전략](#마이그레이션-전략)
6. [검증 방법](#검증-방법)

---

## 🔍 현재 구조 분석

### 현재 파일 구조
```
app/
├── components/
│   ├── DashboardLayout.tsx      # 레이아웃 (공통)
│   ├── PhonePreview.tsx          # 프리뷰 (공통)
│   ├── FeatureList.tsx           # 기능 목록
│   ├── SubscriptionManagement.tsx # 구독 관리
│   ├── NotificationSettings.tsx  # 알림 설정
│   └── NotificationHistory.tsx   # 알림 히스토리
└── page.tsx                      # 라우팅 및 레이아웃 조합
```

### 현재 문제점

#### 1. 중복 코드
- **페이지 헤더**: 모든 화면에서 동일한 패턴 반복
  ```tsx
  <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
  <p className="text-base text-gray-600 dark:text-gray-400">
  ```

- **카드 컴포넌트**: 동일한 스타일이 여러 곳에 반복
  ```tsx
  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
  ```

- **버튼 스타일**: 버튼마다 다른 스타일 정의
  - Primary 버튼: `bg-blue-600 text-white`
  - Secondary 버튼: `bg-gray-100 text-gray-700`
  - 각 컴포넌트마다 다른 패딩, 크기

- **뱃지/태그**: 카테고리 표시가 각각 다름
  ```tsx
  // FeatureList
  className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100..."
  
  // SubscriptionManagement
  className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100..."
  ```

#### 2. 스타일 불일치 위험
- 동일한 요소라도 컴포넌트마다 미세한 차이 가능
- 수정 시 여러 파일을 동시에 수정해야 함
- 실수로 일부만 수정할 위험

#### 3. 유지보수 어려움
- 디자인 변경 시 4개 이상의 파일 수정 필요
- 새 화면 추가 시 기존 패턴을 복사해야 함
- 일관성 검증이 어려움

---

## 🎯 목표 구조

### 최종 디렉토리 구조
```
app/
├── components/
│   ├── ui/                          # 공통 UI 컴포넌트
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   ├── Button.types.ts
│   │   │   └── index.ts
│   │   ├── Card/
│   │   │   ├── Card.tsx
│   │   │   ├── CardHeader.tsx
│   │   │   ├── CardBody.tsx
│   │   │   └── index.ts
│   │   ├── Badge/
│   │   │   ├── Badge.tsx
│   │   │   └── index.ts
│   │   ├── Input/
│   │   │   ├── Input.tsx
│   │   │   ├── SearchInput.tsx
│   │   │   └── index.ts
│   │   ├── Select/
│   │   │   ├── Select.tsx
│   │   │   └── index.ts
│   │   ├── Toggle/
│   │   │   ├── Toggle.tsx
│   │   │   └── index.ts
│   │   ├── PageHeader/
│   │   │   ├── PageHeader.tsx
│   │   │   └── index.ts
│   │   └── StatCard/
│   │       ├── StatCard.tsx
│   │       └── index.ts
│   ├── layout/                      # 레이아웃 컴포넌트
│   │   ├── DashboardLayout.tsx
│   │   ├── PageLayout.tsx           # 프리뷰 포함 레이아웃
│   │   └── index.ts
│   ├── features/                    # 기능별 컴포넌트
│   │   ├── FeatureList/
│   │   │   ├── FeatureList.tsx
│   │   │   ├── FeatureCard.tsx
│   │   │   └── index.ts
│   │   ├── SubscriptionManagement/
│   │   │   ├── SubscriptionManagement.tsx
│   │   │   ├── SubscriptionCard.tsx
│   │   │   └── index.ts
│   │   ├── NotificationSettings/
│   │   │   ├── NotificationSettings.tsx
│   │   │   ├── NotificationRuleCard.tsx
│   │   │   └── index.ts
│   │   └── NotificationHistory/
│   │       ├── NotificationHistory.tsx
│   │       ├── NotificationCard.tsx
│   │       └── index.ts
│   └── preview/                     # 프리뷰 관련
│       ├── PhonePreview.tsx
│       └── index.ts
├── styles/                          # 스타일 정의
│   ├── theme.ts                     # 색상, 폰트, 간격
│   ├── tokens.ts                    # 디자인 토큰
│   └── variants.ts                  # 컴포넌트 variant 정의
├── constants/                       # 상수 정의
│   ├── typography.ts                # 텍스트 스타일
│   └── spacing.ts                   # 간격 상수
└── types/                           # TypeScript 타입
    └── ui.types.ts                  # UI 컴포넌트 공통 타입
```

---

## 📝 단계별 리팩토링 계획

### Phase 1: 기반 구조 설정 (1-2일)
**목표**: 공통 스타일과 타입 정의

#### 작업 내용
1. 디렉토리 구조 생성
2. 스타일 시스템 구축
   - `styles/theme.ts`: 색상, 폰트, 간격 정의
   - `styles/tokens.ts`: 디자인 토큰
   - `constants/typography.ts`: 텍스트 스타일
3. TypeScript 타입 정의
   - `types/ui.types.ts`: 공통 UI 타입

#### 예상 결과
- 모든 스타일 값이 한 곳에서 관리됨
- 타입 안정성 확보

---

### Phase 2: 공통 UI 컴포넌트 개발 (2-3일)
**목표**: 재사용 가능한 기본 컴포넌트 생성

#### 우선순위별 컴포넌트

**1순위 (즉시 필요)**
- `PageHeader`: 페이지 제목 + 설명
- `Button`: 모든 버튼 통합
- `Card`: 기본 카드 컴포넌트
- `Badge`: 카테고리/상태 표시

**2순위 (빠른 개발)**
- `Input`: 텍스트 입력
- `Select`: 드롭다운
- `Toggle`: 스위치
- `StatCard`: 통계 카드

**3순위 (향후 확장)**
- `Modal`
- `Toast`
- `Loading`

#### 각 컴포넌트 구조
```tsx
// components/ui/Button/Button.tsx
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'danger' | 'ghost'
  size: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  children: React.ReactNode
  onClick?: () => void
}

// styles/variants.ts에서 variant별 스타일 정의
```

---

### Phase 3: 레이아웃 컴포넌트 리팩토링 (1일)
**목표**: 공통 레이아웃 패턴 추출

#### 작업 내용
1. `PageLayout` 컴포넌트 생성
   - 프리뷰 표시/숨김 로직 통합
   - 반복되는 레이아웃 코드 제거

2. `DashboardLayout` 개선
   - 사이드바 로직 유지
   - 스타일을 theme에서 참조

---

### Phase 4: 기능별 컴포넌트 마이그레이션 (3-4일)
**목표**: 기존 컴포넌트를 공통 컴포넌트로 교체

#### 마이그레이션 순서

**1. FeatureList.tsx**
- `PageHeader` 적용
- `Card` → `FeatureCard` (Card 기반)
- `Button` 적용
- `Badge` 적용
- `Input`, `Select` 적용

**2. SubscriptionManagement.tsx**
- `PageHeader` 적용
- `StatCard` 적용
- `Card` → `SubscriptionCard`
- `Button` 적용
- `Badge` 적용
- `Toggle` 적용

**3. NotificationSettings.tsx**
- `PageHeader` 적용
- `Card` → `NotificationRuleCard`
- `Toggle` 적용
- `Button` 적용
- `Input` (time input) 적용

**4. NotificationHistory.tsx**
- `PageHeader` 적용
- `Card` → `NotificationCard`
- `Button` (필터 버튼) 적용

---

### Phase 5: 통합 및 검증 (1-2일)
**목표**: 모든 변경사항 통합 및 테스트

#### 작업 내용
1. 모든 화면에서 공통 컴포넌트 사용 확인
2. 스타일 일관성 검증
3. 반응형 디자인 테스트
4. 다크 모드 테스트
5. 접근성 검증

---

## 🔧 상세 작업 내용

### 1. 스타일 시스템 구축

#### `styles/theme.ts`
```typescript
export const theme = {
  colors: {
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      // ...
      600: '#2563eb',  // 메인 색상
      700: '#1d4ed8',
    },
    gray: {
      50: '#f9fafb',
      // ...
      900: '#111827',
    },
    // success, warning, error 등
  },
  spacing: {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',   // 8px
    md: '1rem',     // 16px
    lg: '1.5rem',   // 24px
    xl: '2rem',     // 32px
  },
  typography: {
    h1: {
      fontSize: '2.25rem',  // 36px
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '1.875rem', // 30px
      fontWeight: 700,
      lineHeight: 1.3,
    },
    // ...
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.5rem',
    lg: '0.75rem',
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    // ...
  },
}
```

#### `constants/typography.ts`
```typescript
export const typography = {
  pageTitle: 'text-3xl font-bold',
  pageDescription: 'text-base',
  cardTitle: 'text-xl font-semibold',
  cardDescription: 'text-sm',
  // ...
}
```

---

### 2. 공통 컴포넌트 예시

#### `components/ui/PageHeader/PageHeader.tsx`
```typescript
interface PageHeaderProps {
  title: string
  description: string
  action?: React.ReactNode  // 오른쪽 액션 버튼 등
}

export const PageHeader = ({ title, description, action }: PageHeaderProps) => {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {title}
        </h2>
        <p className="text-base text-gray-600 dark:text-gray-400">
          {description}
        </p>
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}
```

#### `components/ui/Button/Button.tsx`
```typescript
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'danger' | 'ghost'
  size: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  icon?: React.ReactNode
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
}

const variantStyles = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700',
  secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  ghost: 'bg-transparent text-gray-700 hover:bg-gray-100',
}

const sizeStyles = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
}

export const Button = ({ 
  variant = 'primary', 
  size = 'md',
  fullWidth = false,
  icon,
  children,
  ...props 
}: ButtonProps) => {
  return (
    <button
      className={`
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${fullWidth ? 'w-full' : ''}
        rounded-lg font-medium
        transition-colors
        disabled:opacity-50 disabled:cursor-not-allowed
        flex items-center justify-center gap-2
      `}
      {...props}
    >
      {icon && <span>{icon}</span>}
      {children}
    </button>
  )
}
```

#### `components/ui/Card/Card.tsx`
```typescript
interface CardProps {
  children: React.ReactNode
  hover?: boolean
  padding?: 'sm' | 'md' | 'lg'
  className?: string
}

const paddingStyles = {
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
}

export const Card = ({ 
  children, 
  hover = false,
  padding = 'md',
  className = '' 
}: CardProps) => {
  return (
    <div
      className={`
        bg-white dark:bg-gray-800
        rounded-lg shadow-sm
        border border-gray-200 dark:border-gray-700
        ${paddingStyles[padding]}
        ${hover ? 'hover:shadow-md transition-shadow' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  )
}
```

---

### 3. 마이그레이션 예시

#### Before (FeatureList.tsx)
```tsx
<div>
  <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
    웹 기능 목록
  </h2>
  <p className="text-base text-gray-600 dark:text-gray-400">
    사용 가능한 웹 기능들을 탐색하고 구독하세요
  </p>
</div>

<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
  {/* 내용 */}
</div>

<button className="flex-1 px-4 py-2 rounded-lg font-medium bg-blue-600 text-white">
  구독하기
</button>
```

#### After (FeatureList.tsx)
```tsx
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

<PageHeader 
  title="웹 기능 목록"
  description="사용 가능한 웹 기능들을 탐색하고 구독하세요"
/>

<Card hover>
  {/* 내용 */}
</Card>

<Button variant="primary" fullWidth>
  구독하기
</Button>
```

---

## 🔄 마이그레이션 전략

### 점진적 마이그레이션 (Incremental Migration)

#### 전략
1. **병렬 개발**: 기존 컴포넌트 유지하면서 공통 컴포넌트 개발
2. **단계적 교체**: 한 화면씩 순차적으로 마이그레이션
3. **검증 후 진행**: 각 단계마다 동작 확인

#### 단계별 체크리스트

**Phase 1 완료 체크**
- [ ] 디렉토리 구조 생성
- [ ] theme.ts 작성 및 검증
- [ ] typography.ts 작성
- [ ] 타입 정의 완료

**Phase 2 완료 체크**
- [ ] PageHeader 컴포넌트
- [ ] Button 컴포넌트 (모든 variant)
- [ ] Card 컴포넌트
- [ ] Badge 컴포넌트
- [ ] Input, Select 컴포넌트
- [ ] 각 컴포넌트 스토리북 또는 테스트

**Phase 3 완료 체크**
- [ ] PageLayout 컴포넌트
- [ ] DashboardLayout 개선
- [ ] page.tsx 리팩토링

**Phase 4 완료 체크**
- [ ] FeatureList 마이그레이션
- [ ] SubscriptionManagement 마이그레이션
- [ ] NotificationSettings 마이그레이션
- [ ] NotificationHistory 마이그레이션
- [ ] 각 화면 동작 확인

**Phase 5 완료 체크**
- [ ] 모든 화면 스타일 일관성 확인
- [ ] 반응형 테스트
- [ ] 다크 모드 테스트
- [ ] 성능 확인
- [ ] 코드 리뷰

---

## ✅ 검증 방법

### 1. 시각적 검증
- 각 화면 스크린샷 비교 (Before/After)
- 브라우저 개발자 도구로 스타일 확인
- 다양한 화면 크기에서 테스트

### 2. 기능 검증
- 모든 버튼 클릭 동작 확인
- 폼 입력/제출 동작 확인
- 상태 변경 동작 확인

### 3. 코드 검증
- TypeScript 타입 에러 없음
- ESLint 경고 없음
- 중복 코드 제거 확인

### 4. 성능 검증
- 번들 크기 비교
- 렌더링 성능 확인
- 메모리 사용량 확인

---

## 📊 예상 효과

### 코드 감소
- **Before**: ~1,500줄 (중복 포함)
- **After**: ~800줄 (공통 컴포넌트 포함)
- **감소율**: 약 47%

### 유지보수 시간
- **Before**: 디자인 변경 시 4개 파일 수정 (약 30분)
- **After**: 1개 파일 수정 (약 5분)
- **시간 절감**: 약 83%

### 일관성
- **Before**: 수동으로 일관성 유지
- **After**: 자동으로 일관성 보장

---

## 🚀 실행 계획

### Week 1
- **Day 1-2**: Phase 1 (기반 구조)
- **Day 3-5**: Phase 2 (공통 컴포넌트)

### Week 2
- **Day 1**: Phase 3 (레이아웃)
- **Day 2-4**: Phase 4 (마이그레이션)
- **Day 5**: Phase 5 (검증)

### 총 예상 시간
- **개발 시간**: 10일
- **테스트 시간**: 2일
- **총 기간**: 약 2주

---

## ⚠️ 주의사항

### 1. 기존 기능 유지
- 마이그레이션 중에도 기존 기능이 동작해야 함
- 점진적으로 교체하여 리스크 최소화

### 2. 타입 안정성
- 모든 컴포넌트에 TypeScript 타입 정의
- any 타입 사용 지양

### 3. 접근성
- ARIA 속성 유지
- 키보드 네비게이션 지원
- 스크린 리더 호환성

### 4. 성능
- 불필요한 리렌더링 방지
- 메모이제이션 적절히 사용
- 번들 크기 모니터링

---

## 📚 참고 자료

### Design System 예시
- Material-UI: https://mui.com/
- Chakra UI: https://chakra-ui.com/
- Ant Design: https://ant.design/

### 리팩토링 패턴
- Component Composition Pattern
- Design Tokens
- Atomic Design Methodology

---

**작성일**: 2025-12-01  
**버전**: 1.0  
**작성자**: AI Assistant

