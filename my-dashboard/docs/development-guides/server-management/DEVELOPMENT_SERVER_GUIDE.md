# 🚀 개발 서버 실행 및 종료 가이드

> **MY-DASHBOARD 프로젝트 개발 서버 상세 가이드**  
> 빠른 참조는 `QUICK_START.md`를, 이 문서는 포트 변경, 고급 문제 해결 등 상세 내용을 다룹니다.

---

## 📋 목차

1. [개발 서버 실행](#개발-서버-실행)
2. [개발 서버 종료](#개발-서버-종료)
3. [포트 변경](#포트-변경)
4. [문제 해결](#문제-해결)

---

## 🟢 개발 서버 실행

### 방법 1: 기본 실행 (포트 3000)

```powershell
npm.cmd run dev
```

**또는**

```powershell
npm run dev
```

> ⚠️ **PowerShell 실행 정책 오류가 발생하는 경우**: `npm.cmd`를 사용하세요.

### 방법 2: 다른 포트로 실행

포트 3000이 이미 사용 중인 경우:

```powershell
npm.cmd run dev -- -p 3001
```

또는

```powershell
$env:PORT=3001; npm.cmd run dev
```

### 실행 확인

서버가 정상적으로 실행되면 다음과 같은 메시지가 표시됩니다:

```
  ▲ Next.js 16.0.6
  - Local:        http://localhost:3000
  - Ready in 2.3s
```

브라우저에서 **http://localhost:3000** (또는 설정한 포트)로 접속하세요.

---

## 🔴 개발 서버 종료

### 방법 1: 터미널에서 직접 종료 (권장)

서버가 실행 중인 터미널에서:

```
Ctrl + C
```

**PowerShell에서:**
- `Ctrl + C`를 누르면 서버가 종료됩니다
- 확인 메시지가 나오면 `Y`를 입력하거나 그냥 Enter를 누르세요

### 방법 2: 프로세스 강제 종료

터미널이 닫혔거나 응답하지 않는 경우:

#### 1단계: 포트를 사용하는 프로세스 찾기

```powershell
netstat -ano | findstr :3000
```

출력 예시:
```
TCP    0.0.0.0:3000           0.0.0.0:0              LISTENING       17852
```

여기서 `17852`가 프로세스 ID (PID)입니다.

#### 2단계: 프로세스 종료

```powershell
taskkill /PID 17852 /F
```

> ⚠️ **주의**: PID는 실제 값으로 교체하세요.

#### 한 번에 실행 (포트 3000)

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

## 🔧 포트 변경

### 개발 서버를 다른 포트로 실행

#### 방법 1: 명령어 옵션 사용

```powershell
npm.cmd run dev -- -p 3001
```

#### 방법 2: 환경 변수 사용

```powershell
$env:PORT=3001
npm.cmd run dev
```

#### 방법 3: package.json 수정 (영구 변경)

`package.json` 파일의 `scripts` 섹션을 수정:

```json
{
  "scripts": {
    "dev": "next dev -p 3001",
    "build": "next build",
    "start": "next start"
  }
}
```

---

## 🛠️ 문제 해결

### 문제 1: 포트가 이미 사용 중

**에러 메시지:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**해결 방법:**

1. **다른 포트 사용:**
   ```powershell
   npm.cmd run dev -- -p 3001
   ```

2. **기존 프로세스 종료:**
   ```powershell
   # 포트 3000을 사용하는 프로세스 찾기
   netstat -ano | findstr :3000
   
   # 프로세스 종료 (PID를 실제 값으로 교체)
   taskkill /PID [PID번호] /F
   ```

### 문제 2: PowerShell 실행 정책 오류

**에러 메시지:**
```
npm : 이 시스템에서 스크립트를 실행할 수 없으므로...
```

**해결 방법:**

1. **npm.cmd 사용 (권장):**
   ```powershell
   npm.cmd run dev
   ```

2. **실행 정책 변경 (관리자 권한 필요):**
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```

### 문제 3: 서버가 시작되지 않음

**확인 사항:**

1. **의존성 설치 확인:**
   ```powershell
   npm install
   ```

2. **포트 확인:**
   ```powershell
   netstat -ano | findstr :3000
   ```

3. **에러 로그 확인:**
   - 터미널에 표시된 에러 메시지 확인
   - Firebase 환경 변수 설정 확인 (`.env.local`)

### 문제 4: 변경사항이 반영되지 않음

**해결 방법:**

1. **서버 재시작:**
   - `Ctrl + C`로 서버 종료
   - 다시 `npm.cmd run dev` 실행

2. **캐시 삭제:**
   ```powershell
   # .next 폴더 삭제
   Remove-Item -Recurse -Force .next
   
   # 서버 재시작
   npm.cmd run dev
   ```

---

## 📝 빠른 참조

### 실행
```powershell
npm.cmd run dev
```

### 종료
```
Ctrl + C
```

### 다른 포트로 실행
```powershell
npm.cmd run dev -- -p 3001
```

### 프로세스 강제 종료
```powershell
# 포트 3000 사용 프로세스 찾기
netstat -ano | findstr :3000

# 프로세스 종료 (PID 교체 필요)
taskkill /PID [PID] /F
```

---

## 💡 팁

1. **백그라운드 실행**: PowerShell에서는 `Start-Process`를 사용할 수 있지만, 개발 중에는 터미널에서 직접 실행하는 것이 권장됩니다.

2. **자동 재시작**: Next.js는 파일 변경 시 자동으로 재시작되므로, 코드를 수정하면 자동으로 반영됩니다.

3. **에러 확인**: 서버 실행 중 에러가 발생하면 터미널에 빨간색으로 표시됩니다. 에러 메시지를 확인하여 문제를 해결하세요.

---

## 🔗 관련 문서

- **빠른 시작**: `QUICK_START.md` - 간단한 실행/종료 가이드
- **실행 상태 확인**: `CHECK_RUN_STATUS.md` - 현재 실행 가능 상태 점검
- **Firebase 환경 변수 설정**: `FIREBASE_ENV_SETUP.md`
- **개발 가이드**: `DEVELOPMENT_GUIDE.md` - 컴포넌트 사용법 등

---

**작성일**: 2025-01-27  
**버전**: 1.0  
**용도**: 상세 가이드 (포트 변경, 고급 문제 해결 등)

