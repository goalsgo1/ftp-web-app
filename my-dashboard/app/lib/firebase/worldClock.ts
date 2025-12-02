import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  Timestamp,
  collection,
  getDocs,
  query,
  where,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { db } from './config';
import { getCurrentUser } from './auth';

export interface WorldClockSettings {
  userId: string;
  featureId: string;
  selectedTimezones: string[]; // 선택한 시간대 목록
  notifications: {
    enabled: boolean;
    alerts: Array<{
      timezone: string; // 시간대 (예: 'America/New_York')
      time: string; // 시간 (HH:mm 형식, 예: '15:00')
      label?: string; // 알림 라벨 (선택사항)
      active?: boolean; // 알림 활성/비활성 상태
    }>;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

// 사용자 설정 가져오기
export const getUserWorldClockSettings = async (
  userId: string,
  featureId: string
): Promise<WorldClockSettings | null> => {
  try {
    const docRef = doc(db, `features/${featureId}/userSettings`, userId);
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
export const saveUserWorldClockSettings = async (
  userId: string,
  featureId: string,
  settings: Omit<WorldClockSettings, 'userId' | 'featureId' | 'createdAt' | 'updatedAt'>
): Promise<void> => {
  try {
    const currentUser = getCurrentUser();
    
    // 보안 체크: 본인인지 확인
    if (!currentUser || currentUser.uid !== userId) {
      throw new Error('권한이 없습니다.');
    }

    const docRef = doc(db, `features/${featureId}/userSettings`, userId);
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
        userId,
        featureId,
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

// 공개 기능인 경우 다른 사용자들의 설정 보기 (읽기 전용)
export const getPublicUserSettings = async (
  featureId: string
): Promise<WorldClockSettings[]> => {
  try {
    // 먼저 기능이 공개인지 확인
    const featureRef = doc(db, 'features', featureId);
    const featureSnap = await getDoc(featureRef);
    
    if (!featureSnap.exists() || !featureSnap.data().isPublic) {
      return []; // 공개 기능이 아니면 빈 배열 반환
    }

    // 공개 기능이면 모든 사용자 설정 읽기 (읽기 전용)
    const settingsRef = collection(db, `features/${featureId}/userSettings`);
    const snapshot = await getDocs(settingsRef);
    
    return snapshot.docs.map(doc => ({
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as WorldClockSettings[];
  } catch (error) {
    console.error('공개 설정 가져오기 실패:', error);
    throw error;
  }
};

// 공개 기능의 생성자 설정 가져오기 (읽기 전용)
export const getCreatorSettings = async (
  featureId: string,
  creatorId: string
): Promise<WorldClockSettings | null> => {
  try {
    // 먼저 기능이 공개인지 확인
    const featureRef = doc(db, 'features', featureId);
    const featureSnap = await getDoc(featureRef);
    
    if (!featureSnap.exists() || !featureSnap.data().isPublic) {
      return null; // 공개 기능이 아니면 null 반환
    }

    // 생성자의 설정 가져오기
    const creatorSettings = await getUserWorldClockSettings(creatorId, featureId);
    return creatorSettings;
  } catch (error) {
    console.error('생성자 설정 가져오기 실패:', error);
    throw error;
  }
};

// 실시간으로 사용자 설정 감지 (다른 탭/브라우저에서 변경 시 자동 업데이트)
export const subscribeUserWorldClockSettings = (
  userId: string,
  featureId: string,
  callback: (settings: WorldClockSettings | null) => void
): Unsubscribe => {
  const docRef = doc(db, `features/${featureId}/userSettings`, userId);
  
  return onSnapshot(
    docRef,
    (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        callback({
          ...data,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
        } as WorldClockSettings);
      } else {
        callback(null);
      }
    },
    (error) => {
      console.error('실시간 설정 감지 실패:', error);
      callback(null);
    }
  );
};

