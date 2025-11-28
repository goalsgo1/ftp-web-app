# 🔐 GitHub 인증 설정 - Personal Access Token 생성하기

현재 **저장소 설정 페이지**에 있습니다. Personal Access Token을 생성하려면 **개인 계정 설정**으로 이동해야 합니다.

---

## 📍 현재 위치와 목적지

**현재 위치**: 
- 저장소 설정 (Repository Settings)
- `/goalsgo1/ftp-web-app/settings`

**목적지**: 
- 개인 계정 설정 (Account Settings)
- Personal Access Tokens

---

## 🎯 방법 1: Personal Access Token 생성 (HTTPS 인증)

### 1단계: 개인 계정 설정으로 이동

**현재 페이지에서:**

1. **우측 상단 프로필 아이콘 클릭**
   - 화면 우측 상단의 **원형 프로필 아이콘** 클릭
   - (검색바 옆에 있는 사용자 아이콘)

2. **Settings 클릭**
   - 드롭다운 메뉴에서 **"Settings"** 선택
   - 또는 직접 URL로: https://github.com/settings/profile

### 2단계: Developer settings로 이동

**개인 계정 설정 페이지에서:**

1. **왼쪽 사이드바**에서 아래로 스크롤
2. **"Developer settings"** 클릭
   - (사이드바 맨 아래쪽에 위치)
   - 또는 직접 URL로: https://github.com/settings/developers

### 3단계: Personal access tokens로 이동

**Developer settings 페이지에서:**

1. **"Personal access tokens"** 섹션 클릭
2. **"Tokens (classic)"** 선택
   - 또는 직접 URL로: https://github.com/settings/tokens

### 4단계: 새 토큰 생성

**Personal access tokens 페이지에서:**

1. **"Generate new token"** 버튼 클릭
2. **"Generate new token (classic)"** 선택

### 5단계: 토큰 설정

**토큰 생성 페이지에서:**

1. **Note** (토큰 이름):
   ```
   FTP-Web-App-Deploy
   ```
   (원하는 이름 입력)

2. **Expiration** (만료 기간):
   - `90 days` 또는 원하는 기간 선택
   - 또는 `No expiration` (만료 없음 - 비추천)

3. **Select scopes** (권한 선택):
   - ✅ **`repo`** 체크박스 선택
   - (체크하면 하위 항목들이 자동으로 선택됩니다)
   - **필수 권한**: 
     - `repo` (전체 권한)
     - `workflow` (GitHub Actions 사용 시)

4. **"Generate token"** 버튼 클릭 (맨 아래)

### 6단계: 토큰 복사

⚠️ **중요**: 토큰은 **한 번만** 표시됩니다!

1. 생성된 토큰을 **즉시 복사**하세요
   - 토큰이 `ghp_` 로 시작하는 긴 문자열
   - 예: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

2. 안전한 곳에 저장 (비밀번호 관리자 등)

3. 페이지를 나가면 다시 볼 수 없습니다!

---

## 🎯 방법 2: SSH 키 사용 (권장)

SSH 키를 사용하면 토큰 없이 인증할 수 있습니다.

### SSH 키 생성 (PowerShell)

```powershell
# SSH 키 생성
ssh-keygen -t ed25519 -C "your.email@example.com"

# Enter 두 번 (비밀번호 없이)
# 키 위치: C:\Users\사용자명\.ssh\id_ed25519
```

### 공개키 복사

```powershell
# 공개키 내용 복사
Get-Content ~\.ssh\id_ed25519.pub | clip
```

### GitHub에 SSH 키 등록

**이동 경로:**
1. 우측 상단 프로필 아이콘 클릭
2. **Settings** 선택
3. 왼쪽 사이드바에서 **"SSH and GPG keys"** 클릭
   - 또는 직접 URL: https://github.com/settings/keys
4. **"New SSH key"** 클릭
5. **Title**: `My Windows PC` (원하는 이름)
6. **Key**: 복사한 공개키 붙여넣기
7. **"Add SSH key"** 클릭

### 원격 저장소 URL을 SSH로 변경

```powershell
# SSH URL로 변경
git remote set-url origin git@github.com:goalsgo1/ftp-web-app.git

# 확인
git remote -v
```

---

## 📋 전체 이동 경로 요약

### Personal Access Token (HTTPS)

```
현재 페이지 (저장소 설정)
  ↓
우측 상단 프로필 아이콘 클릭
  ↓
Settings 클릭
  ↓
왼쪽 사이드바 → Developer settings
  ↓
Personal access tokens → Tokens (classic)
  ↓
Generate new token (classic)
```

### 직접 URL 사용

- **개인 설정**: https://github.com/settings/profile
- **Developer settings**: https://github.com/settings/developers
- **Personal access tokens**: https://github.com/settings/tokens
- **SSH keys**: https://github.com/settings/keys

---

## ✅ 토큰 생성 후 사용 방법

### 1. 원격 저장소 연결 (아직 안 했다면)

```powershell
git remote add origin https://github.com/goalsgo1/ftp-web-app.git
```

### 2. 코드 푸시

```powershell
git push -u origin main
```

**인증 정보 입력:**
- **Username**: `goalsgo1`
- **Password**: 생성한 Personal Access Token (토큰 전체 복사해서 붙여넣기)

---

## 🆘 문제 해결

### 토큰을 잃어버렸다면?
- 새 토큰을 생성해야 합니다
- 기존 토큰은 삭제할 수 있습니다: Settings → Developer settings → Personal access tokens

### SSH 연결 테스트

```powershell
ssh -T git@github.com
```

예상 결과:
```
Hi goalsgo1! You've successfully authenticated, but GitHub does not provide shell access.
```

---

## 💡 추천

- **빠른 설정**: Personal Access Token (지금 바로)
- **장기적으로**: SSH 키 (더 안전하고 편리함)

**지금 바로 토큰을 생성하시겠습니까, 아니면 SSH 키를 설정하시겠습니까?**
