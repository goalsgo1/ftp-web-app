# GitHub에서 이전 커밋 내용 확인하는 방법

## 저장소 정보
- **원격 저장소 URL**: https://github.com/goalsgo1/ftp-web-app
- **브랜치**: main

## daily-logs 폴더의 삭제 이력 확인하기

### 방법 1: GitHub 웹사이트에서 직접 확인
1. **저장소 메인 페이지로 이동**
   - https://github.com/goalsgo1/ftp-web-app

2. **daily-logs 폴더로 이동**
   - 저장소에서 `daily-logs` 폴더 클릭

3. **히스토리 확인**
   - 우측 상단의 **"History"** 버튼 클릭
   - 또는 URL로 직접 접근: https://github.com/goalsgo1/ftp-web-app/commits/main/daily-logs

4. **삭제된 파일 찾기**
   - 커밋 목록에서 파일이 삭제된 커밋 찾기 (보통 커밋 메시지에 "delete", "remove" 등의 단어 포함)
   - 해당 커밋 클릭

5. **삭제된 파일 내용 확인**
   - 커밋 상세 페이지에서 삭제된 파일 확인
   - 파일 이름 옆에 빨간색 마이너스(-) 표시가 있으면 삭제된 파일
   - 삭제된 파일 클릭하면 이전 내용 확인 가능

### 방법 2: 전체 커밋 이력에서 확인
1. **커밋 이력 페이지로 이동**
   - https://github.com/goalsgo1/ftp-web-app/commits/main

2. **커밋 검색**
   - 검색창에 "daily-logs" 입력하여 관련 커밋 필터링
   - 또는 날짜 범위 지정하여 검색

3. **커밋 상세 확인**
   - 관련 커밋 클릭
   - "Files changed" 탭에서 변경된 파일 확인
   - 삭제된 파일은 빨간색으로 표시됨

### 방법 3: 특정 파일 복구하기
1. **삭제된 파일이 있는 커밋 찾기**
2. **해당 커밋 상세 페이지에서 파일 내용 복사**
3. **로컬에서 파일 복원**
   - 또는 GitHub 웹사이트에서 "Raw" 버튼으로 원본 내용 확인 후 복사

## 유용한 단축키
- `t`: 파일 검색
- `b`: 파일 히스토리 확인
- `y`: URL을 특정 커밋의 상태로 고정

## 빠른 링크
- **저장소 메인**: https://github.com/goalsgo1/ftp-web-app
- **daily-logs 폴더**: https://github.com/goalsgo1/ftp-web-app/tree/main/daily-logs
- **daily-logs 히스토리**: https://github.com/goalsgo1/ftp-web-app/commits/main/daily-logs
- **전체 커밋 이력**: https://github.com/goalsgo1/ftp-web-app/commits/main

## 팁
- 삭제된 파일을 찾으려면 커밋 메시지를 확인하세요
- 파일 이름이나 경로를 알고 있다면 GitHub 검색 기능(`/` 키)을 사용하세요
- GitLens 같은 브라우저 확장 프로그램을 사용하면 더 편리합니다

