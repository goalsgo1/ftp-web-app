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

export type EventStatus = 'todo' | 'in_progress' | 'done'; // 해야할일, 하는중, 했던일

export interface CalendarEvent {
  id?: string;
  userId: string;
  featureId: string;
  title: string;
  date: Date;
  description?: string;
  color?: string;
  tags?: string[]; // 태그 배열
  status?: EventStatus; // 상태 (해야할일, 하는중, 했던일)
  recurringGroupId?: string; // 반복 일정 그룹 ID (같은 그룹의 일정들은 함께 수정/삭제됨)
  createdAt?: Date;
  updatedAt?: Date;
}

// 캘린더 이벤트 추가
export const addCalendarEvent = async (
  event: Omit<CalendarEvent, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      throw new Error('로그인이 필요합니다.');
    }

    // 상태에 따른 기본 색상 설정
    const getDefaultColorByStatus = (status?: EventStatus): string => {
      if (status === 'todo') return '#ef4444'; // 빨간색 (해야할일)
      if (status === 'in_progress') return '#f59e0b'; // 노란색 (하는중)
      if (status === 'done') return '#10b981'; // 초록색 (했던일)
      return event.color || '#3b82f6'; // 기본 파란색
    };

    const docRef = await addDoc(collection(db, 'calendarEvents'), {
      userId: currentUser.uid,
      featureId: event.featureId,
      title: event.title,
      date: Timestamp.fromDate(event.date),
      description: event.description || '',
      color: event.color || (event.status ? getDefaultColorByStatus(event.status) : '#3b82f6'),
      tags: event.tags || [],
      status: event.status || null, // 상태가 없으면 null
      recurringGroupId: event.recurringGroupId || null,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    
    return docRef.id;
  } catch (error) {
    console.error('캘린더 이벤트 추가 실패:', error);
    throw error;
  }
};

// 사용자의 캘린더 이벤트 목록 가져오기
export const getCalendarEvents = async (
  userId: string,
  featureId?: string
): Promise<CalendarEvent[]> => {
  try {
    let q;
    
    if (featureId) {
      q = query(
        collection(db, 'calendarEvents'),
        where('userId', '==', userId),
        where('featureId', '==', featureId),
        orderBy('date', 'desc')
      );
    } else {
      q = query(
        collection(db, 'calendarEvents'),
        where('userId', '==', userId),
        orderBy('date', 'desc')
      );
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        date: data.date?.toDate(),
        tags: data.tags || [],
        status: data.status || undefined,
        recurringGroupId: data.recurringGroupId || undefined,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      };
    }) as CalendarEvent[];
  } catch (error) {
    console.error('캘린더 이벤트 목록 가져오기 실패:', error);
    throw error;
  }
};

// 캘린더 이벤트 수정
export const updateCalendarEvent = async (
  eventId: string,
  event: Partial<Omit<CalendarEvent, 'id' | 'userId' | 'featureId' | 'createdAt' | 'updatedAt'>>,
  updateGroup: boolean = true // 같은 그룹의 일정들도 함께 수정할지 여부
): Promise<void> => {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      throw new Error('로그인이 필요합니다.');
    }

    const docRef = doc(db, 'calendarEvents', eventId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      throw new Error('이벤트를 찾을 수 없습니다.');
    }

    const existingEvent = docSnap.data() as CalendarEvent;
    
    // 권한 체크: 본인 이벤트만 수정 가능
    if (existingEvent.userId !== currentUser.uid) {
      throw new Error('수정 권한이 없습니다.');
    }

    const updateData: any = {
      updatedAt: Timestamp.now(),
    };

    if (event.title !== undefined) updateData.title = event.title;
    if (event.description !== undefined) updateData.description = event.description;
    if (event.date !== undefined) updateData.date = Timestamp.fromDate(event.date);
    if (event.tags !== undefined) updateData.tags = event.tags;
    // status가 undefined인 경우 null로 설정하여 Firestore에서 필드 제거
    if ('status' in event) {
      updateData.status = event.status || null;
      // 상태가 변경되면 색상도 자동 업데이트 (사용자가 색상을 직접 지정하지 않은 경우)
      if (event.status && !event.color) {
        if (event.status === 'todo') updateData.color = '#ef4444';
        else if (event.status === 'in_progress') updateData.color = '#f59e0b';
        else if (event.status === 'done') updateData.color = '#10b981';
      }
    }
    if (event.color !== undefined) updateData.color = event.color;

    // 같은 그룹의 일정들도 함께 수정
    if (updateGroup && existingEvent.recurringGroupId) {
      const groupQuery = query(
        collection(db, 'calendarEvents'),
        where('userId', '==', currentUser.uid),
        where('recurringGroupId', '==', existingEvent.recurringGroupId)
      );
      const groupSnapshot = await getDocs(groupQuery);
      
      const updatePromises = groupSnapshot.docs.map(doc => {
        const groupUpdateData: any = { ...updateData };
        // 날짜는 각 일정의 원래 날짜 유지 (날짜 변경 시에는 그룹 업데이트 안 함)
        if (event.date !== undefined) {
          const originalDate = doc.data().date;
          groupUpdateData.date = originalDate;
        }
        return updateDoc(doc.ref, groupUpdateData);
      });
      
      await Promise.all(updatePromises);
    } else {
      await updateDoc(docRef, updateData);
    }
  } catch (error) {
    console.error('캘린더 이벤트 수정 실패:', error);
    throw error;
  }
};

// 캘린더 이벤트 삭제
export const deleteCalendarEvent = async (
  eventId: string,
  deleteGroup: boolean = false // 같은 그룹의 일정들도 함께 삭제할지 여부
): Promise<void> => {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      throw new Error('로그인이 필요합니다.');
    }

    const docRef = doc(db, 'calendarEvents', eventId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      throw new Error('이벤트를 찾을 수 없습니다.');
    }

    const existingEvent = docSnap.data() as CalendarEvent;
    
    // 권한 체크: 본인 이벤트만 삭제 가능
    if (existingEvent.userId !== currentUser.uid) {
      throw new Error('삭제 권한이 없습니다.');
    }

    // 같은 그룹의 일정들도 함께 삭제
    if (deleteGroup && existingEvent.recurringGroupId) {
      const groupQuery = query(
        collection(db, 'calendarEvents'),
        where('userId', '==', currentUser.uid),
        where('recurringGroupId', '==', existingEvent.recurringGroupId)
      );
      const groupSnapshot = await getDocs(groupQuery);
      
      const deletePromises = groupSnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
    } else {
      await deleteDoc(docRef);
    }
  } catch (error) {
    console.error('캘린더 이벤트 삭제 실패:', error);
    throw error;
  }
};

// 특정 날짜 범위의 캘린더 이벤트 가져오기
export const getCalendarEventsByDateRange = async (
  userId: string,
  startDate: Date,
  endDate: Date,
  featureId?: string
): Promise<CalendarEvent[]> => {
  try {
    let q;
    
    if (featureId) {
      q = query(
        collection(db, 'calendarEvents'),
        where('userId', '==', userId),
        where('featureId', '==', featureId),
        where('date', '>=', Timestamp.fromDate(startDate)),
        where('date', '<=', Timestamp.fromDate(endDate)),
        orderBy('date', 'asc')
      );
    } else {
      q = query(
        collection(db, 'calendarEvents'),
        where('userId', '==', userId),
        where('date', '>=', Timestamp.fromDate(startDate)),
        where('date', '<=', Timestamp.fromDate(endDate)),
        orderBy('date', 'asc')
      );
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        date: data.date?.toDate(),
        tags: data.tags || [],
        status: data.status || undefined,
        recurringGroupId: data.recurringGroupId || undefined,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      };
    }) as CalendarEvent[];
  } catch (error) {
    console.error('날짜 범위 캘린더 이벤트 가져오기 실패:', error);
    throw error;
  }
};

// 실시간으로 캘린더 이벤트 감지
export const subscribeCalendarEvents = (
  userId: string,
  featureId: string,
  callback: (events: CalendarEvent[]) => void
): Unsubscribe => {
  const q = query(
    collection(db, 'calendarEvents'),
    where('userId', '==', userId),
    where('featureId', '==', featureId),
    orderBy('date', 'desc')
  );
  
  return onSnapshot(
    q,
    (querySnapshot) => {
      const events = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          date: data.date?.toDate(),
          tags: data.tags || [],
          status: data.status || undefined,
          recurringGroupId: data.recurringGroupId || undefined,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
        };
      }) as CalendarEvent[];
      callback(events);
    },
    (error) => {
      console.error('실시간 캘린더 이벤트 감지 실패:', error);
      callback([]);
    }
  );
};

// 캘린더 설정 인터페이스
export interface CalendarSettings {
  featureId: string;
  userId: string;
  mealOrderEnabled?: boolean; // 식단 정렬 옵션 활성화 여부
  updatedAt?: Date;
}

// 캘린더 설정 가져오기
export const getCalendarSettings = async (
  userId: string,
  featureId: string
): Promise<CalendarSettings | null> => {
  try {
    const settingsQuery = query(
      collection(db, 'calendarSettings'),
      where('userId', '==', userId),
      where('featureId', '==', featureId)
    );
    
    const querySnapshot = await getDocs(settingsQuery);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const doc = querySnapshot.docs[0];
    const data = doc.data();
    
    return {
      featureId: data.featureId,
      userId: data.userId,
      mealOrderEnabled: data.mealOrderEnabled || false,
      updatedAt: data.updatedAt?.toDate(),
    };
  } catch (error) {
    console.error('캘린더 설정 가져오기 실패:', error);
    return null;
  }
};

// 캘린더 설정 저장/업데이트
export const saveCalendarSettings = async (
  userId: string,
  featureId: string,
  settings: Partial<Omit<CalendarSettings, 'featureId' | 'userId' | 'updatedAt'>>
): Promise<void> => {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser || currentUser.uid !== userId) {
      throw new Error('권한이 없습니다.');
    }

    const settingsQuery = query(
      collection(db, 'calendarSettings'),
      where('userId', '==', userId),
      where('featureId', '==', featureId)
    );
    
    const querySnapshot = await getDocs(settingsQuery);
    
    const updateData: any = {
      updatedAt: Timestamp.now(),
    };
    
    if (settings.mealOrderEnabled !== undefined) {
      updateData.mealOrderEnabled = settings.mealOrderEnabled;
    }
    
    if (querySnapshot.empty) {
      // 새로 생성
      await addDoc(collection(db, 'calendarSettings'), {
        userId,
        featureId,
        mealOrderEnabled: settings.mealOrderEnabled || false,
        updatedAt: Timestamp.now(),
      });
    } else {
      // 업데이트
      const docRef = querySnapshot.docs[0].ref;
      await updateDoc(docRef, updateData);
    }
  } catch (error) {
    console.error('캘린더 설정 저장 실패:', error);
    throw error;
  }
};

