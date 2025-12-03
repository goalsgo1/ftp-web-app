import {
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { db } from './config';
import { getCurrentUser } from './auth';
import { getFeatureById } from './features';
import type { Subscription, SubscriptionWithFeature, CreateSubscriptionData, UpdateSubscriptionData } from '@/types/subscriptions';

/**
 * 구독 추가
 * @param userId 사용자 ID
 * @param featureId 기능 ID
 * @throws 이미 구독 중인 경우 에러
 */
export const subscribeToFeature = async (userId: string, featureId: string): Promise<void> => {
  try {
    // 중복 구독 체크
    const isAlreadySubscribed = await isSubscribed(userId, featureId);
    if (isAlreadySubscribed) {
      throw new Error('이미 구독 중인 기능입니다.');
    }

    // 기능 존재 여부 확인
    const feature = await getFeatureById(featureId);
    if (!feature) {
      throw new Error('기능을 찾을 수 없습니다.');
    }

    // 구독 추가
    const subscriptionData: CreateSubscriptionData = {
      userId,
      featureId,
      notificationEnabled: true, // 기본값: 알림 활성화
    };

    await addDoc(collection(db, 'subscriptions'), {
      ...subscriptionData,
      subscribedAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
  } catch (error: any) {
    console.error('구독 추가 실패:', error);
    
    // 이미 구독 중인 경우
    if (error.message?.includes('이미 구독')) {
      throw error;
    }
    
    // 기능을 찾을 수 없는 경우
    if (error.message?.includes('기능을 찾을 수 없습니다')) {
      throw error;
    }
    
    throw new Error('구독 추가에 실패했습니다. 다시 시도해주세요.');
  }
};

/**
 * 구독 취소
 * @param userId 사용자 ID
 * @param featureId 기능 ID
 */
export const unsubscribeFromFeature = async (userId: string, featureId: string): Promise<void> => {
  try {
    // 현재 사용자 확인
    const currentUser = getCurrentUser();
    if (!currentUser || currentUser.uid !== userId) {
      throw new Error('로그인이 필요하거나 권한이 없습니다.');
    }

    // 구독 문서 찾기
    const q = query(
      collection(db, 'subscriptions'),
      where('userId', '==', userId),
      where('featureId', '==', featureId)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      throw new Error('구독 정보를 찾을 수 없습니다.');
    }

    // 구독 삭제 (여러 개가 있을 경우 모두 삭제)
    const deletePromises = querySnapshot.docs.map(docSnapshot => 
      deleteDoc(doc(db, 'subscriptions', docSnapshot.id))
    );
    
    await Promise.all(deletePromises);
  } catch (error: any) {
    console.error('구독 취소 실패:', error);
    
    if (error.message?.includes('로그인') || error.message?.includes('권한')) {
      throw error;
    }
    
    if (error.message?.includes('구독 정보를 찾을 수 없습니다')) {
      throw error;
    }
    
    throw new Error('구독 취소에 실패했습니다. 다시 시도해주세요.');
  }
};

/**
 * 사용자의 모든 구독 목록 가져오기 (기능 정보 포함)
 * @param userId 사용자 ID
 * @returns 구독 목록 (기능 정보 포함)
 */
export const getUserSubscriptions = async (userId: string): Promise<SubscriptionWithFeature[]> => {
  try {
    // 구독 목록 가져오기
    const q = query(
      collection(db, 'subscriptions'),
      where('userId', '==', userId),
      orderBy('subscribedAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    
    // 각 구독의 기능 정보 가져오기
    const subscriptionsWithFeatures = await Promise.all(
      querySnapshot.docs.map(async (docSnapshot) => {
        const data = docSnapshot.data();
        const subscription: Subscription = {
          id: docSnapshot.id,
          userId: data.userId,
          featureId: data.featureId,
          subscribedAt: data.subscribedAt?.toDate() || new Date(),
          notificationEnabled: data.notificationEnabled ?? true,
          updatedAt: data.updatedAt?.toDate(),
        };

        // 기능 정보 가져오기
        const feature = await getFeatureById(data.featureId);
        if (!feature) {
          // 기능이 삭제된 경우 null 반환 (필터링됨)
          return null;
        }

        return {
          ...subscription,
          feature,
        } as SubscriptionWithFeature;
      })
    );

    // null 값 제거 (기능이 삭제된 구독)
    return subscriptionsWithFeatures.filter(
      (sub): sub is SubscriptionWithFeature => sub !== null
    );
  } catch (error) {
    console.error('구독 목록 가져오기 실패:', error);
    throw new Error('구독 목록을 가져오는데 실패했습니다.');
  }
};

/**
 * 구독 여부 확인
 * @param userId 사용자 ID
 * @param featureId 기능 ID
 * @returns 구독 여부
 */
export const isSubscribed = async (userId: string, featureId: string): Promise<boolean> => {
  try {
    const q = query(
      collection(db, 'subscriptions'),
      where('userId', '==', userId),
      where('featureId', '==', featureId)
    );
    
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    console.error('구독 여부 확인 실패:', error);
    return false;
  }
};

/**
 * 알림 활성/비활성 토글
 * @param userId 사용자 ID
 * @param featureId 기능 ID
 * @param enabled 알림 활성화 여부
 */
export const toggleNotification = async (
  userId: string,
  featureId: string,
  enabled: boolean
): Promise<void> => {
  try {
    // 현재 사용자 확인
    const currentUser = getCurrentUser();
    if (!currentUser || currentUser.uid !== userId) {
      throw new Error('로그인이 필요하거나 권한이 없습니다.');
    }

    // 구독 문서 찾기
    const q = query(
      collection(db, 'subscriptions'),
      where('userId', '==', userId),
      where('featureId', '==', featureId)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      throw new Error('구독 정보를 찾을 수 없습니다.');
    }

    // 알림 설정 업데이트 (첫 번째 문서만 업데이트)
    const subscriptionDoc = querySnapshot.docs[0];
    await updateDoc(doc(db, 'subscriptions', subscriptionDoc.id), {
      notificationEnabled: enabled,
      updatedAt: Timestamp.now(),
    });
  } catch (error: any) {
    console.error('알림 설정 변경 실패:', error);
    
    if (error.message?.includes('로그인') || error.message?.includes('권한')) {
      throw error;
    }
    
    if (error.message?.includes('구독 정보를 찾을 수 없습니다')) {
      throw error;
    }
    
    throw new Error('알림 설정 변경에 실패했습니다. 다시 시도해주세요.');
  }
};

/**
 * 사용자 구독 목록 실시간 리스너
 * @param userId 사용자 ID
 * @param callback 변경 시 호출될 콜백 함수
 * @returns unsubscribe 함수
 */
export const subscribeUserSubscriptions = (
  userId: string,
  callback: (subscriptions: SubscriptionWithFeature[]) => void
): Unsubscribe => {
  const q = query(
    collection(db, 'subscriptions'),
    where('userId', '==', userId),
    orderBy('subscribedAt', 'desc')
  );

  return onSnapshot(
    q,
    async (querySnapshot) => {
      try {
        // 각 구독의 기능 정보 가져오기
        const subscriptionsWithFeatures = await Promise.all(
          querySnapshot.docs.map(async (docSnapshot) => {
            const data = docSnapshot.data();
            const subscription: Subscription = {
              id: docSnapshot.id,
              userId: data.userId,
              featureId: data.featureId,
              subscribedAt: data.subscribedAt?.toDate() || new Date(),
              notificationEnabled: data.notificationEnabled ?? true,
              updatedAt: data.updatedAt?.toDate(),
            };

            // 기능 정보 가져오기
            const feature = await getFeatureById(data.featureId);
            if (!feature) {
              return null;
            }

            return {
              ...subscription,
              feature,
            } as SubscriptionWithFeature;
          })
        );

        // null 값 제거
        const validSubscriptions = subscriptionsWithFeatures.filter(
          (sub): sub is SubscriptionWithFeature => sub !== null
        );

        callback(validSubscriptions);
      } catch (error) {
        console.error('구독 목록 실시간 업데이트 실패:', error);
        callback([]);
      }
    },
    (error) => {
      console.error('구독 목록 실시간 리스너 에러:', error);
      callback([]);
    }
  );
};

