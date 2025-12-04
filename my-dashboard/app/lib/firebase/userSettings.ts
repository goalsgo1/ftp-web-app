import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  Timestamp,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { db } from './config';
import { getCurrentUser } from './auth';

export interface UserSettings {
  userId: string;
  toastDuration?: number; // Toast 자동 닫기 시간 (밀리초, 기본값: 5000)
  toastAutoCloseEnabled?: boolean; // Toast 자동 닫기 활성화 여부 (기본값: true)
  createdAt?: Date;
  updatedAt?: Date;
}

const DEFAULT_TOAST_DURATION = 5000; // 5초

/**
 * 사용자 설정 가져오기
 * @param userId 사용자 ID
 * @returns 사용자 설정
 */
export const getUserSettings = async (userId: string): Promise<UserSettings | null> => {
  try {
    const docRef = doc(db, 'userSettings', userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      } as UserSettings;
    }
    
    // 설정이 없으면 기본값 반환
    return {
      userId,
      toastDuration: DEFAULT_TOAST_DURATION,
      toastAutoCloseEnabled: true,
    };
  } catch (error) {
    console.error('사용자 설정 가져오기 실패:', error);
      // 에러 발생 시 기본값 반환
    return {
      userId,
      toastDuration: DEFAULT_TOAST_DURATION,
      toastAutoCloseEnabled: true,
    };
  }
};

/**
 * 사용자 설정 저장
 * @param userId 사용자 ID
 * @param settings 설정 (부분 업데이트 가능)
 */
export const saveUserSettings = async (
  userId: string,
  settings: Partial<Omit<UserSettings, 'userId' | 'createdAt' | 'updatedAt'>>
): Promise<void> => {
  try {
    const currentUser = getCurrentUser();
    
    // 보안 체크: 본인인지 확인
    if (!currentUser || currentUser.uid !== userId) {
      throw new Error('권한이 없습니다.');
    }

    const docRef = doc(db, 'userSettings', userId);
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
        toastDuration: settings.toastDuration ?? DEFAULT_TOAST_DURATION,
        toastAutoCloseEnabled: settings.toastAutoCloseEnabled ?? true,
        ...settings,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
    }
  } catch (error) {
    console.error('사용자 설정 저장 실패:', error);
    throw error;
  }
};

/**
 * Toast duration 가져오기 (기본값 포함)
 * @param userId 사용자 ID
 * @returns Toast duration (밀리초)
 */
export const getToastDuration = async (userId: string): Promise<number> => {
  try {
    const settings = await getUserSettings(userId);
    return settings?.toastDuration ?? DEFAULT_TOAST_DURATION;
  } catch (error) {
    console.error('Toast duration 가져오기 실패:', error);
    return DEFAULT_TOAST_DURATION;
  }
};

/**
 * 실시간으로 사용자 설정 감지
 * @param userId 사용자 ID
 * @param callback 설정 변경 시 호출되는 콜백
 * @returns 구독 해제 함수
 */
export const subscribeUserSettings = (
  userId: string,
  callback: (settings: UserSettings | null) => void
): Unsubscribe => {
  const docRef = doc(db, 'userSettings', userId);
  
  return onSnapshot(
    docRef,
    (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        callback({
          ...data,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
        } as UserSettings);
      } else {
        // 설정이 없으면 기본값 반환
        callback({
          userId,
          toastDuration: DEFAULT_TOAST_DURATION,
          toastAutoCloseEnabled: true,
        });
      }
    },
    (error) => {
      console.error('실시간 설정 감지 실패:', error);
      // 에러 발생 시 기본값 반환
      callback({
        userId,
        toastDuration: DEFAULT_TOAST_DURATION,
        toastAutoCloseEnabled: true,
      });
    }
  );
};

