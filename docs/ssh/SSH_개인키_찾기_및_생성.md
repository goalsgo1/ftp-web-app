# 🔑 SSH 개인키 찾기 및 생성 가이드

SSH 개인키를 찾거나 새로 생성하는 방법입니다.

---

## 🔍 기존 SSH 키 찾기

### Windows에서 SSH 키 위치

SSH 키는 일반적으로 다음 위치에 저장됩니다:

```
C:\Users\사용자명\.ssh\
```

**일반적인 키 파일 이름:**
- `id_rsa` (RSA 키 개인키)
- `id_rsa.pub` (RSA 키 공개키)
- `id_ed25519` (Ed25519 키 개인키) ← 최신, 권장
- `id_ed25519.pub` (Ed25519 키 공개키)

---

## 📍 PowerShell에서 확인하기

### 1. SSH 디렉토리 확인

```powershell
# SSH 디렉토리가 있는지 확인
Test-Path ~\.ssh

# SSH 디렉토리 내용 확인
Get-ChildItem ~\.ssh
```

### 2. 기존 키 파일 확인

```powershell
# 모든 SSH 키 파일 확인
Get-ChildItem ~\.ssh | Where-Object { $_.Name -like "id_*" -and $_.Name -notlike "*.pub" }

# 또는 간단하게
ls ~\.ssh\id_*
```

**결과 예시:**
```
    Directory: C:\Users\사용자명\.ssh

Mode                 LastWriteTime         Length Name
----                 -------------         ------ ----
-a---         2024/01/15    10:30           1234 id_rsa
-a---         2024/01/15    10:30            567 id_rsa.pub
```

---

## 🔑 개인키 확인 및 복사

### 방법 1: PowerShell로 직접 확인

```powershell
# 개인키 파일이 있는지 확인
Test-Path ~\.ssh\id_rsa
Test-Path ~\.ssh\id_ed25519

# 개인키 내용 보기 (화면에 출력)
Get-Content ~\.ssh\id_rsa
# 또는
Get-Content ~\.ssh\id_ed25519
```

### 방법 2: 클립보드로 복사

```powershell
# RSA 키 복사
Get-Content ~\.ssh\id_rsa | clip

# 또는 Ed25519 키 복사
Get-Content ~\.ssh\id_ed25519 | clip
```

복사 후 GitHub Secret의 Secret 필드에 붙여넣기 (Ctrl+V)

### 방법 3: 메모장으로 열기

```powershell
# 메모장으로 개인키 열기
notepad ~\.ssh\id_rsa

# 또는 Ed25519 키
notepad ~\.ssh\id_ed25519
```

열린 메모장에서:
1. 전체 선택 (Ctrl+A)
2. 복사 (Ctrl+C)
3. GitHub Secret 필드에 붙여넣기

---

## ✨ SSH 키가 없는 경우 - 새로 생성하기

SSH 키가 없다면 새로 생성해야 합니다.

### 1. 배포 전용 SSH 키 생성

**PowerShell에서 실행:**

```powershell
# 배포 전용 SSH 키 생성
ssh-keygen -t ed25519 -C "deploy@server" -f deploy_key

# Enter 두 번 누르기 (비밀번호 없이)
```

**생성된 파일:**
- `deploy_key` - 개인키 (GitHub Secret에 사용)
- `deploy_key.pub` - 공개키 (서버에 등록)

### 2. 개인키 복사

```powershell
# 생성된 개인키 복사
Get-Content deploy_key | clip
```

또는 메모장으로 열기:

```powershell
notepad deploy_key
```

전체 선택 후 복사해서 GitHub Secret에 붙여넣기

### 3. 공개키도 복사 (서버 등록용)

```powershell
# 공개키 복사
Get-Content deploy_key.pub | clip
```

이 공개키는 나중에 서버에 등록해야 합니다.

---

## 📋 SSH 키 형식 확인

개인키는 다음과 같은 형식입니다:

### RSA 키 형식
```
-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
...
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
-----END RSA PRIVATE KEY-----
```

### Ed25519 키 형식 (더 짧음)
```
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAMwAAAAtzc2gtZW
QyNTUxOQAAACBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
...
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
-----END OPENSSH PRIVATE KEY-----
```

**⚠️ 중요:**
- `-----BEGIN`부터 `-----END`까지 **전체**를 복사해야 합니다
- 공개키(`.pub`)가 아닌 **개인키**를 복사해야 합니다
- 공백과 줄바꿈도 포함해서 전체 복사

---

## 🔍 어떤 키를 사용해야 하나요?

### 이미 SSH 키가 있는 경우

1. **기존 키 확인:**
   ```powershell
   Get-ChildItem ~\.ssh\id_*
   ```

2. **개인키 복사:**
   ```powershell
   Get-Content ~\.ssh\id_rsa | clip
   # 또는
   Get-Content ~\.ssh\id_ed25519 | clip
   ```

3. **GitHub Secret에 붙여넣기**

### SSH 키가 없는 경우

**배포 전용 키 생성 권장:**

```powershell
# 배포 전용 키 생성
ssh-keygen -t ed25519 -C "deploy@server" -f deploy_key

# 개인키 복사
Get-Content deploy_key | clip
```

---

## ✅ 확인 체크리스트

- [ ] SSH 디렉토리 확인: `~\.ssh` 폴더 존재
- [ ] 개인키 파일 확인: `id_rsa` 또는 `id_ed25519` 존재
- [ ] 개인키 내용 확인: `-----BEGIN`부터 `-----END`까지 있음
- [ ] 개인키 복사 완료
- [ ] GitHub Secret에 붙여넣기

---

## 🚀 빠른 확인 명령어

**PowerShell에서 한 번에 실행:**

```powershell
Write-Host "=== SSH 키 확인 ===" -ForegroundColor Cyan

# SSH 디렉토리 확인
if (Test-Path ~\.ssh) {
    Write-Host "✅ SSH 디렉토리 존재" -ForegroundColor Green
    Write-Host ""
    Write-Host "키 파일 목록:" -ForegroundColor Yellow
    Get-ChildItem ~\.ssh\id_* | Select-Object Name, Length
    Write-Host ""
    
    # 개인키 확인
    if (Test-Path ~\.ssh\id_rsa) {
        Write-Host "✅ RSA 개인키 발견: ~\.ssh\id_rsa" -ForegroundColor Green
        Write-Host "복사 명령어: Get-Content ~\.ssh\id_rsa | clip" -ForegroundColor Gray
    }
    if (Test-Path ~\.ssh\id_ed25519) {
        Write-Host "✅ Ed25519 개인키 발견: ~\.ssh\id_ed25519" -ForegroundColor Green
        Write-Host "복사 명령어: Get-Content ~\.ssh\id_ed25519 | clip" -ForegroundColor Gray
    }
} else {
    Write-Host "❌ SSH 디렉토리가 없습니다." -ForegroundColor Red
    Write-Host "새 키 생성: ssh-keygen -t ed25519 -C 'deploy@server' -f deploy_key" -ForegroundColor Yellow
}
```

---

## 🆘 문제 해결

### SSH 디렉토리가 없어요

**해결:** 새 키 생성
```powershell
ssh-keygen -t ed25519 -C "deploy@server" -f deploy_key
```

### 키 파일이 보이지 않아요

**확인:**
```powershell
# 숨김 파일 포함해서 확인
Get-ChildItem ~\.ssh -Force
```

### 개인키를 복사했는데 작동하지 않아요

**확인 사항:**
1. 전체 내용을 복사했는지 (`-----BEGIN`부터 `-----END`까지)
2. 공개키가 아닌 개인키를 복사했는지
3. 공백이나 줄바꿈이 포함되었는지

---

## 📚 다음 단계

개인키를 복사했다면:

1. **GitHub Secret에 붙여넣기**
   - Name: `DEPLOY_KEY`
   - Secret: 복사한 개인키 전체

2. **공개키를 서버에 등록** (나중에)
   - 공개키(`.pub` 파일)를 서버의 `~/.ssh/authorized_keys`에 추가

---

**지금 PowerShell에서 `Get-ChildItem ~\.ssh\id_*`를 실행해서 키 파일을 확인해보세요!** 🔍
