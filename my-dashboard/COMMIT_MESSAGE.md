# 📝 커밋 메시지

## 제목

```
docs: 활성 사용 문서를 종류별/목적별 폴더 구조로 재구성
```

## 본문

```
활성 사용 문서들을 docs 폴더로 이동하고 종류별/목적별로 체계적으로 정리

### 변경 사항

#### 문서 이동
- 모든 활성 사용 MD 파일을 docs 폴더로 이동
  - QUICK_START.md → docs/development-guides/quick-start/
  - DEVELOPMENT_SERVER_GUIDE.md → docs/development-guides/server-management/
  - CHECK_RUN_STATUS.md → docs/development-guides/status-check/
  - DEVELOPMENT_GUIDE.md → docs/development-guides/component-usage/
  - FIREBASE_ENV_SETUP.md → docs/firebase-setup/environment-variables/
  - FIREBASE_AUTH_SETUP.md → docs/firebase-setup/authentication/

#### 폴더 구조 생성
- development-guides/ (개발 가이드)
  - quick-start/ (빠른 시작)
  - server-management/ (서버 관리)
  - status-check/ (상태 확인)
  - component-usage/ (컴포넌트 사용법)

- firebase-setup/ (Firebase 설정)
  - environment-variables/ (환경 변수)
  - authentication/ (인증 설정)

#### README 파일 추가
- 각 폴더에 한글 설명이 포함된 README.md 생성
- docs/README.md 추가 (docs 폴더 소개)
- docs/FOLDER_STRUCTURE.md 추가 (폴더 구조 상세 설명)
- docs/MOVEMENT_SUMMARY.md 추가 (이동 완료 보고서)

#### 문서 인덱스 업데이트
- docs/DOCUMENTATION_INDEX.md 업데이트 (새 폴더 구조 반영)
- README.md 업데이트 (새 경로 반영)

### 개선 효과
- 체계적인 문서 구조로 접근성 향상
- 각 폴더의 목적이 README로 명확히 설명됨
- 유지보수성 향상 (관련 문서들이 한 곳에 모임)
```

---

## 간단 버전 (짧은 커밋 메시지)

```
docs: 활성 사용 문서를 종류별/목적별 폴더 구조로 재구성

- 모든 활성 사용 MD 파일을 docs 폴더로 이동
- development-guides와 firebase-setup 폴더로 분류
- 각 폴더에 README 파일 추가 (한글 설명 포함)
- 문서 인덱스 및 README 업데이트
```

---

## 영어 버전

```
docs: reorganize active documentation into categorized folder structure

- Move all active MD files to docs folder
- Organize by category (development-guides, firebase-setup)
- Add README files to each folder with Korean descriptions
- Update documentation index and README
```

