// 세계시간 기능을 Firestore에 추가하는 스크립트
// 브라우저 콘솔에서 실행하거나 별도 스크립트로 실행

import { addFeature } from '@/lib/firebase/features';
import { getCurrentUser } from '@/lib/firebase';

export async function addWorldClockFeature() {
  try {
    const user = getCurrentUser();
    
    if (!user) {
      console.error('로그인이 필요합니다.');
      return;
    }

    const featureId = await addFeature({
      name: '세계시간',
      description: '세계 각 나라의 시간을 확인할 수 있고 설정한 시간에 푸시알림을 받을 수 있습니다.',
      category: '생활',
      url: '/features/world-clock?id=world-clock', // 내부 경로
      isPublic: true,
      status: 'completed',
    }, user.uid);

    console.log('세계시간 기능이 추가되었습니다. ID:', featureId);
    return featureId;
  } catch (error) {
    console.error('세계시간 기능 추가 실패:', error);
    throw error;
  }
}

// 사용법:
// 브라우저 콘솔에서:
// import { addWorldClockFeature } from '@/scripts/add-world-clock-feature';
// await addWorldClockFeature();

