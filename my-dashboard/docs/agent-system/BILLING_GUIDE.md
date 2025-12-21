# 💳 Anthropic API 결제 및 크레딧 가이드

## 🔴 현재 오류

```
Your credit balance is too low to access the Anthropic API. 
Please go to Plans & Billing to upgrade or purchase credits.
```

**의미**: Anthropic API를 사용하기 위한 크레딧 잔액이 부족합니다.

---

## ✅ 해결 방법

### 방법 1: 크레딧 구매 (권장)

1. [Anthropic Console](https://console.anthropic.com/) 접속
2. 로그인
3. 좌측 메뉴에서 **"Plans & Billing"** 클릭
4. **"Purchase Credits"** 또는 **"Add Payment Method"** 클릭
5. 결제 수단 등록 및 크레딧 구매

**크레딧 가격 예시:**
- 최소 충전 금액은 Anthropic 정책에 따름
- 일반적으로 $5-$20부터 시작

---

### 방법 2: 무료 크레딧 확인

1. [Anthropic Console](https://console.anthropic.com/) 접속
2. 로그인
3. **"Plans & Billing"** 메뉴에서 무료 크레딧이 있는지 확인
4. 신규 회원가입 시 무료 크레딧을 제공할 수 있음

---

## 💰 비용 정보

### 모델별 가격 (USD, 1M 토큰 기준)

| 모델 | Input | Output |
|------|-------|--------|
| Claude 3.5 Haiku | $0.25 | $1.25 |
| Claude 3.5 Sonnet | $3.00 | $15.00 |

### 예상 사용 비용

**Content Analyzer Agent (Haiku 사용)**
- 뉴스 기사 1개 분석: 약 $0.000375
- 뉴스 기사 1,000개 분석: 약 $0.375
- 뉴스 기사 10,000개 분석: 약 $3.75

**월간 예상 비용 (일일 1,000개 기사 분석)**
- 일일: 약 $0.375
- 월간 (30일): 약 $11.25

---

## 🔍 크레딧 잔액 확인

1. [Anthropic Console](https://console.anthropic.com/) 접속
2. 좌측 상단 프로필 아이콘 클릭
3. **"Billing"** 또는 **"Plans & Billing"** 메뉴 선택
4. 현재 크레딧 잔액 확인

---

## 💡 비용 절감 팁

### 1. 적절한 모델 선택

- **간단한 작업**: Claude 3.5 Haiku 사용 (10배 저렴)
- **복잡한 분석**: Claude 3.5 Sonnet 사용

현재 구현된 `ContentAnalyzerAgent`는 이미 Haiku를 사용하도록 설정되어 있습니다.

### 2. 배치 처리

여러 요청을 한 번에 처리하는 것보다 개별 요청이 더 효율적일 수 있지만, 필요시 배치 처리도 고려해볼 수 있습니다.

### 3. 캐싱

유사한 요청의 결과를 캐시하여 중복 요청을 방지할 수 있습니다.

---

## ⚠️ 중요 사항

1. **크레딧 미리 충전**: 크레딧이 부족하면 API 사용이 불가능합니다
2. **사용량 모니터링**: Console에서 사용량을 정기적으로 확인하세요
3. **알림 설정**: 크레딧 잔액이 낮을 때 알림을 받도록 설정 가능

---

## 🚀 결제 후 다시 테스트

크레딧을 충전한 후:

1. 개발 서버가 실행 중인지 확인
2. 브라우저에서 테스트:
   ```
   http://localhost:3000/api/agents/test
   ```
3. 성공 응답이 오면 정상 작동!

---

## ❓ 자주 묻는 질문

**Q: 무료 크레딧이 있나요?**
A: Anthropic의 정책에 따라 달라질 수 있습니다. Console에서 확인하세요.

**Q: 최소 충전 금액은 얼마인가요?**
A: Anthropic 정책에 따르며, 일반적으로 $5-20 정도입니다. Console에서 확인 가능합니다.

**Q: 크레딧을 사용하지 않으면 만료되나요?**
A: Anthropic의 정책을 확인하세요. 일반적으로 구매한 크레딧은 만료되지 않습니다.

---

**관련 링크:**
- [Anthropic Console](https://console.anthropic.com/)
- [Anthropic 가격 정책](https://www.anthropic.com/pricing)
- [Anthropic 문서](https://docs.anthropic.com/)

