import { 
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  limit
} from 'firebase/firestore';
import { db } from './config';
import { getCurrentUser } from './auth';

export type NotificationLogAction = 
  | 'created'      // 알림 생성
  | 'saved'        // 알림 저장
  | 'activated'    // 알림 활성화
  | 'deactivated'  // 알림 비활성화
  | 'modified'     // 알림 수정
  | 'deleted'      // 알림 삭제
  | 'delivered';   // 알림 전달

export interface NotificationLog {
  id?: string;
  featureId: string;
  alertId?: string; // 알림 ID (timezone:time 조합 등)
  action: NotificationLogAction;
  userId: string;
  userName?: string;
  userEmail?: string;
  alertName?: string; // 알림 이름 (라벨 또는 timezone:time)
  alertTime?: string; // 알림 시간 (HH:mm)
  alertTimezone?: string; // 알림 시간대
  subscriberCount?: number; // 구독자 수 (delivered 액션의 경우)
  changes?: {
    field: string; // 변경된 필드 (timezone, time, label 등)
    oldValue?: string;
    newValue?: string;
  }[];
  createdAt: Date;
}

/**
 * 알림 활동 로그 기록
 */
export const logNotificationActivity = async (
  featureId: string,
  action: NotificationLogAction,
  data: {
    alertId?: string;
    alertName?: string;
    alertTime?: string;
    alertTimezone?: string;
    subscriberCount?: number;
    changes?: Array<{ field: string; oldValue?: string; newValue?: string }>;
  }
): Promise<void> => {
  try {
    const user = getCurrentUser();
    if (!user) {
      console.warn('로그 기록 실패: 사용자가 로그인하지 않았습니다.');
      return;
    }

    // Firestore는 undefined 값을 지원하지 않으므로 undefined인 필드는 제외
    const logData: any = {
      featureId,
      action,
      userId: user.uid,
      createdAt: Timestamp.now(),
    };

    // 값이 있는 필드만 추가
    if (data.alertId) logData.alertId = data.alertId;
    if (user.displayName) logData.userName = user.displayName;
    if (user.email) logData.userEmail = user.email;
    if (data.alertName) logData.alertName = data.alertName;
    if (data.alertTime) logData.alertTime = data.alertTime;
    if (data.alertTimezone) logData.alertTimezone = data.alertTimezone;
    if (data.subscriberCount !== undefined) logData.subscriberCount = data.subscriberCount;
    if (data.changes && data.changes.length > 0) logData.changes = data.changes;

    await addDoc(collection(db, 'notificationLogs'), logData);
  } catch (error) {
    console.error('알림 로그 기록 실패:', error);
    // 로그 기록 실패해도 앱 동작에는 영향 없음
  }
};

/**
 * 기능별 알림 로그 조회
 */
export const getNotificationLogs = async (
  featureId: string,
  limitCount: number = 100
): Promise<NotificationLog[]> => {
  try {
    const q = query(
      collection(db, 'notificationLogs'),
      where('featureId', '==', featureId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
    })) as NotificationLog[];
  } catch (error) {
    console.error('알림 로그 조회 실패:', error);
    return [];
  }
};

/**
 * 알림 생성 로그
 */
export const logNotificationCreated = async (
  featureId: string,
  alert: { id?: string; timezone: string; time: string; label?: string }
): Promise<void> => {
  const alertId = alert.id || `${alert.timezone}:${alert.time}`;
  const alertName = alert.label || `${alert.timezone} ${alert.time}`;
  
  await logNotificationActivity(featureId, 'created', {
    alertId,
    alertName,
    alertTime: alert.time,
    alertTimezone: alert.timezone,
  });
};

/**
 * 알림 저장 로그
 */
export const logNotificationSaved = async (
  featureId: string,
  alert: { id?: string; timezone: string; time: string; label?: string }
): Promise<void> => {
  const alertId = alert.id || `${alert.timezone}:${alert.time}`;
  const alertName = alert.label || `${alert.timezone} ${alert.time}`;
  
  await logNotificationActivity(featureId, 'saved', {
    alertId,
    alertName,
    alertTime: alert.time,
    alertTimezone: alert.timezone,
  });
};

/**
 * 알림 활성화/비활성화 로그
 */
export const logNotificationToggled = async (
  featureId: string,
  alert: { id?: string; timezone: string; time: string; label?: string },
  isActive: boolean
): Promise<void> => {
  const alertId = alert.id || `${alert.timezone}:${alert.time}`;
  const alertName = alert.label || `${alert.timezone} ${alert.time}`;
  
  await logNotificationActivity(featureId, isActive ? 'activated' : 'deactivated', {
    alertId,
    alertName,
    alertTime: alert.time,
    alertTimezone: alert.timezone,
  });
};

/**
 * 알림 수정 로그
 */
export const logNotificationModified = async (
  featureId: string,
  alertId: string,
  alertName: string,
  changes: Array<{ field: string; oldValue?: string; newValue?: string }>
): Promise<void> => {
  await logNotificationActivity(featureId, 'modified', {
    alertId,
    alertName,
    changes,
  });
};

/**
 * 알림 삭제 로그
 */
export const logNotificationDeleted = async (
  featureId: string,
  alert: { id?: string; timezone: string; time: string; label?: string }
): Promise<void> => {
  const alertId = alert.id || `${alert.timezone}:${alert.time}`;
  const alertName = alert.label || `${alert.timezone} ${alert.time}`;
  
  await logNotificationActivity(featureId, 'deleted', {
    alertId,
    alertName,
    alertTime: alert.time,
    alertTimezone: alert.timezone,
  });
};

/**
 * 알림 전달 로그
 */
export const logNotificationDelivered = async (
  featureId: string,
  alert: { id?: string; timezone: string; time: string; label?: string },
  subscriberCount: number
): Promise<void> => {
  const alertId = alert.id || `${alert.timezone}:${alert.time}`;
  const alertName = alert.label || `${alert.timezone} ${alert.time}`;
  
  await logNotificationActivity(featureId, 'delivered', {
    alertId,
    alertName,
    alertTime: alert.time,
    alertTimezone: alert.timezone,
    subscriberCount,
  });
};

