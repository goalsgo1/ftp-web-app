import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc,
  query,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { db } from './config';

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
    const docRef = doc(db, 'features', id);
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
    const docRef = doc(db, 'features', id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('기능 삭제 실패:', error);
    throw error;
  }
};

