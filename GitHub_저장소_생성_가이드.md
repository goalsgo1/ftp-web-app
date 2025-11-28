# 🎉 첫 커밋 완료! GitHub 저장소 연결하기

첫 번째 커밋이 성공적으로 완료되었습니다! 이제 GitHub에 원격 저장소를 생성하고 연결하겠습니다.

---

## ✅ 현재 상태

- ✅ 로컬 Git 저장소 초기화 완료
- ✅ 첫 번째 커밋 완료 (26개 파일, 6976줄)
- ✅ 브랜치: `main`
- ⏭️ 다음: GitHub 원격 저장소 생성 및 연결

---

## 📋 다음 단계

### 1단계: GitHub에서 원격 저장소 생성

#### 1-1. GitHub 웹사이트 접속
1. 웹 브라우저에서 https://github.com 접속
2. 로그인 (계정이 없다면 회원가입)

#### 1-2. 새 저장소 생성
1. 우측 상단 `+` 버튼 클릭
2. `New repository` 선택

#### 1-3. 저장소 정보 입력
다음 정보를 입력하세요:

- **Repository name**: 
  ```
  ftp-web-app
  ```
  (또는 원하는 이름)

- **Description** (선택사항):
  ```
  FTP 웹 애플리케이션 - Git + CI/CD 자동 배포 프로젝트
  ```

- **Visibility**:
  - ✅ Public (누구나 볼 수 있음) 또는
  - 🔒 Private (나만 볼 수 있음)

- ⚠️ **중요**: 아래 체크박스들은 **모두 해제**하세요:
  - ❌ Add a README file (이미 README.md가 있음)
  - ❌ Add .gitignore (이미 .gitignore가 있음)
  - ❌ Choose a license (선택사항)

#### 1-4. 저장소 생성
- `Create repository` 버튼 클릭

#### 1-5. 저장소 URL 복사
생성된 페이지에서 HTTPS URL을 복사하세요:

```
https://github.com/사용자명/저장소명.git
```

예시:
```
https://github.com/yourusername/ftp-web-app.git
```

---

### 2단계: 원격 저장소 연결

PowerShell에서 다음 명령어를 실행하세요:

```powershell
# 원격 저장소 추가 (위에서 복사한 URL 사용)
git remote add origin https://github.com/사용자명/저장소명.git

# 연결 확인
git remote -v
```

**예상 결과:**
```
origin  https://github.com/사용자명/저장소명.git (fetch)
origin  https://github.com/사용자명/저장소명.git (push)
```

---

### 3단계: 코드 푸시 (GitHub에 업로드)

```powershell
# 첫 번째 푸시
git push -u origin main
```

**인증이 필요한 경우:**
- **Username**: GitHub 사용자명
- **Password**: GitHub Personal Access Token (비밀번호 아님!)

---

## 🔐 GitHub 인증 설정 (필수!)

GitHub는 2021년 8월부터 비밀번호 인증을 중단했습니다. Personal Access Token을 사용해야 합니다.

### 방법 1: Personal Access Token 생성 (HTTPS - 간단)

#### 1. 토큰 생성
1. GitHub → 우측 상단 프로필 클릭 → **Settings**
2. 왼쪽 메뉴에서 **Developer settings** 클릭
3. **Personal access tokens** → **Tokens (classic)** 클릭
4. **Generate new token (classic)** 클릭
5. 토큰 이름 입력 (예: `FTP-Web-App-Deploy`)
6. **Expiration**: 기간 선택 (90 days 또는 원하는 기간)
7. **Select scopes**: `repo` 체크박스 선택 (전체 하위 항목 자동 선택)
8. **Generate token** 버튼 클릭
9. ⚠️ **생성된 토큰을 즉시 복사**하세요 (다시 볼 수 없습니다!)

#### 2. 토큰 사용
`git push` 실행 시:
- **Username**: GitHub 사용자명
- **Password**: 생성한 토큰 입력

### 방법 2: SSH 키 사용 (권장 - 한 번만 설정)

#### 1. SSH 키 생성 (PowerShell)
```powershell
# SSH 키 생성
ssh-keygen -t ed25519 -C "your.email@example.com"

# 비밀번호 없이 Enter 두 번
# 키 위치: C:\Users\사용자명\.ssh\id_ed25519 (개인키)
#           C:\Users\사용자명\.ssh\id_ed25519.pub (공개키)
```

#### 2. 공개키 복사
```powershell
# 공개키 내용 복사
Get-Content ~\.ssh\id_ed25519.pub | clip
```

#### 3. GitHub에 공개키 등록
1. GitHub → Settings → **SSH and GPG keys**
2. **New SSH key** 클릭
3. **Title**: `My Windows PC` (원하는 이름)
4. **Key**: 복사한 공개키 붙여넣기
5. **Add SSH key** 클릭

#### 4. 원격 저장소 URL을 SSH로 변경
```powershell
# SSH URL로 변경
git remote set-url origin git@github.com:사용자명/저장소명.git

# 확인
git remote -v
```

#### 5. SSH 연결 테스트
```powershell
# SSH 연결 테스트
ssh -T git@github.com

# 예상 결과: "Hi 사용자명! You've successfully authenticated..."
```

---

## ✅ 푸시 완료 확인

푸시가 성공하면:

1. **PowerShell 출력**:
   ```
   Enumerating objects: 26, done.
   Counting objects: 100% (26/26), done.
   Delta compression using up to X threads
   Compressing objects: 100% (XX/XX), done.
   Writing objects: 100% (26/26), XX KiB | XX MiB/s, done.
   To https://github.com/사용자명/저장소명.git
    * [new branch]      main -> main
   Branch 'main' set up to track remote branch 'main' from 'origin'.
   ```

2. **GitHub 웹사이트에서 확인**:
   - 저장소 페이지 새로고침
   - 파일들이 표시되는지 확인
   - 커밋 내역 확인

---

## 🎯 다음 단계 (푸시 완료 후)

### 1. GitHub Actions 자동 배포 설정
- `.github/workflows/deploy.yml` 파일이 이미 있음
- GitHub Secrets 설정 필요:
  - `DEPLOY_HOST`: 서버 IP
  - `DEPLOY_USER`: 배포 사용자명
  - `DEPLOY_KEY`: SSH 개인키

자세한 내용: `단계별_배포_가이드.md`의 "7. GitHub Actions CI/CD 설정" 섹션 참고

### 2. 프로젝트 README 확인
- `README.md` 파일이 GitHub에 업로드됨
- 필요시 수정 후 커밋 및 푸시

---

## 🆘 문제 해결

### `git remote add` 오류: "remote origin already exists"
```powershell
# 기존 원격 저장소 삭제 후 재추가
git remote remove origin
git remote add origin https://github.com/사용자명/저장소명.git
```

### `git push` 오류: "authentication failed"
- Personal Access Token 확인
- 또는 SSH 키 설정 확인

### `git push` 오류: "remote: Permission denied"
- 저장소에 대한 접근 권한 확인
- 저장소 이름과 사용자명 확인

---

## 📚 참고 문서

- **전체 가이드**: `단계별_배포_가이드.md`
- **빠른 시작**: `빠른_시작_가이드.md`
- **처음부터 시작**: `처음부터_시작하기.md`

---

**지금 GitHub에서 저장소를 생성하고 연결하세요!** 🚀
