# 🚀 FTP 웹 애플리케이션 - Git 기반 자동 배포

이 프로젝트는 Git과 CI/CD를 활용한 자동 배포 시스템을 구축하는 예제 프로젝트입니다.

## 📁 프로젝트 구조

```
FTP/
├── public/                    # 웹 서버에 배포될 파일들
│   ├── index.html            # 메인 페이지 (로그인 기능 포함)
│   ├── dashboard.html        # 보호된 대시보드 페이지
│   ├── world_time.html       # 세계 시간 페이지
│   ├── disk_info.php         # 디스크 정보 페이지
│   ├── gallery.php           # 갤러리 페이지
│   ├── js/                   # JavaScript 파일
│   │   ├── firebase-config.js   # Firebase 설정
│   │   ├── auth-service.js      # 인증 서비스 (추상화 레이어)
│   │   └── auth-ui.js           # 인증 UI 관리
│   ├── css/                  # 스타일시트
│   └── images/               # 이미지 파일
├── deploy/                   # 배포 스크립트
│   ├── deploy.sh            # 자동 배포 스크립트 (Git 기반)
│   └── manual_deploy.sh     # 수동 배포 스크립트 (FTP 기반)
├── .github/
│   └── workflows/
│       └── deploy.yml        # GitHub Actions 워크플로우
├── 단계별_배포_가이드.md     # 상세 배포 가이드
├── git_cicd_배포가이드.md    # 원본 배포 가이드
└── README.md                 # 이 파일
```

## 🚀 빠른 시작

### 1. 초기 설정

Windows PowerShell에서 실행:

```powershell
# 프로젝트 구조 생성 및 Git 초기화
.\배포_시작하기.ps1
```

### 2. Firebase 인증 설정 (새 기능!)

로그인 기능을 사용하려면 Firebase 설정이 필요합니다:

1. [Firebase Console](https://console.firebase.google.com/)에서 프로젝트 생성
2. Authentication → 이메일/비밀번호 활성화
3. 웹 앱 등록 후 설정 정보 복사
4. `public/js/firebase-config.js` 파일에 설정 정보 입력

**상세 가이드**: [Firebase 설정 가이드](./docs/Firebase_설정_가이드.md)

### 3. 상세 가이드 읽기

`docs/` 폴더의 가이드 문서들을 참고하여 단계별로 진행하세요.

## 📚 주요 문서

### 배포 관련
- **[단계별_배포_가이드.md](./docs/deploy/단계별_배포_가이드.md)** - 전체 배포 과정 상세 가이드
- **[git_cicd_배포가이드.md](./docs/deploy/git_cicd_배포가이드.md)** - 원본 배포 가이드

### 인증 관련
- **[Firebase_설정_가이드.md](./docs/Firebase_설정_가이드.md)** - Firebase 인증 설정 방법
- **[Firebase_전환_가이드.md](./docs/Firebase_전환_가이드.md)** - Firebase → 다른 플랫폼 전환 가이드

## 🔧 주요 기능

### 배포 기능
- ✅ Git 기반 버전 관리
- ✅ GitHub Actions를 통한 자동 배포
- ✅ Zero-downtime 배포 (심볼릭 링크 기반)
- ✅ 이전 버전 롤백 지원
- ✅ 수동 배포 스크립트 (Git 없을 때)

### 인증 기능 (새로 추가!)
- ✅ Firebase Authentication 통합
- ✅ 이메일/비밀번호 로그인 및 회원가입
- ✅ 보호된 페이지 (인증 필요)
- ✅ 추상화 레이어로 플랫폼 전환 용이
- ✅ 나중에 수익화/멀티 유저 확장 가능

## 📋 배포 방식 비교

| 방식 | 설명 | 사용 시기 |
|------|------|----------|
| **자동 배포** | Git push 시 자동으로 서버에 배포 | Git 설치되어 있고 GitHub 저장소 연결 시 |
| **수동 배포** | FTP/SCP로 파일 전송 후 스크립트 실행 | Git 없을 때, 빠른 수정 필요 시 |

## 🛠️ 필요한 도구

### 로컬 환경 (Windows)
- Git (https://git-scm.com/download/win)
- PowerShell 5.1 이상

### 서버 환경 (Linux)
- Git
- Nginx 또는 Apache
- PHP (PHP 파일 사용 시)
- SSH 서버

## 📖 사용 방법

### 자동 배포 (Git 기반)

1. 코드 수정
2. 커밋 및 푸시:
   ```bash
   git add .
   git commit -m "변경 사항 설명"
   git push origin main
   ```
3. GitHub Actions가 자동으로 배포 실행

### 수동 배포 (FTP 기반)

1. 배포할 파일을 `$HOME/deploy_queue` 디렉토리에 복사
2. 서버에서 배포 스크립트 실행:
   ```bash
   ~/deploy/manual_deploy.sh
   ```

## 🔐 보안 주의사항

### 배포 보안
- SSH 키는 안전하게 보관하세요
- `.env` 파일과 민감한 정보는 `.gitignore`에 추가하세요
- GitHub Secrets에 서버 정보를 저장하세요 (코드에 하드코딩하지 마세요)

### 인증 보안
- Firebase API 키는 프론트엔드에 노출되지만, Firebase Console에서 도메인 제한 설정 권장
- 프로덕션 배포 시 승인된 도메인만 허용하도록 설정
- Firebase 보안 규칙을 적절히 설정 (Firestore/Firebase Storage 사용 시)

## 📝 라이선스

이 프로젝트는 학습 목적으로 제작되었습니다.

## 🤝 기여

이슈나 제안사항이 있으면 언제든지 알려주세요!

---

---

## 💡 Firebase → 다른 플랫폼 전환

현재 프로젝트는 **추상화 레이어**를 통해 나중에 다른 인증 플랫폼으로 쉽게 전환할 수 있습니다:

- Supabase, Auth0, Clerk 등으로 전환 가능
- `auth-service.js` 파일만 수정하면 됨
- UI 코드는 변경 불필요

**자세한 내용**: [Firebase 전환 가이드](./docs/Firebase_전환_가이드.md)

---

**작성일**: 2025년 1월  
**최종 업데이트**: 2025년 1월
