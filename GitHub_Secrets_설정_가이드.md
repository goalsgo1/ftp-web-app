# 🔐 GitHub Actions Secrets 설정 가이드

GitHub Actions 자동 배포를 위해 3개의 Secret을 추가해야 합니다.

---

## 📋 필요한 Secrets 목록

1. **`DEPLOY_HOST`** - 서버 IP 주소
2. **`DEPLOY_USER`** - 배포 사용자명 (예: `deploy`)
3. **`DEPLOY_KEY`** - SSH 개인키

---

## 🎯 각 Secret 추가 방법

### ⚠️ 현재 Name이 "deploy"로 되어 있는 경우

**Name 필드를 지우고** 아래 3개를 **각각 따로** 추가해야 합니다!

각 Secret을 하나씩 추가하세요:
1. 첫 번째 Secret 추가 → Name 변경
2. Add secret 클릭
3. New secret 다시 클릭
4. 두 번째 Secret 추가
5. 반복...

---

## 1️⃣ DEPLOY_HOST (서버 IP 주소)

### Name
```
DEPLOY_HOST
```
(대문자로 정확히 입력)

### Secret 값
```
192.168.1.100
```
또는
```
서버IP주소
```
(실제 리눅스 웹 서버의 IP 주소)

**예시:**
- `192.168.1.100`
- `172.30.1.42`
- `203.0.113.1`
- 도메인도 가능: `example.com`

---

## 2️⃣ DEPLOY_USER (배포 사용자명)

### Name
```
DEPLOY_USER
```
(대문자로 정확히 입력)

### Secret 값
```
deploy
```
또는 실제 배포 사용자명

**일반적인 값:**
- `deploy` (가장 많이 사용)
- `ubuntu`
- `www-data`
- 또는 서버에 생성한 배포 전용 사용자명

---

## 3️⃣ DEPLOY_KEY (SSH 개인키) ⚠️ 가장 중요!

### Name
```
DEPLOY_KEY
```
(대문자로 정확히 입력)

### Secret 값
SSH 개인키 전체 내용

#### SSH 키가 이미 있는 경우

**PowerShell에서:**

```powershell
# SSH 키 위치 확인 (일반적으로)
Get-Content ~\.ssh\id_rsa

# 또는 ed25519 키인 경우
Get-Content ~\.ssh\id_ed25519
```

**복사 방법:**
```powershell
# 전체 개인키 복사
Get-Content ~\.ssh\id_rsa | clip
```

#### SSH 키가 없는 경우 - 새로 생성

**PowerShell에서:**

```powershell
# SSH 키 생성
ssh-keygen -t ed25519 -C "deploy@server" -f deploy_key

# Enter 두 번 (비밀번호 없이)
# 생성된 파일:
#   - deploy_key (개인키) ← 이것을 복사
#   - deploy_key.pub (공개키)
```

**개인키 복사:**
```powershell
# 개인키 내용 복사
Get-Content deploy_key | clip
```

#### SSH 키 형식 (예시)

개인키는 다음과 같은 형식입니다:

```
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAMwAAAAtzc2gtZW
QyNTUxOQAAACBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
...
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
-----END OPENSSH PRIVATE KEY-----
```

**⚠️ 중요:**
- `-----BEGIN`부터 `-----END`까지 **전체**를 복사
- 공백이나 줄바꿈 포함해서 전체 복사
- 공개키(`.pub`)가 아닌 **개인키**를 복사!

---

## 📝 단계별 추가 방법

### Step 1: DEPLOY_HOST 추가

1. **Name 필드**: `DEPLOY_HOST` 입력
2. **Secret 필드**: 서버 IP 주소 입력
   - 예: `192.168.1.100`
3. **"Add secret"** 버튼 클릭

### Step 2: DEPLOY_USER 추가

1. **"New secret"** 버튼 클릭 (또는 "Add secret" 후 다시 시작)
2. **Name 필드**: `DEPLOY_USER` 입력
3. **Secret 필드**: 사용자명 입력
   - 예: `deploy`
4. **"Add secret"** 버튼 클릭

### Step 3: DEPLOY_KEY 추가

1. **"New secret"** 버튼 클릭
2. **Name 필드**: `DEPLOY_KEY` 입력
3. **Secret 필드**: SSH 개인키 전체 붙여넣기
   - PowerShell에서 복사한 개인키 전체
4. **"Add secret"** 버튼 클릭

---

## 🔑 SSH 키 생성 및 서버 등록 (처음부터)

SSH 키가 없다면 다음 단계를 진행하세요:

### 1. SSH 키 생성 (Windows PowerShell)

```powershell
# 배포 전용 SSH 키 생성
ssh-keygen -t ed25519 -C "deploy@server" -f deploy_key

# Enter 두 번 (비밀번호 없이)
```

**생성된 파일:**
- `deploy_key` - 개인키 (GitHub Secret에 등록)
- `deploy_key.pub` - 공개키 (서버에 등록)

### 2. 공개키를 서버에 등록

**공개키 복사:**
```powershell
Get-Content deploy_key.pub | clip
```

**리눅스 서버에서:**
```bash
# deploy 사용자 생성 (아직 안 했다면)
sudo adduser deploy
sudo usermod -aG sudo deploy

# SSH 디렉토리 생성
sudo mkdir -p /home/deploy/.ssh
sudo chmod 700 /home/deploy/.ssh

# 공개키 추가 (Windows에서 복사한 내용 붙여넣기)
sudo nano /home/deploy/.ssh/authorized_keys

# 권한 설정
sudo chown -R deploy:deploy /home/deploy/.ssh
sudo chmod 600 /home/deploy/.ssh/authorized_keys
```

### 3. SSH 연결 테스트

**PowerShell에서:**
```powershell
# SSH 연결 테스트
ssh -i deploy_key deploy@서버IP주소

# 예시:
# ssh -i deploy_key deploy@192.168.1.100
```

성공하면 서버에 접속됩니다!

---

## ✅ 추가 완료 확인

3개의 Secret을 모두 추가한 후:

1. **Secrets 목록 확인**
   - Settings → Secrets and variables → Actions
   - 다음 3개가 보여야 함:
     - ✅ DEPLOY_HOST
     - ✅ DEPLOY_USER
     - ✅ DEPLOY_KEY

2. **각 Secret 이름 확인**
   - 정확히 대문자로 되어 있는지 확인
   - 오타 없는지 확인

---

## 🎯 다음 단계

Secrets 설정이 완료되면:

1. **코드 푸시** → GitHub Actions 자동 실행
2. **Actions 탭 확인**
   - https://github.com/goalsgo1/ftp-web-app/actions
   - 워크플로우 실행 상태 확인

---

## 🆘 문제 해결

### SSH 키 복사가 안 됨

**방법 1: 파일 열어서 복사**
```powershell
# 메모장으로 열기
notepad deploy_key

# 전체 선택 (Ctrl+A) → 복사 (Ctrl+C)
```

**방법 2: 직접 파일 읽기**
```powershell
Get-Content deploy_key
# 화면에 출력된 내용을 수동으로 복사
```

### Secret 이름이 틀렸어요

**삭제하고 다시 추가:**
1. Secrets 목록에서 잘못된 Secret 찾기
2. 우측에 삭제 버튼 클릭
3. New secret으로 다시 추가

### SSH 연결이 안 돼요

**확인 사항:**
1. 공개키가 서버에 제대로 등록되었는지
2. 서버 IP 주소가 맞는지
3. 방화벽에서 SSH 포트(22)가 열려있는지

---

## 📚 참고 문서

- **전체 가이드**: `단계별_배포_가이드.md`의 "7. GitHub Actions CI/CD 설정"
- **서버 준비**: `단계별_배포_가이드.md`의 "5. 서버 준비"

---

**지금 "deploy" 대신 "DEPLOY_HOST"로 변경하고 서버 IP를 입력하세요!** 🔐
