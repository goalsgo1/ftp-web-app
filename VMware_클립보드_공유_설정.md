# 📋 VMware 클립보드 공유 설정 가이드

VMware에서 윈도우와 리눅스 간 클립보드 복사/붙여넣기가 작동하지 않는 경우 설정 방법입니다.

---

## 🔄 VMware Tools 설치 확인

VMware Tools가 설치되어 있어야 클립보드 공유가 가능합니다.

### 1. VMware Tools 설치 확인

**리눅스에서 실행:**
```bash
vmware-toolbox-cmd --version
```

**또는:**
```bash
which vmware-toolbox-cmd
```

### 2. VMware Tools 설치되어 있지 않은 경우

#### 방법 1: 자동 설치 (권장)

1. **VMware 메뉴**
   - 상단 메뉴: `VM` → `Install VMware Tools`

2. **리눅스에서 마운트 확인**
   ```bash
   ls /media/
   # 또는
   ls /mnt/
   ```

3. **VMware Tools 설치**
   ```bash
   # CD 마운트
   sudo mkdir -p /mnt/cdrom
   sudo mount /dev/cdrom /mnt/cdrom
   
   # 압축 파일 복사
   cd /tmp
   cp /mnt/cdrom/VMwareTools-*.tar.gz .
   tar -xzf VMwareTools-*.tar.gz
   
   # 설치
   cd vmware-tools-distrib
   sudo ./vmware-install.pl
   ```

#### 방법 2: open-vm-tools 설치 (Ubuntu/Debian)

```bash
sudo apt update
sudo apt install open-vm-tools open-vm-tools-desktop -y
```

**설치 후 재부팅:**
```bash
sudo reboot
```

---

## ✅ 클립보드 공유 확인 및 설정

### 1. VMware 설정 확인

1. **VMware Player/Workstation 실행**
2. **리눅스 가상머신 선택**
3. **Settings** (또는 우클릭 → Settings)
4. **Options** 탭
5. **Guest Isolation** 확인:
   - ✅ **"Copy and Paste"** 체크되어 있어야 함
   - ✅ **"Drag and Drop"** (선택 사항)

### 2. 리눅스에서 클립보드 도구 확인

**리눅스 터미널에서:**
```bash
# 클립보드 내용 확인
xclip -o
# 또는
xsel --clipboard --output
```

**설치되어 있지 않으면:**
```bash
sudo apt install xclip xsel -y
```

---

## 📋 복사/붙여넣기 방법

### 윈도우 → 리눅스

1. **윈도우에서 복사** (Ctrl+C)
2. **리눅스 터미널에서 붙여넣기**
   - **마우스 우클릭** → Paste
   - 또는 **Ctrl+Shift+V**
   - 또는 **Shift+Insert**

### 리눅스 → 윈도우

1. **리눅스에서 텍스트 선택**
   - 마우스로 드래그하여 선택
2. **윈도우에서 붙여넣기** (Ctrl+V)

---

## 🆘 클립보드가 작동하지 않는 경우

### 문제 해결 1: VMware Tools 재시작

**리눅스에서:**
```bash
sudo vmware-toolbox-cmd upgrade
sudo service vmware-tools restart
# 또는
sudo systemctl restart vmtoolsd
```

### 문제 해결 2: 클립보드 도구 설치

```bash
sudo apt update
sudo apt install xclip xsel -y
```

### 문제 해결 3: 수동 복사/붙여넣기

#### 방법 1: SSH 사용

**윈도우 PowerShell에서:**
```powershell
# SSH로 접속
ssh testadmin@리눅스IP

# 그 다음 복사/붙여넣기 시도
```

#### 방법 2: 파일로 전송

**윈도우에서:**
```powershell
# 공개키를 파일로 저장
Get-Content deploy_key.pub | Out-File -Encoding utf8 public_key.txt
```

**VMware 공유 폴더 사용:**
- VMware Settings → Options → Shared Folders
- 폴더 공유 설정
- 리눅스에서 `/mnt/hgfs/` 경로로 접근

#### 방법 3: 텍스트 에디터 사용

**리눅스에서:**
```bash
# 파일 생성
nano public_key.txt

# 그 다음 윈도우에서 텍스트를 수동으로 타이핑
# 또는 VMware의 텍스트 입력 기능 사용
```

---

## 💡 빠른 해결 방법

### 가장 간단한 방법: SSH 접속

**윈도우 PowerShell에서:**
```powershell
# SSH로 접속
ssh testadmin@리눅스IP주소

# SSH 터미널에서는 Ctrl+Shift+V로 붙여넣기 가능
```

### 또는: 파일 내용 직접 입력

**리눅스에서:**
```bash
# 파일 생성
nano ~/public_key.txt

# 내용 직접 입력 (윈도우에서 보면서 타이핑)
```

---

## 🔧 VMware Tools 재설치

클립보드가 계속 작동하지 않으면:

```bash
# 기존 제거 (선택 사항)
sudo apt remove open-vm-tools open-vm-tools-desktop

# 재설치
sudo apt update
sudo apt install open-vm-tools open-vm-tools-desktop -y

# 재부팅
sudo reboot
```

---

## ✅ 확인 방법

### 테스트

1. **윈도우에서** 텍스트 복사 (Ctrl+C)
2. **리눅스 터미널에서**:
   ```bash
   # 붙여넣기 시도
   # 마우스 우클릭 → Paste
   # 또는 Ctrl+Shift+V
   ```

### 성공 확인

- 텍스트가 터미널에 나타나면 성공!

---

## 📋 대안: SSH로 접속하기

클립보드 공유가 작동하지 않으면 SSH를 사용하는 것이 더 편리할 수 있습니다.

**윈도우 PowerShell에서:**
```powershell
# SSH 접속
ssh testadmin@리눅스IP주소

# SSH 터미널에서는:
# - Ctrl+Shift+V: 붙여넣기
# - Ctrl+Shift+C: 복사
```

---

## 💡 추천 방법

### 방법 1: VMware 클립보드 사용 (설정 필요)
1. VMware Tools 설치 확인
2. Guest Isolation 설정 확인
3. 복사/붙여넣기 사용

### 방법 2: SSH 사용 (가장 안정적)
```powershell
# 윈도우 PowerShell
ssh testadmin@리눅스IP

# SSH 터미널에서 Ctrl+Shift+V로 붙여넣기
```

### 방법 3: 파일 직접 생성
```bash
# 리눅스에서
nano ~/public_key.txt
# 내용 직접 입력
```

---

**지금 시도해볼 방법:**
1. 리눅스 터미널에서 **마우스 우클릭** → Paste 시도
2. 또는 **Ctrl+Shift+V** 시도
3. 안 되면 SSH로 접속해서 시도
4. 그래도 안 되면 파일로 직접 입력

**어떤 방법이 작동하나요?** 🚀
