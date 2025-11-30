# 🔑 SSH 공개키 복사 및 서버 등록 가이드

현재 화면에 보이는 파일 중 **`deploy_key.pub`**이 공개키입니다!

---

## 🔍 개인키 vs 공개키 구분

### 화면에 보이는 파일들

1. **`deploy_key`** ← **개인키 (Private Key)**
   - GitHub Secret에 등록했던 것
   - 비밀 파일, 절대 공개하지 않음

2. **`deploy_key.pub`** ← **공개키 (Public Key)** ⭐
   - 서버에 등록해야 하는 것
   - 공개해도 되는 파일
   - **이 파일을 서버에 등록해야 합니다!**

---

## ✅ 공개키 확인하기

### 1. 공개키 내용 확인

**PowerShell에서:**

```powershell
# 공개키 내용 보기
Get-Content deploy_key.pub
```

**예상 결과:**
```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIFwbll+D//Sc6TaC+cLPX7PfOA59iDDed/8f9FJpold6 deploy@server
```

**특징:**
- 한 줄짜리 짧은 문자열
- `ssh-ed25519` 또는 `ssh-rsa`로 시작
- `deploy@server` 같은 설명 포함

---

## 📋 공개키를 서버에 등록하는 방법

### 방법 1: 파일 내용 복사 후 서버에 붙여넣기

#### Step 1: 공개키 복사

**PowerShell에서:**

```powershell
# 공개키 내용을 클립보드로 복사
Get-Content deploy_key.pub | clip
```

또는 **메모장으로 열기:**

```powershell
notepad deploy_key.pub
```

메모장에서:
1. 전체 선택 (Ctrl+A)
2. 복사 (Ctrl+C)

#### Step 2: 서버에 붙여넣기

**리눅스 서버에서:**

```bash
# SSH 디렉토리 생성
sudo mkdir -p /home/deploy/.ssh
sudo chmod 700 /home/deploy/.ssh

# authorized_keys 파일 편집
sudo nano /home/deploy/.ssh/authorized_keys
```

**nano 에디터에서:**
1. 마우스 우클릭 → Paste (또는 Ctrl+Shift+V)
2. 공개키 내용이 붙여넣어짐
3. Ctrl+X로 저장 종료
4. Y로 저장 확인
5. Enter로 파일명 확인

**권한 설정:**
```bash
sudo chown -R deploy:deploy /home/deploy/.ssh
sudo chmod 600 /home/deploy/.ssh/authorized_keys
```

---

### 방법 2: 파일 직접 전송

**윈도우에서 파일 복사:**
- `deploy_key.pub` 파일을 VMware 공유 폴더나 SCP로 전송

**서버에서:**
```bash
# 파일 내용을 authorized_keys에 추가
cat deploy_key.pub >> ~/.ssh/authorized_keys
# 또는
sudo cat /경로/deploy_key.pub >> /home/deploy/.ssh/authorized_keys
```

---

### 방법 3: SSH로 직접 복사 (권장) ⭐

**PowerShell에서:**

```powershell
# 공개키를 서버에 직접 추가
type deploy_key.pub | ssh testadmin@서버IP "sudo tee -a /home/deploy/.ssh/authorized_keys"

# 또는
Get-Content deploy_key.pub | ssh testadmin@서버IP "sudo tee -a /home/deploy/.ssh/authorized_keys"
```

**그 다음 서버에서 권한 설정:**
```bash
sudo chown -R deploy:deploy /home/deploy/.ssh
sudo chmod 700 /home/deploy/.ssh
sudo chmod 600 /home/deploy/.ssh/authorized_keys
```

---

## 📝 단계별 등록 방법 (가장 확실한 방법)

### Step 1: 공개키 복사

**PowerShell에서:**

```powershell
# 현재 위치 확인
cd C:\FTP

# 공개키 내용 복사
Get-Content deploy_key.pub | clip

# 또는 메모장으로 열기
notepad deploy_key.pub
```

**복사한 내용 예시:**
```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIFwbll+D//Sc6TaC+cLPX7PfOA59iDDed/8f9FJpold6 deploy@server
```

### Step 2: 서버에서 디렉토리 생성

**리눅스 서버에서:**

```bash
# SSH 디렉토리 생성
sudo mkdir -p /home/deploy/.ssh
sudo chmod 700 /home/deploy/.ssh
```

### Step 3: 공개키 등록

**리눅스 서버에서:**

```bash
# authorized_keys 파일 편집
sudo nano /home/deploy/.ssh/authorized_keys
```

**nano 에디터에서:**
1. 붙여넣기:
   - 마우스 우클릭 → Paste
   - 또는 Ctrl+Shift+V
   - 또는 Shift+Insert

2. 저장:
   - Ctrl+X (종료)
   - Y (저장 확인)
   - Enter (파일명 확인)

### Step 4: 권한 설정

```bash
sudo chown -R deploy:deploy /home/deploy/.ssh
sudo chmod 600 /home/deploy/.ssh/authorized_keys
```

### Step 5: 확인

```bash
# 파일 확인
cat /home/deploy/.ssh/authorized_keys

# 권한 확인
ls -la /home/deploy/.ssh/
```

**예상 결과:**
```
total 12
drwx------ 2 deploy deploy 4096 Nov 28 13:50 .
drwxr-xr-x 4 deploy deploy 4096 Nov 28 13:45 ..
-rw------- 1 deploy deploy   XXX Nov 28 13:50 authorized_keys
```

---

## 🔍 공개키 내용 확인

**PowerShell에서 실행:**

```powershell
Get-Content deploy_key.pub
```

**예상 출력:**
```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIFwbll+D//Sc6TaC+cLPX7PfOA59iDDed/8f9FJpold6 deploy@server
```

**이 한 줄 전체를 서버에 등록해야 합니다!**

---

## ✅ 등록 확인

### SSH 연결 테스트

**PowerShell에서:**

```powershell
# SSH 키를 사용하여 서버 접속 테스트
ssh -i deploy_key deploy@서버IP주소
```

**성공하면:**
- 서버에 로그인됨
- 비밀번호 없이 접속됨

**실패하면:**
- 공개키가 올바르게 등록되지 않았을 수 있음
- 권한 문제일 수 있음

---

## 🆘 문제 해결

### 공개키 내용이 보이지 않아요

**메모장으로 열기:**
```powershell
notepad deploy_key.pub
```

### 붙여넣기가 안 돼요

**nano에서:**
- 마우스 우클릭 → Paste
- 또는 Shift+Insert

**또는 파일로 직접 추가:**
```bash
# 공개키 내용을 직접 입력
sudo nano /home/deploy/.ssh/authorized_keys
# 공개키 내용을 타이핑
```

### SSH 연결이 안 돼요

**확인 사항:**
1. 공개키가 올바르게 등록되었는지
2. 권한이 올바른지
3. 서버 IP 주소가 맞는지

---

## 💡 요약

### 공개키는:
- **파일 이름**: `deploy_key.pub` (`.pub` 확장자)
- **내용**: 한 줄짜리 짧은 문자열
- **용도**: 서버에 등록 (GitHub Actions가 서버 접속 시 사용)

### 개인키는:
- **파일 이름**: `deploy_key` (확장자 없음)
- **내용**: 긴 암호화된 문자열 (여러 줄)
- **용도**: GitHub Secret에 등록 (이미 완료)

---

## 🎯 지금 바로 할 일

### 1. 공개키 복사

**PowerShell에서:**

```powershell
Get-Content deploy_key.pub | clip
```

### 2. 서버에 등록

**리눅스 서버에서:**

```bash
sudo mkdir -p /home/deploy/.ssh
sudo chmod 700 /home/deploy/.ssh
sudo nano /home/deploy/.ssh/authorized_keys
# 공개키 붙여넣기
sudo chown -R deploy:deploy /home/deploy/.ssh
sudo chmod 600 /home/deploy/.ssh/authorized_keys
```

---

**지금 PowerShell에서 `Get-Content deploy_key.pub`를 실행해서 공개키 내용을 확인하세요!** 🔍
