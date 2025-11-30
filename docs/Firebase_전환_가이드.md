# 🔄 Firebase → 다른 플랫폼 전환 가이드

이 문서는 Firebase로 시작한 프로젝트를 나중에 다른 인증/백엔드 플랫폼으로 전환하는 방법을 설명합니다.

## 📋 목차

1. [전환이 쉬운 구조](#전환이-쉬운-구조)
2. [전환 시나리오별 가이드](#전환-시나리오별-가이드)
3. [단계별 전환 절차](#단계별-전환-절차)
4. [주의사항](#주의사항)

---

## 전환이 쉬운 구조

현재 프로젝트는 **추상화 레이어**를 통해 전환을 쉽게 만들었습니다:

```
public/
├── js/
│   ├── firebase-config.js      # Firebase 설정 (이 파일만 교체)
│   ├── auth-service.js          # 인증 로직 추상화 (주요 수정 파일)
│   └── auth-ui.js               # UI (변경 불필요)
```

### ✅ 현재 구조의 장점

1. **auth-service.js**가 모든 인증 로직을 담당
   - 다른 파일들은 `authService` 객체만 사용
   - Firebase 코드가 UI와 분리됨

2. **표준화된 사용자 객체 형식**
   ```javascript
   {
       uid: string,
       email: string,
       displayName: string,
       emailVerified: boolean,
       // ...
   }
   ```
   - 어떤 플랫폼이든 이 형식만 맞추면 됨

3. **일관된 API**
   - `authService.signIn(email, password)`
   - `authService.signUp(email, password, displayName)`
   - `authService.signOut()`
   - `authService.getCurrentUser()`

---

## 전환 시나리오별 가이드

### 시나리오 1: Supabase로 전환

**Supabase는 Firebase와 유사한 구조**를 가지고 있어 전환이 비교적 쉽습니다.

#### 필요한 변경사항

1. **firebase-config.js → supabase-config.js**

```javascript
// Supabase 클라이언트 초기화
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'YOUR_SUPABASE_URL'
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY'
const supabase = createClient(supabaseUrl, supabaseKey)
```

2. **auth-service.js 수정**

```javascript
// 기존 Firebase 코드를 Supabase 코드로 교체

async signIn(email, password) {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });
        
        if (error) throw error;
        
        this.currentUser = data.user;
        return {
            success: true,
            user: this._formatUser(data.user)
        };
    } catch (error) {
        return {
            success: false,
            error: this._handleError(error)
        };
    }
}

_formatUser(user) {
    // Supabase 사용자 객체를 표준 형식으로 변환
    return {
        uid: user.id,
        email: user.email,
        displayName: user.user_metadata?.full_name || user.email?.split('@')[0],
        emailVerified: user.email_confirmed_at !== null,
        // ...
    };
}
```

**추가 작업:**
- HTML에서 Firebase SDK 제거, Supabase SDK 추가
- 사용자 데이터 마이그레이션 (필요시)

---

### 시나리오 2: 자체 백엔드 API로 전환

**Node.js + Express + JWT** 같은 자체 백엔드를 구축하는 경우.

#### 필요한 변경사항

1. **auth-service.js를 REST API 호출로 변경**

```javascript
async signIn(email, password) {
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Login failed');
        }
        
        // JWT 토큰 저장
        localStorage.setItem('authToken', data.token);
        this.currentUser = data.user;
        
        return {
            success: true,
            user: this._formatUser(data.user)
        };
    } catch (error) {
        return {
            success: false,
            error: this._handleError(error)
        };
    }
}

async signOut() {
    localStorage.removeItem('authToken');
    this.currentUser = null;
    
    // 백엔드에 로그아웃 요청 (선택사항)
    try {
        await fetch('/api/auth/logout', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });
    } catch (e) {
        // 무시
    }
    
    return { success: true };
}

// 토큰 검증 및 사용자 정보 가져오기
async getCurrentUser() {
    const token = localStorage.getItem('authToken');
    if (!token) return null;
    
    try {
        const response = await fetch('/api/auth/me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const user = await response.json();
            this.currentUser = user;
            return this._formatUser(user);
        }
    } catch (e) {
        // 토큰 만료 등
        localStorage.removeItem('authToken');
    }
    
    return null;
}
```

**백엔드 API 엔드포인트 필요:**
- `POST /api/auth/register` - 회원가입
- `POST /api/auth/login` - 로그인
- `POST /api/auth/logout` - 로그아웃
- `GET /api/auth/me` - 현재 사용자 정보

---

### 시나리오 3: Auth0, Clerk 같은 서비스로 전환

**전문 인증 서비스를 사용하는 경우.**

#### Auth0 예시

```javascript
// auth0-config.js
import { createAuth0Client } from '@auth0/auth0-spa-js';

const auth0 = await createAuth0Client({
    domain: 'YOUR_DOMAIN',
    clientId: 'YOUR_CLIENT_ID',
    authorizationParams: {
        redirect_uri: window.location.origin
    }
});

// auth-service.js 수정
async signIn(email, password) {
    try {
        await auth0.loginWithCredentials({
            username: email,
            password: password
        });
        
        const user = await auth0.getUser();
        this.currentUser = user;
        
        return {
            success: true,
            user: this._formatUser(user)
        };
    } catch (error) {
        return {
            success: false,
            error: this._handleError(error)
        };
    }
}
```

---

## 단계별 전환 절차

### 1단계: 새 플랫폼 설정

- [ ] 새 인증 플랫폼 계정 생성/설정
- [ ] 필요한 SDK 또는 라이브러리 확인
- [ ] 테스트 환경 구축

### 2단계: 코드 수정

- [ ] `firebase-config.js` 제거 또는 교체
- [ ] `auth-service.js`의 메서드들을 새 플랫폼 API로 교체
- [ ] `_formatUser()` 메서드 수정 (새 플랫폼의 사용자 객체 형식에 맞게)
- [ ] `_handleError()` 메서드 수정 (새 플랫폼의 에러 코드에 맞게)

### 3단계: HTML 수정

- [ ] Firebase SDK 스크립트 태그 제거
- [ ] 새 플랫폼의 SDK 스크립트 태그 추가
- [ ] `firebase-config.js` 참조를 새 설정 파일로 변경

### 4단계: 테스트

- [ ] 회원가입 테스트
- [ ] 로그인 테스트
- [ ] 로그아웃 테스트
- [ ] 인증 상태 유지 테스트
- [ ] 보호된 페이지 접근 테스트

### 5단계: 데이터 마이그레이션 (필요시)

- [ ] Firebase에서 사용자 데이터 내보내기
- [ ] 새 플랫폼으로 데이터 이전
- [ ] 비밀번호 재설정 유도 (보안상 권장)

### 6단계: 배포

- [ ] 로컬 환경에서 완전히 테스트
- [ ] 스테이징 환경에 배포
- [ ] 프로덕션 배포

---

## 주의사항

### ⚠️ 전환 시 고려사항

1. **사용자 데이터 마이그레이션**
   - Firebase에서 사용자 정보를 내보낼 수 있음
   - 비밀번호는 마이그레이션 불가 (보안상 이유)
   - 사용자에게 비밀번호 재설정 안내 필요

2. **기존 세션 처리**
   - Firebase에서 로그인한 사용자는 자동으로 로그아웃됨
   - 새 플랫폼으로 재로그인 필요
   - 점진적 전환보다는 일시 중단 후 전환이 안전

3. **에러 코드 매핑**
   - 각 플랫폼마다 다른 에러 코드 사용
   - `_handleError()` 메서드에서 새 에러 코드에 맞게 수정 필요

4. **추가 기능**
   - 소셜 로그인 (Google, GitHub 등)
   - 이메일 인증
   - 비밀번호 재설정
   - 2FA (2단계 인증)
   - 등등... 새 플랫폼의 기능에 맞게 확장 가능

---

## 🔧 전환 난이도 평가

| 전환 대상 | 난이도 | 예상 시간 | 비고 |
|---------|-------|----------|------|
| **Supabase** | ⭐⭐☆☆☆ | 2-4시간 | Firebase와 유사한 구조 |
| **Auth0/Clerk** | ⭐⭐⭐☆☆ | 4-8시간 | 잘 정리된 SDK 제공 |
| **자체 백엔드** | ⭐⭐⭐⭐☆ | 1-2일 | 백엔드 구축 필요 |
| **다른 BaaS** | ⭐⭐⭐☆☆ | 4-6시간 | 문서화 정도에 따라 다름 |

---

## 💡 팁

1. **점진적 전환**
   - 한 번에 전환하지 말고, 새 플랫폼과 병행 운영 후 전환
   - A/B 테스트로 새 플랫폼 검증

2. **환경 변수 활용**
   ```javascript
   const AUTH_PROVIDER = process.env.AUTH_PROVIDER || 'firebase';
   
   if (AUTH_PROVIDER === 'firebase') {
       // Firebase 코드
   } else if (AUTH_PROVIDER === 'supabase') {
       // Supabase 코드
   }
   ```

3. **추상화 유지**
   - `auth-service.js`를 그대로 유지하고 내부 구현만 변경
   - 다른 파일들은 수정 불필요

4. **문서화**
   - 전환 과정을 문서로 남기기
   - 팀원들과 공유

---

## 📚 참고 자료

- [Supabase Auth 문서](https://supabase.com/docs/guides/auth)
- [Auth0 문서](https://auth0.com/docs)
- [JWT 인증 가이드](https://jwt.io/introduction)

---

**결론**: 현재 구조는 전환이 쉽게 설계되어 있습니다. `auth-service.js` 파일만 수정하면 대부분의 전환이 가능합니다! 🎉

