# Firebase 설정 (Firebase Setup)

> **Firebase 기능 사용을 위한 설정 가이드**

이 폴더에는 Firebase 환경 변수 설정 및 인증 활성화 가이드가 포함되어 있습니다.

---

## 📁 폴더 구조

### 환경 변수 (environment-variables)
**목적**: Firebase 환경 변수 설정  
**대상**: Firebase 기능을 사용하려는 모든 개발자  
**필수**: Firebase 기능 사용 시 필수  
**파일**: `FIREBASE_ENV_SETUP.md`

### 인증 설정 (authentication)
**목적**: Firebase 인증 활성화  
**대상**: 로그인 기능을 사용하려는 개발자  
**필수**: 로그인 기능 사용 시 필수  
**파일**: `FIREBASE_AUTH_SETUP.md`

### 과금 관리 (billing)
**목적**: Firebase 과금 방지 및 비용 관리  
**대상**: 모든 개발자  
**필수**: Firebase 사용 시 권장  
**파일**: `FIREBASE_BILLING_PROTECTION.md`

---

## 🔥 설정 순서

Firebase 기능을 사용하려면 다음 순서로 설정하세요:

1. **환경 변수 설정** → `environment-variables/FIREBASE_ENV_SETUP.md`
   - `.env.local` 파일 생성
   - Firebase Console에서 설정 값 복사

2. **인증 활성화** → `authentication/FIREBASE_AUTH_SETUP.md`
   - Firebase Console에서 이메일/비밀번호 인증 활성화
   - 테스트 계정 생성

3. **과금 방지 설정** → `billing/FIREBASE_BILLING_PROTECTION.md` (권장)
   - 무료 플랜 유지 확인
   - 사용량 모니터링 설정
   - 예산 알림 설정

---

## ✅ 완료 체크리스트

- [ ] `.env.local` 파일 생성 완료
- [ ] Firebase 환경 변수 입력 완료
- [ ] Firebase Console에서 인증 활성화 완료
- [ ] 개발 서버 재시작 완료
- [ ] 로그인 기능 테스트 완료
- [ ] 과금 방지 설정 완료 (권장)

---

**작성일**: 2025-01-27


