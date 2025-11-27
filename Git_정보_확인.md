# 🔍 Git 정보 확인하기

PowerShell에서 다음 명령어들을 실행하여 Git 정보를 확인하세요.

## 1️⃣ Git 사용자 이름 확인

```powershell
git config user.name
```

또는 글로벌 설정:

```powershell
git config --global user.name
```

---

## 2️⃣ Git 사용자 이메일 확인

```powershell
git config user.email
```

또는 글로벌 설정:

```powershell
git config --global user.email
```

---

## 3️⃣ 모든 Git 설정 확인

```powershell
git config --list
```

또는 글로벌 설정만:

```powershell
git config --global --list
```

---

## 4️⃣ GitHub 저장소 연결 정보 확인

Git 저장소가 초기화되어 있고 원격 저장소가 연결되어 있다면:

```powershell
# 원격 저장소 URL 확인
git remote -v

# 또는 상세 정보
git remote show origin
```

---

## 5️⃣ 한 번에 모두 확인하기

```powershell
Write-Host "=== Git 사용자 정보 ===" -ForegroundColor Cyan
Write-Host "이름: " -NoNewline; git config --global user.name
Write-Host "이메일: " -NoNewline; git config --global user.email
Write-Host ""
Write-Host "=== 원격 저장소 정보 ===" -ForegroundColor Cyan
git remote -v
Write-Host ""
Write-Host "=== Git 저장소 상태 ===" -ForegroundColor Cyan
if (Test-Path .git) {
    Write-Host "✅ Git 저장소가 초기화되어 있습니다." -ForegroundColor Green
    git status
} else {
    Write-Host "❌ Git 저장소가 초기화되지 않았습니다." -ForegroundColor Red
}
```

---

## 📝 사용자 정보 설정하기 (아직 설정하지 않은 경우)

```powershell
# 사용자 이름 설정
git config --global user.name "Your Name"

# 이메일 설정
git config --global user.email "your.email@example.com"
```

---

## 🔗 GitHub 사용자명 확인

GitHub 사용자명은 Git 설정에 저장되지 않습니다. 다음 방법으로 확인할 수 있습니다:

1. **GitHub 웹사이트에서 확인**
   - https://github.com 접속
   - 로그인 후 우측 상단 프로필 아이콘 클릭
   - 사용자명 확인

2. **원격 저장소 URL에서 확인**
   ```powershell
   git remote -v
   ```
   - URL이 `https://github.com/사용자명/저장소명.git` 형식이면 사용자명을 확인할 수 있습니다.

---

## 💡 팁

- **Git 사용자 정보**는 커밋할 때 사용되는 이름과 이메일입니다.
- **GitHub 사용자명**은 GitHub 계정의 사용자명으로, Git 설정과는 별개입니다.
- Git 사용자 정보와 GitHub 계정을 연결하려면, Git 이메일 주소가 GitHub 계정에 등록된 이메일과 일치해야 합니다.
