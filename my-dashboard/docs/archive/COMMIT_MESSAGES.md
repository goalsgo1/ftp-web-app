# Git 커밋 메시지 (항목별)

## 1. 캘린더 기능 추가 및 일지 시스템 기획

```
feat: 캘린더 기능 추가 및 일지 관리 시스템 기획

- 캘린더 페이지 추가 (/features/calendar/page.tsx)
  - 월별 캘린더 뷰 구현
  - 일정 추가/수정/삭제 기능
  - 날짜 클릭으로 일정 관리
  - 일정 색상 지정 기능
  - 월 이동 (이전/다음/오늘) 기능

- AddFeatureModal에 캘린더 옵션 추가
  - 내부 기능 선택 드롭다운에 "캘린더" 추가
  - /features/calendar?id=calendar 경로로 등록 가능

- 캘린더 일지 관리 시스템 기획서 작성
  - 마크다운 일지 자동 파싱 설계
  - 상태별 분류 (해야할일/하는중/했던일) 설계
  - 태그 시스템 및 분석 기능 설계
  - 데이터 구조 및 화면 구성 설계

관련 파일:
- app/features/calendar/page.tsx (신규)
- app/components/features/FeatureList/AddFeatureModal.tsx
- docs/CALENDAR_JOURNAL_SYSTEM_DESIGN.md (신규)
```

---

## 2. 알림 로그 시스템 추가

```
feat: 알림 활동 로그 시스템 추가

- notificationLogs Firestore 컬렉션 및 함수 추가
  - 알림 생성/저장/활성화/비활성화/수정/삭제/전달 로그 기록
  - 기능별 알림 로그 조회 기능
  - alertId 기반 로그 필터링 지원

- World Clock에 알림 로그 기능 통합
  - 알림 생성/저장/토글/수정/삭제/전달 시 자동 로그 기록
  - 고유 alert ID 생성 (alert_${timestamp}_${randomString})
  - 수정로그 모달에 알림별 필터링 selectbox 추가
  - 로그 새로고침 버튼 추가

- WorldClockSettings에 alert ID 필드 추가
  - 각 알림에 고유 ID 부여하여 로그 추적 가능

관련 파일:
- app/lib/firebase/notificationLogs.ts (신규)
- app/features/world-clock/page.tsx
- app/lib/firebase/worldClock.ts
```

---

## 3. FeatureList UI 개선 (카드/리스트 뷰, 이메일 표시)

```
feat: FeatureList UI 개선 및 사용자 이메일 표시

- 카드/리스트 뷰 전환 기능 추가
  - 카드 형식과 리스트 형식 간 전환 가능
  - 그리드 아이콘과 리스트 아이콘으로 뷰 모드 선택
  - 리스트 뷰: 가로 레이아웃으로 정보 표시

- DashboardLayout에 로그인 사용자 이메일 표시
  - 로그아웃 버튼 옆에 사용자 이메일 표시
  - 모바일에서는 숨김 처리 (sm 이상에서만 표시)

- EditFeatureModal 상태 메시지 표시 개선
  - 상태 메시지가 항상 표시되도록 레이아웃 수정
  - 텍스트 영역 flex-1 min-w-0 적용으로 잘림 방지

관련 파일:
- app/components/features/FeatureList/FeatureList.tsx
- app/components/DashboardLayout.tsx
- app/components/features/FeatureList/EditFeatureModal.tsx
```

---

## 4. TimePicker UI 개선 (Portal 사용)

```
fix: TimePicker 드롭다운이 다른 요소에 가려지는 문제 해결

- React Portal을 사용하여 드롭다운을 document.body에 렌더링
  - createPortal로 드롭다운을 최상위 레이어에 배치
  - fixed 포지셔닝과 높은 z-index로 항상 최상단 표시
  - 드롭다운 위치를 동적으로 계산하여 버튼 근처에 배치
  - 화면 하단 공간 부족 시 상단에 배치하도록 개선

- 드롭다운 클릭 이벤트 처리 개선
  - Portal 외부 클릭 감지 로직 수정
  - 드롭다운 내부 스크롤 및 선택 정상 작동

관련 파일:
- app/components/ui/TimePicker/TimePicker.tsx
```

---

## 5. 문서 업데이트

```
docs: Firebase 프로젝트 재생성 가이드 및 앱 아이디어 문서 업데이트

- Firebase 프로젝트 재생성 가이드 업데이트
  - notificationLogs 복합 인덱스 생성 방법 추가
  - featureId와 createdAt 기반 인덱스 설정 안내

- 앱 아이디어 브레인스토밍 문서 업데이트
  - AI 프롬프트 기반 메모장 앱 아이디어 추가
  - 보안 및 신뢰 확보 방안 정리

관련 파일:
- docs/FIREBASE_PROJECT_RECREATION_GUIDE.md
- docs/app-ideas/앱_아이디어_브레인스토밍.md
```

---

## 전체 커밋 전략 제안

### 옵션 1: 기능별로 분리하여 커밋 (권장)
```bash
# 1. 캘린더 기능
git add app/features/calendar/ app/components/features/FeatureList/AddFeatureModal.tsx docs/CALENDAR_JOURNAL_SYSTEM_DESIGN.md
git commit -m "feat: 캘린더 기능 추가 및 일지 관리 시스템 기획"

# 2. 알림 로그 시스템
git add app/lib/firebase/notificationLogs.ts app/features/world-clock/page.tsx app/lib/firebase/worldClock.ts
git commit -m "feat: 알림 활동 로그 시스템 추가"

# 3. FeatureList UI 개선
git add app/components/features/FeatureList/FeatureList.tsx app/components/DashboardLayout.tsx app/components/features/FeatureList/EditFeatureModal.tsx
git commit -m "feat: FeatureList UI 개선 및 사용자 이메일 표시"

# 4. TimePicker 개선
git add app/components/ui/TimePicker/TimePicker.tsx
git commit -m "fix: TimePicker 드롭다운이 다른 요소에 가려지는 문제 해결"

# 5. 문서 업데이트
git add docs/FIREBASE_PROJECT_RECREATION_GUIDE.md docs/app-ideas/앱_아이디어_브레인스토밍.md
git commit -m "docs: Firebase 프로젝트 재생성 가이드 및 앱 아이디어 문서 업데이트"
```

### 옵션 2: 하나의 큰 커밋으로
```bash
git add .
git commit -m "feat: 캘린더 기능 추가, 알림 로그 시스템, UI 개선

- 캘린더 기능 및 일지 관리 시스템 기획 추가
- 알림 활동 로그 시스템 구현
- FeatureList 카드/리스트 뷰 전환 기능 추가
- 사용자 이메일 표시 기능 추가
- TimePicker Portal 적용으로 드롭다운 가림 문제 해결
- 문서 업데이트"
```


