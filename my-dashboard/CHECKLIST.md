# ✅ 프로젝트 개선 작업 체크리스트

> **각 항목을 하나씩 체크하면서 진행하세요. Cursor AI에 각 항목의 프롬프트를 복사하여 작업을 요청하세요.**

---

## 🔴 최우선 작업 (High Priority)

### 1. 구독 관리 기능 구현 (Firestore 연동)

#### 1-1. Firestore 데이터 구조 설계
- [ ] `subscriptions` 컬렉션 구조 설계 문서 작성
- [ ] 문서 구조 확인:
  ```typescript
  {
    userId: string,
    featureId: string,
    subscribedAt: Timestamp,
    notificationEnabled: boolean
  }
  ```
- [ ] Firebase Console에서 복합 인덱스 생성 (userId, featureId)

**프롬프트**:
```
@PROJECT_ANALYSIS.md @features.ts

Firestore에 구독 데이터 구조를 설계해줘.
- 컬렉션: 'subscriptions'
- 문서 구조: { userId, featureId, subscribedAt, notificationEnabled }
- 복합 인덱스 필요 여부 확인 및 생성 가이드 제공
```

---

#### 1-2. 타입 정의 생성
- [ ] `app/types/subscriptions.ts` 파일 생성
- [ ] `Subscription` 인터페이스 정의
- [ ] 관련 타입들 정의 (SubscriptionStatus 등)

**프롬프트**:
```
@PROJECT_ANALYSIS.md

app/types/subscriptions.ts 파일을 생성하고 구독 관련 타입들을 정의해줘.
- Subscription 인터페이스
- 필요한 모든 타입 정의
```

---

#### 1-3. Firebase 함수 구현
- [ ] `app/lib/firebase/subscriptions.ts` 파일 생성
- [ ] `subscribeToFeature(userId, featureId)` 함수 구현
- [ ] `unsubscribeFromFeature(userId, featureId)` 함수 구현
- [ ] `getUserSubscriptions(userId)` 함수 구현
- [ ] `isSubscribed(userId, featureId)` 함수 구현
- [ ] `toggleNotification(userId, featureId, enabled)` 함수 구현
- [ ] `subscribeUserSubscriptions(userId, callback)` 실시간 리스너 구현
- [ ] 에러 처리 추가 (한국어 메시지)

**프롬프트**:
```
@PROJECT_ANALYSIS.md @features.ts @app/lib/firebase/auth.ts

app/lib/firebase/subscriptions.ts 파일을 생성하고 구독 관련 Firebase 함수들을 구현해줘.

구현할 함수들:
1. subscribeToFeature(userId, featureId): Promise<void>
   - 구독 추가 (중복 체크 포함)
   
2. unsubscribeFromFeature(userId, featureId): Promise<void>
   - 구독 취소
   
3. getUserSubscriptions(userId): Promise<Subscription[]>
   - 사용자의 모든 구독 목록 가져오기
   - Feature 정보도 함께 가져오기 (join)
   
4. isSubscribed(userId, featureId): Promise<boolean>
   - 구독 여부 확인
   
5. toggleNotification(userId, featureId, enabled): Promise<void>
   - 알림 활성/비활성 토글
   
6. subscribeUserSubscriptions(userId, callback): Unsubscribe
   - 실시간 리스너 (onSnapshot)
   - 반환값: unsubscribe 함수

에러 처리는 한국어 메시지로 표시하고, 기존 features.ts의 패턴을 따라줘.
```

---

#### 1-4. SubscriptionManagement 컴포넌트 연동
- [ ] `getUserSubscriptions`로 구독 목록 가져오기
- [ ] `unsubscribeFromFeature` 연동
- [ ] `toggleNotification` 연동
- [ ] 실시간 동기화 (`subscribeUserSubscriptions`) 추가
- [ ] 로딩 상태 추가
- [ ] 에러 처리 추가
- [ ] 빈 상태 UI 개선
- [ ] 통계 카드 실시간 업데이트

**프롬프트**:
```
@PROJECT_ANALYSIS.md @SubscriptionManagement.tsx @app/lib/firebase/subscriptions.ts @app/lib/firebase/auth.ts

SubscriptionManagement.tsx를 수정하여 실제 구독 기능을 연동해줘.

1. mockSubscriptions 제거
2. getUserSubscriptions로 실제 데이터 가져오기
3. unsubscribeFromFeature로 구독 취소 기능 구현
4. toggleNotification으로 알림 토글 기능 구현
5. subscribeUserSubscriptions로 실시간 동기화 추가
6. 로딩 상태 추가 (isLoading state)
7. 에러 처리 추가 (에러 메시지 표시)
8. 빈 상태 UI 개선 (구독이 없을 때)
9. 통계 카드가 실시간으로 업데이트되도록 수정

기존 UI 구조는 유지하고, 공통 컴포넌트를 사용해줘.
```

---

#### 1-5. FeatureList 구독 버튼 연동
- [ ] `isSubscribed`로 구독 상태 확인
- [ ] `subscribeToFeature` 연동
- [ ] `unsubscribeFromFeature` 연동
- [ ] 구독 상태 실시간 업데이트
- [ ] 버튼 텍스트 동적 변경 ("구독하기" / "구독 취소")
- [ ] "구독 중" 배지 표시 연동

**프롬프트**:
```
@PROJECT_ANALYSIS.md @FeatureList.tsx @app/lib/firebase/subscriptions.ts @app/lib/firebase/auth.ts

FeatureList.tsx의 "구독하기/구독취소" 버튼을 실제 기능과 연동해줘.

1. 각 기능 카드에 대해 isSubscribed로 구독 상태 확인
2. "구독하기" 버튼 클릭 시 subscribeToFeature 호출
3. "구독 취소" 버튼 클릭 시 unsubscribeFromFeature 호출
4. 구독 상태 실시간 업데이트 (subscribeUserSubscriptions 사용)
5. 버튼 텍스트 동적 변경 ("구독하기" / "구독 취소")
6. "구독 중" 배지가 구독 상태에 따라 표시되도록 수정
7. 로딩 상태 추가 (버튼 비활성화)
8. 에러 처리 추가 (토스트 메시지)

기존 UI 구조는 유지하고, 공통 컴포넌트를 사용해줘.
```

**테스트 방법**:

1. **Firebase 인덱스 생성 (필수!)**
   
   ⚠️ **에러 발생 시**: 브라우저 콘솔에 표시된 Firebase Console 링크를 클릭하면 인덱스 생성 페이지로 자동 이동합니다.
   
   **수동 생성 방법**:
   - Firebase Console → Firestore Database → Indexes 탭 이동
   - "색인 추가" 버튼 클릭
   - 다음 인덱스 생성:
     - **컬렉션 ID**: `subscriptions`
     - **필드 추가**:
       1. `userId` (Ascending)
       2. `subscribedAt` (Descending)
     - "생성" 버튼 클릭
   - 인덱스 생성 완료까지 **몇 분 소요**될 수 있음 (상태가 "사용 설정됨"으로 변경될 때까지 대기)
   
   **참고**: `userId` + `featureId` 인덱스는 현재 사용하지 않으므로 생성하지 않아도 됩니다.

2. **기능 목록에서 구독 테스트**
   - 로그인 상태에서 대시보드 접속
   - "웹 기능 목록" 탭에서 기능 카드 확인
   - "구독하기" 버튼 클릭
   - 성공 토스트 메시지 확인 ("구독이 완료되었습니다")
   - 버튼이 "구독 취소"로 변경되는지 확인
   - "구독 중" 배지가 표시되는지 확인
   - 통계 카드의 "구독 중" 숫자가 증가하는지 확인

3. **구독 취소 테스트**
   - "구독 취소" 버튼 클릭
   - 성공 토스트 메시지 확인 ("구독이 취소되었습니다")
   - 버튼이 "구독하기"로 변경되는지 확인
   - "구독 중" 배지가 사라지는지 확인
   - 통계 카드의 "구독 중" 숫자가 감소하는지 확인

4. **구독 관리 페이지 테스트**
   - 사이드바에서 "구독 관리" 클릭
   - 구독한 기능들이 목록에 표시되는지 확인
   - 각 기능의 정보(이름, 설명, 카테고리, 구독일)가 올바르게 표시되는지 확인
   - 통계 카드(전체 구독, 알림 활성화, 알림 비활성화)가 올바르게 표시되는지 확인

5. **알림 토글 테스트**
   - 구독 관리 페이지에서 "알림 ON/OFF" 버튼 클릭
   - 성공 토스트 메시지 확인
   - 버튼 상태가 변경되는지 확인
   - 통계 카드의 "알림 활성화/비활성화" 숫자가 업데이트되는지 확인

6. **구독 취소 테스트 (구독 관리 페이지)**
   - 구독 관리 페이지에서 "구독 취소" 버튼 클릭
   - 확인 대화상자에서 확인
   - 성공 토스트 메시지 확인
   - 목록에서 해당 기능이 제거되는지 확인
   - 통계 카드가 업데이트되는지 확인

7. **실시간 동기화 테스트**
   - 브라우저 탭을 2개 열기 (같은 계정으로 로그인)
   - 탭 1에서 기능 구독
   - 탭 2에서 구독 관리 페이지 확인 → 구독한 기능이 자동으로 나타나는지 확인
   - 탭 2에서 구독 취소
   - 탭 1에서 기능 목록 확인 → "구독 중" 배지가 사라지고 버튼이 "구독하기"로 변경되는지 확인

8. **에러 케이스 테스트**
   - 로그인하지 않은 상태에서 "구독하기" 버튼 클릭
   - 에러 토스트 메시지 확인 ("로그인이 필요합니다")
   - 이미 구독한 기능을 다시 구독하려고 시도
   - 에러 토스트 메시지 확인 ("이미 구독 중인 기능입니다")

9. **빈 상태 테스트**
   - 모든 구독을 취소
   - 구독 관리 페이지에서 "구독 중인 기능이 없습니다" 메시지 확인
   - "기능 목록에서 구독하기" 버튼이 작동하는지 확인

10. **Firebase Console에서 데이터 확인**
    - Firebase Console → Firestore Database → Data 탭
    - `subscriptions` 컬렉션 확인
    - 구독한 기능들이 올바르게 저장되어 있는지 확인
    - `userId`, `featureId`, `subscribedAt`, `notificationEnabled` 필드 확인

---

### 2. 알림 설정 저장 로직 구현

#### 2-1. Firestore 데이터 구조 설계
- [ ] `notificationSettings` 컬렉션 구조 설계 문서 작성
- [ ] 문서 구조 확인:
  ```typescript
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
  ```
- [ ] Firebase Console에서 복합 인덱스 생성 (userId, featureId)

**프롬프트**:
```
@PROJECT_ANALYSIS.md @features.ts

Firestore에 알림 설정 데이터 구조를 설계해줘.
- 컬렉션: 'notificationSettings'
- 문서 구조: { userId, featureId, enabled, quietHours?, soundEnabled, vibrationEnabled, updatedAt }
- 복합 인덱스 필요 여부 확인 및 생성 가이드 제공
```

---

#### 2-2. 타입 정의 생성
- [ ] `app/types/notificationSettings.ts` 파일 생성
- [ ] `NotificationSettings` 인터페이스 정의
- [ ] `QuietHours` 인터페이스 정의
- [ ] 관련 타입들 정의

**프롬프트**:
```
@PROJECT_ANALYSIS.md

app/types/notificationSettings.ts 파일을 생성하고 알림 설정 관련 타입들을 정의해줘.
- NotificationSettings 인터페이스
- QuietHours 인터페이스
- 필요한 모든 타입 정의
```

---

#### 2-3. Firebase 함수 구현
- [ ] `app/lib/firebase/notificationSettings.ts` 파일 생성
- [ ] `saveNotificationSettings(userId, featureId, settings)` 함수 구현
- [ ] `getNotificationSettings(userId, featureId)` 함수 구현
- [ ] `getUserAllNotificationSettings(userId)` 함수 구현
- [ ] `subscribeNotificationSettings(userId, featureId, callback)` 실시간 리스너 구현
- [ ] 에러 처리 추가 (한국어 메시지)

**프롬프트**:
```
@PROJECT_ANALYSIS.md @features.ts @app/lib/firebase/auth.ts

app/lib/firebase/notificationSettings.ts 파일을 생성하고 알림 설정 관련 Firebase 함수들을 구현해줘.

구현할 함수들:
1. saveNotificationSettings(userId, featureId, settings): Promise<void>
   - 알림 설정 저장/업데이트
   - updatedAt 자동 업데이트
   
2. getNotificationSettings(userId, featureId): Promise<NotificationSettings | null>
   - 특정 기능의 알림 설정 가져오기
   
3. getUserAllNotificationSettings(userId): Promise<NotificationSettings[]>
   - 사용자의 모든 알림 설정 가져오기
   
4. subscribeNotificationSettings(userId, featureId, callback): Unsubscribe
   - 실시간 리스너 (onSnapshot)
   - 반환값: unsubscribe 함수

에러 처리는 한국어 메시지로 표시하고, 기존 features.ts의 패턴을 따라줘.
```

---

#### 2-4. NotificationSettings 컴포넌트 연동
- [ ] `getUserAllNotificationSettings`로 설정 목록 가져오기
- [ ] `saveNotificationSettings`로 설정 저장
- [ ] 실시간 동기화 (`subscribeNotificationSettings`) 추가
- [ ] 각 설정 항목별 토글 기능 구현
- [ ] 조용한 시간대 설정 UI 및 로직 추가
- [ ] 로딩 상태 추가
- [ ] 에러 처리 추가
- [ ] "설정 저장" 버튼 기능 구현

**프롬프트**:
```
@PROJECT_ANALYSIS.md @NotificationSettings.tsx @app/lib/firebase/notificationSettings.ts @app/lib/firebase/auth.ts @app/lib/firebase/features.ts

NotificationSettings.tsx를 수정하여 실제 알림 설정 기능을 연동해줘.

1. mockRules 제거
2. getUserAllNotificationSettings로 실제 데이터 가져오기
3. saveNotificationSettings로 설정 저장 기능 구현
4. subscribeNotificationSettings로 실시간 동기화 추가
5. 각 설정 항목별 토글 기능 구현:
   - enabled (알림 활성/비활성)
   - soundEnabled (소리)
   - vibrationEnabled (진동)
6. 조용한 시간대 설정 UI 및 로직 추가:
   - quietHours.enabled 토글
   - start/end 시간 선택
   - "이 시간대만 받기" / "이 시간대 차단" 선택
7. 로딩 상태 추가 (isLoading state)
8. 에러 처리 추가 (에러 메시지 표시)
9. "설정 저장" 버튼 클릭 시 모든 설정 저장
10. Feature 정보도 함께 표시 (featureName)

기존 UI 구조는 유지하고, 공통 컴포넌트(Toggle, Card, Button, Input, Select)를 사용해줘.
```

---

#### 2-5. FeatureList 알림 상태 표시 연동
- [ ] `getNotificationSettings`로 알림 상태 확인
- [ ] "알림: 활성화/비활성화" 표시 업데이트
- [ ] 실시간 업데이트 추가

**프롬프트**:
```
@PROJECT_ANALYSIS.md @FeatureList.tsx @app/lib/firebase/notificationSettings.ts @app/lib/firebase/auth.ts

FeatureList.tsx의 알림 상태 표시를 실제 데이터와 연동해줘.

1. 각 기능 카드에 대해 getNotificationSettings로 알림 설정 확인
2. "알림: 활성화/비활성화" 텍스트가 실제 설정에 따라 표시되도록 수정
3. 실시간 업데이트 추가 (subscribeNotificationSettings 사용)
4. 알림 설정이 없으면 기본값(활성화)으로 표시

기존 UI 구조는 유지하고, 공통 컴포넌트를 사용해줘.
```

---

## ⚠️ 중간 우선순위 작업 (Medium Priority)

### 3. 상태 관리 라이브러리 도입 (Zustand 활용)

#### 3-1. 스토어 디렉토리 구조 생성
- [ ] `app/store/` 디렉토리 생성
- [ ] `app/store/index.ts` 파일 생성 (스토어 export)

**프롬프트**:
```
@PROJECT_ANALYSIS.md @package.json

app/store/ 디렉토리를 생성하고 기본 구조를 만들어줘.
- app/store/index.ts 파일 생성
- 모든 스토어를 export하는 구조
```

---

#### 3-2. authStore 구현
- [ ] `app/store/authStore.ts` 파일 생성
- [ ] `user`, `isLoading` 상태 정의
- [ ] `setUser`, `clearUser` 액션 구현
- [ ] `onAuthChange` 리스너 통합
- [ ] 타입 정의

**프롬프트**:
```
@PROJECT_ANALYSIS.md @app/lib/firebase/auth.ts

app/store/authStore.ts를 생성하고 인증 상태 관리를 구현해줘.

구현할 내용:
- user: User | null
- isLoading: boolean
- setUser(user: User | null): void
- clearUser(): void
- onAuthChange 리스너 통합 (useEffect 사용)
- 컴포넌트 언마운트 시 리스너 정리

Zustand 패턴을 사용하고, 타입 안정성을 유지해줘.
```

---

#### 3-3. featuresStore 구현
- [ ] `app/store/featuresStore.ts` 파일 생성
- [ ] `features`, `isLoading`, `error` 상태 정의
- [ ] `loadFeatures` 액션 구현
- [ ] `addFeature` 액션 구현
- [ ] `updateFeature` 액션 구현
- [ ] `deleteFeature` 액션 구현
- [ ] `getFeatureById` 셀렉터 구현
- [ ] 타입 정의

**프롬프트**:
```
@PROJECT_ANALYSIS.md @app/lib/firebase/features.ts

app/store/featuresStore.ts를 생성하고 기능 목록 상태 관리를 구현해줘.

구현할 내용:
- features: Feature[]
- isLoading: boolean
- error: string | null
- loadFeatures(): Promise<void>
- addFeature(feature): Promise<void>
- updateFeature(id, feature): Promise<void>
- deleteFeature(id): Promise<void>
- getFeatureById(id): Feature | undefined (셀렉터)

기존 features.ts의 함수들을 사용하고, 에러 처리를 추가해줘.
```

---

#### 3-4. subscriptionsStore 구현
- [ ] `app/store/subscriptionsStore.ts` 파일 생성
- [ ] `subscriptions`, `isLoading` 상태 정의
- [ ] `subscribeToFeature` 액션 구현
- [ ] `unsubscribeFromFeature` 액션 구현
- [ ] `toggleNotification` 액션 구현
- [ ] `isSubscribed` 셀렉터 구현
- [ ] 실시간 동기화 통합
- [ ] 타입 정의

**프롬프트**:
```
@PROJECT_ANALYSIS.md @app/lib/firebase/subscriptions.ts

app/store/subscriptionsStore.ts를 생성하고 구독 상태 관리를 구현해줘.

구현할 내용:
- subscriptions: Subscription[]
- isLoading: boolean
- subscribeToFeature(featureId): Promise<void>
- unsubscribeFromFeature(featureId): Promise<void>
- toggleNotification(featureId, enabled): Promise<void>
- isSubscribed(featureId): boolean (셀렉터)
- subscribeUserSubscriptions 리스너 통합
- 컴포넌트 언마운트 시 리스너 정리

기존 subscriptions.ts의 함수들을 사용하고, 실시간 동기화를 통합해줘.
```

---

#### 3-5. notificationSettingsStore 구현
- [ ] `app/store/notificationSettingsStore.ts` 파일 생성
- [ ] `settings`, `isLoading` 상태 정의
- [ ] `getSettings` 셀렉터 구현
- [ ] `saveSettings` 액션 구현
- [ ] `toggleEnabled` 액션 구현
- [ ] 실시간 동기화 통합
- [ ] 타입 정의

**프롬프트**:
```
@PROJECT_ANALYSIS.md @app/lib/firebase/notificationSettings.ts

app/store/notificationSettingsStore.ts를 생성하고 알림 설정 상태 관리를 구현해줘.

구현할 내용:
- settings: Record<string, NotificationSettings> (featureId를 키로 사용)
- isLoading: boolean
- getSettings(featureId): NotificationSettings | null (셀렉터)
- saveSettings(featureId, settings): Promise<void>
- toggleEnabled(featureId, enabled): Promise<void>
- subscribeNotificationSettings 리스너 통합
- 컴포넌트 언마운트 시 리스너 정리

기존 notificationSettings.ts의 함수들을 사용하고, 실시간 동기화를 통합해줘.
```

---

#### 3-6. DashboardLayout 마이그레이션
- [ ] `authStore` 사용하도록 수정
- [ ] 기존 `useState` 제거
- [ ] `onAuthChange` 로직 제거 (스토어에서 처리)

**프롬프트**:
```
@PROJECT_ANALYSIS.md @DashboardLayout.tsx @app/store/authStore.ts

DashboardLayout.tsx를 authStore를 사용하도록 마이그레이션해줘.

1. authStore에서 user, isLoading 가져오기
2. 기존 useState, onAuthChange 로직 제거
3. 스토어의 상태를 사용하도록 수정
4. 로그아웃 시 clearUser 호출

기존 기능은 완전히 유지하고, 코드만 스토어를 사용하도록 변경해줘.
```

---

#### 3-7. FeatureList 마이그레이션
- [ ] `featuresStore` 사용하도록 수정
- [ ] `subscriptionsStore` 사용하도록 수정
- [ ] 기존 `useState` 제거
- [ ] 기존 Firebase 직접 호출 제거

**프롬프트**:
```
@PROJECT_ANALYSIS.md @FeatureList.tsx @app/store/featuresStore.ts @app/store/subscriptionsStore.ts

FeatureList.tsx를 featuresStore와 subscriptionsStore를 사용하도록 마이그레이션해줘.

1. featuresStore에서 features, isLoading, loadFeatures, addFeature, updateFeature, deleteFeature 가져오기
2. subscriptionsStore에서 isSubscribed, subscribeToFeature, unsubscribeFromFeature 가져오기
3. 기존 useState, Firebase 직접 호출 제거
4. 스토어의 액션을 사용하도록 수정
5. 실시간 동기화는 스토어에서 처리되므로 컴포넌트에서는 제거

기존 기능은 완전히 유지하고, 코드만 스토어를 사용하도록 변경해줘.
```

---

#### 3-8. SubscriptionManagement 마이그레이션
- [ ] `subscriptionsStore` 사용하도록 수정
- [ ] 기존 `useState` 제거
- [ ] 기존 Firebase 직접 호출 제거

**프롬프트**:
```
@PROJECT_ANALYSIS.md @SubscriptionManagement.tsx @app/store/subscriptionsStore.ts

SubscriptionManagement.tsx를 subscriptionsStore를 사용하도록 마이그레이션해줘.

1. subscriptionsStore에서 subscriptions, isLoading, unsubscribeFromFeature, toggleNotification 가져오기
2. 기존 useState, Firebase 직접 호출 제거
3. 스토어의 상태와 액션을 사용하도록 수정
4. 실시간 동기화는 스토어에서 처리되므로 컴포넌트에서는 제거

기존 기능은 완전히 유지하고, 코드만 스토어를 사용하도록 변경해줘.
```

---

#### 3-9. NotificationSettings 마이그레이션
- [ ] `notificationSettingsStore` 사용하도록 수정
- [ ] 기존 `useState` 제거
- [ ] 기존 Firebase 직접 호출 제거

**프롬프트**:
```
@PROJECT_ANALYSIS.md @NotificationSettings.tsx @app/store/notificationSettingsStore.ts

NotificationSettings.tsx를 notificationSettingsStore를 사용하도록 마이그레이션해줘.

1. notificationSettingsStore에서 settings, isLoading, getSettings, saveSettings, toggleEnabled 가져오기
2. 기존 useState, Firebase 직접 호출 제거
3. 스토어의 상태와 액션을 사용하도록 수정
4. 실시간 동기화는 스토어에서 처리되므로 컴포넌트에서는 제거

기존 기능은 완전히 유지하고, 코드만 스토어를 사용하도록 변경해줘.
```

---

### 4. 컴포넌트 분리 (큰 파일들 분리)

#### 4-1. FeatureList.tsx 분리 - 디렉토리 구조 생성
- [ ] `FeatureList/` 디렉토리 구조 생성
- [ ] `hooks/` 서브디렉토리 생성
- [ ] `types/` 서브디렉토리 생성

**프롬프트**:
```
@PROJECT_ANALYSIS.md @FeatureList.tsx

FeatureList.tsx를 분리하기 위한 디렉토리 구조를 만들어줘.

생성할 구조:
- FeatureList/
  - FeatureList.tsx (메인)
  - FeatureCard.tsx
  - FeatureCardMenu.tsx
  - FeatureCardExpanded.tsx
  - FeatureSearchBar.tsx
  - FeatureStats.tsx
  - hooks/
    - useFeatureList.ts
    - useFeatureFilters.ts
    - useFeatureCard.ts
  - types/
    - featureList.types.ts
  - index.ts (export)

각 파일의 기본 틀만 만들어줘.
```

---

#### 4-2. FeatureList.tsx 분리 - 타입 정의 분리
- [ ] `types/featureList.types.ts`에 타입 정의 이동
- [ ] 필요한 타입들 정의

**프롬프트**:
```
@PROJECT_ANALYSIS.md @FeatureList.tsx

FeatureList.tsx에서 사용하는 타입들을 types/featureList.types.ts로 분리해줘.

모든 타입 정의를 이동하고, FeatureList.tsx에서 import하도록 수정해줘.
```

---

#### 4-3. FeatureList.tsx 분리 - 커스텀 훅 생성
- [ ] `hooks/useFeatureList.ts` 생성 (비즈니스 로직)
- [ ] `hooks/useFeatureFilters.ts` 생성 (필터링 로직)
- [ ] `hooks/useFeatureCard.ts` 생성 (카드 상호작용 로직)

**프롬프트**:
```
@PROJECT_ANALYSIS.md @FeatureList.tsx

FeatureList.tsx의 로직을 커스텀 훅으로 분리해줘.

1. hooks/useFeatureList.ts
   - 기능 목록 로딩 로직
   - CRUD 로직 (add, update, delete)
   - 상태 관리 (features, isLoading, error)

2. hooks/useFeatureFilters.ts
   - 검색어 필터링 로직
   - 카테고리 필터링 로직
   - 필터링된 결과 반환

3. hooks/useFeatureCard.ts
   - 카드 확장/축소 로직
   - 메뉴 열기/닫기 로직
   - 외부 클릭 감지

각 훅은 단일 책임 원칙을 따르고, 기존 로직을 그대로 이동해줘.
```

---

#### 4-4. FeatureList.tsx 분리 - 컴포넌트 분리
- [ ] `FeatureCard.tsx` 생성
- [ ] `FeatureCardMenu.tsx` 생성
- [ ] `FeatureCardExpanded.tsx` 생성
- [ ] `FeatureSearchBar.tsx` 생성
- [ ] `FeatureStats.tsx` 생성
- [ ] `FeatureList.tsx` 메인 컴포넌트 수정 (200줄 이하)

**프롬프트**:
```
@PROJECT_ANALYSIS.md @FeatureList.tsx

FeatureList.tsx를 여러 작은 컴포넌트로 분리해줘.

1. FeatureCard.tsx
   - 개별 기능 카드 렌더링
   - props: feature, isExpanded, onExpand, onMenuClick 등

2. FeatureCardMenu.tsx
   - 카드 메뉴 드롭다운 (수정/삭제)
   - props: feature, isOpen, onClose, onEdit, onDelete

3. FeatureCardExpanded.tsx
   - 확장된 카드 내용
   - props: feature, onCollapse

4. FeatureSearchBar.tsx
   - 검색 입력 및 카테고리 필터
   - props: searchTerm, filterCategory, onSearchChange, onFilterChange

5. FeatureStats.tsx
   - 통계 카드 (전체, 구독 중, 활성 알림)
   - props: stats

6. FeatureList.tsx (메인)
   - 전체 레이아웃
   - 위 컴포넌트들을 조합
   - 커스텀 훅 사용
   - 200줄 이하로 유지

각 컴포넌트는 단일 책임 원칙을 따르고, 공통 컴포넌트를 사용해줘.
```

---

#### 4-5. world-clock/page.tsx 분리 - 디렉토리 구조 생성
- [ ] `world-clock/components/` 디렉토리 생성
- [ ] `world-clock/hooks/` 디렉토리 생성
- [ ] `world-clock/types/` 디렉토리 생성
- [ ] `world-clock/utils/` 디렉토리 생성

**프롬프트**:
```
@PROJECT_ANALYSIS.md @world-clock/page.tsx

world-clock/page.tsx를 분리하기 위한 디렉토리 구조를 만들어줘.

생성할 구조:
- world-clock/
  - page.tsx (메인)
  - components/
    - TimezoneSelector.tsx
    - TimezoneCard.tsx
    - NotificationSettings.tsx
    - NotificationAlertCard.tsx
    - NotificationStats.tsx
  - hooks/
    - useWorldClock.ts
    - useTimezoneManagement.ts
    - useNotificationAlerts.ts
    - useRealtimeSync.ts
  - types/
    - worldClock.types.ts
  - utils/
    - timezoneHelpers.ts
    - notificationHelpers.ts

각 파일의 기본 틀만 만들어줘.
```

---

#### 4-6. world-clock/page.tsx 분리 - 타입 및 유틸리티 분리
- [ ] `types/worldClock.types.ts`에 타입 정의 이동
- [ ] `utils/timezoneHelpers.ts` 생성
- [ ] `utils/notificationHelpers.ts` 생성

**프롬프트**:
```
@PROJECT_ANALYSIS.md @world-clock/page.tsx

world-clock/page.tsx에서 타입과 유틸리티 함수를 분리해줘.

1. types/worldClock.types.ts
   - 모든 타입 정의 이동

2. utils/timezoneHelpers.ts
   - 시간대 관련 헬퍼 함수들
   - formatTime, formatDate 등

3. utils/notificationHelpers.ts
   - 알림 관련 헬퍼 함수들
   - checkNotificationTime 등

기존 함수들을 그대로 이동하고, page.tsx에서 import하도록 수정해줘.
```

---

#### 4-7. world-clock/page.tsx 분리 - 커스텀 훅 생성
- [ ] `hooks/useWorldClock.ts` 생성 (메인 로직)
- [ ] `hooks/useTimezoneManagement.ts` 생성 (시간대 관리)
- [ ] `hooks/useNotificationAlerts.ts` 생성 (알림 관리)
- [ ] `hooks/useRealtimeSync.ts` 생성 (실시간 동기화)

**프롬프트**:
```
@PROJECT_ANALYSIS.md @world-clock/page.tsx

world-clock/page.tsx의 로직을 커스텀 훅으로 분리해줘.

1. hooks/useWorldClock.ts
   - 메인 상태 관리 및 초기화
   - 접근 권한 체크
   - 사용자 인증 상태 관리

2. hooks/useTimezoneManagement.ts
   - 시간대 추가/제거 로직
   - 현재 시간 업데이트 로직
   - 시간대 목록 관리

3. hooks/useNotificationAlerts.ts
   - 알림 추가/수정/삭제 로직
   - 알림 활성/비활성 토글
   - 알림 시간 체크 로직

4. hooks/useRealtimeSync.ts
   - Firestore 실시간 동기화
   - onSnapshot 리스너 관리
   - 무한 루프 방지 로직

각 훅은 단일 책임 원칙을 따르고, 기존 로직을 그대로 이동해줘.
```

---

#### 4-8. world-clock/page.tsx 분리 - 컴포넌트 분리
- [ ] `components/TimezoneSelector.tsx` 생성
- [ ] `components/TimezoneCard.tsx` 생성
- [ ] `components/NotificationSettings.tsx` 생성
- [ ] `components/NotificationAlertCard.tsx` 생성
- [ ] `components/NotificationStats.tsx` 생성
- [ ] `page.tsx` 메인 컴포넌트 수정 (200줄 이하)

**프롬프트**:
```
@PROJECT_ANALYSIS.md @world-clock/page.tsx

world-clock/page.tsx를 여러 작은 컴포넌트로 분리해줘.

1. TimezoneSelector.tsx
   - 시간대 선택 섹션
   - 시간대 추가 Select
   - props: selectedTimezones, onAddTimezone, onRemoveTimezone, isCreator

2. TimezoneCard.tsx
   - 개별 시간대 카드
   - props: timezone, currentTime, onRemove, isCreator

3. NotificationSettings.tsx
   - 알림 설정 섹션 전체
   - props: user, notificationAlerts, onAdd, onUpdate, onRemove, onToggle, isCreator

4. NotificationAlertCard.tsx
   - 개별 알림 설정 카드
   - props: alert, index, timezones, onUpdate, onRemove, onToggle, onSave, isCreator

5. NotificationStats.tsx
   - 알림 통계 카드
   - props: total, active, inactive

6. page.tsx (메인)
   - 레이아웃 및 라우팅
   - 위 컴포넌트들을 조합
   - 커스텀 훅 사용
   - 200줄 이하로 유지

각 컴포넌트는 단일 책임 원칙을 따르고, 공통 컴포넌트를 사용해줘.
기존 기능은 완전히 유지해야 합니다.
```

---

## 📋 추가 개선 작업 (선택사항)

### 5. 라우팅 통일

#### 5-1. 라우팅 방식 결정
- [ ] 옵션 1 또는 옵션 2 선택
- [ ] 결정 사항 문서화

**프롬프트**:
```
@PROJECT_ANALYSIS.md @page.tsx @DashboardLayout.tsx

라우팅 방식을 통일하기 위해 옵션을 검토하고 결정해줘.

옵션 1: Next.js 라우팅으로 통일
- /features → 기능 목록
- /subscriptions → 구독 관리
- /notifications → 알림 설정
- /history → 알림 히스토리
- 장점: SEO 친화적, 명확한 URL
- 단점: 페이지 리로드 발생

옵션 2: 해시 라우팅 유지
- /#features → 기능 목록
- /#subscriptions → 구독 관리
- /#notifications → 알림 설정
- /#history → 알림 히스토리
- 장점: SPA 방식, 빠른 전환
- 단점: SEO 불리

각 옵션의 장단점을 분석하고, 프로젝트에 맞는 옵션을 추천해줘.
```

---

#### 5-2. 라우팅 통일 구현 (선택한 옵션에 따라)
- [ ] 선택한 옵션에 따라 구현
- [ ] 기존 코드 마이그레이션
- [ ] 테스트

**프롬프트**:
```
@PROJECT_ANALYSIS.md @page.tsx @DashboardLayout.tsx

선택한 라우팅 방식으로 통일 구현해줘.

[선택한 옵션에 따라 프롬프트 내용이 달라집니다]

옵션 1 선택 시:
- Next.js 라우팅으로 전환
- 해시 라우팅 제거
- 각 탭을 별도 페이지로 생성

옵션 2 선택 시:
- 해시 라우팅 가이드라인 문서화
- 일관된 사용 패턴 유지
```

---

## 📊 진행 상황 추적

### 최우선 작업 진행률
- [ ] 구독 관리 기능 구현: 0/5 완료
- [ ] 알림 설정 저장 로직 구현: 0/5 완료

### 중간 우선순위 작업 진행률
- [ ] 상태 관리 라이브러리 도입: 0/9 완료
- [ ] 컴포넌트 분리: 0/8 완료

### 추가 작업 진행률
- [ ] 라우팅 통일: 0/2 완료

---

## 💡 작업 팁

1. **하나씩 진행**: 각 체크리스트 항목을 하나씩 완료하고 다음으로 진행
2. **프롬프트 복사**: 각 항목의 프롬프트를 Cursor AI에 복사하여 사용
3. **파일 참조**: `@` 기호로 관련 파일들을 참조
4. **테스트**: 각 항목 완료 후 기능이 정상 작동하는지 확인
5. **커밋**: 각 주요 단계 완료 후 Git 커밋 권장

---

**마지막 업데이트**: 2025-12-02

