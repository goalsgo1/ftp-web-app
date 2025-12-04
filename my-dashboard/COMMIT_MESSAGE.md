# 커밋 메시지

## 주요 변경사항

### ✨ 새로운 기능

1. **Toast 자동 닫기 시간 설정 기능**
   - 사용자별 Toast 자동 닫기 시간 설정 (1-60초)
   - 체크박스로 자동 닫기 활성화/비활성화 제어
   - Firestore에 사용자 설정 저장 및 실시간 동기화
   - 빈 값 입력 시 기본값(5초)으로 자동 설정

2. **구독자 실시간 동기화**
   - 생성자의 알림 설정 변경 시 구독자에게 실시간 반영
   - 토글, 시간대, 알림시간, 알림라벨 변경 시 자동 동기화
   - "현재" 버튼 클릭 시 즉시 저장하여 구독자에게 반영

3. **커스텀 TimePicker 컴포넌트**
   - AM/PM 선택 및 시간/분 스크롤 선택
   - 다크모드 지원 및 모던한 디자인
   - 기존 HTML time input 대체

### 🎨 UI/UX 개선

1. **알림 설정 화면 레이아웃 개선**
   - Toast 자동 닫기 시간 설정 구역 레이아웃 최적화
   - 체크박스 크기 및 스타일 개선
   - Input 필드와 어울리는 디자인

2. **기능 목록 및 구독 관리 화면 차별화**
   - 기능 목록: 정렬 옵션, 구독자 수 표시, 통계 카드 개선
   - 구독 관리: 알림 토글 강조, 구독 날짜 표시, 통계 카드 개선

### 🐛 버그 수정

1. **Toast 자동 닫기 동작 개선**
   - 타이핑할 때마다 저장되던 문제 해결 (onBlur에서만 저장)
   - 명시적 duration 지정 제거하여 사용자 설정 적용
   - Toast 컴포넌트의 duration 재설정 문제 해결

2. **알림 발송 로직 수정**
   - 구독자에게 알림이 발송되지 않던 문제 해결
   - 구독자의 알림 설정 확인 로직 추가

### 📝 문서 업데이트

- 앱 아이디어 브레인스토밍 메모 추가 (AI 프롬프트 기반 메모장 앱 아이디어)

---

## 커밋 메시지

```
feat: Toast 자동 닫기 설정 및 구독자 실시간 동기화 기능 추가

✨ 새로운 기능
- Toast 자동 닫기 시간 사용자 설정 기능 (1-60초)
- 체크박스로 자동 닫기 활성화/비활성화 제어
- 구독자 실시간 동기화 (생성자 설정 변경 시 자동 반영)
- 커스텀 TimePicker 컴포넌트 추가 (AM/PM 선택, 스크롤 선택)

🎨 UI/UX 개선
- 알림 설정 화면 레이아웃 최적화
- 기능 목록 및 구독 관리 화면 차별화
- 체크박스 및 Input 필드 디자인 개선

🐛 버그 수정
- Toast 자동 닫기 타이밍 문제 해결 (onBlur에서만 저장)
- 구독자 알림 발송 로직 수정
- Toast duration 재설정 문제 해결

📝 문서
- 앱 아이디어 브레인스토밍 메모 추가

변경된 파일:
- app/components/features/NotificationSettings/NotificationSettings.tsx
- app/components/ui/Toast/Toast.tsx
- app/components/ui/TimePicker/ (신규)
- app/contexts/ToastContext.tsx (신규)
- app/lib/firebase/userSettings.ts (신규)
- app/features/world-clock/page.tsx
- app/components/features/FeatureList/FeatureList.tsx
- app/components/features/SubscriptionManagement/SubscriptionManagement.tsx
- app/lib/firebase/subscriptions.ts
- app/components/DashboardLayout.tsx
- docs/app-ideas/앱_아이디어_브레인스토밍.md
```
