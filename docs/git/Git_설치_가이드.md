# 🔧 Git 설치 가이드 (Windows)

현재 시스템에 Git이 설치되어 있지 않습니다. 다음 방법 중 하나로 Git을 설치하세요.

## 방법 1: 공식 웹사이트에서 설치 (권장) ⭐

### 1단계: 다운로드
1. 웹 브라우저에서 다음 주소 접속:
   ```
   https://git-scm.com/download/win
   ```
2. 자동으로 다운로드가 시작됩니다
3. 다운로드한 파일 실행 (예: `Git-2.x.x-64-bit.exe`)

### 2단계: 설치
1. 설치 마법사가 시작됩니다
2. **대부분의 경우 기본 설정으로 진행**하면 됩니다
   - Next 버튼을 계속 클릭
   - 중요한 옵션:
     - **"Git from the command line and also from 3rd-party software"** 선택 (기본값)
     - **"Use bundled OpenSSH"** 선택 (기본값)
     - **"Use the OpenSSL library"** 선택 (기본값)
     - **"Checkout Windows-style, commit Unix-style line endings"** 선택 (기본값)
3. 설치 완료까지 대기 (약 1-2분)

### 3단계: 설치 확인
PowerShell을 다시 시작한 후:
```powershell
git --version
```

다음과 같은 출력이 나오면 성공:
```
git version 2.x.x
```

---

## 방법 2: Chocolatey 사용 (관리자 권한 필요)

관리자 권한으로 PowerShell 실행 후:

```powershell
# Chocolatey 설치 (아직 설치하지 않은 경우)
Set-ExecutionPolicy Bypass -Scope Process -Force
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Git 설치
choco install git -y
```

---

## 방법 3: Winget 사용 (Windows 10/11)

```powershell
winget install --id Git.Git -e --source winget
```

---

## 설치 후 설정

### 1. Git 사용자 정보 설정
```powershell
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### 2. 설정 확인
```powershell
git config --global user.name
git config --global user.email
```

---

## 설치 후 다음 단계

Git 설치가 완료되면:

1. **PowerShell 재시작** (중요!)
2. 다음 명령어로 다시 시작:
   ```powershell
   cd C:\FTP
   .\배포_시작하기.ps1
   ```
   
   또는 수동으로 진행:
   ```powershell
   # 디렉토리 구조 확인
   ls public
   
   # Git 저장소 초기화
   git init
   git branch -M main
   
   # 파일 추가
   git add .
   
   # 첫 커밋
   git commit -m "Initial commit"
   ```

---

## 문제 해결

### Git 명령어를 찾을 수 없습니다

**해결책:**
1. PowerShell을 완전히 종료하고 다시 시작
2. 그래도 안 되면 컴퓨터 재시작
3. 시스템 환경 변수 PATH 확인:
   ```powershell
   $env:PATH -split ';' | Select-String git
   ```

### 설치 후에도 git 명령어가 작동하지 않음

**해결책:**
1. Git 설치 시 "Git from the command line" 옵션 확인
2. 수동으로 PATH 추가:
   ```
   C:\Program Files\Git\cmd
   ```

---

## 빠른 참조

| 작업 | 명령어 |
|------|--------|
| Git 버전 확인 | `git --version` |
| 사용자 이름 설정 | `git config --global user.name "이름"` |
| 이메일 설정 | `git config --global user.email "이메일"` |
| 저장소 초기화 | `git init` |
| 파일 추가 | `git add .` |
| 커밋 | `git commit -m "메시지"` |

---

**다운로드 링크**: https://git-scm.com/download/win

설치 후 이 가이드를 다시 참고하여 진행하세요!


