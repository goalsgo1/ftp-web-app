# 보안 상태 분석 및 대응 가이드

> **작성일**: 2025-01-27  
> **프로젝트**: PushHub (푸시 알림 통합 관리 대시보드)  
> **Next.js 버전**: 16.0.10  
> **React 버전**: 19.2.3

---

## 📊 현재 보안 상태 평가

### ✅ 완료된 보안 조치

1. **최신 버전 업데이트 완료**
   - Next.js 16.0.10 (최신)
   - React 19.2.3 (CVE-2025-55182 패치 포함)
   - React 19.2.1 이상에서 React2Shell 취약점 해결됨

2. **RSC 사용 확인**
   - `app/` 폴더 구조로 App Router 활성화
   - React Server Components 사용 중
   - Flight 엔드포인트 노출 확인 완료 (404 응답 - 정상)

3. **환경 변수 관리**
   - `.gitignore`에 `.env*` 포함되어 있음
   - Firebase 설정값을 환경 변수로 관리
   - 민감한 정보가 Git에 커밋되지 않도록 설정됨

4. **Server Actions 미사용**
   - `'use server'` 디렉티브 없음
   - 클라이언트 컴포넌트 위주로 구성
   - RSC 취약점 노출 최소화

### ⚠️ 주의 필요 사항

1. **Firebase API 키 노출**
   - `NEXT_PUBLIC_` 접두사로 인해 클라이언트에 노출됨
   - Firebase의 정상적인 사용 방식이지만, Firestore 보안 규칙 필수
   - **대응**: Firestore 보안 규칙을 엄격하게 설정해야 함

2. **CSP 설정**
   - 개발 모드에서 `'unsafe-eval'`, `'unsafe-inline'` 허용 필요
   - 프로덕션에서는 더 엄격한 CSP 적용 권장

3. **로컬 개발 환경**
   - 현재 로컬에서만 실행 중
   - 배포 시 추가 보안 조치 필요

---

## 🔒 next.config.ts 보안 설정

### 적용된 보안 헤더

1. **Strict-Transport-Security (HSTS)**
   - HTTPS 강제 전환
   - 2년간 유효 (max-age=63072000)
   - 서브도메인 포함

2. **X-Content-Type-Options: nosniff**
   - MIME 타입 스니핑 방지
   - XSS 공격 방어

3. **X-Frame-Options: DENY**
   - 클릭재킹 방지
   - iframe 임베드 완전 차단

4. **X-XSS-Protection: 1; mode=block**
   - 브라우저 XSS 필터 활성화
   - 레거시 브라우저 지원

5. **Referrer-Policy: strict-origin-when-cross-origin**
   - 외부 사이트로 정보 유출 방지
   - 같은 도메인 내에서는 전체 URL 전송

6. **Permissions-Policy**
   - 불필요한 브라우저 기능 비활성화
   - 카메라, 마이크, 위치 정보 차단

7. **Content-Security-Policy (CSP)**
   - XSS 공격 방지
   - 허용된 리소스만 로드
   - Firebase 연결 허용

### 추가 설정

- **reactStrictMode: true**: 개발 중 잠재적 문제 감지
- **poweredByHeader: false**: 서버 정보 노출 방지

---

## 🚀 배포 시 필요한 추가 보안 조치

### 1. 환경 변수 관리

#### 현재 상태
- ✅ `.env.local` 파일 사용 중
- ✅ `.gitignore`에 포함됨

#### 배포 시 조치
- [ ] 배포 플랫폼(Vercel, AWS 등)에 환경 변수 설정
- [ ] 프로덕션용 `.env.production` 파일 생성 (로컬 테스트용)
- [ ] 민감한 정보는 서버 사이드 환경 변수로만 관리
- [ ] `NEXT_PUBLIC_` 접두사는 클라이언트 노출되는 값만 사용

### 2. HTTPS 적용

#### 필수 사항
- [ ] SSL/TLS 인증서 적용
- [ ] HTTP → HTTPS 자동 리디렉션 설정
- [ ] HSTS 헤더 적용 (이미 설정됨)

#### 배포 플랫폼별
- **Vercel**: 자동 HTTPS 제공
- **AWS CloudFront**: ACM 인증서 사용
- **자체 서버**: Let's Encrypt 인증서 적용

### 3. Firestore 보안 규칙 강화

#### 현재 상태
- ⚠️ Firestore 보안 규칙 확인 필요

#### 권장 규칙 예시
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 사용자 인증 확인
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // 기능 목록 - 인증된 사용자만 읽기 가능
    match /features/{featureId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
                      request.resource.data.userId == request.auth.uid;
    }
    
    // 구독 관리 - 본인 데이터만 접근
    match /subscriptions/{subscriptionId} {
      allow read, write: if request.auth != null && 
                            resource.data.userId == request.auth.uid;
    }
  }
}
```

### 4. 의존성 보안 점검

#### 정기 점검
- [ ] `npm audit` 실행하여 취약점 확인
- [ ] `npm audit fix`로 자동 수정 가능한 취약점 해결
- [ ] Dependabot 또는 Snyk 사용 고려

#### 실행 명령어
```powershell
npm audit
npm audit fix
```

### 5. 로깅 및 모니터링

#### 배포 시 설정
- [ ] 에러 로깅 서비스 연동 (Sentry, LogRocket 등)
- [ ] 비정상적인 요청 패턴 모니터링
- [ ] Firebase 사용량 모니터링
- [ ] 보안 이벤트 알림 설정

### 6. Rate Limiting

#### 구현 필요
- [ ] API 엔드포인트 Rate Limiting
- [ ] 로그인 시도 제한
- [ ] Firebase Functions 또는 미들웨어 사용

### 7. CSP 강화 (프로덕션)

#### 개발 모드 vs 프로덕션
- **개발**: `'unsafe-eval'`, `'unsafe-inline'` 허용 (Next.js 필요)
- **프로덕션**: 더 엄격한 CSP 적용 가능

#### 프로덕션 CSP 예시
```typescript
"Content-Security-Policy": [
  "default-src 'self'",
  "script-src 'self'", // 'unsafe-eval' 제거
  "style-src 'self' 'unsafe-inline'", // Tailwind 필요
  "img-src 'self' data: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://*.firebaseio.com https://*.googleapis.com",
  "frame-ancestors 'none'",
].join('; ')
```

---

## ⚠️ RSC 사용 시 주의사항

### 1. Server Components 보안

#### 데이터 유출 방지
- ✅ Server Components에서 민감한 데이터를 클라이언트로 전달하지 않도록 주의
- ✅ 환경 변수는 `NEXT_PUBLIC_` 접두사 없이 사용 (서버 전용)
- ✅ API 키, 비밀번호 등은 절대 클라이언트 컴포넌트로 전달 금지

#### 예시: 올바른 사용
```typescript
// ✅ Server Component
export default async function ServerPage() {
  const secretData = await fetchSecretData(); // 서버에서만 실행
  return <ClientComponent publicData={secretData.public} />;
}

// ❌ 잘못된 사용
export default async function ServerPage() {
  const secretData = await fetchSecretData();
  return <ClientComponent secret={secretData.secret} />; // 민감 정보 노출!
}
```

### 2. Server Actions 보안

#### 현재 상태
- ✅ Server Actions 미사용 (취약점 노출 최소화)

#### 향후 사용 시 주의사항
- [ ] 입력값 검증 필수
- [ ] CSRF 토큰 검증
- [ ] Rate Limiting 적용
- [ ] 권한 확인 (인증/인가)

### 3. Flight 엔드포인트 보호

#### 현재 상태
- ✅ `/_next/flight` 엔드포인트 404 응답 (정상)

#### 배포 시 확인
- [ ] 프로덕션에서도 Flight 엔드포인트 접근 불가 확인
- [ ] Next.js 최신 버전 유지 (자동 보호)
- [ ] WAF 규칙으로 추가 보호 가능

### 4. 환경 변수 관리

#### 서버 전용 환경 변수
```typescript
// ✅ Server Component에서만 사용
const apiKey = process.env.SECRET_API_KEY; // NEXT_PUBLIC_ 없음

// ❌ 클라이언트에서 접근 불가
// 클라이언트 컴포넌트에서는 undefined
```

#### 클라이언트 노출 환경 변수
```typescript
// ✅ 클라이언트에서도 사용 가능
const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

// ⚠️ 주의: 클라이언트에 노출됨
// Firestore 보안 규칙으로 보호 필수
```

---

## 🔍 보안 점검 체크리스트

### 로컬 개발 환경
- [x] Next.js 최신 버전 사용
- [x] React 최신 버전 사용 (CVE-2025-55182 패치 포함)
- [x] Flight 엔드포인트 노출 확인 (404 응답)
- [x] 환경 변수 `.gitignore` 포함
- [x] 보안 헤더 설정 완료

### 배포 전 필수 확인
- [ ] Firestore 보안 규칙 설정 및 테스트
- [ ] 환경 변수 배포 플랫폼에 설정
- [ ] HTTPS 적용 확인
- [ ] `npm audit` 실행 및 취약점 해결
- [ ] 프로덕션 빌드 테스트 (`npm run build`)
- [ ] 보안 헤더 동작 확인

### 배포 후 모니터링
- [ ] 에러 로깅 설정
- [ ] 비정상 요청 모니터링
- [ ] Firebase 사용량 모니터링
- [ ] 정기적인 의존성 업데이트

---

## 📚 참고 자료

### 공식 문서
- [Next.js 보안 가이드](https://nextjs.org/docs/app/building-your-application/configuring/security-headers)
- [React Server Components](https://react.dev/reference/rsc/server-components)
- [Firebase 보안 규칙](https://firebase.google.com/docs/firestore/security/get-started)

### 취약점 정보
- [CVE-2025-55182 (React2Shell)](https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2025-55182)
- [React 보안 공지](https://github.com/facebook/react/security)

### 보안 도구
- [npm audit](https://docs.npmjs.com/cli/v8/commands/npm-audit)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Security Headers](https://securityheaders.com/)

---

## 🎯 다음 단계

1. **즉시 조치**
   - [ ] Firestore 보안 규칙 확인 및 강화
   - [ ] `npm audit` 실행하여 의존성 취약점 확인

2. **배포 준비**
   - [ ] 배포 플랫폼 선택 및 환경 변수 설정
   - [ ] HTTPS 설정 확인
   - [ ] 프로덕션 빌드 테스트

3. **지속적 관리**
   - [ ] 정기적인 의존성 업데이트
   - [ ] 보안 공지 모니터링
   - [ ] 로깅 및 모니터링 설정

---

**최종 업데이트**: 2025-01-27  
**다음 점검 예정일**: 배포 전

