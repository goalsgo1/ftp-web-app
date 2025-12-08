# 🚀 빠른 시작 가이드

> **MY-DASHBOARD 프로젝트 실행 가이드**  
> 빠른 참조용 간단 가이드입니다. 상세 내용은 `DEVELOPMENT_SERVER_GUIDE.md`를 참고하세요.

---

## 📋 목차

1. [개발 서버 실행](#개발-서버-실행)
2. [개발 서버 종료](#개발-서버-종료)
3. [실행 상태 확인](#실행-상태-확인)
4. [문제 해결](#문제-해결)

---

## 🟢 개발 서버 실행

### 기본 실행

```powershell
npm.cmd run dev
```

**실행 확인:**
- 터미널에 다음과 같은 메시지가 표시됩니다:
  ```
  ▲ Next.js 16.0.6
  - Local:        http://localhost:3000
  - Ready in 2.3s
  ```
- 브라우저에서 **http://localhost:3000** 접속

### 다른 포트로 실행

포트 3000이 이미 사용 중인 경우:

```powershell
npm.cmd run dev -- -p 3001
```

---

## 🔴 개발 서버 종료

### 방법 1: 터미널에서 종료 (권장)

서버가 실행 중인 터미널에서:

```
Ctrl + C
```

### 방법 2: 프로세스 강제 종료

터미널이 닫혔거나 응답하지 않는 경우:

#### 단계별 가이드

**1단계: 포트를 사용하는 프로세스 찾기**
```powershell
netstat -ano | findstr :3000
```

**출력 예시:**
```
TCP    0.0.0.0:3000           0.0.0.0:0              LISTENING       17852
```
→ `17852`가 프로세스 ID (PID)입니다.

**2단계: 프로세스 종료**
```powershell
taskkill /PID 17852 /F
```

> ⚠️ **주의**: `17852`를 실제 PID로 교체하세요.

#### 한 번에 실행 (PowerShell 스크립트)

```powershell
$port = 3000
$process = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess
if ($process) {
    Stop-Process -Id $process -Force
    Write-Host "포트 $port 의 프로세스가 종료되었습니다."
} else {
    Write-Host "포트 $port 에서 실행 중인 프로세스가 없습니다."
}
```

---

## ✅ 실행 상태 확인

### 서버가 실행 중인지 확인

```powershell
netstat -ano | findstr :3000
```

**출력이 있으면**: 서버가 실행 중입니다  
**출력이 없으면**: 서버가 실행되지 않았습니다

### 브라우저에서 확인

1. http://localhost:3000 접속
2. 대시보드 UI가 표시되면 정상 실행

---

## 🛠️ 문제 해결

### 문제 1: 포트가 이미 사용 중

**에러:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**해결:**
```powershell
# 방법 1: 다른 포트 사용
npm.cmd run dev -- -p 3001

# 방법 2: 기존 프로세스 종료
netstat -ano | findstr :3000
taskkill /PID [PID번호] /F
```

### 문제 2: PowerShell 실행 정책 오류

**에러:**
```
npm : 이 시스템에서 스크립트를 실행할 수 없으므로...
```

**해결:**
```powershell
# npm.cmd 사용 (권장)
npm.cmd run dev

# 또는 실행 정책 변경 (관리자 권한 필요)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### 문제 3: 서버가 시작되지 않음

**확인 사항:**

1. **의존성 설치 확인:**
   ```powershell
   npm install
   ```

2. **에러 로그 확인:**
   - 터미널에 표시된 에러 메시지 확인
   - Firebase 환경 변수 설정 확인 (`.env.local`)

3. **캐시 삭제 후 재시작:**
   ```powershell
   Remove-Item -Recurse -Force .next
   npm.cmd run dev
   ```

### 문제 4: 변경사항이 반영되지 않음

**해결:**
1. 서버 재시작: `Ctrl + C` 후 다시 `npm.cmd run dev`
2. 캐시 삭제: `.next` 폴더 삭제 후 재시작

---

## 📝 명령어 요약

| 작업 | 명령어 |
|------|--------|
| **서버 실행** | `npm.cmd run dev` |
| **서버 종료** | `Ctrl + C` |
| **다른 포트로 실행** | `npm.cmd run dev -- -p 3001` |
| **실행 상태 확인** | `netstat -ano \| findstr :3000` |
| **프로세스 강제 종료** | `taskkill /PID [PID] /F` |

---

## 💡 팁

1. **자동 재시작**: Next.js는 파일 변경 시 자동으로 재시작됩니다.
2. **에러 확인**: 서버 실행 중 에러는 터미널에 빨간색으로 표시됩니다.
3. **환경 변수**: Firebase 기능을 사용하려면 `.env.local` 파일이 필요합니다.
   - 자세한 내용: `FIREBASE_ENV_SETUP.md` 참고

---

## 🔗 관련 문서

### 필수 설정
- **Firebase 환경 변수 설정**: `FIREBASE_ENV_SETUP.md` - Firebase 기능 사용을 위한 환경 변수 설정
- **Firebase 인증 설정**: `FIREBASE_AUTH_SETUP.md` - 로그인 기능 활성화

### 추가 가이드
- **실행 상태 확인**: `CHECK_RUN_STATUS.md` - 현재 실행 가능 상태 점검
- **상세 개발 서버 가이드**: `DEVELOPMENT_SERVER_GUIDE.md` - 포트 변경, 고급 문제 해결 등
- **개발 가이드**: `DEVELOPMENT_GUIDE.md` - 컴포넌트 사용법, 코드 스타일 등

---

**작성일**: 2025-01-27  
**버전**: 1.0  
**용도**: 빠른 참조용 간단 가이드

