import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  getDoc,
  updateDoc, 
  deleteDoc,
  query,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { db } from './config';
import { getCurrentUser } from './auth';

export interface Feature {
  id?: string;
  name: string;
  description: string;
  category: string;
  url: string;
  subscribed?: boolean;
  notificationEnabled?: boolean;
  isPublic?: boolean; // 공개/비공개
  status?: 'completed' | 'coming_soon'; // 완료/준비중
  createdBy?: string; // 생성한 사용자 ID
  createdAt?: Date;
  updatedAt?: Date;
}

// 기능 추가
export const addFeature = async (feature: Omit<Feature, 'id' | 'createdAt' | 'updatedAt'>, userId?: string): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'features'), {
      ...feature,
      subscribed: false,
      notificationEnabled: false,
      isPublic: feature.isPublic ?? true, // 기본값: 공개
      status: feature.status ?? 'completed', // 기본값: 완료
      createdBy: userId || null,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error('기능 추가 실패:', error);
    throw error;
  }
};

// 모든 기능 가져오기
export const getFeatures = async (): Promise<Feature[]> => {
  try {
    const q = query(collection(db, 'features'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as Feature[];
  } catch (error) {
    console.error('기능 목록 가져오기 실패:', error);
    throw error;
  }
};

// 기능 수정
export const updateFeature = async (id: string, feature: Partial<Feature>): Promise<void> => {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      throw new Error('로그인이 필요합니다.');
    }

    // 기능 정보 가져오기
    const docRef = doc(db, 'features', id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      throw new Error('기능을 찾을 수 없습니다.');
    }

    const existingFeature = docSnap.data() as Feature;
    
    // 권한 체크: 생성자만 수정 가능
    if (existingFeature.createdBy && existingFeature.createdBy !== currentUser.uid) {
      throw new Error('수정 권한이 없습니다. 생성자만 수정할 수 있습니다.');
    }

    await updateDoc(docRef, {
      ...feature,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('기능 수정 실패:', error);
    throw error;
  }
};

// 기능 삭제
export const deleteFeature = async (id: string): Promise<void> => {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      throw new Error('로그인이 필요합니다.');
    }

    // 기능 정보 가져오기
    const docRef = doc(db, 'features', id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      throw new Error('기능을 찾을 수 없습니다.');
    }

    const existingFeature = docSnap.data() as Feature;
    
    // 권한 체크: 생성자만 삭제 가능
    if (existingFeature.createdBy && existingFeature.createdBy !== currentUser.uid) {
      throw new Error('삭제 권한이 없습니다. 생성자만 삭제할 수 있습니다.');
    }

    await deleteDoc(docRef);
  } catch (error) {
    console.error('기능 삭제 실패:', error);
    throw error;
  }
};

// ID로 기능 가져오기
export const getFeatureById = async (id: string): Promise<Feature | null> => {
  try {
    const docRef = doc(db, 'features', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: docSnap.data().createdAt?.toDate(),
        updatedAt: docSnap.data().updatedAt?.toDate(),
      } as Feature;
    }
    
    return null;
  } catch (error) {
    console.error('기능 가져오기 실패:', error);
    throw error;
  }
};

