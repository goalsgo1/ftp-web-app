# 🔍 중복 코드 분석 보고서

> **분석 일자**: 2025-01-27  
> **프로젝트명**: PushHub (MY-DASHBOARD)  
> **분석 범위**: 전체 프로젝트

---

## 📋 목차

1. [중복 코드 유형별 분석](#중복-코드-유형별-분석)
2. [중복 코드 상세 목록](#중복-코드-상세-목록)
3. [리팩토링 권장 사항](#리팩토링-권장-사항)
4. [예상 개선 효과](#예상-개선-효과)

---

## 🔴 중복 코드 유형별 분석

### 1. 알림 통계 로드 로직 (심각)

**중복 위치:**
- `app/components/features/FeatureList/FeatureList.tsx` (라인 300-322, 458-480, 233-255)
- `app/components/features/SubscriptionManagement/SubscriptionManagement.tsx` (라인 65-87, 112-134)

**중복 코드:**
```typescript
// 동일한 패턴이 4곳에서 반복됨
const stats: Record<string, { total: number; active: number; inactive: number }> = {};
for (const feature of features) {
  if (feature.url?.startsWith('/features/world-clock') && feature.id && feature.createdBy) {
    try {
      const creatorSettings = await getCreatorSettings(feature.id, feature.createdBy);
      if (creatorSettings && creatorSettings.notifications?.alerts) {
        const alerts = creatorSettings.notifications.alerts;
        stats[feature.id] = {
          total: alerts.length,
          active: alerts.filter(a => a.active !== false).length,
          inactive: alerts.filter(a => a.active === false).length,
        };
      } else {
        stats[feature.id] = { total: 0, active: 0, inactive: 0 };
      }
    } catch (error) {
      console.error(`알림 통계 로드 실패 (${feature.id}):`, error);
      stats[feature.id] = { total: 0, active: 0, inactive: 0 };
    }
  }
}
```

**문제점:**
- 동일한 로직이 4곳에서 반복됨
- 수정 시 여러 파일을 동시에 수정해야 함
- 버그 발생 시 여러 곳에서 수정 필요

**해결 방안:**
- `app/lib/utils/notificationStats.ts` 유틸리티 함수 생성

---

### 2. 카드 확장/축소 로직 (중간)

**중복 위치:**
- `app/components/features/FeatureList/FeatureList.tsx` (라인 135-161, 797-811, 483-497)
- `app/components/features/SubscriptionManagement/SubscriptionManagement.tsx` (라인 140-158, 483-497)

**중복 코드:**
```typescript
// 외부 클릭 감지 로직
useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    if (expandedCardId) {
      const cardElement = cardRefs.current[expandedCardId];
      if (cardElement && !cardElement.contains(event.target as Node)) {
        setExpandedCardId(null);
      }
    }
  };

  if (expandedCardId) {
    document.addEventListener('mousedown', handleClickOutside);
  }

  return () => {
    document.removeEventListener('mousedown', handleClickOutside);
  };
}, [expandedCardId]);
```

**문제점:**
- 동일한 외부 클릭 감지 로직이 반복됨
- 카드 확장/축소 버튼 UI도 중복

**해결 방안:**
- `app/hooks/useClickOutside.ts` 커스텀 훅 생성
- `app/components/ui/ExpandableCard/ExpandableCard.tsx` 컴포넌트 생성

---

### 3. URL 파라미터 처리 로직 (중간)

**중복 위치:**
- `app/components/features/FeatureList/FeatureList.tsx` (라인 750-787, 954-992)
- `app/components/features/SubscriptionManagement/SubscriptionManagement.tsx` (라인 444-473)

**중복 코드:**
```typescript
// 내부 기능 URL 처리
if (feature.url?.startsWith('/features/')) {
  const [path, queryString] = feature.url.split('?');
  const params = new URLSearchParams(queryString || '');
  
  if (feature.id) {
    params.set('featureId', feature.id);
  }
  
  if (currentUserId) {
    params.set('userId', currentUserId);
  }
  
  const newQueryString = params.toString();
  const targetUrl = newQueryString ? `${path}?${newQueryString}` : path;
  
  if (openInNewTab) {
    window.open(targetUrl, '_blank');
  } else {
    window.location.href = targetUrl;
  }
} else {
  // 외부 URL 처리
  if (openInNewTab) {
    window.open(feature.url, '_blank');
  } else {
    window.location.href = feature.url || '#';
  }
}
```

**문제점:**
- 동일한 URL 처리 로직이 3곳에서 반복됨
- Ctrl+Click 처리도 중복

**해결 방안:**
- `app/lib/utils/featureNavigation.ts` 유틸리티 함수 생성

---

### 4. Toast 메시지 생성 패턴 (경미)

**중복 위치:**
- `app/components/features/FeatureList/FeatureList.tsx` (라인 363-411)
- `app/components/features/SubscriptionManagement/SubscriptionManagement.tsx` (라인 167-180, 194-208)
- `app/components/features/NotificationSettings/NotificationSettings.tsx` (라인 146-177)

**중복 코드:**
```typescript
// Toast 메시지 생성 패턴
setToasts(prev => [...prev, {
  id: Date.now().toString(),
  message: '메시지 내용',
  type: 'success' | 'error',
  duration: 2000,
}]);
```

**문제점:**
- Toast 생성 로직이 반복됨
- ID 생성 방식이 일관되지 않음

**해결 방안:**
- `app/hooks/useToast.ts` 커스텀 훅 생성

---

### 5. 로딩/에러 상태 표시 (경미)

**중복 위치:**
- `app/components/features/FeatureList/FeatureList.tsx` (라인 587-600)
- `app/components/features/SubscriptionManagement/SubscriptionManagement.tsx` (라인 308-321)
- `app/components/features/NotificationSettings/NotificationSettings.tsx` (부분적)

**중복 코드:**
```typescript
{/* 로딩 상태 */}
{isLoading && (
  <div className="text-center py-12">
    <p className="text-gray-500 dark:text-gray-400">
      로딩 메시지...
    </p>
  </div>
)}

{/* 에러 상태 */}
{error && !isLoading && (
  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg">
    {error}
  </div>
)}
```

**문제점:**
- 동일한 로딩/에러 UI가 반복됨

**해결 방안:**
- `app/components/ui/LoadingState/LoadingState.tsx` 컴포넌트 생성
- `app/components/ui/ErrorState/ErrorState.tsx` 컴포넌트 생성

---

### 6. Badge 스타일 중복 (경미)

**중복 위치:**
- `app/components/features/FeatureList/FeatureList.tsx` (라인 680-690, 885-893)
- `app/components/features/SubscriptionManagement/SubscriptionManagement.tsx` (라인 353-364)

**중복 코드:**
```typescript
{/* 내부 기능 Badge */}
{feature.url?.startsWith('/features/') ? (
  <Badge variant="default" className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-700">
    내부 기능
  </Badge>
) : feature.url ? (
  <Badge variant="default" className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-700">
    외부 URL
  </Badge>
) : null}
```

**문제점:**
- 동일한 Badge 스타일이 반복됨
- 카테고리 Badge도 유사한 패턴

**해결 방안:**
- `app/components/ui/Badge/FeatureTypeBadge.tsx` 컴포넌트 생성
- Badge variant 확장

---

### 7. 알림 통계 표시 UI (중간)

**중복 위치:**
- `app/components/features/FeatureList/FeatureList.tsx` (라인 722-737, 927-941)
- `app/components/features/SubscriptionManagement/SubscriptionManagement.tsx` (라인 414-429)

**중복 코드:**
```typescript
{/* 세계시간 기능의 알림 통계 표시 */}
{feature.url?.startsWith('/features/world-clock') && feature.id && notificationStats[feature.id] && (
  <div className="flex items-center gap-3 text-xs bg-gray-50 dark:bg-gray-800/50 rounded-lg px-3 py-2">
    <span className="flex items-center gap-1.5 cursor-help" title="전체 알림">
      <FiBell size={14} className="text-blue-500" />
      <span className="font-semibold text-blue-600 dark:text-blue-400">{notificationStats[feature.id].total}</span>
    </span>
    <span className="flex items-center gap-1.5 cursor-help" title="활성 알림">
      <FiCheckCircle size={14} className="text-green-500" />
      <span className="font-semibold text-green-600 dark:text-green-400">{notificationStats[feature.id].active}</span>
    </span>
    <span className="flex items-center gap-1.5 cursor-help" title="비활성 알림">
      <FiClock size={14} className="text-gray-500" />
      <span className="font-semibold text-gray-600 dark:text-gray-400">{notificationStats[feature.id].inactive}</span>
    </span>
  </div>
)}
```

**문제점:**
- 동일한 알림 통계 UI가 반복됨

**해결 방안:**
- `app/components/ui/NotificationStats/NotificationStats.tsx` 컴포넌트 생성

---

### 8. 빈 목록 상태 표시 (경미)

**중복 위치:**
- `app/components/features/FeatureList/FeatureList.tsx` (라인 1010-1027)
- `app/components/features/SubscriptionManagement/SubscriptionManagement.tsx` (라인 507-524)
- `app/components/features/NotificationHistory/NotificationHistory.tsx` (라인 163-172)

**중복 코드:**
```typescript
{/* 빈 목록 상태 */}
{!isLoading && !error && items.length === 0 && (
  <div className="text-center py-12">
    <p className="text-gray-500 dark:text-gray-400 mb-4">
      메시지...
    </p>
    {actionButton && (
      <Button variant="primary" onClick={onAction}>
        액션 버튼
      </Button>
    )}
  </div>
)}
```

**문제점:**
- 빈 목록 UI가 반복됨

**해결 방안:**
- `app/components/ui/EmptyState/EmptyState.tsx` 컴포넌트 생성

---

### 9. 검색 및 필터 UI (경미)

**중복 위치:**
- `app/components/features/FeatureList/FeatureList.tsx` (라인 530-584)
- `app/components/features/SubscriptionManagement/SubscriptionManagement.tsx` (라인 286-305)

**중복 코드:**
```typescript
{/* 검색 및 필터 */}
<div className="flex flex-col sm:flex-row gap-4">
  <div className="flex-1">
    <SearchInput
      placeholder="검색..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
    />
  </div>
  <Select
    value={filterCategory}
    onChange={(e) => setFilterCategory(e.target.value)}
  >
    {categories.map(cat => (
      <option key={cat} value={cat}>
        {cat === 'all' ? '전체 카테고리' : cat}
      </option>
    ))}
  </Select>
</div>
```

**문제점:**
- 검색/필터 UI가 반복됨

**해결 방안:**
- `app/components/ui/SearchAndFilter/SearchAndFilter.tsx` 컴포넌트 생성

---

### 10. 날짜 포맷팅 로직 (경미)

**중복 위치:**
- `app/components/features/SubscriptionManagement/SubscriptionManagement.tsx` (라인 378-386)
- `app/components/features/NotificationHistory/NotificationHistory.tsx` (라인 63-79)

**중복 코드:**
```typescript
// 날짜 포맷팅
const formatTime = (date: Date) => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return '방금 전';
  if (minutes < 60) return `${minutes}분 전`;
  if (hours < 24) return `${hours}시간 전`;
  if (days < 7) return `${days}일 전`;
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
};
```

**문제점:**
- 날짜 포맷팅 로직이 중복됨

**해결 방안:**
- `app/lib/utils/dateFormat.ts` 유틸리티 함수 생성 (date-fns 활용)

---

## 📊 중복 코드 통계

| 유형 | 심각도 | 중복 횟수 | 예상 리팩토링 시간 |
|------|--------|----------|------------------|
| 알림 통계 로드 로직 | 🔴 심각 | 4회 | 2시간 |
| 카드 확장/축소 로직 | 🟡 중간 | 2회 | 1.5시간 |
| URL 파라미터 처리 | 🟡 중간 | 3회 | 1시간 |
| 알림 통계 표시 UI | 🟡 중간 | 2회 | 1시간 |
| Toast 메시지 생성 | 🟢 경미 | 3회 | 0.5시간 |
| 로딩/에러 상태 | 🟢 경미 | 3회 | 1시간 |
| Badge 스타일 | 🟢 경미 | 2회 | 0.5시간 |
| 빈 목록 상태 | 🟢 경미 | 3회 | 0.5시간 |
| 검색/필터 UI | 🟢 경미 | 2회 | 0.5시간 |
| 날짜 포맷팅 | 🟢 경미 | 2회 | 0.5시간 |

**총 예상 리팩토링 시간**: 약 9시간

---

## 🔧 리팩토링 권장 사항

### 우선순위 1: 알림 통계 로드 로직 통합

**생성할 파일:**
```typescript
// app/lib/utils/notificationStats.ts
export const loadNotificationStats = async (
  features: Feature[]
): Promise<Record<string, { total: number; active: number; inactive: number }>> => {
  const stats: Record<string, { total: number; active: number; inactive: number }> = {};
  
  for (const feature of features) {
    if (feature.url?.startsWith('/features/world-clock') && feature.id && feature.createdBy) {
      try {
        const creatorSettings = await getCreatorSettings(feature.id, feature.createdBy);
        if (creatorSettings && creatorSettings.notifications?.alerts) {
          const alerts = creatorSettings.notifications.alerts;
          stats[feature.id] = {
            total: alerts.length,
            active: alerts.filter(a => a.active !== false).length,
            inactive: alerts.filter(a => a.active === false).length,
          };
        } else {
          stats[feature.id] = { total: 0, active: 0, inactive: 0 };
        }
      } catch (error) {
        console.error(`알림 통계 로드 실패 (${feature.id}):`, error);
        stats[feature.id] = { total: 0, active: 0, inactive: 0 };
      }
    }
  }
  
  return stats;
};
```

---

### 우선순위 2: 커스텀 훅 생성

**생성할 파일:**
```typescript
// app/hooks/useClickOutside.ts
export const useClickOutside = (
  ref: React.RefObject<HTMLElement>,
  handler: () => void
) => {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        handler();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref, handler]);
};

// app/hooks/useToast.ts
export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: 'success' | 'error' | 'info', duration = 2000) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, message, type, duration }]);
  };

  const closeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return { toasts, showToast, closeToast };
};
```

---

### 우선순위 3: 공통 컴포넌트 생성

**생성할 파일:**
```typescript
// app/components/ui/NotificationStats/NotificationStats.tsx
interface NotificationStatsProps {
  stats: { total: number; active: number; inactive: number };
}

export const NotificationStats = ({ stats }: NotificationStatsProps) => {
  return (
    <div className="flex items-center gap-3 text-xs bg-gray-50 dark:bg-gray-800/50 rounded-lg px-3 py-2">
      <span className="flex items-center gap-1.5 cursor-help" title="전체 알림">
        <FiBell size={14} className="text-blue-500" />
        <span className="font-semibold text-blue-600 dark:text-blue-400">{stats.total}</span>
      </span>
      <span className="flex items-center gap-1.5 cursor-help" title="활성 알림">
        <FiCheckCircle size={14} className="text-green-500" />
        <span className="font-semibold text-green-600 dark:text-green-400">{stats.active}</span>
      </span>
      <span className="flex items-center gap-1.5 cursor-help" title="비활성 알림">
        <FiClock size={14} className="text-gray-500" />
        <span className="font-semibold text-gray-600 dark:text-gray-400">{stats.inactive}</span>
      </span>
    </div>
  );
};

// app/components/ui/EmptyState/EmptyState.tsx
interface EmptyStateProps {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState = ({ message, actionLabel, onAction, icon }: EmptyStateProps) => {
  return (
    <div className="text-center py-12">
      {icon && <div className="mb-4">{icon}</div>}
      <p className="text-gray-500 dark:text-gray-400 mb-4">{message}</p>
      {actionLabel && onAction && (
        <Button variant="primary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
```

---

## 📈 예상 개선 효과

### 코드 감소
- **Before**: 중복 코드 약 500줄
- **After**: 공통 함수/컴포넌트 약 200줄
- **감소율**: 약 60% (순 감소 300줄)

### 유지보수 시간
- **Before**: 수정 시 4-5개 파일 동시 수정 (약 30분)
- **After**: 1개 파일만 수정 (약 5분)
- **시간 절감**: 약 83%

### 버그 발생 위험
- **Before**: 여러 곳에서 동일한 버그 발생 가능
- **After**: 한 곳에서만 수정하면 전체 적용

### 일관성
- **Before**: 수동으로 일관성 유지
- **After**: 자동으로 일관성 보장

---

## ✅ 리팩토링 체크리스트

### Phase 1: 유틸리티 함수 통합 (우선순위 높음)
- [ ] `app/lib/utils/notificationStats.ts` 생성
- [ ] `app/lib/utils/featureNavigation.ts` 생성
- [ ] `app/lib/utils/dateFormat.ts` 생성
- [ ] FeatureList에서 중복 코드 제거
- [ ] SubscriptionManagement에서 중복 코드 제거

### Phase 2: 커스텀 훅 생성
- [ ] `app/hooks/useClickOutside.ts` 생성
- [ ] `app/hooks/useToast.ts` 생성
- [ ] 모든 컴포넌트에서 적용

### Phase 3: 공통 컴포넌트 생성
- [ ] `app/components/ui/NotificationStats/NotificationStats.tsx` 생성
- [ ] `app/components/ui/EmptyState/EmptyState.tsx` 생성
- [ ] `app/components/ui/LoadingState/LoadingState.tsx` 생성
- [ ] `app/components/ui/ErrorState/ErrorState.tsx` 생성
- [ ] `app/components/ui/FeatureTypeBadge/FeatureTypeBadge.tsx` 생성

### Phase 4: 검증
- [ ] 모든 기능 동작 확인
- [ ] 스타일 일관성 확인
- [ ] 성능 테스트
- [ ] 코드 리뷰

---

## 📝 참고 사항

1. **점진적 리팩토링**: 한 번에 모든 중복을 제거하지 말고 단계적으로 진행
2. **테스트**: 리팩토링 후 반드시 기능 테스트 수행
3. **문서화**: 새로 생성한 유틸리티/컴포넌트는 사용법 문서화
4. **타입 안정성**: TypeScript 타입 정의 명확히 작성

---

**작성일**: 2025-01-27  
**버전**: 1.0  
**작성자**: AI Assistant

