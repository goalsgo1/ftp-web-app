# 🎯 프로젝트 개선 작업 프롬프트

> **Cursor AI를 사용하여 작업할 때 이 프롬프트를 복사하여 사용하세요.**

---

## 🔴 최우선 작업 (High Priority)

### 1. 구독 관리 기능 구현 (Firestore 연동)

**현재 상태**: 
- `SubscriptionManagement.tsx` 컴포넌트는 UI만 존재
- 실제 구독/구독 취소 로직이 없음
- Firestore에 구독 데이터 저장 안 됨

**작업 내용**:

```
@PROJECT_ANALYSIS.md @SubscriptionManagement.tsx @features.ts

구독 관리 기능을 완전히 구현해줘.

1. Firestore에 구독 데이터 구조 설계
   - 컬렉션: 'subscriptions'
   - 문서 구조:
     {
       userId: string,
       featureId: string,
       subscribedAt: Timestamp,
       notificationEnabled: boolean
     }
   - 인덱스: userId, featureId 복합 인덱스

2. app/lib/firebase/subscriptions.ts 파일 생성
   - subscribeToFeature(userId, featureId): Promise<void>
   - unsubscribeFromFeature(userId, featureId): Promise<void>
   - getUserSubscriptions(userId): Promise<Subscription[]>
   - isSubscribed(userId, featureId): Promise<boolean>
   - toggleNotification(userId, featureId, enabled): Promise<void>
   - subscribeUserSubscriptions(userId, callback): Unsubscribe (실시간 리스너)

3. SubscriptionManagement.tsx 수정
   - getUserSubscriptions로 구독 목록 가져오기
   - subscribeToFeature/unsubscribeFromFeature 연동
   - toggleNotification 연동
   - 실시간 동기화 (onSnapshot)
   - 로딩 상태 및 에러 처리 추가
   - 빈 상태 UI 추가

4. FeatureList.tsx의 "구독하기/구독취소" 버튼 연동
   - 현재는 UI만 있고 실제 동작 안 함
   - subscribeToFeature/unsubscribeFromFeature 호출
   - 구독 상태 실시간 업데이트

5. 타입 정의 추가
   - app/types/subscriptions.ts 생성
   - Subscription 인터페이스 정의

공통 컴포넌트와 디자인 시스템을 사용하고, 에러 처리는 한국어 메시지로 표시해줘.
```

---

### 2. 알림 설정 저장 로직 구현

**현재 상태**:
- `NotificationSettings.tsx` 컴포넌트는 UI만 존재
- 실제 알림 설정 저장 로직이 없음
- Firestore에 알림 설정 저장 안 됨

**작업 내용**:

```
@PROJECT_ANALYSIS.md @NotificationSettings.tsx @features.ts

알림 설정 기능을 완전히 구현해줘.

1. Firestore에 알림 설정 데이터 구조 설계
   - 컬렉션: 'notificationSettings'
   - 문서 구조:
     {
       userId: string,
       featureId: string,
       enabled: boolean,
       quietHours?: {
         enabled: boolean,
         start: string, // "09:00"
         end: string    // "18:00"
       },
       soundEnabled: boolean,
       vibrationEnabled: boolean,
       updatedAt: Timestamp
     }
   - 인덱스: userId, featureId 복합 인덱스

2. app/lib/firebase/notificationSettings.ts 파일 생성
   - saveNotificationSettings(userId, featureId, settings): Promise<void>
   - getNotificationSettings(userId, featureId): Promise<NotificationSettings | null>
   - getUserAllNotificationSettings(userId): Promise<NotificationSettings[]>
   - subscribeNotificationSettings(userId, featureId, callback): Unsubscribe (실시간 리스너)

3. NotificationSettings.tsx 수정
   - getNotificationSettings로 설정 가져오기
   - saveNotificationSettings로 설정 저장
   - 실시간 동기화 (onSnapshot)
   - 로딩 상태 및 에러 처리 추가
   - 각 설정 항목별 토글 기능 구현
   - 조용한 시간대 설정 UI 및 로직 추가

4. FeatureList.tsx의 알림 상태 표시 연동
   - notificationSettings에서 enabled 상태 확인
   - "알림: 활성화/비활성화" 표시 업데이트

5. 타입 정의 추가
   - app/types/notificationSettings.ts 생성
   - NotificationSettings 인터페이스 정의

공통 컴포넌트(Toggle, Card, Button 등)를 사용하고, 에러 처리는 한국어 메시지로 표시해줘.
```

---

## ⚠️ 중간 우선순위 작업 (Medium Priority)

### 3. 상태 관리 라이브러리 도입 (Zustand 활용)

**현재 상태**:
- Zustand가 설치되어 있으나 미사용
- 각 컴포넌트에서 useState로 로컬 상태 관리
- 전역 상태 공유 어려움

**작업 내용**:

```
@PROJECT_ANALYSIS.md @package.json

Zustand를 사용하여 전역 상태 관리를 구현해줘.

1. app/store/ 디렉토리 생성 및 스토어 구조 설계
   - authStore.ts: 인증 상태 관리
   - featuresStore.ts: 기능 목록 상태 관리
   - subscriptionsStore.ts: 구독 상태 관리
   - notificationSettingsStore.ts: 알림 설정 상태 관리

2. authStore.ts 구현
   - user: User | null
   - isLoading: boolean
   - setUser(user: User | null): void
   - clearUser(): void
   - onAuthChange 리스너 통합

3. featuresStore.ts 구현
   - features: Feature[]
   - isLoading: boolean
   - error: string | null
   - loadFeatures(): Promise<void>
   - addFeature(feature): Promise<void>
   - updateFeature(id, feature): Promise<void>
   - deleteFeature(id): Promise<void>
   - getFeatureById(id): Feature | undefined

4. subscriptionsStore.ts 구현
   - subscriptions: Subscription[]
   - isLoading: boolean
   - subscribeToFeature(featureId): Promise<void>
   - unsubscribeFromFeature(featureId): Promise<void>
   - toggleNotification(featureId, enabled): Promise<void>
   - isSubscribed(featureId): boolean

5. notificationSettingsStore.ts 구현
   - settings: Record<string, NotificationSettings>
   - isLoading: boolean
   - getSettings(featureId): NotificationSettings | null
   - saveSettings(featureId, settings): Promise<void>
   - toggleEnabled(featureId, enabled): Promise<void>

6. 기존 컴포넌트 마이그레이션
   - DashboardLayout.tsx: authStore 사용
   - FeatureList.tsx: featuresStore, subscriptionsStore 사용
   - SubscriptionManagement.tsx: subscriptionsStore 사용
   - NotificationSettings.tsx: notificationSettingsStore 사용
   - world-clock/page.tsx: 필요한 스토어 사용

7. 실시간 동기화 통합
   - 각 스토어에 onSnapshot 리스너 통합
   - 컴포넌트 언마운트 시 자동 정리

주의사항:
- 기존 useState 로직을 점진적으로 마이그레이션
- 타입 안정성 유지
- 에러 처리 추가
- 로딩 상태 관리
```

---

### 4. 컴포넌트 분리 (큰 파일들 분리)

**현재 상태**:
- FeatureList.tsx: 634줄 (너무 큼)
- world-clock/page.tsx: 1349줄 (매우 큼)
- 유지보수 어려움

**작업 내용**:

#### 4-1. FeatureList.tsx 분리

```
@PROJECT_ANALYSIS.md @FeatureList.tsx

FeatureList.tsx를 여러 작은 컴포넌트로 분리해줘.

1. FeatureList/ 디렉토리 구조 재구성
   - FeatureList.tsx (메인 컴포넌트, 200줄 이하)
   - FeatureCard.tsx (개별 카드 컴포넌트)
   - FeatureCardMenu.tsx (카드 메뉴 드롭다운)
   - FeatureCardExpanded.tsx (확장된 카드 뷰)
   - FeatureSearchBar.tsx (검색 및 필터)
   - FeatureStats.tsx (통계 카드)
   - hooks/useFeatureList.ts (비즈니스 로직 훅)
   - hooks/useFeatureFilters.ts (필터링 로직 훅)
   - hooks/useFeatureCard.ts (카드 상호작용 로직 훅)

2. 각 컴포넌트의 책임 분리
   - FeatureList: 전체 레이아웃 및 상태 관리
   - FeatureCard: 개별 카드 렌더링
   - FeatureCardMenu: 수정/삭제 메뉴
   - FeatureCardExpanded: 확장된 카드 내용
   - FeatureSearchBar: 검색 및 카테고리 필터
   - FeatureStats: 통계 표시

3. 커스텀 훅으로 로직 분리
   - useFeatureList: 기능 목록 로딩, CRUD 로직
   - useFeatureFilters: 검색어, 카테고리 필터링
   - useFeatureCard: 카드 확장/축소, 메뉴 열기/닫기

4. 타입 정의 분리
   - types/featureList.types.ts 생성

주의사항:
- 기존 기능 유지
- 공통 컴포넌트 사용 유지
- props 타입 명확히 정의
- 각 컴포넌트는 단일 책임 원칙 준수
```

#### 4-2. world-clock/page.tsx 분리

```
@PROJECT_ANALYSIS.md @world-clock/page.tsx

world-clock/page.tsx를 여러 작은 컴포넌트로 분리해줘.

1. world-clock/ 디렉토리 구조 재구성
   - page.tsx (메인 페이지, 200줄 이하)
   - components/
     - TimezoneSelector.tsx (시간대 선택 섹션)
     - TimezoneCard.tsx (개별 시간대 카드)
     - NotificationSettings.tsx (알림 설정 섹션)
     - NotificationAlertCard.tsx (개별 알림 카드)
     - NotificationStats.tsx (알림 통계)
   - hooks/
     - useWorldClock.ts (메인 로직 훅)
     - useTimezoneManagement.ts (시간대 관리)
     - useNotificationAlerts.ts (알림 관리)
     - useRealtimeSync.ts (실시간 동기화)
   - types/
     - worldClock.types.ts

2. 각 컴포넌트의 책임 분리
   - page.tsx: 레이아웃 및 라우팅
   - TimezoneSelector: 시간대 추가/제거 UI
   - TimezoneCard: 개별 시간대 표시
   - NotificationSettings: 알림 설정 섹션
   - NotificationAlertCard: 개별 알림 설정 카드
   - NotificationStats: 통계 표시

3. 커스텀 훅으로 로직 분리
   - useWorldClock: 메인 상태 관리 및 초기화
   - useTimezoneManagement: 시간대 추가/제거 로직
   - useNotificationAlerts: 알림 추가/수정/삭제 로직
   - useRealtimeSync: Firestore 실시간 동기화

4. 유틸리티 함수 분리
   - utils/timezoneHelpers.ts (시간대 관련 헬퍼)
   - utils/notificationHelpers.ts (알림 관련 헬퍼)

주의사항:
- 기존 기능 완전히 유지
- 실시간 동기화 로직 정확히 유지
- 접근 권한 제어 로직 유지
- 공통 컴포넌트 사용 유지
- 각 컴포넌트는 단일 책임 원칙 준수
```

---

## 📋 추가 개선 작업

### 5. 라우팅 통일 (선택사항)

**현재 상태**:
- 해시 라우팅 (`#features`)과 Next.js 라우팅 혼용
- 일관성 부족

**작업 내용**:

```
@PROJECT_ANALYSIS.md @page.tsx @DashboardLayout.tsx

라우팅 방식을 통일해줘. 두 가지 옵션 중 하나를 선택:

옵션 1: Next.js 라우팅으로 통일 (권장)
- /features → 기능 목록
- /subscriptions → 구독 관리
- /notifications → 알림 설정
- /history → 알림 히스토리
- 해시 라우팅 제거

옵션 2: 해시 라우팅 유지 (현재 방식)
- 명확한 가이드라인 문서화
- 일관된 사용 패턴 유지

어떤 옵션을 선택할지 결정하고, 선택한 방식으로 통일해줘.
```

---

## 🎯 작업 순서 권장사항

1. **1단계**: 구독 관리 기능 구현 (최우선)
2. **2단계**: 알림 설정 저장 로직 구현 (최우선)
3. **3단계**: 상태 관리 라이브러리 도입 (중간)
4. **4단계**: 컴포넌트 분리 (중간)
5. **5단계**: 라우팅 통일 (선택사항)

각 작업은 독립적으로 진행 가능하지만, 위 순서를 권장합니다.

---

## 📝 작업 시 주의사항

1. **공통 컴포넌트 사용**: 항상 `app/components/ui/`의 공통 컴포넌트 사용
2. **타입 안정성**: TypeScript 타입 명확히 정의
3. **에러 처리**: 한국어 에러 메시지 표시
4. **로딩 상태**: 모든 비동기 작업에 로딩 상태 추가
5. **실시간 동기화**: Firestore onSnapshot 활용
6. **접근 권한**: 생성자/공개/비공개 권한 체크 유지
7. **디자인 일관성**: 기존 디자인 시스템 유지

---

**작업 시작 전**: 각 프롬프트를 복사하여 Cursor AI에 붙여넣고, 관련 파일들을 @로 참조하여 작업을 시작하세요.

