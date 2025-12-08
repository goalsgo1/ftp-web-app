# 개발 가이드 (Development Guide)

> **새로운 기능을 추가할 때 반드시 이 가이드를 참고하세요.**  
> 공통 레이아웃, 공통 컴포넌트, 공통 디자인을 사용하여 일관성과 유지보수성을 보장합니다.

---

## 📋 이 가이드의 목적

이 문서는 다음을 다룹니다:
- 공통 컴포넌트 사용법
- 디자인 시스템 활용
- 새 페이지/기능 추가 방법
- 코드 스타일 가이드
- 디자인 패턴

**개발 서버 실행/종료는 `QUICK_START.md` 또는 `DEVELOPMENT_SERVER_GUIDE.md`를 참고하세요.**

---

## 📋 목차

1. [프로젝트 구조](#프로젝트-구조)
2. [공통 컴포넌트 사용법](#공통-컴포넌트-사용법)
3. [디자인 시스템](#디자인-시스템)
4. [새 페이지/기능 추가 가이드](#새-페이지기능-추가-가이드)
5. [코드 스타일 가이드](#코드-스타일-가이드)
6. [디자인 패턴](#디자인-패턴)

---

## 📁 프로젝트 구조

```
app/
├── components/
│   ├── DashboardLayout.tsx      # 메인 레이아웃 (사이드바, 헤더)
│   ├── features/               # 기능별 컴포넌트
│   │   ├── FeatureList/
│   │   ├── SubscriptionManagement/
│   │   ├── NotificationSettings/
│   │   └── NotificationHistory/
│   ├── layout/                 # 레이아웃 컴포넌트
│   │   └── PageLayout.tsx      # 페이지 레이아웃 (프리뷰 포함)
│   ├── preview/                # 프리뷰 컴포넌트
│   │   └── PhonePreview.tsx
│   └── ui/                     # 공통 UI 컴포넌트 ⭐
│       ├── Badge/
│       ├── Button/
│       ├── Card/
│       ├── Input/
│       ├── PageHeader/
│       ├── Select/
│       ├── StatCard/
│       └── Toggle/
├── constants/
│   └── typography.ts           # 텍스트 스타일 상수
├── styles/
│   ├── theme.ts                # 디자인 토큰
│   ├── tokens.ts               # 색상, 간격 등
│   └── variants.ts             # 컴포넌트 variant 스타일
├── types/
│   └── ui.types.ts             # 공통 TypeScript 타입
└── page.tsx                    # 메인 페이지
```

### 📌 중요 규칙

- ✅ **공통 컴포넌트는 `app/components/ui/`에서만 사용**
- ✅ **기능별 컴포넌트는 `app/components/features/`에 생성**
- ✅ **스타일은 직접 작성하지 말고 공통 컴포넌트/상수 사용**
- ✅ **새로운 공통 컴포넌트가 필요하면 `ui/`에 추가**

---

## 🧩 공통 컴포넌트 사용법

### 1. PageHeader (페이지 헤더)

모든 페이지는 `PageHeader`로 시작합니다.

```tsx
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';

<PageHeader 
  title="페이지 제목"
  description="페이지에 대한 간단한 설명"
  action={
    <Button variant="primary" size="md">
      새로 만들기
    </Button>
  }
/>
```

**Props:**
- `title` (string, required): 페이지 제목
- `description` (string, required): 페이지 설명
- `action` (ReactNode, optional): 오른쪽에 표시할 액션 버튼

---

### 2. Button (버튼)

모든 버튼은 `Button` 컴포넌트를 사용합니다.

```tsx
import { Button } from '@/components/ui/Button';
import { FiPlus } from 'react-icons/fi';

// 기본 사용
<Button variant="primary" size="md">
  저장하기
</Button>

// 아이콘 포함
<Button variant="primary" icon={<FiPlus />}>
  추가하기
</Button>

// 전체 너비
<Button variant="primary" fullWidth>
  전체 너비 버튼
</Button>

// 다양한 variant
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="danger">Danger</Button>
<Button variant="ghost">Ghost</Button>
```

**Props:**
- `variant`: `'primary' | 'secondary' | 'danger' | 'ghost'` (기본: `'primary'`)
- `size`: `'sm' | 'md' | 'lg'` (기본: `'md'`)
- `fullWidth`: `boolean` (기본: `false`)
- `icon`: `ReactNode` (선택)
- `disabled`: `boolean`
- 기타 HTML button 속성 지원

---

### 3. Card (카드)

콘텐츠를 감싸는 카드 컨테이너입니다.

```tsx
import { Card, CardHeader, CardBody } from '@/components/ui/Card';

<Card hover padding="md">
  <CardHeader>
    <h3>카드 제목</h3>
  </CardHeader>
  <CardBody>
    <p>카드 내용</p>
  </CardBody>
</Card>
```

**Props:**
- `hover`: `boolean` - 호버 시 그림자 효과 (기본: `false`)
- `padding`: `'sm' | 'md' | 'lg'` (기본: `'md'`)
- `className`: 추가 클래스명

---

### 4. Badge (배지)

카테고리, 상태 등을 표시합니다.

```tsx
import { Badge } from '@/components/ui/Badge';

<Badge variant="default">기본</Badge>
<Badge variant="success">성공</Badge>
<Badge variant="warning">경고</Badge>
<Badge variant="error">에러</Badge>
<Badge variant="info">정보</Badge>
```

**Props:**
- `variant`: `'default' | 'success' | 'warning' | 'error' | 'info'`

---

### 5. Input (입력 필드)

```tsx
import { Input, SearchInput } from '@/components/ui/Input';

// 기본 입력
<Input 
  type="text"
  placeholder="입력하세요"
  size="md"
/>

// 검색 입력
<SearchInput 
  placeholder="검색..."
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
/>
```

**Props:**
- `size`: `'sm' | 'md' | 'lg'` (기본: `'md'`)
- 기타 HTML input 속성 지원

---

### 6. Select (드롭다운)

```tsx
import { Select } from '@/components/ui/Select';

<Select
  value={selectedValue}
  onChange={(e) => setSelectedValue(e.target.value)}
  size="md"
>
  <option value="">선택하세요</option>
  <option value="1">옵션 1</option>
  <option value="2">옵션 2</option>
</Select>
```

---

### 7. Toggle (토글 스위치)

```tsx
import { Toggle } from '@/components/ui/Toggle';

<Toggle
  checked={isEnabled}
  onChange={(checked) => setIsEnabled(checked)}
  size="md"
/>
```

---

### 8. StatCard (통계 카드)

```tsx
import { StatCard } from '@/components/ui/StatCard';

<StatCard
  title="총 구독"
  value="42"
  change="+12%"
  trend="up"
/>
```

---

## 🎨 디자인 시스템

### 타이포그래피

**직접 스타일을 작성하지 말고 `typography` 상수를 사용하세요.**

```tsx
import { typography } from '@/constants/typography';

// ❌ 나쁜 예
<h2 className="text-3xl font-bold text-gray-900">제목</h2>

// ✅ 좋은 예
<h2 className={typography.pageTitle.className}>제목</h2>
<p className={typography.pageDescription.className}>설명</p>
```

**사용 가능한 타이포그래피:**
- `typography.pageTitle` - 페이지 제목
- `typography.pageDescription` - 페이지 설명
- `typography.cardTitle` - 카드 제목
- `typography.cardDescription` - 카드 설명
- `typography.body` - 본문
- `typography.small` - 작은 텍스트
- `typography.statNumber` - 통계 숫자

---

### 색상

**직접 색상 코드를 작성하지 말고 Tailwind 클래스를 사용하세요.**

```tsx
// ❌ 나쁜 예
<div className="bg-[#3B82F6] text-white">...</div>

// ✅ 좋은 예
<div className="bg-blue-600 text-white dark:bg-blue-700 dark:text-white">...</div>
```

**주요 색상:**
- Primary: `blue-600`, `blue-700`
- Secondary: `gray-100`, `gray-200`
- Danger: `red-600`, `red-700`
- Success: `green-600`, `green-700`
- Warning: `yellow-600`, `yellow-700`

**다크 모드 지원:**
모든 색상은 `dark:` 접두사를 사용하여 다크 모드를 지원합니다.

---

### 간격 (Spacing)

Tailwind의 간격 시스템을 사용합니다:
- `p-4`, `p-6`, `p-8` (padding)
- `m-4`, `m-6`, `m-8` (margin)
- `gap-4`, `gap-6`, `gap-8` (gap)

---

## 🚀 새 페이지/기능 추가 가이드

### Step 1: 디렉토리 구조 생성

새로운 기능을 추가할 때는 `app/components/features/` 아래에 폴더를 만듭니다.

```
app/components/features/
└── YourNewFeature/
    ├── YourNewFeature.tsx
    └── index.ts
```

### Step 2: 컴포넌트 작성

```tsx
'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { typography } from '@/constants/typography';

export const YourNewFeature = () => {
  const [state, setState] = useState('');

  return (
    <>
      <PageHeader 
        title="새 기능"
        description="이 기능에 대한 설명"
        action={
          <Button variant="primary">
            새로 만들기
          </Button>
        }
      />

      <Card hover>
        <h3 className={typography.cardTitle.className}>카드 제목</h3>
        <p className={typography.cardDescription.className}>카드 설명</p>
        {/* 내용 */}
      </Card>
    </>
  );
};
```

### Step 3: Export 파일 생성

`index.ts`:
```tsx
export { YourNewFeature } from './YourNewFeature';
```

### Step 4: page.tsx에 추가

```tsx
import { YourNewFeature } from './components/features/YourNewFeature';
import { PageLayout } from './components/layout';

// renderContent 함수 내부
case 'your-feature':
  return (
    <PageLayout>
      <YourNewFeature />
    </PageLayout>
  );
```

---

## 📝 코드 스타일 가이드

### 1. 컴포넌트 구조

```tsx
'use client';  // 클라이언트 컴포넌트인 경우

// 1. React imports
import { useState, useEffect } from 'react';

// 2. 외부 라이브러리 imports
import { FiPlus } from 'react-icons/fi';

// 3. 공통 컴포넌트 imports
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

// 4. 상수/타입 imports
import { typography } from '@/constants/typography';
import { YourType } from '@/types/ui.types';

// 5. 컴포넌트 정의
export const YourComponent = () => {
  // State
  const [state, setState] = useState('');

  // Effects
  useEffect(() => {
    // ...
  }, []);

  // Handlers
  const handleClick = () => {
    // ...
  };

  // Render
  return (
    <>
      <PageHeader title="..." description="..." />
      {/* 내용 */}
    </>
  );
};
```

### 2. 네이밍 규칙

- **컴포넌트**: PascalCase (`YourComponent`)
- **파일명**: 컴포넌트명과 동일 (`YourComponent.tsx`)
- **함수/변수**: camelCase (`handleClick`, `userName`)
- **상수**: UPPER_SNAKE_CASE (`MAX_COUNT`)
- **타입/인터페이스**: PascalCase (`UserData`, `ButtonProps`)

### 3. Props 타입 정의

```tsx
// ✅ 좋은 예
interface YourComponentProps {
  title: string;
  description?: string;
  onAction?: () => void;
}

export const YourComponent = ({ 
  title, 
  description = '', 
  onAction 
}: YourComponentProps) => {
  // ...
};
```

### 4. 조건부 렌더링

```tsx
// ✅ 좋은 예
{isVisible && <Component />}
{items.length > 0 ? <List items={items} /> : <EmptyState />}
```

---

## 🏗️ 디자인 패턴

### 1. 레이아웃 패턴

모든 페이지는 다음 구조를 따릅니다:

```tsx
<DashboardLayout>
  <PageLayout>
    <PageHeader title="..." description="..." />
    <Card>
      {/* 페이지 내용 */}
    </Card>
  </PageLayout>
</DashboardLayout>
```

### 2. 상태 관리 패턴

- **로컬 상태**: `useState` 사용
- **서버 상태**: 추후 TanStack Query 도입 예정
- **전역 상태**: 추후 Zustand 도입 예정

### 3. 데이터 페칭 패턴

```tsx
const [data, setData] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/data');
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };
  
  fetchData();
}, []);
```

### 4. 폼 처리 패턴

```tsx
const [formData, setFormData] = useState({
  name: '',
  email: '',
});

const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setFormData(prev => ({
    ...prev,
    [e.target.name]: e.target.value,
  }));
};

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  // 제출 로직
};
```

---

## ✅ 체크리스트

새로운 기능을 추가할 때 다음을 확인하세요:

- [ ] `PageHeader`를 사용했는가?
- [ ] 공통 컴포넌트(`Button`, `Card`, `Badge` 등)를 사용했는가?
- [ ] 직접 스타일을 작성하지 않고 `typography` 상수를 사용했는가?
- [ ] `PageLayout`으로 감쌌는가?
- [ ] 다크 모드를 지원하는가? (`dark:` 클래스 사용)
- [ ] TypeScript 타입을 정의했는가?
- [ ] `index.ts` 파일을 생성했는가?
- [ ] 컴포넌트가 `app/components/features/` 아래에 올바르게 위치하는가?

---

## 📚 참고 자료

- **공통 컴포넌트**: `app/components/ui/`
- **타이포그래피**: `app/constants/typography.ts`
- **스타일 variants**: `app/styles/variants.ts`
- **타입 정의**: `app/types/ui.types.ts`
- **기존 예제**: `app/components/features/FeatureList/FeatureList.tsx`

---

## 🆘 문제 해결

### Q: 공통 컴포넌트가 필요한데 없어요.
**A**: `app/components/ui/`에 새 컴포넌트를 추가하세요. 기존 컴포넌트를 참고하여 동일한 패턴을 따르세요.

### Q: 스타일이 일치하지 않아요.
**A**: 직접 스타일을 작성하지 말고 공통 컴포넌트나 `typography` 상수를 사용하세요.

### Q: 다크 모드가 작동하지 않아요.
**A**: 모든 색상 클래스에 `dark:` 접두사를 추가했는지 확인하세요.

---

## 🔗 관련 문서

- **빠른 시작**: `QUICK_START.md` - 개발 서버 실행/종료
- **개발 서버 가이드**: `DEVELOPMENT_SERVER_GUIDE.md` - 상세 가이드
- **Firebase 환경 변수 설정**: `FIREBASE_ENV_SETUP.md`
- **Firebase 인증 설정**: `FIREBASE_AUTH_SETUP.md`

---

**마지막 업데이트**: 2025-01-27  
**버전**: 1.0.0

