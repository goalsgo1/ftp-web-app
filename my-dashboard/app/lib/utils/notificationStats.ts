import { getCreatorSettings } from '../firebase/worldClock';
import type { Feature } from '../firebase/features';

export interface NotificationStats {
  total: number;
  active: number;
  inactive: number;
}

/**
 * 기능 목록에서 알림 통계를 로드합니다.
 * 세계시간 기능(world-clock)의 생성자 설정에서 알림 통계를 가져옵니다.
 * 
 * @param features 기능 목록
 * @returns 기능 ID를 키로 하는 알림 통계 맵
 */
export const loadNotificationStats = async (
  features: Feature[]
): Promise<Record<string, NotificationStats>> => {
  const stats: Record<string, NotificationStats> = {};
  
  for (const feature of features) {
    // 세계시간 기능만 처리
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

/**
 * 단일 기능의 알림 통계를 로드합니다.
 * 
 * @param featureId 기능 ID
 * @param creatorId 생성자 ID
 * @returns 알림 통계
 */
export const loadSingleNotificationStats = async (
  featureId: string,
  creatorId: string
): Promise<NotificationStats> => {
  try {
    const creatorSettings = await getCreatorSettings(featureId, creatorId);
    if (creatorSettings && creatorSettings.notifications?.alerts) {
      const alerts = creatorSettings.notifications.alerts;
      return {
        total: alerts.length,
        active: alerts.filter(a => a.active !== false).length,
        inactive: alerts.filter(a => a.active === false).length,
      };
    }
    return { total: 0, active: 0, inactive: 0 };
  } catch (error) {
    console.error(`알림 통계 로드 실패 (${featureId}):`, error);
    return { total: 0, active: 0, inactive: 0 };
  }
};

