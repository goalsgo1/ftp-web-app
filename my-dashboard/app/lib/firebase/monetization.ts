/**
 * 수익화 시스템 - Firestore 연동
 */

import {
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
} from 'firebase/firestore';
import { db } from './config';

// 프리미엄 구독 타입
export interface PremiumSubscription {
  id?: string;
  userId: string;
  plan: 'basic' | 'pro' | 'enterprise';
  status: 'active' | 'cancelled' | 'expired';
  startDate: Date;
  endDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

// API 사용량 타입
export interface ApiUsage {
  id?: string;
  userId: string;
  endpoint: string;
  count: number;
  cost: number;
  period: 'daily' | 'monthly';
  periodDate: Date;
  createdAt?: Date;
}

// 구독 플랜 정의
export const SUBSCRIPTION_PLANS = {
  basic: {
    name: 'Basic',
    price: 9.99,
    features: {
      maxArticlesPerDay: 100,
      analysisAccess: true,
      reportGeneration: false,
      apiAccess: false,
    },
  },
  pro: {
    name: 'Pro',
    price: 29.99,
    features: {
      maxArticlesPerDay: 1000,
      analysisAccess: true,
      reportGeneration: true,
      apiAccess: true,
      apiCallsPerMonth: 10000,
    },
  },
  enterprise: {
    name: 'Enterprise',
    price: 99.99,
    features: {
      maxArticlesPerDay: -1, // 무제한
      analysisAccess: true,
      reportGeneration: true,
      apiAccess: true,
      apiCallsPerMonth: -1, // 무제한
    },
  },
};

// 프리미엄 구독 추가
export const addPremiumSubscription = async (
  subscription: Omit<PremiumSubscription, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'premiumSubscriptions'), {
      userId: subscription.userId,
      plan: subscription.plan,
      status: subscription.status,
      startDate: Timestamp.fromDate(subscription.startDate),
      endDate: subscription.endDate ? Timestamp.fromDate(subscription.endDate) : null,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    
    return docRef.id;
  } catch (error) {
    console.error('프리미엄 구독 추가 실패:', error);
    throw error;
  }
};

// 사용자의 활성 구독 조회
export const getActiveSubscription = async (userId: string): Promise<PremiumSubscription | null> => {
  try {
    const q = query(
      collection(db, 'premiumSubscriptions'),
      where('userId', '==', userId),
      where('status', '==', 'active'),
      orderBy('startDate', 'desc'),
      limit(1)
    );

    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    const data = doc.data();
    
    return {
      id: doc.id,
      userId: data.userId,
      plan: data.plan,
      status: data.status,
      startDate: data.startDate.toDate(),
      endDate: data.endDate?.toDate(),
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate(),
    };
  } catch (error) {
    console.error('구독 조회 실패:', error);
    throw error;
  }
};

// 사용자가 프리미엄 기능 사용 가능한지 확인
export const checkPremiumAccess = async (
  userId: string,
  feature: 'analysis' | 'report' | 'api'
): Promise<boolean> => {
  try {
    const subscription = await getActiveSubscription(userId);
    
    if (!subscription) {
      return false;
    }

    const plan = SUBSCRIPTION_PLANS[subscription.plan];
    
    switch (feature) {
      case 'analysis':
        return plan.features.analysisAccess;
      case 'report':
        return plan.features.reportGeneration;
      case 'api':
        return plan.features.apiAccess;
      default:
        return false;
    }
  } catch (error) {
    console.error('프리미엄 접근 확인 실패:', error);
    return false;
  }
};

// API 사용량 기록
export const recordApiUsage = async (
  usage: Omit<ApiUsage, 'id' | 'createdAt'>
): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'apiUsage'), {
      userId: usage.userId,
      endpoint: usage.endpoint,
      count: usage.count,
      cost: usage.cost,
      period: usage.period,
      periodDate: Timestamp.fromDate(usage.periodDate),
      createdAt: Timestamp.now(),
    });
    
    return docRef.id;
  } catch (error) {
    console.error('API 사용량 기록 실패:', error);
    throw error;
  }
};

