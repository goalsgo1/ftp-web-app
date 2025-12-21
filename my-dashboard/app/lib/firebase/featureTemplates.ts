import { 
  collection, 
  getDocs,
  query,
  orderBy,
  doc,
  getDoc,
  setDoc,
  Timestamp
} from 'firebase/firestore';
import { db } from './config';

/**
 * 내부 기능 템플릿 타입
 * 사용자가 선택할 수 있는 미리 정의된 기능들
 */
export interface FeatureTemplate {
  id: string;
  name: string; // 표시 이름 (예: "뉴스 스크래퍼")
  url: string; // 기능 URL (예: "/features/news-scraper?id=news-scraper")
  description?: string; // 설명
  category?: string; // 카테고리
  icon?: string; // 아이콘 이름 (선택사항)
  isActive: boolean; // 활성화 여부
  order: number; // 정렬 순서
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * 기본 기능 템플릿 목록
 */
const DEFAULT_FEATURE_TEMPLATES: Omit<FeatureTemplate, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: '세계시간',
    url: '/features/world-clock?id=world-clock',
    description: '전 세계 도시의 현재 시간을 확인할 수 있습니다',
    category: '생산성',
    isActive: true,
    order: 1,
  },
  {
    name: '캘린더',
    url: '/features/calendar?id=calendar',
    description: '일정 관리 및 캘린더 기능',
    category: '생산성',
    isActive: true,
    order: 2,
  },
  {
    name: '뉴스 스크래퍼',
    url: '/features/news-scraper?id=news-scraper',
    description: 'AI 기반 뉴스 자동 수집 및 분석',
    category: '뉴스',
    isActive: true,
    order: 3,
  },
];

/**
 * 기능 템플릿 초기화 (기본 템플릿이 없으면 생성)
 */
export const initializeFeatureTemplates = async (): Promise<void> => {
  try {
    const templatesRef = collection(db, 'featureTemplates');
    const snapshot = await getDocs(templatesRef);
    
    // 이미 템플릿이 있으면 초기화하지 않음
    if (!snapshot.empty) {
      return;
    }
    
    // 기본 템플릿 생성
    for (const template of DEFAULT_FEATURE_TEMPLATES) {
      const docRef = doc(templatesRef);
      await setDoc(docRef, {
        ...template,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
    }
    
    console.log('기능 템플릿 초기화 완료');
  } catch (error) {
    console.error('기능 템플릿 초기화 실패:', error);
    throw error;
  }
};

/**
 * 활성화된 기능 템플릿 목록 가져오기
 */
export const getActiveFeatureTemplates = async (): Promise<FeatureTemplate[]> => {
  try {
    // 복합 인덱스를 사용하여 DB에서 정렬 (더 효율적)
    const q = query(
      collection(db, 'featureTemplates'),
      orderBy('order', 'asc'),
      orderBy('name', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
    const templates: FeatureTemplate[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      // 활성화된 것만 반환
      if (data.isActive !== false) {
        templates.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || undefined,
          updatedAt: data.updatedAt?.toDate() || undefined,
        } as FeatureTemplate);
      }
    });
    
    return templates;
  } catch (error) {
    console.error('기능 템플릿 목록 가져오기 실패:', error);
    throw error;
  }
};

/**
 * 모든 기능 템플릿 목록 가져오기 (관리자용)
 */
export const getAllFeatureTemplates = async (): Promise<FeatureTemplate[]> => {
  try {
    // 복합 인덱스를 사용하여 DB에서 정렬 (더 효율적)
    const q = query(
      collection(db, 'featureTemplates'),
      orderBy('order', 'asc'),
      orderBy('name', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || undefined,
        updatedAt: data.updatedAt?.toDate() || undefined,
      } as FeatureTemplate;
    });
  } catch (error) {
    console.error('기능 템플릿 목록 가져오기 실패:', error);
    throw error;
  }
};

/**
 * 기능 템플릿 추가 (관리자용)
 */
export const addFeatureTemplate = async (
  template: Omit<FeatureTemplate, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  try {
    const templatesRef = collection(db, 'featureTemplates');
    const docRef = doc(templatesRef);
    
    await setDoc(docRef, {
      ...template,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    
    return docRef.id;
  } catch (error) {
    console.error('기능 템플릿 추가 실패:', error);
    throw error;
  }
};

/**
 * 기능 템플릿 업데이트 (관리자용)
 */
export const updateFeatureTemplate = async (
  templateId: string,
  template: Partial<Omit<FeatureTemplate, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<void> => {
  try {
    const docRef = doc(db, 'featureTemplates', templateId);
    await setDoc(
      docRef,
      {
        ...template,
        updatedAt: Timestamp.now(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error('기능 템플릿 업데이트 실패:', error);
    throw error;
  }
};

