# Firebase 과금 관리

Firebase 과금 방지 및 비용 관리 관련 문서입니다.

## 📚 문서 목록

### [Firebase 과금 방지 설정 가이드](./FIREBASE_BILLING_PROTECTION.md)

Firebase에서 예상치 못한 과금을 방지하기 위한 설정 방법을 안내합니다.

**주요 내용:**
- 무료 플랜(Spark Plan) 유지 방법
- 예산 알림 설정
- 사용량 모니터링
- 코드 레벨 최적화
- 무료 한도 초과 시 대응 방법

---

## 🎯 빠른 요약

### 과금 방지 핵심 포인트

1. **Spark Plan (무료 플랜) 유지**
   - Blaze Plan으로 업그레이드하지 않으면 과금 없음
   - 무료 한도 초과 시 서비스 제한 (과금 없음)

2. **사용량 모니터링**
   - Firebase Console에서 일일 사용량 확인
   - 무료 한도 80%, 90% 도달 시 알림 설정

3. **코드 최적화**
   - 실시간 리스너 구독 해제 확인
   - 불필요한 읽기/쓰기 작업 최소화
   - 캐싱 활용

---

## 📊 무료 한도

| 서비스 | 무료 한도 |
|--------|----------|
| Authentication | 무제한 |
| Firestore 저장 | 1GB |
| Firestore 읽기 | 50,000회/일 |
| Firestore 쓰기 | 20,000회/일 |
| Firestore 삭제 | 20,000회/일 |
| Cloud Messaging (FCM) | 무제한 |

---

## 🔗 관련 문서

- [Firebase 프로젝트 재생성 가이드](../FIREBASE_PROJECT_RECREATION_GUIDE.md)
- [Firebase vs 자체 서버 비교](../../FIREBASE_VS_SELF_HOSTED_COMPARISON.md)
- [Firestore 구독 스키마](../../FIRESTORE_SUBSCRIPTIONS_SCHEMA.md)

