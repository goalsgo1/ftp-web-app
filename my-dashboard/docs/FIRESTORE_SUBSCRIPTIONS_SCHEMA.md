# Firestore 구독 데이터 구조 설계

## 컬렉션: `subscriptions`

### 문서 구조

```typescript
{
  userId: string,              // 구독한 사용자 ID (Firebase Auth UID)
  featureId: string,          // 구독한 기능 ID (features 컬렉션의 문서 ID)
  subscribedAt: Timestamp,    // 구독 시작 시간
  notificationEnabled: boolean, // 알림 활성화 여부
  updatedAt: Timestamp         // 마지막 업데이트 시간
}
```

### 문서 ID

- **방식**: 자동 생성 (Firestore가 생성)
- **고유성**: `userId`와 `featureId`의 조합으로 고유성 보장
- **쿼리 최적화**: 복합 인덱스 사용

### 인덱스

#### 복합 인덱스 1: userId + subscribedAt (내림차순)
- **용도**: 특정 사용자의 구독 목록을 최신순으로 조회
- **필드**:
  - `userId` (오름차순)
  - `subscribedAt` (내림차순)

#### 복합 인덱스 2: userId + featureId
- **용도**: 특정 사용자가 특정 기능을 구독했는지 확인
- **필드**:
  - `userId` (오름차순)
  - `featureId` (오름차순)

### 보안 규칙 (Firestore Security Rules)

```javascript
match /subscriptions/{subscriptionId} {
  // 읽기: 자신의 구독만 읽을 수 있음
  allow read: if request.auth != null && request.auth.uid == resource.data.userId;
  
  // 생성: 자신의 구독만 생성할 수 있음
  allow create: if request.auth != null 
    && request.auth.uid == request.resource.data.userId
    && request.resource.data.subscribedAt != null
    && request.resource.data.notificationEnabled != null;
  
  // 수정: 자신의 구독만 수정할 수 있음
  allow update: if request.auth != null 
    && request.auth.uid == resource.data.userId
    && request.auth.uid == request.resource.data.userId;
  
  // 삭제: 자신의 구독만 삭제할 수 있음
  allow delete: if request.auth != null && request.auth.uid == resource.data.userId;
}
```

### 쿼리 패턴

#### 1. 사용자의 모든 구독 가져오기
```typescript
query(
  collection(db, 'subscriptions'),
  where('userId', '==', userId),
  orderBy('subscribedAt', 'desc')
)
```

#### 2. 특정 기능 구독 여부 확인
```typescript
query(
  collection(db, 'subscriptions'),
  where('userId', '==', userId),
  where('featureId', '==', featureId)
)
```

#### 3. 구독과 기능 정보 조인 (클라이언트 사이드)
- `getUserSubscriptions` 함수에서:
  1. 구독 목록 가져오기
  2. 각 구독의 `featureId`로 `features` 컬렉션에서 기능 정보 가져오기
  3. 두 데이터를 조합하여 반환

### 데이터 예시

```json
{
  "userId": "user123",
  "featureId": "feature456",
  "subscribedAt": "2025-12-02T10:30:00Z",
  "notificationEnabled": true,
  "updatedAt": "2025-12-02T10:30:00Z"
}
```

### 주의사항

1. **중복 구독 방지**: 
   - `subscribeToFeature` 함수에서 구독 전에 `isSubscribed`로 확인
   - 또는 Firestore 규칙에서 중복 체크

2. **기능 삭제 시**:
   - 기능이 삭제되면 관련 구독도 삭제해야 함 (Cloud Function 또는 클라이언트에서 처리)

3. **사용자 삭제 시**:
   - 사용자 계정 삭제 시 관련 구독도 삭제해야 함 (Cloud Function에서 처리)

### Firebase Console에서 인덱스 생성 방법

1. Firebase Console → Firestore Database → Indexes 탭
2. "Create Index" 클릭
3. Collection ID: `subscriptions`
4. Fields:
   - `userId` (Ascending)
   - `subscribedAt` (Descending)
5. "Create" 클릭

6. 두 번째 인덱스:
   - Collection ID: `subscriptions`
   - Fields:
     - `userId` (Ascending)
     - `featureId` (Ascending)
   - "Create" 클릭

### 성능 고려사항

- **읽기 최적화**: 인덱스를 사용하여 빠른 쿼리
- **쓰기 최적화**: 최소한의 필드만 업데이트
- **실시간 리스너**: `onSnapshot` 사용 시 효율적인 필터링

