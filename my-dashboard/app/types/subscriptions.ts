/**
 * 구독 관련 TypeScript 타입 정의
 */

import { Timestamp } from 'firebase/firestore';
import type { Feature } from '@/lib/firebase/features';

/**
 * 구독 정보 (Firestore 문서 구조)
 */
export interface Subscription {
  id?: string; // 문서 ID
  userId: string; // 구독한 사용자 ID
  featureId: string; // 구독한 기능 ID
  subscribedAt: Date | Timestamp; // 구독 시작 시간
  notificationEnabled: boolean; // 알림 활성화 여부
  updatedAt?: Date | Timestamp; // 마지막 업데이트 시간
}

/**
 * 구독 정보 + 기능 정보 (조회 시 사용)
 */
export interface SubscriptionWithFeature extends Subscription {
  feature: Feature; // 구독한 기능의 상세 정보
}

/**
 * 구독 생성 시 사용하는 데이터 (id, subscribedAt, updatedAt 제외)
 */
export type CreateSubscriptionData = Omit<Subscription, 'id' | 'subscribedAt' | 'updatedAt'>;

/**
 * 구독 업데이트 시 사용하는 데이터 (부분 업데이트 가능)
 */
export type UpdateSubscriptionData = Partial<Pick<Subscription, 'notificationEnabled'>>;

