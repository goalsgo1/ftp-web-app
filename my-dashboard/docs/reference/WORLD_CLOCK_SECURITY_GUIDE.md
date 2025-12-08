# 세계시간 기능 보안 가이드

## 🔒 보안 원칙

### ❌ 잘못된 방법 (URL 파라미터 사용)

```
❌ /features/world-clock?user=abc123hash
```

**문제점:**
1. 사용자 ID가 URL에 노출됨
2. 다른 사람이 해시를 알면 접근 가능
3. 브라우저 히스토리에 남음
4. 로그 공유 시 유출 위험

### ✅ 올바른 방법 (인증 기반 접근)

```
✅ /features/world-clock
```

**장점:**
1. URL에 사용자 정보 노출 없음
2. Firebase Authentication으로 자동 인증
3. Firestore 보안 규칙으로 접근 제어
4. 사용자가 자신의 데이터만 접근 가능

---

## 🏗️ 구현 방법

### 1. URL 구조

**일반적인 경로 사용:**
```
/features/world-clock
```

**파라미터 없이 접근:**
- 로그인 상태: 사용자별 설정 자동 로드
- 비로그인 상태: 기본 설정 또는 로그인 요청

### 2. 데이터 저장 구조

**Firestore 컬렉션:**
```
users/{userId}/worldClockSettings
```

또는

```
worldClockSettings/{userId}
```

**데이터 구조:**
```typescript
{
  userId: string,           // Firebase Auth UID
  timezones: string[],      // 선택한 시간대 목록
  notifications: {
    enabled: boolean,
    times: string[],        // 알림 받을 시간들
  },
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### 3. 코드 구현

**컴포넌트에서 사용자 확인:**
```typescript
'use client';

import { useEffect, useState } from 'react';
import { getCurrentUser, onAuthChange } from '@/lib/firebase';
import { getUserWorldClockSettings, saveWorldClockSettings } from '@/lib/firebase/worldClock';

export default function WorldClockPage() {
  const [user, setUser] = useState(null);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthChange((currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        // 로그인한 사용자의 설정만 로드
        loadUserSettings(currentUser.uid);
      } else {
        // 비로그인 상태 처리
        setSettings(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const loadUserSettings = async (userId: string) => {
    try {
      const userSettings = await getUserWorldClockSettings(userId);
      setSettings(userSettings);
    } catch (error) {
      console.error('설정 로드 실패:', error);
    }
  };

  const handleSaveSettings = async (newSettings: any) => {
    if (!user) {
      // 로그인 요청
      return;
    }

    try {
      await saveWorldClockSettings(user.uid, newSettings);
      setSettings(newSettings);
    } catch (error) {
      console.error('설정 저장 실패:', error);
    }
  };

  // ... 나머지 컴포넌트
}
```

### 4. Firestore 보안 규칙

**Firebase Console → Firestore → 규칙:**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 세계시간 설정: 사용자가 자신의 데이터만 접근 가능
    match /worldClockSettings/{userId} {
      // 읽기: 자신의 데이터만
      allow read: if request.auth != null && request.auth.uid == userId;
      
      // 쓰기: 자신의 데이터만
      allow write: if request.auth != null && request.auth.uid == userId;
    }

    // 또는 users 컬렉션 구조
    match /users/{userId}/worldClockSettings/{docId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

## 🔐 보안 체크리스트

### ✅ 필수 사항

- [ ] URL에 사용자 ID 노출하지 않기
- [ ] Firebase Authentication으로 사용자 확인
- [ ] Firestore 보안 규칙 설정
- [ ] 클라이언트에서도 사용자 확인 (이중 체크)
- [ ] 비로그인 사용자 처리

### ✅ 권장 사항

- [ ] 설정 저장 시 `userId` 자동 설정 (클라이언트에서 설정 불가)
- [ ] 에러 처리: 권한 없음 시 명확한 메시지
- [ ] 로그인 상태 실시간 감지
- [ ] 로그아웃 시 설정 초기화

---

## 📝 구현 예시

### Firestore 함수

```typescript
// app/lib/firebase/worldClock.ts

import { doc, getDoc, setDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from './config';

export interface WorldClockSettings {
  userId: string;
  timezones: string[];
  notifications: {
    enabled: boolean;
    times: string[];
  };
  createdAt?: Date;
  updatedAt?: Date;
}

// 사용자 설정 가져오기
export const getUserWorldClockSettings = async (userId: string): Promise<WorldClockSettings | null> => {
  try {
    const docRef = doc(db, 'worldClockSettings', userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      } as WorldClockSettings;
    }
    
    return null;
  } catch (error) {
    console.error('설정 가져오기 실패:', error);
    throw error;
  }
};

// 사용자 설정 저장
export const saveWorldClockSettings = async (
  userId: string, 
  settings: Omit<WorldClockSettings, 'userId' | 'createdAt' | 'updatedAt'>
): Promise<void> => {
  try {
    const docRef = doc(db, 'worldClockSettings', userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      // 업데이트
      await updateDoc(docRef, {
        ...settings,
        updatedAt: Timestamp.now(),
      });
    } else {
      // 생성
      await setDoc(docRef, {
        userId, // 서버에서 확인하지만 클라이언트에서도 설정
        ...settings,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
    }
  } catch (error) {
    console.error('설정 저장 실패:', error);
    throw error;
  }
};
```

---

## 🔓 공개 기능의 알림 설정 관리

### 시나리오
웹 기능이 **공개**로 설정된 경우:
- ✅ 다른 사용자들의 알림 설정을 **볼 수 있음** (참고용)
- ❌ 다른 사용자의 알림 설정을 **수정할 수 없음** (본인 것만 수정)

### 데이터 구조

**개인 설정 (수정 가능):**
```
worldClockSettings/{userId}
```
- 각 사용자만 자신의 설정 읽기/쓰기 가능

**공개 통계 (읽기 전용):**
```
worldClockPublicStats/{featureId}
```
- 모든 사용자가 읽기 가능
- 쓰기는 불가 (또는 관리자만)

### Firestore 보안 규칙

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 개인 알림 설정: 본인만 읽기/쓰기
    match /worldClockSettings/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // 공개 통계: 모두 읽기, 쓰기 불가
    match /worldClockPublicStats/{featureId} {
      allow read: if request.auth != null;
      allow write: if false; // 아무도 쓰기 불가
    }

    // 또는 실시간 집계 방식
    match /features/{featureId}/userSettings/{userId} {
      // 본인 설정: 읽기/쓰기 가능
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // 다른 사람 설정: 읽기만 가능 (공개 기능인 경우)
      allow read: if request.auth != null && 
        get(/databases/$(database)/documents/features/$(featureId)).data.isPublic == true;
    }
  }
}
```

### 구현 예시

```typescript
// app/lib/firebase/worldClock.ts

// 개인 설정 저장 (본인만 가능)
export const saveUserSettings = async (
  userId: string,
  featureId: string,
  settings: WorldClockSettings
): Promise<void> => {
  const currentUser = getCurrentUser();
  
  // 보안 체크: 본인인지 확인
  if (!currentUser || currentUser.uid !== userId) {
    throw new Error('권한이 없습니다.');
  }

  const docRef = doc(db, `features/${featureId}/userSettings`, userId);
  await setDoc(docRef, {
    ...settings,
    userId, // 서버에서도 확인하지만 클라이언트에서도 체크
    updatedAt: Timestamp.now(),
  });
};

// 다른 사용자들의 설정 보기 (공개 기능인 경우만)
export const getPublicUserSettings = async (
  featureId: string
): Promise<WorldClockSettings[]> => {
  // 먼저 기능이 공개인지 확인
  const featureRef = doc(db, 'features', featureId);
  const featureSnap = await getDoc(featureRef);
  
  if (!featureSnap.exists() || !featureSnap.data().isPublic) {
    throw new Error('공개 기능이 아닙니다.');
  }

  // 공개 기능이면 모든 사용자 설정 읽기 (읽기 전용)
  const settingsRef = collection(db, `features/${featureId}/userSettings`);
  const snapshot = await getDocs(settingsRef);
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as WorldClockSettings[];
};

// 개인 설정 가져오기 (본인만)
export const getUserSettings = async (
  userId: string,
  featureId: string
): Promise<WorldClockSettings | null> => {
  const currentUser = getCurrentUser();
  
  // 보안 체크
  if (!currentUser || currentUser.uid !== userId) {
    throw new Error('권한이 없습니다.');
  }

  const docRef = doc(db, `features/${featureId}/userSettings`, userId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return docSnap.data() as WorldClockSettings;
  }
  
  return null;
};
```

### UI 구현 예시

```typescript
'use client';

export default function WorldClockPage({ featureId }: { featureId: string }) {
  const [user, setUser] = useState(null);
  const [mySettings, setMySettings] = useState(null);
  const [publicSettings, setPublicSettings] = useState([]); // 다른 사람들 설정 (읽기 전용)
  const [isPublic, setIsPublic] = useState(false);

  useEffect(() => {
    // 기능이 공개인지 확인
    checkFeatureIsPublic(featureId);
    
    // 로그인한 사용자의 설정 로드
    if (user) {
      loadMySettings(user.uid, featureId);
    }
    
    // 공개 기능이면 다른 사람들 설정도 로드 (읽기 전용)
    if (isPublic) {
      loadPublicSettings(featureId);
    }
  }, [user, featureId, isPublic]);

  const handleSaveMySettings = async (settings: any) => {
    if (!user) return;
    
    // 본인 설정만 저장 가능
    await saveUserSettings(user.uid, featureId, settings);
    setMySettings(settings);
  };

  return (
    <div>
      {/* 내 설정 (수정 가능) */}
      <MySettingsPanel
        settings={mySettings}
        onSave={handleSaveMySettings}
      />

      {/* 다른 사람들 설정 (읽기 전용, 공개 기능인 경우만) */}
      {isPublic && (
        <PublicSettingsPanel
          settings={publicSettings}
          readOnly // 수정 불가 표시
        />
      )}
    </div>
  );
}
```

### 보안 체크리스트

- [ ] 개인 설정: 본인만 읽기/쓰기 가능
- [ ] 공개 설정: 모든 사용자가 읽기 가능 (참고용)
- [ ] 공개 설정: 수정 불가 (읽기 전용)
- [ ] Firestore 보안 규칙으로 서버 측 보호
- [ ] 클라이언트에서도 사용자 확인 (이중 체크)
- [ ] UI에서 수정 버튼 비활성화 (다른 사람 설정)

---

## 🎯 결론

**URL 파라미터 사용하지 않기!**

대신:
1. ✅ Firebase Authentication으로 사용자 확인
2. ✅ Firestore 보안 규칙으로 접근 제어
3. ✅ 클라이언트에서도 사용자 확인
4. ✅ 사용자별 데이터는 `userId`로 구분
5. ✅ 공개 기능: 다른 사람 설정은 읽기 전용

**공개 기능의 알림 설정:**
- ✅ 다른 사람 설정 **보기 가능** (참고용)
- ❌ 다른 사람 설정 **수정 불가** (본인 것만 수정)

이렇게 하면 **보안이 강화**되고, **사용자 경험도 좋아집니다**! 🚀

