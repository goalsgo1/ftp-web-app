# 🔗 GitHub 저장소와 로컬 폴더 연결하기 (Git Desktop)

GitHub에 있는 저장소와 로컬 PC의 기존 폴더를 Git Desktop으로 연결하는 방법입니다.

## 📋 상황

- ✅ GitHub에 이미 저장소가 있음
- ✅ 로컬 PC에 폴더가 있고 파일들이 있음
- ⚠️ 중복되는 파일들이 있을 수 있음

---

## 🎯 방법 1: Git Desktop에서 기존 폴더 열기 (권장)

### 1단계: Git Desktop 실행 및 로컬 폴더 열기

1. **Git Desktop 실행**
2. 메뉴에서 **File → Add Local Repository** 클릭
3. **"Choose..."** 버튼 클릭
4. 로컬 PC의 폴더 선택 (예: `C:\FTP`)
5. **"Add Repository"** 클릭

⚠️ **경고 메시지가 나타나는 경우**:

#### 경고 1: "This directory does not appear to be a Git repository"
- 폴더가 아직 Git 저장소로 초기화되지 않은 것입니다
- 아래 "방법 2"를 먼저 진행하세요

#### 경고 2: "The Git repository appears to be owned by another user" ⚠️
**이 경고가 나타나는 경우** (이미지와 같은 상황):

1. **경고 메시지 이해**
   - Windows에서 다른 사용자 계정으로 만들어진 Git 저장소를 추가하려고 할 때 나타남
   - 실제로는 본인이 만든 폴더일 수도 있음 (권한 설정 차이)

2. **해결 방법** (신뢰할 수 있는 폴더인 경우)
   - 경고 메시지 안에 있는 파란색 링크 **"add an exception for this directory"** 클릭
   - 또는 직접 설정에서 추가:
     - Git Desktop 메뉴: **File → Preferences → Advanced**
     - **"Repository exceptions"** 섹션 찾기
     - **"Add exception"** 클릭 → `C:\WFTP` 경로 입력

3. **다시 시도**
   - 예외 추가 후 다시 **"Add Repository"** 버튼 클릭
   - 이제 정상적으로 추가됩니다

**보안 참고**: 
- 본인이 만든 폴더이고 신뢰할 수 있다면 예외를 추가해도 안전합니다
- 모르는 출처의 저장소라면 주의하세요 (자동 실행 스크립트가 있을 수 있음)

### 2단계: 원격 저장소 연결

1. Git Desktop 상단의 **Repository → Repository Settings...** 클릭
2. 또는 상단 메뉴에서 **Repository → Repository Settings** 선택
3. 왼쪽에서 **"Remote"** 탭 클릭
4. **"Add remote"** 클릭 (또는 기존 origin이 있다면 편집)
5. 다음과 같이 입력:
   - **Name**: `origin`
   - **URL**: GitHub 저장소 URL (예: `https://github.com/사용자명/저장소명.git`)
6. **"Save"** 클릭

### 3단계: 원격 저장소 정보 가져오기

1. Git Desktop 상단 메뉴에서 **Repository → Fetch origin** 클릭
2. 원격 저장소의 브랜치와 커밋 정보가 가져와집니다

### 4단계: 현재 상태 확인

1. Git Desktop 왼쪽 하단에서 **"Current branch"** 확인
2. 보통 `main` 또는 `master` 브랜치가 표시됩니다

---

## 🎯 방법 2: Git 저장소로 초기화되지 않은 폴더인 경우

### 1단계: Git 저장소 초기화

1. Git Desktop에서 **File → New Repository** 클릭
2. 또는 **Repository → Initialize in C:\FTP** 클릭
3. 다음 정보 입력:
   - **Name**: 저장소 이름
   - **Local path**: 로컬 폴더 경로 (예: `C:\FTP`)
   - **Git ignore**: 필요시 선택 (예: None 또는 Custom)
   - **License**: None 선택 가능
4. **"Create Repository"** 클릭

### 2단계: 첫 커밋 생성 (선택사항)

1. Git Desktop에서 변경사항 확인
2. 좌측 **"Changes"** 탭에서 파일 목록 확인
3. 모든 파일 선택 또는 필요한 파일만 선택
4. 하단에 커밋 메시지 입력 (예: `Initial commit from local files`)
5. **"Commit to main"** 클릭

### 3단계: 원격 저장소 연결

위의 **"방법 1의 2단계"**를 따라 원격 저장소를 연결하세요.

---

## ⚠️ 중복 파일 및 충돌 해결

### 상황 A: 같은 파일이 두 곳에 모두 있는 경우

#### 옵션 1: 로컬 파일을 우선 (로컬이 최신인 경우)

```bash
# Git Desktop에서:
1. "Changes" 탭에서 로컬 변경사항 확인
2. 커밋 메시지 입력
3. "Commit to main" 클릭
4. "Push origin" 클릭 → 충돌 발생 시 아래 "충돌 해결" 참고
```

#### 옵션 2: GitHub 파일을 우선 (원격이 최신인 경우)

```bash
# Git Desktop에서:
1. "Fetch origin" 클릭
2. 상단 메뉴에서 "Branch → Merge into current branch..."
3. "origin/main" 선택
4. "Merge origin/main into main" 클릭
```

### 상황 B: 파일 충돌 발생 시

1. Git Desktop에서 충돌이 있는 파일을 확인
   - 빨간색 표시로 충돌 파일 표시
   
2. 충돌 파일 열기
   - 파일을 더블클릭하여 기본 에디터에서 열기
   - 또는 **"Open in External Editor"** 클릭

3. 충돌 마커 확인
   ```text
   <<<<<<< HEAD
   로컬 파일의 내용
   =======
   GitHub에서 가져온 내용
   >>>>>>> origin/main
   ```

4. 원하는 내용으로 수정
   - 두 내용을 모두 유지하거나
   - 한 쪽만 선택하거나
   - 완전히 새로운 내용으로 교체
   - 충돌 마커(`<<<<<<<`, `=======`, `>>>>>>>`)는 삭제

5. Git Desktop으로 돌아와서
   - 수정한 파일 저장
   - Git Desktop에서 변경사항이 자동으로 감지됨
   - 커밋 메시지 입력 (예: `Resolve merge conflict`)
   - **"Commit merge"** 클릭

---

## 📝 단계별 체크리스트

### ✅ 초기 설정

- [ ] Git Desktop 설치 및 로그인 확인
- [ ] 로컬 폴더를 Git Desktop에 추가
- [ ] GitHub 저장소 URL 확인
- [ ] 원격 저장소(origin) 연결

### ✅ 데이터 동기화

- [ ] `Fetch origin` 실행하여 원격 정보 가져오기
- [ ] 현재 브랜치 확인 (`main` 또는 `master`)
- [ ] 충돌 파일 확인 및 해결
- [ ] 로컬 변경사항 커밋 (필요시)

### ✅ 첫 푸시

- [ ] `Push origin` 클릭하여 로컬 변경사항 업로드
- [ ] GitHub에서 파일이 제대로 올라갔는지 확인

---

## 🔍 자주 발생하는 문제 해결

### 문제 1: "fatal: refusing to merge unrelated histories"

**원인**: 로컬과 원격 저장소의 히스토리가 완전히 다를 때 발생

**해결 방법**:
```bash
# Git Desktop에서:
1. Repository → Open in Command Prompt (또는 Terminal)
2. 다음 명령어 실행:
   git pull origin main --allow-unrelated-histories
3. 충돌이 있으면 위의 "충돌 해결" 방법 참고
4. Git Desktop에서 커밋 완료
```

### 문제 2: "Permission denied (publickey)"

**원인**: SSH 키가 설정되지 않았거나 잘못된 인증 방식

**해결 방법**:
- HTTPS URL 사용: `https://github.com/사용자명/저장소명.git`
- 또는 SSH 키 설정: [SSH 키 설정 가이드](./SSH_공개키_복사_및_등록_가이드.md)

### 문제 3: "remote origin already exists"

**원인**: 이미 원격 저장소가 연결되어 있음

**해결 방법**:
1. Repository Settings → Remote
2. 기존 `origin` 선택
3. URL을 올바른 GitHub 저장소 URL로 변경
4. Save 클릭

### 문제 4: "The Git repository appears to be owned by another user" 경고

**원인**: Windows에서 다른 사용자 권한으로 만들어진 Git 저장소를 추가할 때 발생

**해결 방법**:
1. 경고 메시지 내 **"add an exception for this directory"** 링크 클릭
2. 또는 Git Desktop 설정에서 수동 추가:
   - `File → Preferences → Advanced`
   - `Repository exceptions` 섹션에서 예외 추가
3. 저장 후 다시 `Add Repository` 클릭

**주의**: 신뢰할 수 있는 폴더인 경우에만 예외를 추가하세요!

### 문제 5: 중복 파일이 너무 많아서 정리하고 싶다면?

**권장 순서**:
1. 먼저 로컬 파일을 백업 (별도 폴더에 복사)
2. GitHub의 최신 버전을 가져오기: `Fetch origin` → `Pull origin`
3. 필요한 파일만 선택적으로 복사
4. 변경사항 커밋 및 푸시

---

## 💡 추천 워크플로우

### 안전한 연결 방법 (권장)

1. **백업 생성**
   ```
   로컬 폴더를 다른 곳에 복사 (예: C:\FTP_backup)
   ```

2. **Git 저장소로 초기화**
   - Git Desktop에서 로컬 폴더 추가

3. **첫 커밋 생성**
   - 현재 로컬 파일들을 모두 커밋
   - 커밋 메시지: `Initial commit: Local files before merge`

4. **원격 저장소 연결**
   - origin 추가

5. **원격 정보 가져오기**
   - `Fetch origin`

6. **병합 전략 결정**
   - 로컬 우선: `Pull with rebase` 또는 직접 푸시
   - 원격 우선: `Pull origin` 후 로컬 변경사항 추가
   - 양쪽 모두: 충돌 해결하면서 병합

7. **최종 확인 및 푸시**
   - 모든 파일 확인
   - `Push origin` 실행

---

## 📚 관련 가이드

- [Git 설치 가이드](./Git_설치_가이드.md)
- [Git 저장소 클론 및 인증 가이드](./Git_저장소_클론_인증_가이드.md)
- [SSH 키 설정 가이드](./SSH_공개키_복사_및_등록_가이드.md)

---

## 🎯 빠른 요약

```
1. Git Desktop 실행
2. File → Add Local Repository → 로컬 폴더 선택
3. Repository Settings → Remote → origin 추가 (GitHub URL)
4. Fetch origin → 상태 확인
5. 충돌 있으면 해결 → Commit → Push
```

**중요**: 충돌이 걱정되면 먼저 백업을 만들고 진행하세요! 💾

---

**작성일**: 2025년 1월  
**도구**: Git Desktop

